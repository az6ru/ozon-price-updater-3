import logging
from typing import List, Dict, Optional
from datetime import datetime
from contextlib import contextmanager
import asyncio

from sqlalchemy.orm import Session
from sqlalchemy import update

from app.db.database import get_db_session
from app.db.models import SkuMonitoring
from app.services.ozon_api import ozon_api, OzonApiError
from app.services.front_price_api import front_price_api, FrontPriceApiError
from app.core.config import settings

logger = logging.getLogger(__name__)


async def process_product_batch(product_ids: List[str]) -> List[Dict]:
    """Получение полной информации о партии товаров из Ozon API"""
    try:
        return await ozon_api.get_product_info(product_ids)
    except OzonApiError as e:
        logger.error(f"Error fetching product info: {str(e)}")
        return []


async def map_ozon_product_to_model(product_data: Dict) -> Dict:
    """Преобразование данных товара из Ozon API в формат модели SkuMonitoring"""
    product_id = str(product_data["id"])
    
    # Получение SKU из sources
    sku = None
    if "sources" in product_data and product_data["sources"]:
        sku = str(product_data["sources"][0].get("sku", ""))
    
    # Проверка наличия товара
    has_stock = False
    if "stocks" in product_data and "has_stock" in product_data["stocks"]:
        has_stock = product_data["stocks"]["has_stock"]
    
    # Безопасное преобразование цен
    def safe_float(value, default=0.0):
        if not value or value == "":
            return default
        try:
            return float(value)
        except (ValueError, TypeError):
            return default
    
    # Цены
    marketing_price = safe_float(product_data.get("marketing_price"))
    min_price = safe_float(product_data.get("min_price"))
    old_price = safe_float(product_data.get("old_price"))
    price = safe_float(product_data.get("price"))
    
    # Формирование URL товара
    product_url = f"https://www.ozon.ru/product/{sku}" if sku else None
    
    return {
        "product_id": product_id,
        "sku": sku,
        "name": product_data.get("name", ""),
        "product_url": product_url,
        "marketing_price": marketing_price,
        "min_price": min_price,
        "old_price": old_price,
        "price": price,
        "available": has_stock,
        "update_timestamp": datetime.now()
    }


async def update_front_prices(db: Session, ozon_client_id: str) -> int:
    """Обновление цен товаров с витрины Ozon"""
    try:
        # Получение всех товаров с витрины Ozon
        products = await front_price_api.get_all_seller_products(ozon_client_id)
        
        updated_count = 0
        current_time = datetime.now()
        
        for product in products:
            sku_id = product.get("sku_id")
            if not sku_id:
                continue
                
            # Получение цены из объекта price
            price_data = product.get("price", {})
            card_price = price_data.get("card_price")
            original_price = price_data.get("original")
            discount_percent = price_data.get("discount_percent")
            
            if not card_price:
                continue
                
            # Обновление цены в БД
            product_in_db = db.query(SkuMonitoring).filter(SkuMonitoring.sku == sku_id).first()
            
            if product_in_db:
                product_in_db.front_price = card_price
                product_in_db.front_price_timestamp = current_time
                updated_count += 1
                
        db.commit()
        logger.info(f"Updated front prices for {updated_count} products")
        return updated_count
    except FrontPriceApiError as e:
        logger.error(f"Error updating front prices: {str(e)}")
        return 0


async def monitor_products():
    """
    Задача мониторинга всех товаров продавца
    
    Процесс:
    1. Получение полного списка товаров из Ozon API
    2. Для каждого товара:
       - Обновление базовой информации (наличие, цены, статусы)
       - Получение цены с витрины
       - Обновление информации о доступности
    3. Сохранение изменений в базе данных
    4. Логирование результатов мониторинга
    """
    logger.info("Starting products monitoring task")
    
    try:
        # Получение списка всех товаров
        all_products = await ozon_api.get_product_list(limit=100)
        product_ids = [str(item["product_id"]) for item in all_products]
        
        logger.info(f"Found {len(product_ids)} products in Ozon API")
        
        # Обработка товаров партиями для улучшения производительности
        batch_size = 50
        product_batches = [product_ids[i:i + batch_size] for i in range(0, len(product_ids), batch_size)]
        
        all_product_data = []
        for batch in product_batches:
            batch_data = await process_product_batch(batch)
            all_product_data.extend(batch_data)
        
        # Обработка полученных данных и обновление БД
        with get_db_session() as db:
            updated_count = 0
            new_count = 0
            
            # Сначала обновляем цены с витрины
            front_prices_count = await update_front_prices(db, settings.OZON_CLIENT_ID)
            
            # Затем обрабатываем данные о товарах
            for product_data in all_product_data:
                model_data = await map_ozon_product_to_model(product_data)
                
                # Проверяем, существует ли товар в БД
                existing_product = db.query(SkuMonitoring).filter(
                    SkuMonitoring.product_id == model_data["product_id"]
                ).first()
                
                if existing_product:
                    # Обновляем существующий товар
                    for key, value in model_data.items():
                        if key != "front_price" and key != "front_price_timestamp":
                            setattr(existing_product, key, value)
                    updated_count += 1
                else:
                    # Создаем новый товар
                    new_product = SkuMonitoring(**model_data)
                    db.add(new_product)
                    new_count += 1
            
            db.commit()
        
        logger.info(f"Monitoring completed: {new_count} new products, {updated_count} updated products, {front_prices_count} front prices updated")
        
    except Exception as e:
        logger.error(f"Error in monitor_products task: {str(e)}")
        raise 