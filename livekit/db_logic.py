import psycopg2
from psycopg2.extras import RealDictCursor
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

DB_CONFIG = {
    'host': os.getenv('DB_HOST', '192.168.1.64'),
    'port': int(os.getenv('DB_PORT', '5432')),
    'database': os.getenv('DB_NAME', 'rolevatedb'),
    'user': os.getenv('DB_USER', 'husain'),
    'password': os.getenv('DB_PASSWORD', 'tt55oo77'),
}

def get_db_connection():
    return psycopg2.connect(**DB_CONFIG, cursor_factory=RealDictCursor)

def get_job_ai_prompt(job_id):
    """
    Fetch the aiPrompt for a specific job_id from the job_posts table
    """
    if not job_id:
        print("[WARNING] No job_id provided, cannot fetch aiPrompt")
        return None
    
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute('''
            SELECT "aiPrompt" FROM job_posts WHERE id = %s
        ''', (job_id,))
        result = cur.fetchone()
        cur.close()
        conn.close()
        
        if result and result['aiPrompt']:
            print(f"[INFO] Found aiPrompt for job_id: {job_id}")
            return result['aiPrompt']
        else:
            print(f"[WARNING] No aiPrompt found for job_id: {job_id}")
            return None
            
    except Exception as e:
        print(f"[ERROR] Failed to fetch aiPrompt for job_id {job_id}: {e}")
        return None

def get_job_ai_instructions(job_id):
    """
    Fetch the aiInstructions for a specific job_id from the job_posts table
    """
    if not job_id:
        print("[WARNING] No job_id provided, cannot fetch aiInstructions")
        return None
    
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute('''
            SELECT "aiInstructions" FROM job_posts WHERE id = %s
        ''', (job_id,))
        result = cur.fetchone()
        cur.close()
        conn.close()
        
        if result and result['aiInstructions']:
            print(f"[INFO] Found aiInstructions for job_id: {job_id}")
            return result['aiInstructions']
        else:
            print(f"[WARNING] No aiInstructions found for job_id: {job_id}")
            return None
            
    except Exception as e:
        print(f"[ERROR] Failed to fetch aiInstructions for job_id {job_id}: {e}")
        return None

def get_job_ai_config(job_id):
    """
    Fetch both aiPrompt and aiInstructions for a specific job_id from the job_posts table
    Returns a dictionary with 'prompt' and 'instructions' keys
    """
    if not job_id:
        print("[WARNING] No job_id provided, cannot fetch AI config")
        return None
    
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute('''
            SELECT "aiPrompt", "aiInstructions" FROM job_posts WHERE id = %s
        ''', (job_id,))
        result = cur.fetchone()
        cur.close()
        conn.close()
        
        if result:
            config = {
                'prompt': result['aiPrompt'] if result['aiPrompt'] else None,
                'instructions': result['aiInstructions'] if result['aiInstructions'] else None
            }
            print(f"[INFO] Found AI config for job_id: {job_id}")
            print(f"  - aiPrompt: {len(config['prompt']) if config['prompt'] else 0} chars")
            print(f"  - aiInstructions: {len(config['instructions']) if config['instructions'] else 0} chars")
            return config
        else:
            print(f"[WARNING] No AI config found for job_id: {job_id}")
            return None
            
    except Exception as e:
        print(f"[ERROR] Failed to fetch AI config for job_id {job_id}: {e}")
        return None

# def create_history_table():
#     # Table is already created by NestJS/Prisma, so just return True
#     print("[INFO] Table managed by NestJS/Prisma - skipping creation")
#     return True

def save_interview_history(ai, user, language, job_id=None, candidate_id=None):
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute('''
        INSERT INTO interview_history (candidate_id, ai, "user", language, "jobId")
        VALUES (%s, %s, %s, %s, %s)
    ''', (candidate_id, ai, user, language, job_id))
    conn.commit()
    cur.close()
    conn.close()
