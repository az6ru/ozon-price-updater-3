import logging
from typing import List, Dict, Optional, Tuple
from datetime import datetime
import json

from sqlalchemy.orm import Session
from sqlalchemy import and_

from app.db.database import get_db_session
from app.db.models import SkuMonitoring, PriceHistory
from app.services.ozon_api import ozon_api, OzonApiError
from app.services.price_calculator import calculate_price_adjustment, analyze_price_difference
from app.core.config import settings

logger = logging.getLogger(__name__)


async def update_product_price(
    db: Session, 
    product: SkuMonitoring,
    price_verification_queue: List[Dict]
) -> bool:
    """
    Обновляет цену товара в Ozon и сохраняет в истории изменений
    
    Args:
        db: Сессия базы данных
        product: Товар для обновления цены
        price_verification_queue: Очередь на проверку изменений цен
        
    Returns:
        bool: Успешно ли обновлена цена
    """
    try:
        # Расчет новой цены и старой цены с учетом МРЦ и скидки
        new_price, new_old_price = calculate_price_adjustment(
            current_price=product.price,
            front_price=product.front_price,
            mrpc=product.mrpc,
            discount=product.discount
        )
        
        # Проверяем, нужно ли обновлять цену
        # Если текущая цена и old_price уже соответствуют расчетным, то пропускаем
        if abs(product.price - new_price) < 0.01 and abs(product.old_price - new_old_price) < 0.01:
            logger.debug(f"Product {product.product_id} prices already correct, skipping update")
            return False
            
        # Отправляем запрос на обновление цены в Ozon API
        await ozon_api.set_product_prices([{
            "product_id": product.product_id,
            "price": new_price,
            "old_price": new_old_price,
            "min_price": new_price
        }])
        
        # Создаем запись в истории изменений
        price_history = PriceHistory(
            product_id=product.product_id,
            timestamp=datetime.now(),
            showcase_price=product.front_price,
            old_price=product.price,
            new_price=new_price
        )
        db.add(price_history)
        
        # Обновляем цены в модели товара
        product.price = new_price
        product.old_price = new_old_price
        product.update_timestamp = datetime.now()
        
        # Добавляем товар в очередь на проверку
        price_verification_queue.append({
            "product_id": product.product_id,
            "expected_price": new_price,
            "update_time": datetime.now()
        })
        
        logger.info(f"Updated price for product {product.product_id}: new_price={new_price}, new_old_price={new_old_price}")
        return True
        
    except OzonApiError as e:
        logger.error(f"Error updating price for product {product.product_id}: {str(e)}")
        return False
    except Exception as e:
        logger.error(f"Unexpected error updating product {product.product_id}: {str(e)}")
        return False


async def maintain_mrpc_prices():
    """
    Задача поддержания цен в соответствии с МРЦ и скидками
    
    Процесс:
    1. Получение списка товаров с заданным МРЦ
    2. Для каждого товара:
       - Проверка текущей цены на витрине
       - Сравнение с установленным МРЦ
       - Расчет отклонений
       - Если товар активен (active = True):
         * Расчет новой цены
         * Расчет old_price с учетом скидки (если задана)
         * Отправка запроса на изменение цены в Ozon API
         * Добавление в очередь на проверку изменения
         * Сохранение в истории изменений
    """
    logger.info("Starting maintain MRPC prices task")
    
    price_verification_queue = []
    
    try:
        with get_db_session() as db:
            # Получаем список товаров с заданным МРЦ и активированным мониторингом
            active_products = db.query(SkuMonitoring).filter(
                and_(
                    SkuMonitoring.active == True,
                    SkuMonitoring.mrpc > 0,
                    SkuMonitoring.available == True
                )
            ).all()
            
            logger.info(f"Found {len(active_products)} active products with MRPC")
            
            updated_count = 0
            
            # Обрабатываем каждый товар
            for product in active_products:
                # Если нет цены на витрине, пропускаем
                if not product.front_price or product.front_price <= 0:
                    logger.debug(f"Product {product.product_id} has no front price, skipping")
                    continue
                
                # Анализируем разницу между ценой на витрине и МРЦ
                price_diff = analyze_price_difference(
                    front_price=product.front_price,
                    target_price=product.mrpc,
                    threshold_percent=1.0  # 1% порог отклонения
                )
                
                # Если цена на витрине отличается от МРЦ больше чем на порог,
                # или изменилась скидка, обновляем цену
                needs_update = price_diff["needs_update"]
                
                if needs_update:
                    logger.debug(
                        f"Product {product.product_id} needs price update: "
                        f"front_price={product.front_price}, mrpc={product.mrpc}, "
                        f"difference={price_diff['difference_percent']:.2f}%"
                    )
                    
                    # Обновляем цену
                    if await update_product_price(db, product, price_verification_queue):
                        updated_count += 1
            
            # Сохраняем изменения в БД
            db.commit()
            
            # Сохраняем очередь на проверку в глобальный кэш или БД
            # (в реальной имплементации нужно сохранять эту информацию между запусками)
            # В данном примере просто логируем
            logger.info(f"Added {len(price_verification_queue)} products to verification queue")
            
            logger.info(f"MRPC price maintenance completed: updated {updated_count} products")
            
    except Exception as e:
        logger.error(f"Error in maintain_mrpc_prices task: {str(e)}")
        raise 