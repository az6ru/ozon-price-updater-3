from typing import Any, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
import math
from datetime import datetime, date

from app.db.database import get_db
from app.db.models import ApiLogEntry, User
from app.db.schemas import ApiLog, PaginatedResponse
from app.core.security import get_current_active_user

router = APIRouter()


@router.get("", response_model=PaginatedResponse)
async def get_api_logs(
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    success: Optional[bool] = None,
    page: int = Query(1, ge=1),
    per_page: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
    _: User = Depends(get_current_active_user)
) -> Any:
    """
    Получение логов API с фильтрацией и пагинацией
    """
    # Базовый запрос
    query = db.query(ApiLogEntry)
    
    # Применяем фильтры
    if start_date:
        query = query.filter(ApiLogEntry.timestamp >= datetime.combine(start_date, datetime.min.time()))
    
    if end_date:
        query = query.filter(ApiLogEntry.timestamp <= datetime.combine(end_date, datetime.max.time()))
    
    if success is not None:
        query = query.filter(ApiLogEntry.success == success)
    
    # Сортировка по времени (сначала новые)
    query = query.order_by(ApiLogEntry.timestamp.desc())
    
    # Получаем общее количество записей
    total_items = query.count()
    
    # Рассчитываем пагинацию
    total_pages = math.ceil(total_items / per_page)
    offset = (page - 1) * per_page
    
    # Получаем записи для текущей страницы
    items = query.offset(offset).limit(per_page).all()
    
    return {
        "items": items,
        "total": total_items,
        "page": page,
        "pages": total_pages
    } 