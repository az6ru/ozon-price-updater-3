import logging
from sqlalchemy.orm import Session
from app.db.database import Base, engine, SessionLocal
from app.core.security import get_password_hash
from app.db.models import User
from app.core.config import settings

logger = logging.getLogger(__name__)

# Данные для первого пользователя-администратора
FIRST_SUPERUSER_USERNAME = "admin"
FIRST_SUPERUSER_EMAIL = "admin@example.com"
FIRST_SUPERUSER_PASSWORD = "admin123"  # В реальном проекте использовать более сложный пароль!

def init_db(db: Session) -> None:
    """
    Инициализация базы данных с созданием первого администратора
    """
    logger.info("Проверка наличия администратора...")
    
    # Проверяем, есть ли уже в базе суперпользователь
    user = db.query(User).filter(User.username == FIRST_SUPERUSER_USERNAME).first()
    
    # Если суперпользователя нет, создаем его
    if not user:
        logger.info(f"Создание пользователя-администратора с именем: {FIRST_SUPERUSER_USERNAME}")
        
        user_in = User(
            username=FIRST_SUPERUSER_USERNAME,
            email=FIRST_SUPERUSER_EMAIL,
            hashed_password=get_password_hash(FIRST_SUPERUSER_PASSWORD),
            is_superuser=True,
            is_active=True,
        )
        
        db.add(user_in)
        db.commit()
        
        logger.info("Пользователь-администратор успешно создан")
    else:
        logger.info("Пользователь-администратор уже существует")

    try:
        # Создаем все таблицы
        Base.metadata.create_all(bind=engine)
        logger.info("База данных успешно инициализирована")
        
    except Exception as e:
        logger.error(f"Ошибка при инициализации базы данных: {str(e)}", exc_info=True)
        raise 