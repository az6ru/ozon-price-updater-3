import logging
import time
from typing import Any, Callable
from pathlib import Path
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.interval import IntervalTrigger
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.core.config import settings
from app.db.database import Base, engine, SessionLocal
from app.api.api import api_router
from app.tasks.monitor_products import monitor_products
from app.tasks.maintain_mrpc_prices import maintain_mrpc_prices
from app.tasks.verify_price_changes import verify_price_changes
from app.db.init_db import init_db

# Настройка логирования
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)

# Создание планировщика задач
scheduler = AsyncIOScheduler()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Управление жизненным циклом приложения
    """
    # Инициализация базы данных
    Base.metadata.create_all(bind=engine)
    
    # Инициализация первого пользователя
    db = SessionLocal()
    try:
        init_db(db)
    finally:
        db.close()
    
    # Настройка задач планировщика
    scheduler.add_job(
        monitor_products,
        trigger=IntervalTrigger(minutes=settings.MONITORING_INTERVAL),
        id="monitor_products",
        replace_existing=True,
    )
    
    scheduler.add_job(
        maintain_mrpc_prices,
        trigger=IntervalTrigger(minutes=settings.PRICE_UPDATE_TIMEOUT),
        id="maintain_mrpc_prices",
        replace_existing=True,
    )
    
    scheduler.add_job(
        verify_price_changes,
        trigger=IntervalTrigger(minutes=1),
        id="verify_price_changes",
        replace_existing=True,
    )
    
    # Запуск планировщика
    scheduler.start()
    logger.info("Scheduler started")
    
    yield
    
    # Остановка планировщика при завершении работы
    scheduler.shutdown()
    logger.info("Scheduler shutdown")


# Создание приложения FastAPI
app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    lifespan=lifespan,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# Настройка CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],  # Домены фронтенда
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Middleware для логирования запросов
@app.middleware("http")
async def log_requests(request: Request, call_next: Callable) -> Response:
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    
    # Логирование времени обработки запроса
    logger.debug(
        f"Request: {request.method} {request.url.path} "
        f"- Response: {response.status_code} "
        f"- Time: {process_time:.3f} sec"
    )
    
    return response


# Подключение роутеров API
app.include_router(api_router, prefix=settings.API_V1_STR)


# Эндпоинт для проверки работоспособности приложения
@app.get("/health", tags=["health"])
async def health_check() -> dict:
    """
    Проверка работоспособности приложения и его компонентов
    """
    return {
        "status": "healthy",
        "components": {
            "database": {"status": "up"},
            "scheduler": {"status": "up" if scheduler.running else "down"}
        }
    }


# Эндпоинт для проверки статуса приложения
@app.get("/api/status", tags=["status"])
async def check_status() -> dict:
    """
    Проверка статуса системы
    """
    return {
        "status": "ok",
        "version": settings.VERSION,
    }


# Инициализация базы данных при запуске
@app.on_event("startup")
async def startup_event():
    try:
        logger.info("Инициализация базы данных...")
        db = SessionLocal()
        try:
            init_db(db)
        finally:
            db.close()
    except Exception as e:
        logger.error(f"Ошибка при инициализации базы данных: {str(e)}", exc_info=True)
        raise


if __name__ == "__main__":
    import uvicorn
    
    # Запуск приложения при прямом вызове скрипта
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True) 