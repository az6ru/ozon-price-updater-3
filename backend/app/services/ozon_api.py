from typing import Dict, List, Optional, Any
import aiohttp
import json
import logging
from datetime import datetime

from app.core.config import settings

logger = logging.getLogger(__name__)


class OzonApiError(Exception):
    """Исключение при ошибках в Ozon API"""
    def __init__(self, message: str, status_code: Optional[int] = None):
        self.message = message
        self.status_code = status_code
        super().__init__(self.message)


class OzonApi:
    """Клиент для работы с Ozon Seller API"""
    
    def __init__(self, client_id: str, api_key: str):
        self.client_id = client_id
        self.api_key = api_key
        self.base_url = "https://api-seller.ozon.ru"
        self.headers = {
            "Client-Id": client_id,
            "Api-Key": api_key,
            "Content-Type": "application/json"
        }
    
    async def _make_request(self, method: str, endpoint: str, data: Optional[Dict] = None) -> Dict:
        """Выполнить запрос к Ozon API"""
        url = f"{self.base_url}{endpoint}"
        start_time = datetime.now()
        
        try:
            async with aiohttp.ClientSession() as session:
                async with session.request(
                    method=method,
                    url=url,
                    headers=self.headers,
                    json=data,
                    timeout=30
                ) as response:
                    response_data = await response.json()
                    if response.status != 200:
                        error_msg = response_data.get("message", "Unknown error")
                        logger.error(f"Ozon API error: {error_msg}, status: {response.status}")
                        raise OzonApiError(error_msg, response.status)
                    
                    return response_data
        except aiohttp.ClientError as e:
            logger.error(f"Ozon API connection error: {str(e)}")
            raise OzonApiError(f"Connection error: {str(e)}")
        except Exception as e:
            logger.error(f"Unexpected error while calling Ozon API: {str(e)}")
            raise OzonApiError(f"Unexpected error: {str(e)}")
        finally:
            elapsed = (datetime.now() - start_time).total_seconds()
            logger.debug(f"Ozon API request to {endpoint} took {elapsed:.2f} seconds")
    
    async def get_product_list(self, limit: int = 100, offset: int = 0) -> List[Dict]:
        """Получить список товаров продавца"""
        endpoint = "/v3/product/list"
        payload = {
            "filter": {
                "visibility": "ALL"
            },
            "limit": limit,
            "offset": offset
        }
        
        response = await self._make_request("POST", endpoint, payload)
        
        if "result" not in response or "items" not in response["result"]:
            raise OzonApiError("Invalid response format from Ozon API")
        
        return response["result"]["items"]
    
    async def get_product_info(self, product_ids: List[str]) -> List[Dict]:
        """Получить информацию о товарах по их ID"""
        endpoint = "/v3/product/info/list"
        payload = {
            "product_id": [int(pid) for pid in product_ids]
        }
        
        response = await self._make_request("POST", endpoint, payload)
        
        if "items" not in response:
            raise OzonApiError("Invalid response format from Ozon API")
        
        return response["items"]
    
    async def set_product_prices(self, prices: List[Dict]) -> Dict:
        """Обновить цены товаров
        
        Args:
            prices: Список словарей с ценами товаров, каждый словарь должен содержать:
                - product_id: ID товара
                - price: Новая цена
                - old_price: Старая цена (для отображения скидки)
                - min_price: Минимальная цена (опционально)
        """
        endpoint = "/v1/product/import/prices"
        
        # Подготовка данных для API
        payload = {
            "prices": [
                {
                    "product_id": item["product_id"],
                    "price": str(item["price"]),
                    "old_price": str(item.get("old_price", item["price"])),
                    "min_price": str(item.get("min_price", item["price"]))
                }
                for item in prices
            ]
        }
        
        return await self._make_request("POST", endpoint, payload)


# Создание экземпляра клиента Ozon API
ozon_api = OzonApi(
    client_id=settings.OZON_CLIENT_ID,
    api_key=settings.OZON_API_KEY
) 