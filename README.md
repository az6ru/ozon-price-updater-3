# Ozon Price Updater v3.0

Система для автоматического обновления цен товаров на маркетплейсе Ozon с учетом МРЦП (минимальной розничной цены производителя).

## Технологии

### Бэкенд
- **FastAPI** - современный API фреймворк для Python
- **SQLAlchemy** - ORM для работы с базой данных
- **Pydantic** - для валидации данных
- **APScheduler** - для планирования задач

### Фронтенд
- **Nuxt 3** - фреймворк для Vue.js
- **Vue 3 Composition API** - основа фреймворка
- **Shadcn Vue** - библиотека UI компонентов
- **Tailwind CSS** - для стилизации
- **Pinia** - для управления состоянием

## Установка и запуск

Проект состоит из двух частей: бэкенд (FastAPI) и фронтенд (Nuxt.js). Для упрощения запуска всех компонентов используется скрипт `start-services.sh`.

### Требования
- Python 3.8+
- Node.js 16+
- npm 8+

### Запуск

1. Клонируйте репозиторий:
```
git clone <url-репозитория>
cd ozon-price-updater-3.0
```

2. Запустите все сервисы с помощью скрипта:
```
bash start-services.sh start
```

3. Скрипт автоматически:
   - Установит зависимости бэкенда и создаст виртуальное окружение
   - Установит зависимости фронтенда
   - Запустит бэкенд на порту 8000
   - Запустит фронтенд на порту 3000

4. Откройте приложение в браузере: [http://localhost:3000](http://localhost:3000)

### Дополнительные команды

```bash
# Остановка всех сервисов
bash start-services.sh stop

# Перезапуск всех сервисов
bash start-services.sh restart

# Проверка статуса сервисов
bash start-services.sh status
```

## Структура проекта

```
ozon-price-updater-3.0/
├── backend/              # FastAPI бэкенд
│   ├── app/              # Основная логика приложения
│   │   ├── api/          # API эндпоинты
│   │   ├── core/         # Настройки и утилиты
│   │   ├── db/           # Модели базы данных
│   │   ├── services/     # Сервисы для работы с внешними API
│   │   └── tasks/        # Фоновые задачи
│   ├── logs/             # Логи
│   ├── venv/             # Виртуальное окружение Python
│   ├── requirements.txt  # Зависимости Python
│   └── run.py            # Точка входа
├── frontend/             # Nuxt.js фронтенд
│   ├── components/       # Vue компоненты
│   ├── pages/            # Страницы приложения
│   ├── composables/      # Композиции Vue
│   ├── layouts/          # Макеты страниц
│   └── public/           # Статические файлы
└── start-services.sh     # Скрипт для управления сервисами
```

## Особенности

- Авторизация на основе JWT токенов
- Мониторинг и отслеживание изменений цен
- Автоматическое обновление цен на товары
- История изменения цен
- Настройка правил обновления цен (МРЦП и скидки)

## Настройка

Все основные настройки находятся в файле `.env` в директории бэкенда.

```
DATABASE_URL=sqlite:///app.db
SECRET_KEY=your-secret-key
OZON_CLIENT_ID=your-ozon-client-id
OZON_API_KEY=your-ozon-api-key
FRONT_PRICE_API_URL=url-to-front-api
```

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