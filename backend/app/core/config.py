from typing import Optional
import os
from pydantic import field_validator
from pydantic_settings import BaseSettings
import logging
import logging.handlers
import pathlib


class Settings(BaseSettings):
    # Базовые настройки приложения
    PROJECT_NAME: str = "Ozone Price Updater"
    API_V1_STR: str = "/api"
    VERSION: str = "3.0.0"
    
    # Настройки базы данных
    DATABASE_URL: str
    
    # Настройки безопасности
    SECRET_KEY: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 дней
    
    # Настройки внешних API
    OZON_CLIENT_ID: str
    OZON_API_KEY: str
    FRONT_PRICE_API_URL: str
    
    # Настройки мониторинга
    MONITORING_INTERVAL: int = 30  # в минутах
    PRICE_UPDATE_TIMEOUT: int = 60  # в минутах
    
    # Настройки логирования
    LOG_LEVEL: str = "INFO"
    LOG_FORMAT: str = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    LOG_FILE: str = "backend/logs/app.log"
    
    # Валидация DATABASE_URL
    @field_validator("DATABASE_URL")
    def validate_database_url(cls, v: str) -> str:
        if os.path.isfile(v.replace("sqlite:///", "")):
            return v
        return v
    
    def setup_logging(self):
        """Настройка логирования"""
        # Создаем директорию для логов, если её нет
        log_dir = pathlib.Path(os.path.dirname(self.LOG_FILE))
        log_dir.mkdir(parents=True, exist_ok=True)
        
        # Настраиваем корневой логгер
        root_logger = logging.getLogger()
        root_logger.setLevel(self.LOG_LEVEL)
        
        # Форматтер для логов
        formatter = logging.Formatter(self.LOG_FORMAT)
        
        # Хендлер для файла
        file_handler = logging.handlers.RotatingFileHandler(
            self.LOG_FILE,
            maxBytes=10*1024*1024,  # 10MB
            backupCount=5
        )
        file_handler.setFormatter(formatter)
        root_logger.addHandler(file_handler)
        
        # Хендлер для консоли
        console_handler = logging.StreamHandler()
        console_handler.setFormatter(formatter)
        root_logger.addHandler(console_handler)
    
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
settings.setup_logging() 