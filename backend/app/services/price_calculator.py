from typing import Tuple, Dict, Optional, List
import logging

logger = logging.getLogger(__name__)


def calculate_price_adjustment(
    current_price: float,
    front_price: Optional[float],
    mrpc: Optional[float],
    discount: float = 0.0
) -> Tuple[float, float]:
    """
    Расчет новой цены и старой цены для управления скидкой
    
    Args:
        current_price: Текущая цена товара
        front_price: Цена на витрине
        mrpc: Минимальная розничная цена (фиксированная)
        discount: Процент скидки (0-100)
    
    Returns:
        Tuple[new_price, new_old_price]
        
    Логика:
    1. МРЦ является фиксированной ценой, которую мы хотим получить на витрине
    2. Управление скидкой происходит через old_price:
       - price = МРЦ (всегда фиксирована)
       - old_price = МРЦ / (1 - discount/100)
    """
    # Проверка, задано ли МРЦ
    if not mrpc or mrpc <= 0:
        logger.debug(f"MRPC not set or invalid, keeping current price: {current_price}")
        return current_price, current_price
        
    # Базовая проверка на положительную цену
    if current_price <= 0:
        logger.warning(f"Invalid current_price: {current_price}, using MRPC: {mrpc}")
        current_price = mrpc
    
    # Всегда используем МРЦ как целевую цену
    new_price = mrpc
    
    # Если задана скидка, рассчитываем old_price для получения нужного процента скидки
    if discount > 0 and discount < 100:
        # Формула: old_price = new_price / (1 - discount/100)
        discount_factor = 1 - (discount / 100)
        if discount_factor <= 0:
            logger.warning(f"Invalid discount factor: {discount_factor}, using 0.1")
            discount_factor = 0.1  # Защита от деления на ноль или отрицательное число
            
        new_old_price = round(new_price / discount_factor)
        logger.debug(f"Calculated prices: new_price={new_price}, new_old_price={new_old_price} with discount={discount}%")
        return new_price, new_old_price
    
    # Если скидка не задана, устанавливаем old_price = price (нет скидки)
    logger.debug(f"No discount, setting both prices to MRPC: {mrpc}")
    return new_price, new_price


def analyze_price_difference(
    front_price: float, 
    target_price: float, 
    threshold_percent: float = 1.0
) -> Dict:
    """
    Анализ разницы между ценой на витрине и целевой ценой
    
    Args:
        front_price: Текущая цена на витрине
        target_price: Целевая цена (МРЦ)
        threshold_percent: Порог отклонения в процентах (по умолчанию 1%)
    
    Returns:
        Dict с результатами анализа:
        {
            "needs_update": bool,  # Требуется ли обновление цены
            "difference": float,   # Абсолютная разница
            "difference_percent": float,  # Разница в процентах
            "threshold_exceeded": bool  # Превышен ли порог отклонения
        }
    """
    if front_price <= 0 or target_price <= 0:
        return {
            "needs_update": True,
            "difference": 0,
            "difference_percent": 0,
            "threshold_exceeded": True
        }
    
    # Расчет разницы в абсолютном и процентном выражении
    difference = front_price - target_price
    difference_percent = (difference / target_price) * 100
    
    # Проверка, превышен ли порог отклонения
    threshold_exceeded = abs(difference_percent) > threshold_percent
    
    return {
        "needs_update": threshold_exceeded,
        "difference": difference,
        "difference_percent": difference_percent,
        "threshold_exceeded": threshold_exceeded
    }


def can_activate_product(
    available: bool,
    mrpc: Optional[float],
    front_price: Optional[float]
) -> Tuple[bool, str]:
    """
    Проверка возможности активации товара
    
    Args:
        available: Доступность товара
        mrpc: Установленное МРЦ
        front_price: Цена на витрине
        
    Returns:
        tuple[can_activate: bool, message: str]
        
    Логика:
    1. Товар можно активировать если:
       - Есть в наличии (available = True)
       - Установлено МРЦ (mrpc > 0)
       - Есть цена на витрине (front_price > 0)
    2. В противном случае возвращается False и причина
    """
    if not available:
        return False, "Товар не доступен"
    if not mrpc or mrpc <= 0:
        return False, "Не установлено МРЦ"
    if not front_price or front_price <= 0:
        return False, "Нет цены на витрине"
    return True, "Товар можно активировать" 