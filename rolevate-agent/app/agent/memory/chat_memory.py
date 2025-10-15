"""
Chat Memory State Management - Persistent CV building state for conversational AI
Manages user sessions and CV data persistence during chat interactions
"""
from typing import Dict, Any, Optional, List
from pathlib import Path
import json
import time
from loguru import logger
from app.config import settings
import hashlib


class CVChatMemory:
    """Manage persistent CV building memory for chat sessions"""
    
    def __init__(self):
        # Setup memory storage directory
        self.memory_dir = Path(settings.output_dir) / "chat_memory"
        self.memory_dir.mkdir(parents=True, exist_ok=True)
        
        # Session timeout (24 hours)
        self.session_timeout = 24 * 60 * 60
        
        # Default empty CV structure
        self.empty_cv_structure = {
            "personal_info": {
                "name": "",
                "email": "",
                "phone": "",
                "location": "",
                "linkedin": "",
                "github": "",
                "website": ""
            },
            "summary": "",
            "experiences": [],
            "education": [],
            "skills": [],
            "languages": [],
            "certifications": [],
            "selected_template": "modern",
            "conversation_state": "initial",
            "last_intent": "",
            "completion_status": {
                "personal_info": False,
                "summary": False,
                "experiences": False,
                "education": False,
                "skills": False
            }
        }
    
    def generate_session_id(self, user_identifier: str = None) -> str:
        """Generate a unique session ID"""
        if user_identifier:
            # Create deterministic session ID for authenticated users
            return hashlib.md5(f"cv_session_{user_identifier}".encode()).hexdigest()
        else:
            # Create random session ID for anonymous users
            timestamp = str(int(time.time() * 1000))
            return hashlib.md5(f"anonymous_{timestamp}".encode()).hexdigest()
    
    def get_session_file_path(self, session_id: str) -> Path:
        """Get the file path for a session's memory"""
        return self.memory_dir / f"session_{session_id}.json"
    
    def load_session_memory(self, session_id: str) -> Dict[str, Any]:
        """Load CV memory for a specific session"""
        
        session_file = self.get_session_file_path(session_id)
        
        try:
            if session_file.exists():
                with open(session_file, 'r', encoding='utf-8') as f:
                    memory_data = json.load(f)
                
                # Check if session has expired
                last_updated = memory_data.get("last_updated", 0)
                if time.time() - last_updated > self.session_timeout:
                    logger.info(f"Session {session_id} expired, creating new session")
                    return self.create_new_session(session_id)
                
                # Update last accessed time
                memory_data["last_accessed"] = time.time()
                self.save_session_memory(session_id, memory_data)
                
                logger.info(f"Loaded session memory for {session_id}")
                return memory_data
            else:
                logger.info(f"No existing session found for {session_id}, creating new")
                return self.create_new_session(session_id)
                
        except Exception as e:
            logger.error(f"Failed to load session memory: {e}")
            return self.create_new_session(session_id)
    
    def create_new_session(self, session_id: str) -> Dict[str, Any]:
        """Create a new chat session with empty CV structure"""
        
        new_session = {
            "session_id": session_id,
            "created_at": time.time(),
            "last_updated": time.time(),
            "last_accessed": time.time(),
            "message_count": 0,
            "cv_memory": self.empty_cv_structure.copy(),
            "conversation_history": [],
            "user_preferences": {
                "preferred_template": "modern",
                "notification_style": "friendly",
                "detail_level": "standard"
            }
        }
        
        self.save_session_memory(session_id, new_session)
        logger.info(f"Created new session: {session_id}")
        return new_session
    
    def save_session_memory(self, session_id: str, memory_data: Dict[str, Any]) -> bool:
        """Save CV memory for a specific session"""
        
        try:
            # Update timestamps
            memory_data["last_updated"] = time.time()
            memory_data["session_id"] = session_id
            
            session_file = self.get_session_file_path(session_id)
            
            with open(session_file, 'w', encoding='utf-8') as f:
                json.dump(memory_data, f, indent=2, ensure_ascii=False)
            
            logger.debug(f"Saved session memory for {session_id}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to save session memory: {e}")
            return False
    
    def update_cv_memory(self, session_id: str, cv_updates: Dict[str, Any]) -> bool:
        """Update CV memory within a session"""
        
        try:
            session_data = self.load_session_memory(session_id)
            
            # Update CV memory
            cv_memory = session_data.get("cv_memory", {})
            cv_memory.update(cv_updates)
            session_data["cv_memory"] = cv_memory
            
            # Update completion status
            self.update_completion_status(session_data)
            
            return self.save_session_memory(session_id, session_data)
            
        except Exception as e:
            logger.error(f"Failed to update CV memory: {e}")
            return False
    
    def update_completion_status(self, session_data: Dict[str, Any]) -> None:
        """Update completion status based on current CV data"""
        
        cv_memory = session_data.get("cv_memory", {})
        completion_status = cv_memory.get("completion_status", {})
        
        # Check personal info completion
        personal_info = cv_memory.get("personal_info", {})
        completion_status["personal_info"] = bool(
            personal_info.get("name") and 
            personal_info.get("email")
        )
        
        # Check summary completion
        completion_status["summary"] = bool(cv_memory.get("summary", "").strip())
        
        # Check experiences completion
        experiences = cv_memory.get("experiences", [])
        completion_status["experiences"] = len(experiences) > 0
        
        # Check education completion
        education = cv_memory.get("education", [])
        completion_status["education"] = len(education) > 0
        
        # Check skills completion
        skills = cv_memory.get("skills", [])
        completion_status["skills"] = len(skills) > 0
        
        cv_memory["completion_status"] = completion_status
        session_data["cv_memory"] = cv_memory
    
    def add_conversation_message(self, session_id: str, role: str, content: str, metadata: Dict = None) -> bool:
        """Add a message to conversation history"""
        
        try:
            session_data = self.load_session_memory(session_id)
            
            message = {
                "role": role,
                "content": content,
                "timestamp": time.time(),
                "metadata": metadata or {}
            }
            
            conversation_history = session_data.get("conversation_history", [])
            conversation_history.append(message)
            
            # Keep only last 50 messages to prevent memory bloat
            if len(conversation_history) > 50:
                conversation_history = conversation_history[-50:]
            
            session_data["conversation_history"] = conversation_history
            session_data["message_count"] = session_data.get("message_count", 0) + 1
            
            return self.save_session_memory(session_id, session_data)
            
        except Exception as e:
            logger.error(f"Failed to add conversation message: {e}")
            return False
    
    def get_conversation_context(self, session_id: str, last_n_messages: int = 10) -> List[Dict]:
        """Get recent conversation context for AI processing"""
        
        try:
            session_data = self.load_session_memory(session_id)
            conversation_history = session_data.get("conversation_history", [])
            
            # Return last N messages
            return conversation_history[-last_n_messages:] if conversation_history else []
            
        except Exception as e:
            logger.error(f"Failed to get conversation context: {e}")
            return []
    
    def get_cv_completion_progress(self, session_id: str) -> Dict[str, Any]:
        """Get CV completion progress for the session"""
        
        try:
            session_data = self.load_session_memory(session_id)
            cv_memory = session_data.get("cv_memory", {})
            completion_status = cv_memory.get("completion_status", {})
            
            total_sections = len(completion_status)
            completed_sections = sum(1 for completed in completion_status.values() if completed)
            
            progress_percentage = int((completed_sections / total_sections) * 100) if total_sections > 0 else 0
            
            return {
                "total_sections": total_sections,
                "completed_sections": completed_sections,
                "progress_percentage": progress_percentage,
                "completion_status": completion_status,
                "next_suggested_section": self.get_next_suggested_section(completion_status)
            }
            
        except Exception as e:
            logger.error(f"Failed to get completion progress: {e}")
            return {"progress_percentage": 0, "completion_status": {}}
    
    def get_next_suggested_section(self, completion_status: Dict[str, bool]) -> Optional[str]:
        """Suggest the next section to complete"""
        
        # Priority order for CV sections
        section_priority = [
            "personal_info",
            "summary", 
            "experiences",
            "skills",
            "education"
        ]
        
        for section in section_priority:
            if not completion_status.get(section, False):
                return section
        
        return None
    
    def cleanup_expired_sessions(self) -> int:
        """Clean up expired session files"""
        
        cleaned_count = 0
        current_time = time.time()
        
        try:
            for session_file in self.memory_dir.glob("session_*.json"):
                try:
                    with open(session_file, 'r', encoding='utf-8') as f:
                        session_data = json.load(f)
                    
                    last_updated = session_data.get("last_updated", 0)
                    if current_time - last_updated > self.session_timeout:
                        session_file.unlink()
                        cleaned_count += 1
                        logger.info(f"Cleaned up expired session: {session_file.name}")
                        
                except Exception as e:
                    logger.warning(f"Error processing session file {session_file}: {e}")
                    
            if cleaned_count > 0:
                logger.info(f"Cleaned up {cleaned_count} expired sessions")
                
        except Exception as e:
            logger.error(f"Error during session cleanup: {e}")
        
        return cleaned_count
    
    def export_session_data(self, session_id: str) -> Optional[Dict[str, Any]]:
        """Export complete session data for backup or analysis"""
        
        try:
            session_data = self.load_session_memory(session_id)
            
            # Add export metadata
            export_data = {
                "export_timestamp": time.time(),
                "session_data": session_data,
                "cv_completion_progress": self.get_cv_completion_progress(session_id)
            }
            
            return export_data
            
        except Exception as e:
            logger.error(f"Failed to export session data: {e}")
            return None


# Global chat memory manager instance
chat_memory_manager = CVChatMemory()


def get_or_create_session(session_id: str = None, user_id: str = None) -> tuple[str, Dict[str, Any]]:
    """Get or create a chat session"""
    
    if not session_id:
        session_id = chat_memory_manager.generate_session_id(user_id)
    
    session_data = chat_memory_manager.load_session_memory(session_id)
    return session_id, session_data


def update_session_cv_memory(session_id: str, cv_updates: Dict[str, Any]) -> bool:
    """Update CV memory in session"""
    return chat_memory_manager.update_cv_memory(session_id, cv_updates)


def add_session_message(session_id: str, role: str, content: str, metadata: Dict = None) -> bool:
    """Add message to session conversation"""
    return chat_memory_manager.add_conversation_message(session_id, role, content, metadata)