## **Описание API Ozon**

Информация о товарах получается в два этапа (запроса)

1. Сначала нужно получить список товаров с их `product_id` через метод `/v3/product/list`
2. Затем для этих `product_id` нужно получить подробную информацию (название, sku, наличие, цены) через метод `/v3/product/info/list`

### **GET PRODUCT LIST**

```bash
curl --location 'https://api-seller.ozon.ru/v3/product/list' \
--header 'Client-Id: 1179237' \
--header 'Api-Key: dacd56ac-be5c-4416-b3d4-db7d7775df38' \
--header 'Content-Type: application/json' \
--header 'Cookie: abt_data=7.ry5AlcRe3u40dKo33lxPVSrZxJOcaFHdbH3WqYMNJSAuOYuQRrfPjHnwmfabf4V9FXA5D7B0BXAA4KOuwum54eAiQj0LBvHDdHDkiaky03B4X8PXlDHsCQc1vtoZljAiWFH1wAzjzGC7HP11QLLHxqvXtAqrc5A2hcEZlFTw9ifLeFuFlOdLa1HraFj4_TY6afUOdl8kBFatod3rA-hklgCFEDcczLCV_tKqUvjEDildcxroDNOn_YADmwimUQj6eQqKRUa7oWd4F9-PcRVe2caG6O0GWCobnejT7tRKVTXNDdg6eysm2mzYaYHMJnBuSNWsd16YG-BXOnXEqi9HMM72fPlA4O76SVyslQGG' \
--data '{
  "filter": {
    "visibility": "ALL"
  },
  "limit": 100
}'

```

### **Ответ**

```json
{
    "result": {
        "items": [
            {
                "product_id": int,
                "offer_id": str,
                "has_fbo_stocks": bool,
                "has_fbs_stocks": bool,
                "archived": bool,
                "is_discounted": bool,
                "quants": [
                    {
                        "quant_code": str,
                        "quant_size": int
                    }
                ]
            }
        ]
    }
}

```

Из ответа нам необходимо собрость `product_id`

### **GET PRODUCT INFO**

Запрос информации о продукте по `product_id` для получения и сопоставления `sku`

```bash
curl --location 'https://api-seller.ozon.ru/v3/product/info/list' \
--header 'Client-Id: 1179237' \
--header 'Api-Key: dacd56ac-be5c-4416-b3d4-db7d7775df38' \
--header 'Content-Type: application/json' \
--header 'Cookie: abt_data=7.ry5AlcRe3u40dKo33lxPVSrZxJOcaFHdbH3WqYMNJSAuOYuQRrfPjHnwmfabf4V9FXA5D7B0BXAA4KOuwum54eAiQj0LBvHDdHDkiaky03B4X8PXlDHsCQc1vtoZljAiWFH1wAzjzGC7HP11QLLHxqvXtAqrc5A2hcEZlFTw9ifLeFuFlOdLa1HraFj4_TY6afUOdl8kBFatod3rA-hklgCFEDcczLCV_tKqUvjEDildcxroDNOn_YADmwimUQj6eQqKRUa7oWd4F9-PcRVe2caG6O0GWCobnejT7tRKVTXNDdg6eysm2mzYaYHMJnBuSNWsd16YG-BXOnXEqi9HMM72fPlA4O76SVyslQGG' \
--data '{
  "product_id": [
    533337017

  ]
}
'

```

### **Ответ**

В ответе у одного `product_id` могут быть несколько `sku` мы берем только первый

В ответе нам ужно 

- marketing_price
- min_price
- old_price
- price
- sku
- has_stock

```bash
{
    "items": [
        {
            "id": 533337017,
            "name": "Шунгит, цеолит, кварц смесь промытая 300гр",
            "offer_id": "001",
            "is_archived": false,
            "is_autoarchived": false,
            "barcodes": [],
            "description_category_id": 17028964,
            "type_id": 92912,
            "created_at": "2023-05-31T16:56:00.782321Z",
            "images": [
                "https://cdn1.ozone.ru/s3/multimedia-i/6667818894.jpg"
            ],
            "currency_code": "RUB",
            "marketing_price": "2752.00",
            "min_price": "2752.00",
            "old_price": "5500.00",
            "price": "2752.00",
            "sources": [
                {
                    "sku": 1660684851,
                    "source": "sds",
                    "created_at": "2024-08-16T14:53:12.048270Z",
                    "shipment_type": "SHIPMENT_TYPE_GENERAL",
                    "quant_code": ""
                }
            ],
            "model_info": {
                "model_id": 423678159,
                "count": 1
            },
            "commissions": [
                {
                    "delivery_amount": 151.36,
                    "percent": 17,
                    "return_amount": 63,
                    "sale_schema": "FBO",
                    "value": 467.84
                },
                {
                    "delivery_amount": 151.36,
                    "percent": 18,
                    "return_amount": 76,
                    "sale_schema": "FBS",
                    "value": 495.36
                },
                {
                    "percent": 17,
                    "sale_schema": "RFBS",
                    "value": 467.84
                },
                {
                    "percent": 17,
                    "sale_schema": "FBP",
                    "value": 467.84
                }
            ],
            "is_prepayment_allowed": true,
            "volume_weight": 0.3,
            "has_discounted_fbo_item": false,
            "is_discounted": false,
            "discounted_fbo_stocks": 0,
            "stocks": {
                "has_stock": false,
                "stocks": [
                    {
                        "present": 0,
                        "reserved": 0,
                        "sku": 1660684851,
                        "source": "fbs"
                    }
                ]
            },
            "errors": [],
            "updated_at": "2024-08-16T14:53:28.047934Z",
            "vat": "0.00",
            "visibility_details": {
                "has_price": true,
                "has_stock": false
            },
            "price_indexes": {
                "color_index": "COLOR_INDEX_WITHOUT_INDEX",
                "external_index_data": {
                    "minimal_price": "",
                    "minimal_price_currency": "RUB",
                    "price_index_value": 0
                },
                "ozon_index_data": {
                    "minimal_price": "",
                    "minimal_price_currency": "RUB",
                    "price_index_value": 0
                },
                "self_marketplaces_index_data": {
                    "minimal_price": "",
                    "minimal_price_currency": "RUB",
                    "price_index_value": 0
                }
            },
            "images360": [],
            "is_kgt": false,
            "color_image": [],
            "primary_image": [
                "https://cdn1.ozone.ru/s3/multimedia-3/6667818915.jpg"
            ],
            "statuses": {
                "status": "price_sent",
                "status_failed": "",
                "moderate_status": "approved",
                "validation_status": "success",
                "status_name": "Готов к продаже",
                "status_description": "Нет на складе",
                "is_created": true,
                "status_tooltip": "Привезите товар на склад Ozon или укажите его количество на своем складе",
                "status_updated_at": "2024-08-16T14:53:19.549986Z"
            },
            "is_super": false,
            "is_seasonal": false
        }
    ]
}

```

### **SET PRICE**

Установка цены через официальный api ozon

```json
curl --location 'https://api-seller.ozon.ru/v1/product/import/prices' \
--header 'Client-Id: 1179237' \
--header 'Api-Key: dacd56ac-be5c-4416-b3d4-db7d7775df38' \
--header 'Content-Type: application/json' \
--header 'Cookie: abt_data=7.jG6jilZoLcTK7D7-SRz_MT_EY39szb2Tdy2rMSYX13YACLt67xn8k2NLoMABNg8ZHxlXW8NfX4vVkWWaVH-R6q75XEQXoZ_MW4C_kVgdijaxJqryV7LFgHkFJRRV5fVrHsGVnZDvDPUuwdV3k7zA9OiGK00z4APOWWi2K8o4WSjLcfrG26WYyB-ZFUPtKZUw-dOAyEjSQ1NKcdC0FiOUkLq9U8Tp-BFusgxYq5CS-WNGGuJlbzTaU30CIQdygt0aqr0WcDPU-O2yJ730LYEr2ixk7f_zpObFGyXiX-BJSma8GW2jDSTuplVrMajS3mumJTfDWUoASwDTTQ' \
--data '{
    "prices": [
        {
            "product_id": "669626957",
            "price": "2891",
            "old_price": "5000",
            "min_price": "2891"

        }
    ]
}'

```

**Лимиты API:** 10 изменений цены в час для конкретного `product_id`