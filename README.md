# Ozon Price Updater 3.0

Система для автоматического управления ценами на Ozon.

## Возможности

- Автоматический мониторинг цен конкурентов
- Автоматическое обновление цен по заданным правилам
- Управление минимальными ценами и наценками
- Поддержка массового обновления цен
- Веб-интерфейс для управления настройками

## Технологии

- Backend: FastAPI, SQLAlchemy, Pydantic
- Frontend: Nuxt.js 3, Vue.js 3, Tailwind CSS
- База данных: SQLite

## Установка и запуск

1. Клонируйте репозиторий:
```bash
git clone https://github.com/az6ru/ozon-price-updater-3.git
cd ozon-price-updater-3
```

2. Создайте файл .env и заполните его необходимыми переменными:
```env
OZON_CLIENT_ID=your_client_id
OZON_API_KEY=your_api_key
DATABASE_URL=sqlite:///./app.db
SECRET_KEY=your_secret_key
```

3. Запустите backend:
```bash
cd backend
python -m venv venv
source venv/bin/activate  # для Linux/Mac
# или
venv\Scripts\activate  # для Windows
pip install -r requirements.txt
uvicorn app.main:app --reload
```

4. Запустите frontend:
```bash
cd frontend
npm install
npm run dev
```

5. Откройте http://localhost:3000 в браузере

## Учетные данные по умолчанию

- Логин: admin
- Пароль: admin123!

## Лицензия

MIT 