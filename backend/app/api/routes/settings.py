from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import secrets
from datetime import datetime

from app.db.database import get_db
from app.db.models import User
from app.db.schemas import SettingsSchema, SettingsResponse
from app.core.security import get_current_active_user, get_current_superuser
from app.core.config import settings

router = APIRouter()


@router.get("", response_model=SettingsResponse)
async def get_settings(
    _: User = Depends(get_current_active_user)
) -> Any:
    """
    Получение текущих настроек приложения
    """
    return {
        "monitoring_interval": settings.MONITORING_INTERVAL,
        "price_update_interval": settings.PRICE_UPDATE_TIMEOUT,
        "ozon_client_id": settings.OZON_CLIENT_ID,
        "ozon_api_key": settings.OZON_API_KEY,
        "front_price_api_url": settings.FRONT_PRICE_API_URL,
        "secret_key": settings.SECRET_KEY,
        "last_update": None,  # В реальном приложении здесь должна быть метка времени последнего обновления
        "next_update": None   # И следующего запланированного обновления
    }


@router.put("", response_model=dict)
async def update_settings(
    settings_update: SettingsSchema,
    _: User = Depends(get_current_superuser)  # Только администратор может менять настройки
) -> Any:
    """
    Обновление настроек приложения
    """
    # В реальном приложении здесь должно быть обновление настроек в файле или БД
    # В этом примере мы просто возвращаем ответ
    
    # TODO: Логика обновления настроек и перезапуска планировщика задач
    # Это может включать запись в файл .env или базу данных,
    # а также перезапуск планировщика с новыми интервалами
    
    return {
        "status": "success",
        "message": "Settings updated successfully"
    }


@router.post("/generate-secret", response_model=dict)
async def generate_secret_key(
    _: User = Depends(get_current_superuser)  # Только администратор может менять секретный ключ
) -> Any:
    """
    Генерация нового секретного ключа
    """
    # Генерация случайного ключа
    new_secret_key = secrets.token_hex(32)
    
    # В реальном приложении здесь должно быть обновление секретного ключа в файле или БД
    # В этом примере мы просто возвращаем новый ключ
    
    # TODO: Логика обновления секретного ключа
    
    return {
        "status": "success",
        "secret_key": new_secret_key
    } 