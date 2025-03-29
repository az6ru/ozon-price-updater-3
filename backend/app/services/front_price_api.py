from typing import Dict, List, Optional, Any
import aiohttp
import json
import logging
from datetime import datetime

from app.core.config import settings

logger = logging.getLogger(__name__)


class FrontPriceApiError(Exception):
    """Исключение при ошибках в Front Price API"""
    def __init__(self, message: str, status_code: Optional[int] = None):
        self.message = message
        self.status_code = status_code
        super().__init__(self.message)


class FrontPriceApi:
    """Клиент для работы с Front Price API"""
    
    def __init__(self, base_url: str):
        self.base_url = base_url
    
    async def _make_request(self, method: str, endpoint: str, params: Optional[Dict] = None) -> Dict:
        """Выполнить запрос к Front Price API"""
        url = f"{self.base_url}{endpoint}"
        start_time = datetime.now()
        
        try:
            async with aiohttp.ClientSession() as session:
                async with session.request(
                    method=method,
                    url=url,
                    params=params,
                    timeout=30
                ) as response:
                    if response.status != 200:
                        error_msg = await response.text()
                        logger.error(f"Front Price API error: {error_msg}, status: {response.status}")
                        raise FrontPriceApiError(error_msg, response.status)
                    
                    return await response.json()
        except aiohttp.ClientError as e:
            logger.error(f"Front Price API connection error: {str(e)}")
            raise FrontPriceApiError(f"Connection error: {str(e)}")
        except Exception as e:
            logger.error(f"Unexpected error while calling Front Price API: {str(e)}")
            raise FrontPriceApiError(f"Unexpected error: {str(e)}")
        finally:
            elapsed = (datetime.now() - start_time).total_seconds()
            logger.debug(f"Front Price API request to {endpoint} took {elapsed:.2f} seconds")
    
    async def get_prices(self, seller_id: str, page: int = 1) -> Dict:
        """Получить цены товаров с витрины Ozon для указанного продавца
        
        Args:
            seller_id: ID продавца на Ozon
            page: Номер страницы для пагинации
            
        Returns:
            Dict с данными о товарах и информацией о пагинации
            {
                "pagination": {
                    "current_page": int,
                    "total_pages": int,
                    "items_per_page": int,
                    "total_items": int
                },
                "products": [
                    {
                        "name": str,
                        "price": {
                            "original": float,
                            "discount": float,
                            "discount_percent": int,
                            "card_price": float
                        },
                        "seller_id": str,
                        "sku_id": str,
                        ...
                    }
                ]
            }
        """
        endpoint = f"/api/v1/seller/{seller_id}"
        params = {"page": page}
        
        response = await self._make_request("GET", endpoint, params)
        
        # Проверка формата ответа
        if "products" not in response or "pagination" not in response:
            raise FrontPriceApiError("Invalid response format from Front Price API")
        
        return response
    
    async def get_all_seller_products(self, seller_id: str) -> List[Dict]:
        """Получить все товары продавца с витрины Ozon (с обработкой пагинации)
        
        Args:
            seller_id: ID продавца на Ozon
            
        Returns:
            List[Dict] список всех товаров продавца
        """
        # Получаем первую страницу
        first_page = await self.get_prices(seller_id, 1)
        
        # Извлекаем информацию о товарах и пагинации
        products = first_page["products"]
        pagination = first_page["pagination"]
        total_pages = pagination["total_pages"]
        
        # Если есть другие страницы, получаем их
        if total_pages > 1:
            for page in range(2, total_pages + 1):
                logger.debug(f"Fetching page {page} of {total_pages} for seller {seller_id}")
                page_data = await self.get_prices(seller_id, page)
                products.extend(page_data["products"])
        
        return products


# Создание экземпляра клиента Front Price API
front_price_api = FrontPriceApi(base_url=settings.FRONT_PRICE_API_URL) 