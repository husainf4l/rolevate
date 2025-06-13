"""
SQL-based Session Manager for Job Post Agent

This module provides a robust SQL database-based session management system
using SQLite for development and can be easily adapted for PostgreSQL in production.
"""

import sqlite3
import json
import uuid
from typing import Dict, Any, Optional, List
from datetime import datetime, timedelta
from pathlib import Path
import threading
from contextlib import contextmanager

class SQLSessionState:
    """Represents a conversation session state for SQL storage."""
    
    def __init__(self, session_id: str, company_id: str, company_name: str = None):
        self.session_id = session_id
        self.company_id = company_id
        self.company_name = company_name or "Your Company"
        self.created_at = datetime.now()
        self.last_updated = datetime.now()
        self.conversation_history: List[str] = []
        self.job_data: Dict[str, Any] = {
            "title": "",
            "description": "",
            "requirements": "",
            "responsibilities": "",
            "benefits": "",
            "skills": [],
            "experienceLevel": "",
            "location": "",
            "workType": "",
            "salaryMin": 0,
            "salaryMax": 0,
            "currency": "JOD",
            "enableAiInterview": False,
            "isFeatured": False
        }
        self.current_step = "getting_basic_info"
        self.is_complete = False
        
    def to_dict(self) -> Dict[str, Any]:
        """Convert session state to dictionary for API responses."""
        return {
            "session_id": self.session_id,
            "company_id": self.company_id,
            "company_name": self.company_name,
            "created_at": self.created_at.isoformat(),
            "last_updated": self.last_updated.isoformat(),
            "conversation_history": self.conversation_history,
            "job_data": self.job_data,
            "current_step": self.current_step,
            "is_complete": self.is_complete
        }
    
    @classmethod
    def from_db_row(cls, row: sqlite3.Row) -> 'SQLSessionState':
        """Create session state from database row."""
        session = cls(row['session_id'], row['company_id'], row['company_name'])
        session.created_at = datetime.fromisoformat(row['created_at'])
        session.last_updated = datetime.fromisoformat(row['last_updated'])
        session.conversation_history = json.loads(row['conversation_history'])
        session.job_data = json.loads(row['job_data'])
        session.current_step = row['current_step']
        session.is_complete = bool(row['is_complete'])
        return session

class SQLSessionManager:
    """SQL-based session manager with SQLite backend."""
    
    def __init__(self, db_path: str = "sessions.db", session_timeout_hours: int = 24):
        self.db_path = db_path
        self.session_timeout = timedelta(hours=session_timeout_hours)
        self._lock = threading.Lock()
        
        # Initialize database
        self._init_database()
        
        print(f"🗄️  SQL Session Manager initialized with database: {db_path}")
    
    def _init_database(self):
        """Initialize the database schema."""
        with self._get_connection() as conn:
            conn.execute("""
                CREATE TABLE IF NOT EXISTS sessions (
                    session_id TEXT PRIMARY KEY,
                    company_id TEXT NOT NULL,
                    company_name TEXT NOT NULL,
                    created_at TEXT NOT NULL,
                    last_updated TEXT NOT NULL,
                    conversation_history TEXT NOT NULL DEFAULT '[]',
                    job_data TEXT NOT NULL DEFAULT '{}',
                    current_step TEXT NOT NULL DEFAULT 'getting_basic_info',
                    is_complete INTEGER NOT NULL DEFAULT 0
                )
            """)
            
            # Create indexes for better performance
            conn.execute("""
                CREATE INDEX IF NOT EXISTS idx_company_id ON sessions(company_id)
            """)
            
            conn.execute("""
                CREATE INDEX IF NOT EXISTS idx_created_at ON sessions(created_at)
            """)
            
            conn.execute("""
                CREATE INDEX IF NOT EXISTS idx_last_updated ON sessions(last_updated)
            """)
            
            conn.execute("""
                CREATE INDEX IF NOT EXISTS idx_is_complete ON sessions(is_complete)
            """)
            
            conn.commit()
    
    @contextmanager
    def _get_connection(self):
        """Get a database connection with proper error handling."""
        conn = sqlite3.connect(self.db_path, timeout=30.0)
        conn.row_factory = sqlite3.Row  # Enable column access by name
        try:
            yield conn
        finally:
            conn.close()
    
    def create_session(self, company_id: str, company_name: str = None, session_id: str = None) -> SQLSessionState:
        """Create a new session with optional specific session ID."""
        if not session_id:
            session_id = str(uuid.uuid4())
        
        session = SQLSessionState(session_id, company_id, company_name)
        
        with self._lock:
            with self._get_connection() as conn:
                try:
                    conn.execute("""
                        INSERT INTO sessions (
                            session_id, company_id, company_name, created_at, 
                            last_updated, conversation_history, job_data, 
                            current_step, is_complete
                        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """, (
                        session.session_id,
                        session.company_id,
                        session.company_name,
                        session.created_at.isoformat(),
                        session.last_updated.isoformat(),
                        json.dumps(session.conversation_history),
                        json.dumps(session.job_data),
                        session.current_step,
                        int(session.is_complete)
                    ))
                    conn.commit()
                    print(f"📝 Created new session: {session_id}")
                    return session
                except sqlite3.IntegrityError:
                    # Session ID already exists
                    raise ValueError(f"Session ID {session_id} already exists")
    
    def get_session(self, session_id: str) -> Optional[SQLSessionState]:
        """Retrieve a session by ID."""
        with self._get_connection() as conn:
            cursor = conn.execute(
                "SELECT * FROM sessions WHERE session_id = ?",
                (session_id,)
            )
            row = cursor.fetchone()
            
            if not row:
                return None
            
            # Check if session has expired
            last_updated = datetime.fromisoformat(row['last_updated'])
            if datetime.now() - last_updated > self.session_timeout:
                print(f"⏰ Session {session_id} has expired, removing...")
                self.delete_session(session_id)
                return None
            
            return SQLSessionState.from_db_row(row)
    
    def update_session(self, session: SQLSessionState):
        """Update an existing session."""
        session.last_updated = datetime.now()
        
        with self._lock:
            with self._get_connection() as conn:
                conn.execute("""
                    UPDATE sessions SET
                        company_name = ?,
                        last_updated = ?,
                        conversation_history = ?,
                        job_data = ?,
                        current_step = ?,
                        is_complete = ?
                    WHERE session_id = ?
                """, (
                    session.company_name,
                    session.last_updated.isoformat(),
                    json.dumps(session.conversation_history),
                    json.dumps(session.job_data),
                    session.current_step,
                    int(session.is_complete),
                    session.session_id
                ))
                conn.commit()
    
    def delete_session(self, session_id: str) -> bool:
        """Delete a session by ID."""
        with self._lock:
            with self._get_connection() as conn:
                cursor = conn.execute(
                    "DELETE FROM sessions WHERE session_id = ?",
                    (session_id,)
                )
                conn.commit()
                
                if cursor.rowcount > 0:
                    print(f"🗑️  Deleted session: {session_id}")
                    return True
                return False
    
    def get_sessions_by_company(self, company_id: str, limit: int = 50) -> List[SQLSessionState]:
        """Get all sessions for a specific company."""
        with self._get_connection() as conn:
            cursor = conn.execute("""
                SELECT * FROM sessions 
                WHERE company_id = ? 
                ORDER BY last_updated DESC 
                LIMIT ?
            """, (company_id, limit))
            
            sessions = []
            for row in cursor.fetchall():
                sessions.append(SQLSessionState.from_db_row(row))
            
            return sessions
    
    def get_recent_sessions(self, hours: int = 24, limit: int = 100) -> List[SQLSessionState]:
        """Get recent sessions within specified hours."""
        cutoff_time = (datetime.now() - timedelta(hours=hours)).isoformat()
        
        with self._get_connection() as conn:
            cursor = conn.execute("""
                SELECT * FROM sessions 
                WHERE last_updated >= ? 
                ORDER BY last_updated DESC 
                LIMIT ?
            """, (cutoff_time, limit))
            
            sessions = []
            for row in cursor.fetchall():
                sessions.append(SQLSessionState.from_db_row(row))
            
            return sessions
    
    def get_completed_jobs(self, limit: int = 50) -> List[SQLSessionState]:
        """Get completed job post sessions."""
        with self._get_connection() as conn:
            cursor = conn.execute("""
                SELECT * FROM sessions 
                WHERE is_complete = 1 
                ORDER BY last_updated DESC 
                LIMIT ?
            """, (limit,))
            
            sessions = []
            for row in cursor.fetchall():
                sessions.append(SQLSessionState.from_db_row(row))
            
            return sessions
    
    def cleanup_expired_sessions(self) -> int:
        """Clean up expired sessions and return count of deleted sessions."""
        cutoff_time = (datetime.now() - self.session_timeout).isoformat()
        
        with self._lock:
            with self._get_connection() as conn:
                cursor = conn.execute(
                    "DELETE FROM sessions WHERE last_updated < ?",
                    (cutoff_time,)
                )
                conn.commit()
                
                deleted_count = cursor.rowcount
                if deleted_count > 0:
                    print(f"🧹 Cleaned up {deleted_count} expired sessions")
                
                return deleted_count
    
    def get_session_stats(self) -> Dict[str, Any]:
        """Get session statistics."""
        with self._get_connection() as conn:
            # Total sessions
            total_sessions = conn.execute("SELECT COUNT(*) FROM sessions").fetchone()[0]
            
            # Active sessions (last 24 hours)
            cutoff_time = (datetime.now() - timedelta(hours=24)).isoformat()
            active_sessions = conn.execute(
                "SELECT COUNT(*) FROM sessions WHERE last_updated >= ?",
                (cutoff_time,)
            ).fetchone()[0]
            
            # Completed sessions
            completed_sessions = conn.execute(
                "SELECT COUNT(*) FROM sessions WHERE is_complete = 1"
            ).fetchone()[0]
            
            # Sessions by company
            company_stats = conn.execute("""
                SELECT company_name, COUNT(*) as session_count 
                FROM sessions 
                GROUP BY company_name 
                ORDER BY session_count DESC 
                LIMIT 10
            """).fetchall()
            
            return {
                "total_sessions": total_sessions,
                "active_sessions_24h": active_sessions,
                "completed_sessions": completed_sessions,
                "completion_rate": round((completed_sessions / total_sessions * 100), 2) if total_sessions > 0 else 0,
                "top_companies": [{"company": row[0], "sessions": row[1]} for row in company_stats]
            }

# Global instance
_sql_session_manager = None

def get_sql_session_manager(db_path: str = "sessions.db") -> SQLSessionManager:
    """Get the global SQL session manager instance."""
    global _sql_session_manager
    if _sql_session_manager is None:
        _sql_session_manager = SQLSessionManager(db_path)
    return _sql_session_manager
