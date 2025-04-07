from typing import Generator, Dict, Optional
from fastapi import Depends, HTTPException, status
import time
import logging
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.db.models import ApiLogEntry

logger = logging.getLogger(__name__)


class APILogger:
    """
    Класс для логирования API запросов
    """
    def __init__(self, db: Session):
        self.db = db
        self.start_time = time.time()
        self.endpoint = ""
        self.method = ""
        self.status_code = None
        self.products_count = None
        self.success = None
        self.error_message = None
        self.request_payload = None
        self.response_payload = None
    
    def set_request_info(
        self, 
        endpoint: str, 
        method: str, 
        payload: Optional[Dict] = None,
        products_count: Optional[int] = None
    ):
        """Установка информации о запросе"""
        self.endpoint = endpoint
        self.method = method
        self.request_payload = str(payload) if payload else None
        self.products_count = products_count
    
    def set_response_info(
        self, 
        status_code: int, 
        success: bool, 
        payload: Optional[Dict] = None,
        error_message: Optional[str] = None
    ):
        """Установка информации об ответе"""
        self.status_code = status_code
        self.success = success
        self.response_payload = str(payload) if payload else None
        self.error_message = error_message
    
    def log(self):
        """Сохранение лога в базу данных"""
        response_time = time.time() - self.start_time
        
        try:
            log_entry = ApiLogEntry(
                endpoint=self.endpoint,
                method=self.method,
                status_code=self.status_code,
                response_time=response_time,
                products_count=self.products_count,
                success=self.success,
                error_message=self.error_message,
                request_payload=self.request_payload,
                response_payload=self.response_payload
            )
            
            self.db.add(log_entry)
            self.db.commit()
            
        except Exception as e:
            logger.error(f"Error saving API log: {str(e)}")
            self.db.rollback()


def get_api_logger(db: Session = Depends(get_db)) -> APILogger:
    """Зависимость для получения логгера API"""
    return APILogger(db) 