#!/bin/bash

# Цвета для вывода
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

PROJECT_DIR="$(pwd)"
BACKEND_DIR="$PROJECT_DIR/backend"
FRONTEND_DIR="$PROJECT_DIR/frontend"

# Проверка существования директорий
if [ ! -d "$BACKEND_DIR" ]; then
    echo -e "${RED}Ошибка: Директория бэкенда не существует: $BACKEND_DIR${NC}"
    exit 1
fi

if [ ! -d "$FRONTEND_DIR" ]; then
    echo -e "${RED}Ошибка: Директория фронтенда не существует: $FRONTEND_DIR${NC}"
    exit 1
fi

# Функция для остановки процессов
stop_services() {
    echo -e "${YELLOW}Останавливаю запущенные сервисы...${NC}"
    
    # Остановка процессов npm
    echo -e "Останавливаю процессы фронтенда..."
    pkill -f "npm run dev" || true
    
    # Остановка процессов backend
    echo -e "Останавливаю процессы бэкенда..."
    pkill -f "python run.py" || true
    pkill -f "uvicorn app.main:app" || true
    
    # Даем процессам время на завершение
    sleep 2
    
    # Проверка, все ли процессы остановлены
    if pgrep -f "npm run dev" > /dev/null || pgrep -f "python run.py" > /dev/null || pgrep -f "uvicorn app.main:app" > /dev/null; then
        echo -e "${RED}Некоторые процессы не удалось остановить. Попробуйте остановить их вручную.${NC}"
    else
        echo -e "${GREEN}Все сервисы остановлены.${NC}"
    fi
}

# Функция для запуска бэкенда
start_backend() {
    echo -e "${YELLOW}Запуск бэкенда...${NC}"
    cd "$BACKEND_DIR"
    
    # Проверка наличия виртуального окружения
    if [ ! -d "venv" ]; then
        echo -e "Виртуальное окружение не найдено, создаю..."
        python -m venv venv
    fi
    
    # Активация виртуального окружения и запуск бэкенда
    source venv/bin/activate
    
    # Проверка установленных зависимостей
    if [ ! -f "venv/lib/python*/site-packages/fastapi" ]; then
        echo -e "Устанавливаю зависимости бэкенда..."
        pip install -r requirements.txt
    fi
    
    # Запуск бэкенда в фоновом режиме
    echo -e "Запуск сервера FastAPI..."
    python run.py > backend.log 2>&1 &
    
    # Проверка запуска
    sleep 3
    if curl -s http://localhost:8000/health > /dev/null; then
        echo -e "${GREEN}Бэкенд успешно запущен на http://localhost:8000${NC}"
        echo -e "${GREEN}API документация доступна по адресу http://localhost:8000/docs${NC}"
    else
        echo -e "${RED}Не удалось запустить бэкенд. Проверьте журнал backend.log${NC}"
    fi
    
    cd "$PROJECT_DIR"
}

# Функция для запуска фронтенда
start_frontend() {
    echo -e "${YELLOW}Запуск фронтенда...${NC}"
    cd "$FRONTEND_DIR"
    
    # Проверка установленных зависимостей
    if [ ! -d "node_modules" ]; then
        echo -e "Устанавливаю зависимости фронтенда..."
        npm install
    fi
    
    # Запуск фронтенда в фоновом режиме
    echo -e "Запуск сервера Next.js..."
    npm run dev > frontend.log 2>&1 &
    
    # Проверка запуска (даем немного времени на инициализацию)
    sleep 5
    if curl -s http://localhost:3000/ > /dev/null; then
        echo -e "${GREEN}Фронтенд успешно запущен на http://localhost:3000${NC}"
    else
        echo -e "${RED}Не удалось запустить фронтенд. Проверьте журнал frontend.log${NC}"
    fi
    
    cd "$PROJECT_DIR"
}

# Проверка аргументов
case "$1" in
    start)
        stop_services
        start_backend
        start_frontend
        echo -e "${GREEN}Все сервисы запущены.${NC}"
        ;;
    stop)
        stop_services
        ;;
    restart)
        stop_services
        start_backend
        start_frontend
        echo -e "${GREEN}Все сервисы перезапущены.${NC}"
        ;;
    status)
        echo -e "${YELLOW}Статус сервисов:${NC}"
        
        # Проверка статуса бэкенда
        if curl -s http://localhost:8000/health > /dev/null; then
            echo -e "${GREEN}Бэкенд: запущен (http://localhost:8000)${NC}"
        else
            echo -e "${RED}Бэкенд: остановлен${NC}"
        fi
        
        # Проверка статуса фронтенда
        if curl -s http://localhost:3000/ > /dev/null; then
            echo -e "${GREEN}Фронтенд: запущен (http://localhost:3000)${NC}"
        else
            echo -e "${RED}Фронтенд: остановлен${NC}"
        fi
        ;;
    *)
        echo -e "${YELLOW}Использование: $0 {start|stop|restart|status}${NC}"
        echo -e "  start   - Запуск всех сервисов"
        echo -e "  stop    - Остановка всех сервисов"
        echo -e "  restart - Перезапуск всех сервисов"
        echo -e "  status  - Проверка статуса сервисов"
        exit 1
        ;;
esac

exit 0 