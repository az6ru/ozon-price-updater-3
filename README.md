# Ozon Price Updater 3.0

Система для мониторинга и обновления цен товаров на Ozon.

## Описание

Ozon Price Updater - это приложение, которое позволяет автоматизировать процесс мониторинга и обновления цен товаров на Ozon. Система отслеживает изменения цен конкурентов, позволяет устанавливать правила для автоматического обновления цен и предоставляет удобный интерфейс для контроля за процессом.

## Основные возможности

- Мониторинг цен товаров на Ozon
- Автоматическое обновление цен на основе заданных правил
- Отслеживание МРПЦ (минимальной рекомендованной цены)
- Проверка соответствия цен требованиям Ozon
- Ведение истории изменения цен
- Логирование API запросов
- Управление пользователями с разными уровнями доступа

## Структура проекта

Проект состоит из двух основных частей:

- `backend/` - Серверная часть на FastAPI (Python)
- `frontend/` - Клиентская часть на Nuxt.js 3 (Vue 3 + TypeScript)

## Требования

### Для backend:

- Python 3.9+
- FastAPI
- SQLAlchemy
- Pydantic
- HTTPX
- APScheduler
- Другие зависимости (см. requirements.txt)

### Для frontend:

- Node.js 16+
- Nuxt.js 3
- Vue.js 3
- TypeScript
- TailwindCSS
- Pinia
- ApexCharts

## Установка и запуск

### Backend

1. Перейдите в директорию backend:
   ```bash
   cd backend
   ```

2. Создайте виртуальное окружение:
   ```bash
   python -m venv venv
   ```

3. Активируйте виртуальное окружение:
   - На Windows:
     ```bash
     venv\Scripts\activate
     ```
   - На Unix или MacOS:
     ```bash
     source venv/bin/activate
     ```

4. Установите зависимости:
   ```bash
   pip install -r requirements.txt
   ```

5. Запустите сервер:
   ```bash
   python run.py
   ```

### Frontend

1. Перейдите в директорию frontend:
   ```bash
   cd frontend
   ```

2. Установите зависимости:
   ```bash
   npm install
   ```

3. Запустите сервер для разработки:
   ```bash
   npm run dev
   ```

4. Для сборки production версии:
   ```bash
   npm run build
   ```

## Конфигурация

### Backend

Основные настройки хранятся в файле конфигурации `backend/app/core/config.py`:

- `MONITORING_INTERVAL` - интервал мониторинга цен (в минутах)
- `PRICE_UPDATE_INTERVAL` - интервал обновления цен (в минутах)
- `OZON_CLIENT_ID` - ID клиента для API Ozon
- `OZON_API_KEY` - ключ API для доступа к API Ozon
- `FRONT_PRICE_API_URL` - URL для доступа к API Front Price

### Frontend

Настройки frontend хранятся в `frontend/nuxt.config.ts`.

## API Документация

После запуска backend, документация API доступна по адресу: `http://localhost:8000/docs`

## Лицензия

MIT License 