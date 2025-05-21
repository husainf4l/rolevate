import psycopg2
from psycopg2.extras import RealDictCursor

DB_CONFIG = {
    'host': '149.200.251.12',
    'port': 5432,
    'database': 'rolevate',
    'user': 'husain',
    'password': 'tt55oo77',
}

def get_db_connection():
    return psycopg2.connect(**DB_CONFIG, cursor_factory=RealDictCursor)

def create_history_table():
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
