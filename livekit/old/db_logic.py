import psycopg2
from psycopg2.extras import RealDictCursor
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

DB_CONFIG = {
    'host': os.getenv('DB_HOST', '192.168.1.64'),
    'port': int(os.getenv('DB_PORT', '5432')),
    'database': os.getenv('DB_NAME', 'rolevateinter'),
    'user': os.getenv('DB_USER', 'husain'),
    'password': os.getenv('DB_PASSWORD', 'tt55oo77'),
}

def get_db_connection():
    return psycopg2.connect(**DB_CONFIG, cursor_factory=RealDictCursor)

def create_history_table():
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute('''
            CREATE TABLE IF NOT EXISTS interview_history (
                id SERIAL PRIMARY KEY,
                user_id VARCHAR(64),
                question TEXT,
                answer TEXT,
                language VARCHAR(8),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        conn.commit()
        cur.close()
        conn.close()
        return True
    except Exception as e:
        print(f"[WARNING] Database operation skipped: {e}")
        return False

def save_interview_history(user_id, question, answer, language):
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute('''
        INSERT INTO interview_history (user_id, question, answer, language)
        VALUES (%s, %s, %s, %s)
    ''', (user_id, question, answer, language))
    conn.commit()
    cur.close()
    conn.close()
