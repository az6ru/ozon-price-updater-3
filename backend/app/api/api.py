from fastapi import APIRouter

from app.api.routes import auth, products, price_history, api_logs, settings, users

api_router = APIRouter()

# Добавление всех роутеров
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(products.router, prefix="/products", tags=["products"])
api_router.include_router(price_history.router, prefix="/price-history", tags=["price-history"])
api_router.include_router(api_logs.router, prefix="/api-logs", tags=["api-logs"])
api_router.include_router(settings.router, prefix="/settings", tags=["settings"]) 