import os
import sqlite3
from dotenv import load_dotenv

def run_migrations():
    load_dotenv()
    
    # Получаем путь к базе данных из переменной окружения
    database_url = os.getenv('DATABASE_URL', 'sqlite:///app.db')
    db_path = database_url.replace('sqlite:///', '')
    
    conn = None
    cur = None
    
    try:
        # Подключаемся к базе данных
        print(f"Подключение к базе данных: {db_path}")
        conn = sqlite3.connect(db_path)
        cur = conn.cursor()
        
        # Читаем и выполняем SQL-скрипт
        with open('migrations/update_product_urls.sql', 'r') as f:
            sql = f.read()
            # Изменяем синтаксис SQL для SQLite
            sql = sql.replace('CONCAT(', '').replace(')', '')
            cur.execute(sql)
        
        # Фиксируем изменения
        conn.commit()
        print("Миграция успешно выполнена")
        
    except Exception as e:
        print(f"Ошибка при выполнении миграции: {e}")
        if conn:
            conn.rollback()
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()

if __name__ == "__main__":
    run_migrations() 