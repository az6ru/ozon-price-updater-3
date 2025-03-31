-- Обновление URL товаров, используя SKU вместо product_id
UPDATE sku_monitoring
SET product_url = 'https://www.ozon.ru/product/' || sku
WHERE sku IS NOT NULL; 