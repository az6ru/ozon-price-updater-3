from sqlalchemy import Boolean, Column, Float, ForeignKey, Integer, String, DateTime, Text
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.db.database import Base


class SkuMonitoring(Base):
    """Модель для отслеживания товаров"""
    __tablename__ = "sku_monitoring"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(String, unique=True, index=True, nullable=False)
    sku = Column(String, index=True, nullable=False)
    name = Column(String, nullable=False)
    product_url = Column(String, nullable=True)
    marketing_price = Column(Float, nullable=True)
    min_price = Column(Float, nullable=True)
    old_price = Column(Float, nullable=True)
    price = Column(Float, nullable=False)
    front_price = Column(Float, nullable=True)
    mrpc = Column(Float, nullable=True)
    discount = Column(Float, default=0.0)  # Процент скидки от 0 до 100
    available = Column(Boolean, default=True)
    active = Column(Boolean, default=False)
    front_price_timestamp = Column(DateTime, nullable=True)
    update_timestamp = Column(DateTime, nullable=True)
    
    price_history = relationship("PriceHistory", back_populates="product", cascade="all, delete-orphan")


class PriceHistory(Base):
    """Модель для истории изменения цен"""
    __tablename__ = "price_history"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(String, ForeignKey("sku_monitoring.product_id"), nullable=False)
    timestamp = Column(DateTime, default=func.now(), nullable=False)
    showcase_price = Column(Float, nullable=True)
    old_price = Column(Float, nullable=True)
    new_price = Column(Float, nullable=True)
    
    product = relationship("SkuMonitoring", back_populates="price_history")


class ApiLogEntry(Base):
    """Модель для логирования API запросов"""
    __tablename__ = "api_log_entry"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=func.now(), nullable=False)
    endpoint = Column(String, nullable=False)
    method = Column(String, nullable=False)
    status_code = Column(Integer, nullable=True)
    response_time = Column(Float, nullable=True)
    products_count = Column(Integer, nullable=True)
    success = Column(Boolean, nullable=True)
    error_message = Column(Text, nullable=True)
    request_payload = Column(Text, nullable=True)
    response_payload = Column(Text, nullable=True)


class User(Base):
    """Модель пользователя"""
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    is_superuser = Column(Boolean, default=False)
    created_at = Column(DateTime, default=func.now(), nullable=False)
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now(), nullable=False) 