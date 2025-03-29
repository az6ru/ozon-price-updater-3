from typing import Optional
import os
from pydantic import field_validator
from pydantic_settings import BaseSettings


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
    
    # Валидация DATABASE_URL
    @field_validator("DATABASE_URL")
    def validate_database_url(cls, v: str) -> str:
        if os.path.isfile(v.replace("sqlite:///", "")):
            return v
        return v
    
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings() 