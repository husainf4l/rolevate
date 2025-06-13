"""
Session Manager for Job Post Agent

This module provides session management functionality for maintaining conversation state
across multiple API requests in the job post creation workflow.
"""

import json
import uuid
from typing import Dict, Any, Optional, List
from datetime import datetime, timedelta
from pathlib import Path
import os
from threading import Lock

class SessionState:
    """Represents a conversation session state."""
    
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
            "salaryMin": None,
            "salaryMax": None,
            "currency": "USD",
            "department": "",
            "enableAiInterview": False,
            "isFeatured": False
        }
        self.current_step = "getting_basic_info"
        self.is_complete = False
        
    def to_dict(self) -> Dict[str, Any]:
        """Convert session state to dictionary for storage."""
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
    def from_dict(cls, data: Dict[str, Any]) -> 'SessionState':
        """Create session state from dictionary."""
        session = cls(
            session_id=data["session_id"],
            company_id=data["company_id"],
            company_name=data.get("company_name", "Your Company")
        )
        session.created_at = datetime.fromisoformat(data["created_at"])
        session.last_updated = datetime.fromisoformat(data["last_updated"])
        session.conversation_history = data.get("conversation_history", [])
        session.job_data = data.get("job_data", session.job_data)
        session.current_step = data.get("current_step", "getting_basic_info")
        session.is_complete = data.get("is_complete", False)
        return session
    
    def update_last_activity(self):
        """Update the last activity timestamp."""
        self.last_updated = datetime.now()

class SessionManager:
    """Manages conversation sessions for the job post agent."""
    
    def __init__(self, storage_dir: str = "sessions", session_timeout_hours: int = 24):
        self.storage_dir = Path(storage_dir)
        self.storage_dir.mkdir(exist_ok=True)
        self.session_timeout = timedelta(hours=session_timeout_hours)
        self._lock = Lock()
        
        # In-memory cache for active sessions
        self._active_sessions: Dict[str, SessionState] = {}
        
        print(f"SessionManager initialized with storage: {self.storage_dir}")
    
    def create_session(self, company_id: str, company_name: str = None, session_id: str = None) -> SessionState:
        """Create a new conversation session."""
        if not session_id:
            session_id = str(uuid.uuid4())
        
        with self._lock:
            session = SessionState(session_id, company_id, company_name)
            self._active_sessions[session_id] = session
            self._save_session(session)
            
            print(f"Created new session: {session_id} for company: {company_name}")
            return session
    
    def get_session(self, session_id: str) -> Optional[SessionState]:
        """Get an existing session by ID."""
        with self._lock:
            # First check in-memory cache
            if session_id in self._active_sessions:
                session = self._active_sessions[session_id]
                
                # Check if session has expired
                if self._is_session_expired(session):
                    self._cleanup_session(session_id)
                    return None
                
                session.update_last_activity()
                return session
            
            # Try to load from storage
            session = self._load_session(session_id)
            if session and not self._is_session_expired(session):
                session.update_last_activity()
                self._active_sessions[session_id] = session
                return session
            
            return None
    
    def update_session(self, session: SessionState) -> bool:
        """Update an existing session."""
        try:
            with self._lock:
                session.update_last_activity()
                self._active_sessions[session.session_id] = session
                self._save_session(session)
                return True
        except Exception as e:
            print(f"Error updating session {session.session_id}: {e}")
            return False
    
    def delete_session(self, session_id: str) -> bool:
        """Delete a session."""
        with self._lock:
            return self._cleanup_session(session_id)
    
    def list_active_sessions(self, company_id: str = None) -> List[SessionState]:
        """List all active sessions, optionally filtered by company."""
        with self._lock:
            sessions = []
            for session in self._active_sessions.values():
                if not self._is_session_expired(session):
                    if company_id is None or session.company_id == company_id:
                        sessions.append(session)
            return sessions
    
    def cleanup_expired_sessions(self) -> int:
        """Clean up expired sessions and return count of cleaned sessions."""
        with self._lock:
            expired_sessions = []
            for session_id, session in self._active_sessions.items():
                if self._is_session_expired(session):
                    expired_sessions.append(session_id)
            
            for session_id in expired_sessions:
                self._cleanup_session(session_id)
            
            print(f"Cleaned up {len(expired_sessions)} expired sessions")
            return len(expired_sessions)
    
    def _is_session_expired(self, session: SessionState) -> bool:
        """Check if a session has expired."""
        return datetime.now() - session.last_updated > self.session_timeout
    
    def _save_session(self, session: SessionState):
        """Save session to persistent storage."""
        try:
            session_file = self.storage_dir / f"{session.session_id}.json"
            with open(session_file, 'w') as f:
                json.dump(session.to_dict(), f, indent=2)
        except Exception as e:
            print(f"Error saving session {session.session_id}: {e}")
    
    def _load_session(self, session_id: str) -> Optional[SessionState]:
        """Load session from persistent storage."""
        try:
            session_file = self.storage_dir / f"{session_id}.json"
            if session_file.exists():
                with open(session_file, 'r') as f:
                    data = json.load(f)
                return SessionState.from_dict(data)
        except Exception as e:
            print(f"Error loading session {session_id}: {e}")
        return None
    
    def _cleanup_session(self, session_id: str) -> bool:
        """Remove session from memory and storage."""
        try:
            # Remove from memory
            if session_id in self._active_sessions:
                del self._active_sessions[session_id]
            
            # Remove from storage
            session_file = self.storage_dir / f"{session_id}.json"
            if session_file.exists():
                session_file.unlink()
            
            return True
        except Exception as e:
            print(f"Error cleaning up session {session_id}: {e}")
            return False

# Global session manager instance
_session_manager = None

def get_session_manager() -> SessionManager:
    """Get the global session manager instance."""
    global _session_manager
    if _session_manager is None:
        _session_manager = SessionManager()
    return _session_manager
