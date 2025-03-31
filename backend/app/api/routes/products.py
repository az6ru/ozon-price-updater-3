from typing import Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, Path, status
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
import math
from datetime import datetime
import logging

from app.db.database import get_db
from app.db.models import SkuMonitoring, User
from app.db.schemas import (
    Product,
    ProductUpdate,
    MrpcUpdate,
    MrpcUpdateBatchResponse,
    DiscountUpdate,
    DiscountUpdateBatchResponse,
    PaginatedResponse,
    UpdatePricesRequest,
    UpdatePricesResponse
)
from app.core.security import get_current_active_user
from app.services.ozon_api import ozon_api, OzonApiError
from app.services.front_price_api import front_price_api, FrontPriceApiError
from app.services.price_calculator import calculate_price_adjustment, can_activate_product
from app.tasks.monitor_products import monitor_products
from app.tasks.maintain_mrpc_prices import update_product_price
from app.core.config import settings

router = APIRouter()

logger = logging.getLogger(__name__)


@router.get("", response_model=PaginatedResponse)
async def get_products(
    page: int = Query(1, ge=1),
    per_page: int = Query(50, ge=1, le=100),
    active: Optional[bool] = None,
    has_stock: Optional[bool] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_active_user)
) -> Any:
    """
    Получение списка товаров с пагинацией и фильтрацией
    """
    try:
        logger.info("Получение списка товаров с параметрами: page=%s, per_page=%s, active=%s, has_stock=%s, search=%s",
                   page, per_page, active, has_stock, search)
        
        # Базовый запрос
        query = db.query(SkuMonitoring)
        
        # Применяем фильтры
        if active is not None:
            query = query.filter(SkuMonitoring.active == active)
        
        if has_stock is not None:
            query = query.filter(SkuMonitoring.available == has_stock)
        
        if search:
            query = query.filter(
                or_(
                    SkuMonitoring.name.ilike(f"%{search}%"),
                    SkuMonitoring.sku.ilike(f"%{search}%"),
                    SkuMonitoring.product_id.ilike(f"%{search}%")
                )
            )
        
        # Получаем общее количество товаров
        total_items = query.count()
        logger.debug("Найдено товаров: %s", total_items)
        
        # Рассчитываем пагинацию
        total_pages = math.ceil(total_items / per_page)
        offset = (page - 1) * per_page
        
        # Получаем товары для текущей страницы
        items = query.offset(offset).limit(per_page).all()
        logger.debug("Получено товаров для страницы: %s", len(items))
        
        # Преобразуем объекты SQLAlchemy в словари для корректной сериализации
        serialized_items = [
            {
                "id": item.id,
                "product_id": item.product_id,
                "sku": item.sku,
                "name": item.name,
                "active": item.active,
                "available": item.available,
                "price": item.price,
                "marketing_price": item.marketing_price,
                "min_price": item.min_price,
                "old_price": item.old_price,
                "front_price": item.front_price,
                "mrpc": item.mrpc,
                "discount": item.discount,
                "product_url": item.product_url,
                "front_price_timestamp": item.front_price_timestamp,
                "update_timestamp": item.update_timestamp
            }
            for item in items
        ]
        
        return {
            "items": serialized_items,
            "total": total_items,
            "page": page,
            "pages": total_pages
        }
    except Exception as e:
        logger.error("Ошибка при получении списка товаров: %s", str(e), exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ошибка при получении списка товаров: {str(e)}"
        )


@router.get("/fetch", response_model=dict)
async def fetch_products(
    _: User = Depends(get_current_active_user)
) -> Any:
    """
    Ручное получение данных о товарах из Ozon API
    """
    try:
        await monitor_products()
        return {
            "status": "success",
            "message": "Products fetched successfully"
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching products: {str(e)}"
        )


@router.post("/fetch-prices", response_model=dict)
async def fetch_front_prices(
    request: Optional[UpdatePricesRequest] = None,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_active_user)
) -> Any:
    """
    Ручное получение цен товаров с витрины Ozon
    """
    try:
        # Получаем все товары с витрины
        all_products = await front_price_api.get_all_seller_products(settings.OZON_CLIENT_ID)
        
        updated_count = 0
        errors = []
        current_time = datetime.now()
        
        # Фильтруем товары, если указаны конкретные product_ids
        if request and request.product_ids:
            # Сначала получаем product_id -> sku маппинг
            products_map = {
                p.product_id: p.sku for p in db.query(SkuMonitoring).filter(
                    SkuMonitoring.product_id.in_(request.product_ids)
                ).all()
            }
            
            for product in all_products:
                sku_id = product.get("sku_id")
                if not sku_id:
                    continue
                
                # Проверяем, есть ли SKU в нашем списке product_ids
                in_requested_list = False
                for product_id, sku in products_map.items():
                    if sku == sku_id:
                        in_requested_list = True
                        break
                
                if not in_requested_list:
                    continue
                
                # Обновляем цену
                price_data = product.get("price", {})
                card_price = price_data.get("card_price")
                
                if not card_price:
                    errors.append({"sku": sku_id, "error": "No card_price found"})
                    continue
                
                # Находим товар по SKU
                db_product = db.query(SkuMonitoring).filter(SkuMonitoring.sku == sku_id).first()
                if db_product:
                    db_product.front_price = card_price
                    db_product.front_price_timestamp = current_time
                    updated_count += 1
                else:
                    errors.append({"sku": sku_id, "error": "Product not found in database"})
        else:
            # Обновляем все товары
            for product in all_products:
                sku_id = product.get("sku_id")
                if not sku_id:
                    continue
                
                price_data = product.get("price", {})
                card_price = price_data.get("card_price")
                
                if not card_price:
                    continue
                
                # Находим товар по SKU
                db_product = db.query(SkuMonitoring).filter(SkuMonitoring.sku == sku_id).first()
                if db_product:
                    db_product.front_price = card_price
                    db_product.front_price_timestamp = current_time
                    updated_count += 1
        
        db.commit()
        
        return {
            "status": "success",
            "fetched": len(all_products),
            "updated": updated_count,
            "errors": errors
        }
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching front prices: {str(e)}"
        )


@router.post("/set-mrpc", response_model=MrpcUpdateBatchResponse)
async def set_mrpc(
    items: List[MrpcUpdate],
    db: Session = Depends(get_db),
    _: User = Depends(get_current_active_user)
) -> Any:
    """
    Установка МРЦ для товаров
    """
    updated = []
    errors = []
    
    for item in items:
        # Поиск товара по SKU
        product = db.query(SkuMonitoring).filter(SkuMonitoring.sku == item.sku).first()
        
        if not product:
            errors.append({"sku": item.sku, "error": "Product not found"})
            continue
        
        if item.mrpc <= 0:
            errors.append({"sku": item.sku, "error": "MRPC must be greater than zero"})
            continue
        
        try:
            # Обновляем МРЦ
            product.mrpc = item.mrpc
            product.update_timestamp = datetime.now()
            
            # Добавляем в список успешно обновленных
            updated.append({
                "sku": item.sku,
                "mrpc": item.mrpc,
                "message": "MRPC updated successfully"
            })
        except Exception as e:
            errors.append({"sku": item.sku, "error": str(e)})
    
    db.commit()
    
    return {
        "status": "success",
        "updated": updated,
        "errors": errors
    }


@router.post("/set-discount", response_model=DiscountUpdateBatchResponse)
async def set_discount(
    items: List[DiscountUpdate],
    db: Session = Depends(get_db),
    _: User = Depends(get_current_active_user)
) -> Any:
    """
    Установка скидок для товаров
    """
    updated = []
    errors = []
    
    for item in items:
        # Поиск товара по SKU
        product = db.query(SkuMonitoring).filter(SkuMonitoring.sku == item.sku).first()
        
        if not product:
            errors.append({"sku": item.sku, "error": "Product not found"})
            continue
        
        if item.discount < 0 or item.discount > 100:
            errors.append({"sku": item.sku, "error": "Discount must be between 0 and 100"})
            continue
        
        try:
            # Рассчитываем новую старую цену на основе МРЦ и скидки
            if product.mrpc:
                _, new_old_price = calculate_price_adjustment(
                    current_price=product.price,
                    front_price=product.front_price,
                    mrpc=product.mrpc,
                    discount=item.discount
                )
            else:
                new_old_price = 0
            
            # Обновляем скидку и old_price
            product.discount = item.discount
            product.update_timestamp = datetime.now()
            
            # Добавляем в список успешно обновленных
            updated.append({
                "sku": item.sku,
                "discount": item.discount,
                "old_price": new_old_price,
                "message": "Discount updated successfully"
            })
        except Exception as e:
            errors.append({"sku": item.sku, "error": str(e)})
    
    db.commit()
    
    return {
        "status": "success",
        "updated": updated,
        "errors": errors
    }


@router.post("/{product_id}/activate", response_model=dict)
async def activate_product(
    product_id: str = Path(...),
    db: Session = Depends(get_db),
    _: User = Depends(get_current_active_user)
) -> Any:
    """
    Активация мониторинга товара
    """
    # Поиск товара по product_id
    product = db.query(SkuMonitoring).filter(SkuMonitoring.product_id == product_id).first()
    
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    
    # Проверка возможности активации
    can_activate, message = can_activate_product(
        available=product.available,
        mrpc=product.mrpc,
        front_price=product.front_price
    )
    
    if not can_activate:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=message
        )
    
    # Активация товара
    product.active = True
    product.update_timestamp = datetime.now()
    db.commit()
    
    return {
        "status": "success",
        "product_id": product_id,
        "active": True,
        "message": "Product activated successfully"
    }


@router.post("/{product_id}/deactivate", response_model=dict)
async def deactivate_product(
    product_id: str = Path(...),
    db: Session = Depends(get_db),
    _: User = Depends(get_current_active_user)
) -> Any:
    """
    Деактивация мониторинга товара
    """
    # Поиск товара по product_id
    product = db.query(SkuMonitoring).filter(SkuMonitoring.product_id == product_id).first()
    
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    
    # Деактивация товара
    product.active = False
    product.update_timestamp = datetime.now()
    db.commit()
    
    return {
        "status": "success",
        "product_id": product_id,
        "active": False,
        "message": "Product deactivated successfully"
    }


@router.put("/{product_id}", response_model=dict)
async def update_product(
    product_update: ProductUpdate,
    product_id: str = Path(...),
    db: Session = Depends(get_db),
    _: User = Depends(get_current_active_user)
) -> Any:
    """
    Обновление параметров товара
    """
    # Поиск товара по product_id
    product = db.query(SkuMonitoring).filter(SkuMonitoring.product_id == product_id).first()
    
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    
    # Обновление полей товара
    if product_update.mrpc is not None:
        if product_update.mrpc <= 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="MRPC must be greater than zero"
            )
        product.mrpc = product_update.mrpc
    
    if product_update.active is not None:
        # Если товар активируется, проверяем возможность активации
        if product_update.active:
            can_activate, message = can_activate_product(
                available=product.available,
                mrpc=product.mrpc,
                front_price=product.front_price
            )
            
            if not can_activate:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=message
                )
        
        product.active = product_update.active
    
    if product_update.discount is not None:
        if product_update.discount < 0 or product_update.discount > 100:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Discount must be between 0 and 100"
            )
        product.discount = product_update.discount
    
    product.update_timestamp = datetime.now()
    db.commit()
    
    return {
        "status": "success",
        "message": "Product updated successfully"
    }


@router.post("/update-prices", response_model=UpdatePricesResponse)
async def update_prices(
    request: Optional[UpdatePricesRequest] = None,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_active_user)
) -> Any:
    """
    Принудительное обновление цен товаров
    """
    try:
        price_verification_queue = []
        updated_count = 0
        errors = []
        
        # Получаем список товаров для обновления
        query = db.query(SkuMonitoring).filter(
            and_(
                SkuMonitoring.active == True,
                SkuMonitoring.mrpc > 0,
                SkuMonitoring.available == True
            )
        )
        
        # Если указаны конкретные product_ids, фильтруем по ним
        if request and request.product_ids:
            query = query.filter(SkuMonitoring.product_id.in_(request.product_ids))
        
        products = query.all()
        
        # Обновляем цены товаров
        for product in products:
            try:
                # Обновляем цену
                if await update_product_price(db, product, price_verification_queue):
                    updated_count += 1
            except Exception as e:
                errors.append({"product_id": product.product_id, "error": str(e)})
        
        db.commit()
        
        return {
            "status": "success",
            "updated": updated_count,
            "errors": errors
        }
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating prices: {str(e)}"
        )


@router.post("/monitor", response_model=dict)
async def monitor_products_endpoint(
    db: Session = Depends(get_db),
    _: User = Depends(get_current_active_user)
) -> Any:
    """
    Ручной запуск мониторинга товаров
    """
    try:
        await monitor_products()
        return {
            "status": "success",
            "message": "Мониторинг товаров успешно запущен"
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ошибка при запуске мониторинга: {str(e)}"
        ) 