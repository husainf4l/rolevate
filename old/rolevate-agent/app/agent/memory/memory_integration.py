"""
Memory Integration Layer
Bridges the new shared memory system with existing chat memory and workflow components
"""
from typing import Dict, Any, Optional, List
import time

# Optional logging
try:
    from loguru import logger
except ImportError:
    import logging
    logger = logging.getLogger(__name__)

from app.agent.memory.shared_memory import (
    CVMemoryStructure, 
    CVMemoryManager,
    get_cv_memory_from_state,
    update_cv_memory_in_state,
    cv_memory_manager
)


class MemoryIntegrationManager:
    """
    Integration layer between shared memory system and existing components
    """
    
    def __init__(self):
        self.cv_memory_manager = cv_memory_manager
        self._chat_memory = None
    
    @property 
    def chat_memory(self):
        """Lazy load chat memory to avoid import issues"""
        if self._chat_memory is None:
            from app.agent.memory.chat_memory import chat_memory_manager
            self._chat_memory = chat_memory_manager
        return self._chat_memory
    
    def sync_chat_session_to_shared_memory(self, session_id: str) -> CVMemoryStructure:
        """
        Sync existing chat session data to standardized memory structure
        
        Args:
            session_id: Chat session identifier
            
        Returns:
            Standardized CV memory structure
        """
        try:
            # Load existing session data
            session_data = self.chat_memory.load_session_memory(session_id)
            old_cv_memory = session_data.get("cv_memory", {})
            
            # Migrate to standardized structure
            standardized_memory = self.cv_memory_manager.migrate_memory_structure(old_cv_memory)
            
            # Update session with standardized structure
            session_data["cv_memory"] = standardized_memory
            self.chat_memory.save_session_memory(session_id, session_data)
            
            logger.info(f"Synchronized session {session_id} to shared memory structure")
            return standardized_memory
            
        except Exception as e:
            logger.error(f"Failed to sync session to shared memory: {e}")
            return self.cv_memory_manager.create_empty_memory()
    
    def update_chat_session_from_workflow(self, session_id: str, workflow_state: Dict[str, Any]) -> bool:
        """
        Update chat session with results from LangGraph workflow
        
        Args:
            session_id: Chat session identifier
            workflow_state: LangGraph workflow state
            
        Returns:
            Success status
        """
        try:
            # Extract standardized CV memory from workflow state
            cv_memory = get_cv_memory_from_state(workflow_state)
            
            # Update chat session
            return self.chat_memory.update_cv_memory(session_id, cv_memory)
            
        except Exception as e:
            logger.error(f"Failed to update session from workflow: {e}")
            return False
    
    def prepare_workflow_state_from_session(self, session_id: str, user_message: str) -> Dict[str, Any]:
        """
        Prepare LangGraph workflow initial state from chat session
        
        Args:
            session_id: Chat session identifier
            user_message: User's current message
            
        Returns:
            Initial workflow state with standardized memory
        """
        # Sync session to shared memory format
        cv_memory = self.sync_chat_session_to_shared_memory(session_id)
        
        # Create initial workflow state
        workflow_state = {
            # Input data
            "raw_input": {"message": user_message, "session_id": session_id},
            "user_message": user_message,
            "user_id": None,  # Will be set by auth system
            
            # Standardized CV memory
            "cv_memory": cv_memory,
            
            # Workflow metadata
            "processing_step": "initialized",
            "workflow_id": f"workflow_{session_id}_{int(time.time())}",
            
            # Node outputs (empty initially)
            "parsed_data": {},
            "cleaned_data": {},
            "enhanced_content": {},
            "section_order": [],
            "selected_template": cv_memory.get("selected_template", "Modern"),
            "rendered_pdf": {},
            "optimization_report": {},
            "storage_info": {},
            
            # Metadata
            "cv_id": None,
            "error_log": [],
            "performance_metrics": {},
            "messages": []
        }
        
        return workflow_state


class CVCollectorAgentMemory:
    """Memory interface for CV Collector Agent"""
    
    def __init__(self, memory_manager: CVMemoryManager):
        self.memory_manager = memory_manager
    
    def update_personal_info(self, cv_memory: CVMemoryStructure, personal_data: Dict[str, Any]) -> CVMemoryStructure:
        """Update personal_info section"""
        updates = {"personal_info": personal_data}
        return self.memory_manager.merge_memory_updates(cv_memory, updates)
    
    def add_education_entry(self, cv_memory: CVMemoryStructure, education_entry: Dict[str, Any]) -> CVMemoryStructure:
        """Add new education entry"""
        updates = {
            "education": {
                "action": "add",
                "data": education_entry
            }
        }
        return self.memory_manager.merge_memory_updates(cv_memory, updates)
    
    def add_experience_entry(self, cv_memory: CVMemoryStructure, experience_entry: Dict[str, Any]) -> CVMemoryStructure:
        """Add new experience entry"""
        updates = {
            "experience": {
                "action": "add", 
                "data": experience_entry
            }
        }
        return self.memory_manager.merge_memory_updates(cv_memory, updates)
    
    def update_skills(self, cv_memory: CVMemoryStructure, skills: List[str]) -> CVMemoryStructure:
        """Update skills list"""
        updates = {"skills": skills}
        return self.memory_manager.merge_memory_updates(cv_memory, updates)
    
    def update_languages(self, cv_memory: CVMemoryStructure, languages: List[Dict[str, Any]]) -> CVMemoryStructure:
        """Update languages list"""
        updates = {"languages": languages}
        return self.memory_manager.merge_memory_updates(cv_memory, updates)


class CVWriterAgentMemory:
    """Memory interface for CV Writer Agent"""
    
    def __init__(self, memory_manager: CVMemoryManager):
        self.memory_manager = memory_manager
    
    def enhance_section_content(self, cv_memory: CVMemoryStructure, section: str, enhanced_content: Any) -> CVMemoryStructure:
        """Enhance content in specific section"""
        updates = {section: enhanced_content}
        return self.memory_manager.merge_memory_updates(cv_memory, updates)
    
    def update_professional_summary(self, cv_memory: CVMemoryStructure, summary: str) -> CVMemoryStructure:
        """Update professional summary"""
        updates = {
            "summary": summary,
            "personal_info": {**cv_memory.get("personal_info", {}), "summary": summary}
        }
        return self.memory_manager.merge_memory_updates(cv_memory, updates)


class TemplateAgentMemory:
    """Memory interface for Template Agent"""
    
    def __init__(self, memory_manager: CVMemoryManager):
        self.memory_manager = memory_manager
    
    def set_selected_template(self, cv_memory: CVMemoryStructure, template_name: str) -> CVMemoryStructure:
        """Set selected template"""
        updates = {"selected_template": template_name}
        return self.memory_manager.merge_memory_updates(cv_memory, updates)
    
    def get_template_context(self, cv_memory: CVMemoryStructure) -> Dict[str, Any]:
        """Get template rendering context from memory"""
        return {
            "personal_info": cv_memory["personal_info"],
            "education": cv_memory["education"],
            "experience": cv_memory["experience"],
            "skills": cv_memory["skills"],
            "languages": cv_memory["languages"],
            "summary": cv_memory.get("summary", ""),
            "template": cv_memory["selected_template"]
        }


class FileAgentMemory:
    """Memory interface for File Agent"""
    
    def __init__(self, memory_manager: CVMemoryManager):
        self.memory_manager = memory_manager
    
    def set_generated_pdf_url(self, cv_memory: CVMemoryStructure, pdf_url: str) -> CVMemoryStructure:
        """Update generated PDF URL"""
        updates = {"generated_pdf_url": pdf_url}
        return self.memory_manager.merge_memory_updates(cv_memory, updates)


class FeedbackAgentMemory:
    """Memory interface for Feedback Agent"""
    
    def __init__(self, memory_manager: CVMemoryManager):
        self.memory_manager = memory_manager
    
    def analyze_completeness(self, cv_memory: CVMemoryStructure) -> Dict[str, Any]:
        """Analyze CV completeness and provide feedback"""
        completion_percentage = self.memory_manager.get_completion_percentage(cv_memory)
        completion_status = cv_memory.get("completion_status", {})
        
        suggestions = []
        
        if not completion_status.get("personal_info"):
            suggestions.append("Add your personal information (name, email, phone)")
        
        if not completion_status.get("experience"):
            suggestions.append("Add your work experience")
        
        if not completion_status.get("education"):
            suggestions.append("Add your education background")
        
        if not completion_status.get("skills"):
            suggestions.append("List your relevant skills")
        
        if not completion_status.get("template_selected"):
            suggestions.append("Choose a CV template")
        
        return {
            "completion_percentage": completion_percentage,
            "completion_status": completion_status,
            "suggestions": suggestions,
            "is_ready_for_generation": completion_percentage >= 60
        }


# Global integration manager instance
memory_integration_manager = MemoryIntegrationManager()

# Agent-specific memory interfaces
cv_collector_memory = CVCollectorAgentMemory(cv_memory_manager)
cv_writer_memory = CVWriterAgentMemory(cv_memory_manager)
template_agent_memory = TemplateAgentMemory(cv_memory_manager)
file_agent_memory = FileAgentMemory(cv_memory_manager)
feedback_agent_memory = FeedbackAgentMemory(cv_memory_manager)

__all__ = [
    "MemoryIntegrationManager",
    "CVCollectorAgentMemory",
    "CVWriterAgentMemory", 
    "TemplateAgentMemory",
    "FileAgentMemory",
    "FeedbackAgentMemory",
    "memory_integration_manager",
    "cv_collector_memory",
    "cv_writer_memory",
    "template_agent_memory",
    "file_agent_memory",
    "feedback_agent_memory"
]