from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.security import get_current_active_user
from app.db.models import User
from app.db.database import get_db
from app.db.schemas import User as UserSchema

router = APIRouter()


@router.get("/me", response_model=UserSchema)
async def read_current_user(
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Получение информации о текущем пользователе
    """
    return current_user


@router.get("/{user_id}", response_model=UserSchema)
async def read_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Получение информации о пользователе по ID
    """
    # Только администраторы могут получать информацию о других пользователях
    if user_id != current_user.id and not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Недостаточно прав для выполнения операции",
        )
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Пользователь не найден",
        )
    
    return user 