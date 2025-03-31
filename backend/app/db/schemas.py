from typing import List, Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field, validator


# Базовые схемы для аутентификации
class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    username: Optional[str] = None


class UserBase(BaseModel):
    username: str
    email: str
    is_active: bool = True
    is_superuser: bool = False


class UserCreate(UserBase):
    password: str


class UserUpdate(BaseModel):
    username: Optional[str] = None
    email: Optional[str] = None
    password: Optional[str] = None
    is_active: Optional[bool] = None


class UserInDB(UserBase):
    id: int
    hashed_password: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class User(UserBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Схемы для товаров
class ProductBase(BaseModel):
    product_id: str
    sku: str
    name: str
    active: bool = False
    available: bool = True


class ProductCreate(ProductBase):
    price: float
    marketing_price: Optional[float] = None
    min_price: Optional[float] = None
    old_price: Optional[float] = None
    front_price: Optional[float] = None
    mrpc: Optional[float] = None
    discount: Optional[float] = Field(default=0.0, ge=0.0, le=100.0)
    product_url: Optional[str] = None


class ProductUpdate(BaseModel):
    mrpc: Optional[float] = None
    active: Optional[bool] = None
    discount: Optional[float] = Field(default=None, ge=0.0, le=100.0)


class Product(ProductBase):
    id: int
    price: float
    marketing_price: Optional[float] = None
    min_price: Optional[float] = None
    old_price: Optional[float] = None
    front_price: Optional[float] = None
    mrpc: Optional[float] = None
    discount: float = 0.0
    product_url: Optional[str] = None
    front_price_timestamp: Optional[datetime] = None
    update_timestamp: Optional[datetime] = None

    class Config:
        from_attributes = True


class MrpcUpdate(BaseModel):
    sku: str
    mrpc: float = Field(gt=0)


class MrpcUpdateResponse(BaseModel):
    sku: str
    mrpc: float
    message: str


class MrpcUpdateError(BaseModel):
    sku: str
    error: str


class MrpcUpdateBatchResponse(BaseModel):
    status: str
    updated: List[MrpcUpdateResponse]
    errors: List[MrpcUpdateError]


class DiscountUpdate(BaseModel):
    sku: str
    discount: float = Field(ge=0.0, le=100.0)


class DiscountUpdateResponse(BaseModel):
    sku: str
    discount: float
    old_price: Optional[float] = None
    message: str


class DiscountUpdateError(BaseModel):
    sku: str
    error: str


class DiscountUpdateBatchResponse(BaseModel):
    status: str
    updated: List[DiscountUpdateResponse]
    errors: List[DiscountUpdateError]


# Схемы для истории цен
class PriceHistoryBase(BaseModel):
    product_id: str
    timestamp: datetime
    showcase_price: Optional[float] = None
    old_price: Optional[float] = None
    new_price: Optional[float] = None


class PriceHistoryCreate(PriceHistoryBase):
    pass


class PriceHistory(PriceHistoryBase):
    id: int

    class Config:
        from_attributes = True


# Схемы для логов API
class ApiLogBase(BaseModel):
    endpoint: str
    method: str
    timestamp: datetime
    response_time: Optional[float] = None
    success: Optional[bool] = None
    error_message: Optional[str] = None
    products_count: Optional[int] = None
    request_payload: Optional[str] = None
    response_payload: Optional[str] = None


class ApiLogCreate(ApiLogBase):
    status_code: Optional[int] = None


class ApiLog(ApiLogBase):
    id: int
    status_code: Optional[int] = None

    class Config:
        from_attributes = True


# Схемы для цен с витрины
class FrontPriceResponse(BaseModel):
    sku: str
    front_price: float
    discount_percent: Optional[float] = None
    original_price: Optional[float] = None
    timestamp: datetime


# Схемы для проверки цен
class PriceVerificationResponse(BaseModel):
    product_id: str
    expected_price: float
    actual_price: float
    verified: bool
    timestamp: datetime


# Схемы для обновления цен
class ProductPriceUpdate(BaseModel):
    product_id: str
    price: float
    old_price: Optional[float] = None


class UpdatePricesRequest(BaseModel):
    product_ids: Optional[List[str]] = None


class UpdatePricesResponse(BaseModel):
    status: str
    updated: int
    errors: List[Dict[str, Any]]


# Схемы для настроек
class SettingsSchema(BaseModel):
    monitoring_interval: Optional[int] = None
    price_update_interval: Optional[int] = None
    ozon_client_id: Optional[str] = None
    ozon_api_key: Optional[str] = None
    front_price_api_url: Optional[str] = None


class SettingsResponse(BaseModel):
    monitoring_interval: int
    price_update_interval: int
    ozon_client_id: str
    ozon_api_key: str
    front_price_api_url: str
    secret_key: str
    last_update: Optional[datetime] = None
    next_update: Optional[datetime] = None


# Схемы для пагинации
class PaginatedResponse(BaseModel):
    items: List[Any]
    total: int
    page: int
    pages: int

    class Config:
        from_attributes = True 