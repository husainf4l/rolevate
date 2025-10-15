"""
CV Builder Shared Memory System
Standardized memory structure and management for LangGraph CV Builder workflow
Ensures consistent data flow between all nodes and agents
"""
from typing import Dict, Any, List, Optional, TypedDict, Union
from dataclasses import dataclass, field
import json
import time
from datetime import datetime
from pathlib import Path
from copy import deepcopy

# Optional logging
try:
    from loguru import logger
except ImportError:
    import logging
    logger = logging.getLogger(__name__)


class CVMemoryStructure(TypedDict):
    """
    Standardized CV memory structure used across all agents and nodes.
    This is the SINGLE SOURCE OF TRUTH for CV data format.
    
    Do NOT modify this structure without updating all dependent components.
    """
    # Core CV sections - exactly as specified
    personal_info: Dict[str, Any]
    education: List[Dict[str, Any]]
    experience: List[Dict[str, Any]]
    skills: List[str]
    languages: List[Dict[str, Any]]
    selected_template: str
    generated_pdf_url: str
    
    # Additional metadata for workflow management
    summary: Optional[str]
    certifications: Optional[List[Dict[str, Any]]]
    projects: Optional[List[Dict[str, Any]]]
    
    # Workflow state tracking
    completion_status: Dict[str, bool]
    last_updated: float
    version: int


@dataclass
class CVMemoryManager:
    """
    Central memory manager for CV Builder workflow.
    Ensures all nodes and agents access the same standardized memory structure.
    """
    
    def __init__(self):
        self._version = 1
        self._default_structure = self._get_default_cv_structure()
    
    def _get_default_cv_structure(self) -> CVMemoryStructure:
        """
        Get the default empty CV memory structure.
        This matches the required format exactly.
        """
        return CVMemoryStructure({
            # Required core sections
            "personal_info": {
                "full_name": "",
                "email": "",
                "phone": "",
                "location": "",
                "linkedin": "",
                "github": "",
                "website": "",
                "summary": ""  # Professional summary within personal info
            },
            "education": [],
            "experience": [],  # Note: using 'experience' not 'experiences' for consistency
            "skills": [],
            "languages": [],
            "selected_template": "Modern",
            "generated_pdf_url": "",
            
            # Extended sections for enhanced functionality
            "summary": "",  # Top-level professional summary
            "certifications": [],
            "projects": [],
            
            # Workflow metadata
            "completion_status": {
                "personal_info": False,
                "education": False,
                "experience": False,
                "skills": False,
                "languages": False,
                "template_selected": False,
                "pdf_generated": False
            },
            "last_updated": time.time(),
            "version": self._version
        })
    
    def create_empty_memory(self) -> CVMemoryStructure:
        """Create a new empty CV memory with default structure"""
        return deepcopy(self._default_structure)
    
    def validate_memory_structure(self, cv_memory: Dict[str, Any]) -> bool:
        """
        Validate that cv_memory follows the standardized structure
        
        Args:
            cv_memory: CV memory to validate
            
        Returns:
            True if structure is valid, False otherwise
        """
        required_keys = [
            "personal_info", "education", "experience", 
            "skills", "languages", "selected_template", "generated_pdf_url"
        ]
        
        # Check all required keys exist
        for key in required_keys:
            if key not in cv_memory:
                logger.warning(f"Missing required key in CV memory: {key}")
                return False
        
        # Validate data types
        type_checks = {
            "personal_info": dict,
            "education": list,
            "experience": list,
            "skills": list,
            "languages": list,
            "selected_template": str,
            "generated_pdf_url": str
        }
        
        for key, expected_type in type_checks.items():
            if not isinstance(cv_memory.get(key), expected_type):
                logger.warning(f"Invalid type for {key}. Expected {expected_type}, got {type(cv_memory.get(key))}")
                return False
        
        return True
    
    def migrate_memory_structure(self, old_memory: Dict[str, Any]) -> CVMemoryStructure:
        """
        Migrate old memory structure to current standardized format
        
        Args:
            old_memory: Legacy memory structure
            
        Returns:
            Migrated memory in standardized format
        """
        new_memory = self.create_empty_memory()
        
        # Map common fields
        field_mappings = {
            # Handle both 'experience' and 'experiences' for backward compatibility
            "experiences": "experience",
            "work_experience": "experience",
            
            # Personal info variations
            "contact_info": "personal_info",
            "personal_details": "personal_info",
            
            # Template variations
            "template": "selected_template",
            "template_name": "selected_template",
            
            # PDF URL variations
            "pdf_url": "generated_pdf_url",
            "download_url": "generated_pdf_url",
            "file_url": "generated_pdf_url"
        }
        
        # Direct mappings
        for old_key, new_key in field_mappings.items():
            if old_key in old_memory:
                new_memory[new_key] = old_memory[old_key]
        
        # Copy direct matches
        for key in new_memory.keys():
            if key in old_memory:
                new_memory[key] = old_memory[key]
        
        # Special handling for personal_info structure
        if "personal_info" in old_memory and isinstance(old_memory["personal_info"], dict):
            # Merge with default structure to ensure all fields exist
            for key, value in old_memory["personal_info"].items():
                if key in new_memory["personal_info"] or key in ["name", "full_name"]:
                    # Handle name/full_name variations
                    if key in ["name", "full_name"]:
                        new_memory["personal_info"]["full_name"] = value
                    else:
                        new_memory["personal_info"][key] = value
        
        # Update metadata
        new_memory["last_updated"] = time.time()
        new_memory["version"] = self._version
        
        # Recalculate completion status
        self.update_completion_status(new_memory)
        
        return new_memory
    
    def update_completion_status(self, cv_memory: CVMemoryStructure) -> None:
        """
        Update completion status based on current data
        
        Args:
            cv_memory: CV memory to update status for
        """
        completion = cv_memory.get("completion_status", {})
        
        # Check personal info completion
        personal_info = cv_memory.get("personal_info", {})
        completion["personal_info"] = bool(
            personal_info.get("full_name") and 
            personal_info.get("email")
        )
        
        # Check education completion
        completion["education"] = len(cv_memory.get("education", [])) > 0
        
        # Check experience completion
        completion["experience"] = len(cv_memory.get("experience", [])) > 0
        
        # Check skills completion
        completion["skills"] = len(cv_memory.get("skills", [])) > 0
        
        # Check languages completion
        completion["languages"] = len(cv_memory.get("languages", [])) > 0
        
        # Check template selection
        completion["template_selected"] = bool(cv_memory.get("selected_template"))
        
        # Check PDF generation
        completion["pdf_generated"] = bool(cv_memory.get("generated_pdf_url"))
        
        cv_memory["completion_status"] = completion
        cv_memory["last_updated"] = time.time()
    
    def get_completion_percentage(self, cv_memory: CVMemoryStructure) -> int:
        """
        Calculate completion percentage of CV
        
        Args:
            cv_memory: CV memory to analyze
            
        Returns:
            Completion percentage (0-100)
        """
        completion = cv_memory.get("completion_status", {})
        
        # Core sections with weights
        section_weights = {
            "personal_info": 25,
            "experience": 30,
            "education": 20,
            "skills": 15,
            "template_selected": 10
        }
        
        total_score = 0
        for section, weight in section_weights.items():
            if completion.get(section, False):
                total_score += weight
        
        return total_score
    
    def merge_memory_updates(self, base_memory: CVMemoryStructure, updates: Dict[str, Any]) -> CVMemoryStructure:
        """
        Safely merge updates into existing CV memory
        
        Args:
            base_memory: Current CV memory state
            updates: New data to merge
            
        Returns:
            Updated CV memory
        """
        merged_memory = deepcopy(base_memory)
        
        # Handle different update patterns
        for key, value in updates.items():
            if key in ["personal_info"] and isinstance(value, dict):
                # Merge personal info updates
                merged_memory[key].update(value)
            
            elif key in ["education", "experience", "skills", "languages"]:
                if isinstance(value, list):
                    # Replace entire list
                    merged_memory[key] = value
                elif isinstance(value, dict) and "action" in value:
                    # Handle structured updates (add, remove, update)
                    self._handle_list_update(merged_memory, key, value)
            
            elif key in merged_memory:
                # Direct assignment for simple fields
                merged_memory[key] = value
        
        # Update metadata
        self.update_completion_status(merged_memory)
        
        return merged_memory
    
    def _handle_list_update(self, memory: CVMemoryStructure, list_key: str, update: Dict[str, Any]) -> None:
        """Handle structured list updates (add, remove, update items)"""
        
        action = update.get("action")
        data = update.get("data")
        index = update.get("index")
        
        if list_key not in memory:
            memory[list_key] = []
        
        current_list = memory[list_key]
        
        if action == "add" and data:
            current_list.append(data)
        
        elif action == "remove" and index is not None:
            if 0 <= index < len(current_list):
                current_list.pop(index)
        
        elif action == "update" and index is not None and data:
            if 0 <= index < len(current_list):
                if isinstance(current_list[index], dict) and isinstance(data, dict):
                    current_list[index].update(data)
                else:
                    current_list[index] = data
        
        elif action == "replace":
            memory[list_key] = data if isinstance(data, list) else []


# Memory utility functions for node integration
def get_cv_memory_from_state(state: Dict[str, Any]) -> CVMemoryStructure:
    """
    Extract CV memory from LangGraph state, ensuring standard structure
    
    Args:
        state: LangGraph state dictionary
        
    Returns:
        Standardized CV memory structure
    """
    memory_manager = CVMemoryManager()
    
    # Get cv_memory from state, with fallbacks
    cv_memory = (
        state.get("cv_memory") or 
        state.get("cv_data") or 
        state.get("memory") or 
        {}
    )
    
    # Validate and migrate if necessary
    if not memory_manager.validate_memory_structure(cv_memory):
        logger.info("Migrating CV memory to standardized structure")
        cv_memory = memory_manager.migrate_memory_structure(cv_memory)
    
    return cv_memory


def update_cv_memory_in_state(state: Dict[str, Any], updates: Dict[str, Any]) -> None:
    """
    Update CV memory within LangGraph state
    
    Args:
        state: LangGraph state to update
        updates: Memory updates to apply
    """
    memory_manager = CVMemoryManager()
    
    # Get current memory
    current_memory = get_cv_memory_from_state(state)
    
    # Apply updates
    updated_memory = memory_manager.merge_memory_updates(current_memory, updates)
    
    # Store back in state
    state["cv_memory"] = updated_memory
    
    # Also update cv_data for backward compatibility
    state["cv_data"] = updated_memory


def create_agent_memory_context(cv_memory: CVMemoryStructure) -> Dict[str, Any]:
    """
    Create agent-specific memory context for different AI agents
    
    Args:
        cv_memory: Standardized CV memory
        
    Returns:
        Agent context with relevant memory sections
    """
    return {
        # Core data for all agents
        "cv_memory": cv_memory,
        
        # Specific views for different agents
        "collector_context": {
            "personal_info": cv_memory["personal_info"],
            "education": cv_memory["education"],
            "experience": cv_memory["experience"],
            "skills": cv_memory["skills"],
            "languages": cv_memory["languages"],
            "completion_status": cv_memory["completion_status"]
        },
        
        "writer_context": {
            "all_sections": cv_memory,
            "needs_enhancement": [
                key for key, completed in cv_memory["completion_status"].items()
                if completed and key in ["personal_info", "experience", "education"]
            ]
        },
        
        "template_context": {
            "selected_template": cv_memory["selected_template"],
            "cv_data": cv_memory,
            "completion_percentage": CVMemoryManager().get_completion_percentage(cv_memory)
        },
        
        "file_context": {
            "generated_pdf_url": cv_memory["generated_pdf_url"],
            "cv_data": cv_memory,
            "template": cv_memory["selected_template"]
        },
        
        "feedback_context": {
            "full_cv": cv_memory,
            "completion_status": cv_memory["completion_status"],
            "suggestions": []
        }
    }


# Global memory manager instance
cv_memory_manager = CVMemoryManager()

__all__ = [
    "CVMemoryStructure",
    "CVMemoryManager",
    "get_cv_memory_from_state",
    "update_cv_memory_in_state", 
    "create_agent_memory_context",
    "cv_memory_manager"
]