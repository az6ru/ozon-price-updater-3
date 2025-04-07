import logging
from typing import List, Dict, Optional
from datetime import datetime, timedelta
import json

from app.db.database import get_db_session
from app.db.models import SkuMonitoring
from app.services.front_price_api import front_price_api, FrontPriceApiError
from app.core.config import settings

logger = logging.getLogger(__name__)

# В реальной имплементации это должно храниться в базе данных или Redis
# Для примера используем глобальную переменную
PRICE_VERIFICATION_QUEUE = []


async def verify_price_changes():
    """
    Проверка применения изменений цен
    
    Процесс:
    1. Получение списка товаров из очереди на проверку
    2. Для каждого товара:
       - Получение актуальной цены с витрины
       - Сравнение с ожидаемой ценой
       - Если цена не изменилась:
         * Отправка уведомления
         * Логирование ошибки
    3. Очистка проверенных товаров из очереди
    """
    global PRICE_VERIFICATION_QUEUE
    
    if not PRICE_VERIFICATION_QUEUE:
        logger.debug("Price verification queue is empty")
        return
    
    logger.info(f"Starting price verification for {len(PRICE_VERIFICATION_QUEUE)} products")
    
    # Копируем текущую очередь и очищаем глобальную
    current_queue = PRICE_VERIFICATION_QUEUE.copy()
    PRICE_VERIFICATION_QUEUE = []
    
    # Фильтруем элементы старше 1 часа для повторной проверки
    now = datetime.now()
    filtered_queue = [
        item for item in current_queue 
        if now - item["update_time"] < timedelta(hours=1)
    ]
    
    if len(filtered_queue) != len(current_queue):
        logger.info(f"Removed {len(current_queue) - len(filtered_queue)} outdated items from verification queue")
    
    verification_results = []
    verification_failures = []
    
    try:
        # Получаем актуальные sku для проверяемых товаров
        with get_db_session() as db:
            product_ids = [item["product_id"] for item in filtered_queue]
            
            # Получаем продукты из БД для получения их SKU
            products = db.query(SkuMonitoring).filter(
                SkuMonitoring.product_id.in_(product_ids)
            ).all()
            
            # Создаем словарь product_id -> sku
            product_sku_map = {p.product_id: p.sku for p in products if p.sku}
            
            if not product_sku_map:
                logger.warning("No products found in DB for verification")
                return
                
            # Получаем текущие цены с витрины
            try:
                all_products = await front_price_api.get_all_seller_products(settings.OZON_CLIENT_ID)
                
                # Создаем словарь sku -> front_price
                sku_price_map = {}
                for product in all_products:
                    sku_id = product.get("sku_id")
                    price_data = product.get("price", {})
                    card_price = price_data.get("card_price")
                    
                    if sku_id and card_price:
                        sku_price_map[sku_id] = card_price
                
                # Проверяем каждый товар в очереди
                for item in filtered_queue:
                    product_id = item["product_id"]
                    expected_price = item["expected_price"]
                    
                    # Проверяем, есть ли SKU для этого product_id
                    if product_id not in product_sku_map:
                        logger.warning(f"Product {product_id} not found in DB")
                        continue
                    
                    sku = product_sku_map[product_id]
                    
                    # Проверяем, есть ли цена для этого SKU
                    if sku not in sku_price_map:
                        logger.warning(f"SKU {sku} for product {product_id} not found in front prices")
                        
                        # Добавляем обратно в очередь для повторной проверки
                        PRICE_VERIFICATION_QUEUE.append(item)
                        continue
                    
                    actual_price = sku_price_map[sku]
                    
                    # Сравниваем ожидаемую и актуальную цену
                    price_matches = abs(expected_price - actual_price) < 0.01
                    
                    verification_result = {
                        "product_id": product_id,
                        "sku": sku,
                        "expected_price": expected_price,
                        "actual_price": actual_price,
                        "verified": price_matches,
                        "timestamp": now
                    }
                    
                    verification_results.append(verification_result)
                    
                    if not price_matches:
                        verification_failures.append(verification_result)
                        logger.warning(
                            f"Price verification failed for product {product_id}: "
                            f"expected {expected_price}, actual {actual_price}"
                        )
                        
                        # Если прошло менее 30 минут с момента обновления, 
                        # добавляем обратно в очередь для повторной проверки
                        if now - item["update_time"] < timedelta(minutes=30):
                            PRICE_VERIFICATION_QUEUE.append(item)
                
                # Если есть неподтвержденные изменения цен, логируем их
                if verification_failures:
                    logger.error(f"Price verification failed for {len(verification_failures)} products")
                    
                    # В реальной имплементации здесь можно отправить уведомление
                    # или выполнить другие действия
                else:
                    logger.info(f"Price verification completed successfully for {len(verification_results)} products")
                
            except FrontPriceApiError as e:
                logger.error(f"Error getting front prices: {str(e)}")
                
                # Если произошла ошибка, возвращаем все элементы в очередь
                PRICE_VERIFICATION_QUEUE.extend(filtered_queue)
        
    except Exception as e:
        logger.error(f"Error in verify_price_changes task: {str(e)}")
        # Возвращаем элементы в очередь при непредвиденной ошибке
        PRICE_VERIFICATION_QUEUE.extend(filtered_queue) 