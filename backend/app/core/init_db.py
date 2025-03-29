from sqlalchemy.orm import Session
from app.db.models import User
from app.core.security import get_password_hash
from app.core.config import settings

def init_db(db: Session) -> None:
    """Инициализация базы данных"""
    # Проверяем, существует ли уже администратор
    admin = db.query(User).filter(User.is_superuser == True).first()
    
    if not admin:
        # Создаем администратора по умолчанию
        admin = User(
            username="admin",
            email="admin@example.com",
            hashed_password=get_password_hash("admin123!"),
            is_active=True,
            is_superuser=True
        )
        db.add(admin)
        db.commit()
        print("Администратор создан успешно!")
        print("Логин: admin")
        print("Пароль: admin123!")
    else:
        print("Администратор уже существует") 