"""
Data Cleaner Node - Merge, deduplicate, and validate user CV data
Enhances the existing data structuring capabilities with advanced deduplication
"""
import asyncio
from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field
from loguru import logger
import json
from datetime import datetime

from app.config import settings
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from app.services.similarity_service import get_similarity_service


class CVMemory(BaseModel):
    """Enhanced CV data structure with validation"""
    personal_info: Dict[str, Any] = Field(default_factory=dict)
    experiences: List[Dict[str, Any]] = Field(default_factory=list)
    education: List[Dict[str, Any]] = Field(default_factory=list)
    skills: Dict[str, List[str]] = Field(default_factory=dict)
    languages: List[Dict[str, str]] = Field(default_factory=list)
    summary: str = ""
    certifications: List[Dict[str, Any]] = Field(default_factory=list)
    projects: List[Dict[str, Any]] = Field(default_factory=list)
    updated_at: str = Field(default_factory=lambda: datetime.now().isoformat())


class DataCleaner:
    """Advanced data cleaning and deduplication service using semantic similarity"""
    
    def __init__(self):
        self.llm = ChatOpenAI(
            model="gpt-4",
            temperature=0.1,
            openai_api_key=settings.openai_api_key
        )
        self.similarity_service = get_similarity_service()
        self.similarity_threshold = 0.85  # Higher threshold for semantic similarity
    
    async def find_duplicate_experiences(self, new_experience: Dict[str, Any], 
                                       existing_experiences: List[Dict[str, Any]]) -> Optional[int]:
        """Find duplicate experiences using FAISS and semantic similarity"""
        if not existing_experiences:
            return None
        
        # Use semantic similarity service for experience matching
        result = await self.similarity_service.find_similar_experiences(
            new_experience, 
            existing_experiences, 
            threshold=self.similarity_threshold
        )
        
        if result:
            index, similarity_score = result
            logger.info(f"Found similar experience with semantic score {similarity_score:.3f}")
            return index
        
        return None
    
    async def find_duplicate_skills(self, new_skill: str, existing_skills: List[str]) -> Optional[int]:
        """Find duplicate skills using semantic similarity"""
        if not existing_skills or not new_skill:
            return None
        
        # Use semantic similarity service for skill matching
        result = await self.similarity_service.find_similar_skills(
            new_skill, 
            existing_skills, 
            threshold=0.9  # Higher threshold for skills
        )
        
        if result:
            index, similarity_score = result
            logger.info(f"Found similar skill with semantic score {similarity_score:.3f}")
            return index
        
        return None
    
    # Legacy method for backward compatibility
    async def find_duplicates(self, new_item: Dict[str, Any], existing_items: List[Dict[str, Any]], 
                            key_field: str = "title") -> Optional[int]:
        """Find duplicate items - backward compatibility method"""
        if key_field in ["job_title", "title", "position"]:
            # For experience-like items, use semantic matching
            return await self.find_duplicate_experiences(new_item, existing_items)
        else:
            # For other items, use basic text comparison with semantic similarity
            new_text = str(new_item.get(key_field, ""))
            existing_texts = [str(item.get(key_field, "")) for item in existing_items]
            
            if not new_text or not existing_texts:
                return None
            
            # Check for exact matches first
            for idx, existing_text in enumerate(existing_texts):
                if new_text.lower() == existing_text.lower():
                    return idx
            
            # Use semantic similarity for non-exact matches
            result = await self.similarity_service.find_similar_skills(new_text, existing_texts)
            if result:
                return result[0]
            
        return None
    
    async def merge_experience_entries(self, new_exp: Dict[str, Any], existing_exp: Dict[str, Any]) -> Dict[str, Any]:
        """Intelligently merge two experience entries"""
        
        prompt = ChatPromptTemplate.from_template("""
        You are merging two work experience entries that appear to be duplicates or similar.
        
        Existing Experience:
        {existing}
        
        New Experience:  
        {new}
        
        Please merge these into a single, comprehensive experience entry. Rules:
        1. Keep the most complete and accurate information
        2. Combine descriptions if they add value
        3. Use the most specific job title and company name
        4. Preserve the broadest date range
        5. Merge achievements and responsibilities
        
        Return only valid JSON in this format:
        {{
            "job_title": "Final Job Title",
            "company": "Company Name",
            "start_date": "YYYY-MM",
            "end_date": "YYYY-MM or Present",
            "location": "City, Country", 
            "description": "Comprehensive description combining both entries",
            "achievements": ["achievement1", "achievement2"],
            "technologies": ["tech1", "tech2"]
        }}
        """)
        
        try:
            response = await self.llm.ainvoke(prompt.format_messages(
                existing=json.dumps(existing_exp, indent=2),
                new=json.dumps(new_exp, indent=2)
            ))
            
            merged_data = json.loads(response.content)
            logger.info(f"Successfully merged experience entries: {merged_data.get('job_title', 'Unknown')}")
            return merged_data
            
        except Exception as e:
            logger.error(f"Error merging experiences: {e}")
            # Fallback: return the new entry
            return new_exp
    
    async def validate_and_enhance_data(self, data: Dict[str, Any], section_type: str) -> Dict[str, Any]:
        """Validate and enhance data using AI"""
        
        validation_prompts = {
            "experience": """
            Validate and enhance this work experience entry:
            {data}
            
            Ensure:
            1. Job title is professional and clear
            2. Company name is properly formatted
            3. Dates are in YYYY-MM format
            4. Description is concise but comprehensive
            5. Add missing standard fields if obvious
            
            Return valid JSON with the same structure.
            """,
            "education": """
            Validate and enhance this education entry:
            {data}
            
            Ensure:
            1. Degree name is complete and properly formatted
            2. Institution name is correct
            3. Dates are valid and logical
            4. Add graduation status if clear
            
            Return valid JSON with the same structure.
            """,
            "skills": """
            Validate and categorize these skills:
            {data}
            
            Organize into categories:
            - technical_skills: Programming, tools, frameworks
            - soft_skills: Communication, leadership, etc.
            - languages_and_frameworks: Specific programming languages
            - tools_and_platforms: Software, platforms, services
            
            Return valid JSON with categorized skills.
            """
        }
        
        if section_type not in validation_prompts:
            return data
        
        try:
            prompt = ChatPromptTemplate.from_template(validation_prompts[section_type])
            response = await self.llm.ainvoke(prompt.format_messages(data=json.dumps(data, indent=2)))
            
            enhanced_data = json.loads(response.content)
            return enhanced_data
            
        except Exception as e:
            logger.warning(f"Data validation failed for {section_type}: {e}")
            return data
    
    async def clean_and_merge_cv_data(self, existing_memory: Dict[str, Any], 
                                    new_data: Dict[str, Any]) -> CVMemory:
        """Main method to clean and merge CV data"""
        
        # Initialize with existing memory or create new
        cv_memory = CVMemory(**(existing_memory or {}))
        
        logger.info("Starting data cleaning and merging process")
        
        # Process each section
        for section, section_data in new_data.items():
            if section == "personal_info":
                # Merge personal info (override with new data)
                cv_memory.personal_info.update(section_data or {})
                
            elif section == "experiences" and section_data:
                for new_exp in (section_data if isinstance(section_data, list) else [section_data]):
                    # Check for duplicates using semantic similarity
                    duplicate_idx = await self.find_duplicate_experiences(
                        new_exp, cv_memory.experiences
                    )
                    
                    if duplicate_idx is not None:
                        # Merge with existing using AI-powered merge
                        existing_exp = cv_memory.experiences[duplicate_idx]
                        merged_exp = await self.merge_experience_entries(new_exp, existing_exp)
                        cv_memory.experiences[duplicate_idx] = merged_exp
                        logger.info(f"Merged similar experience: {new_exp.get('job_title', 'Unknown')}")
                    else:
                        # Add as new entry after validation
                        validated_exp = await self.validate_and_enhance_data(new_exp, "experience")
                        cv_memory.experiences.append(validated_exp)
                        
            elif section == "education" and section_data:
                for new_edu in (section_data if isinstance(section_data, list) else [section_data]):
                    # Check for duplicates
                    duplicate_idx = await self.find_duplicates(
                        new_edu, cv_memory.education, "degree"
                    )
                    
                    if duplicate_idx is not None:
                        # Update existing
                        cv_memory.education[duplicate_idx].update(new_edu)
                    else:
                        # Add new entry after validation
                        validated_edu = await self.validate_and_enhance_data(new_edu, "education")
                        cv_memory.education.append(validated_edu)
                        
            elif section == "skills" and section_data:
                # Validate and merge skills
                validated_skills = await self.validate_and_enhance_data(section_data, "skills")
                
                # Merge skill categories with semantic deduplication
                for category, skills in validated_skills.items():
                    if category not in cv_memory.skills:
                        cv_memory.skills[category] = []
                    
                    # Add new skills, avoiding semantic duplicates
                    existing_skills = cv_memory.skills[category]
                    for skill in skills:
                        # Use semantic similarity to avoid duplicates
                        duplicate_idx = await self.find_duplicate_skills(skill, existing_skills)
                        if duplicate_idx is None:
                            cv_memory.skills[category].append(skill)
                        else:
                            logger.debug(f"Skipped duplicate skill: {skill} (similar to {existing_skills[duplicate_idx]})")
                            
            elif section == "languages" and section_data:
                for new_lang in (section_data if isinstance(section_data, list) else [section_data]):
                    # Check if language already exists
                    existing_languages = [lang.get("language", "").lower() for lang in cv_memory.languages]
                    new_lang_name = new_lang.get("language", "").lower()
                    
                    if new_lang_name not in existing_languages:
                        cv_memory.languages.append(new_lang)
                        
            elif section == "summary" and section_data:
                # Update summary (could merge with existing if both exist)
                if cv_memory.summary and section_data:
                    # Could implement AI-based summary merging here
                    cv_memory.summary = section_data  # Simple override for now
                else:
                    cv_memory.summary = section_data or cv_memory.summary
        
        # Update timestamp
        cv_memory.updated_at = datetime.now().isoformat()
        
        logger.success(f"Data cleaning completed. CV now has {len(cv_memory.experiences)} experiences, "
                      f"{len(cv_memory.education)} education entries, "
                      f"{len(cv_memory.skills)} skill categories")
        
        return cv_memory


async def data_cleaner_node(state: Dict[str, Any]) -> Dict[str, Any]:
    """
    LangGraph node for data cleaning and validation
    
    Input: state with 'extracted_data' and existing 'cv_memory'
    Output: state with cleaned and merged 'cv_memory'
    """
    logger.info("🧹 Starting data cleaning and validation...")
    
    try:
        cleaner = DataCleaner()
        
        # Get data from state
        extracted_data = state.get("extracted_data", {})
        existing_memory = state.get("cv_memory", {})
        
        # Clean and merge data
        cleaned_memory = await cleaner.clean_and_merge_cv_data(existing_memory, extracted_data)
        
        # Update state
        state["cv_memory"] = cleaned_memory.dict()
        state["processing_step"] = "data_cleaning_complete"
        
        logger.success("✅ Data cleaning completed successfully")
        
        return state
        
    except Exception as e:
        logger.error(f"❌ Data cleaning failed: {e}")
        state["processing_step"] = f"data_cleaning_error: {str(e)}"
        return state


# Input/Output Schemas for LangGraph
class DataCleanerInput(BaseModel):
    """Input schema for data cleaner node"""
    extracted_data: Dict[str, Any] = Field(..., description="New data to merge")
    cv_memory: Dict[str, Any] = Field(default_factory=dict, description="Existing CV data")
    user_id: Optional[str] = Field(None, description="User identifier")


class DataCleanerOutput(BaseModel):
    """Output schema for data cleaner node"""
    cv_memory: Dict[str, Any] = Field(..., description="Cleaned and merged CV data")
    processing_step: str = Field(..., description="Processing status")
    duplicate_count: int = Field(default=0, description="Number of duplicates found")
    validation_errors: List[str] = Field(default_factory=list, description="Validation issues found")


# Node metadata for LangGraph
DATA_CLEANER_NODE_METADATA = {
    "name": "data_cleaner_node",
    "description": "Merge, deduplicate, and validate CV data",
    "input_schema": DataCleanerInput,
    "output_schema": DataCleanerOutput,
    "dependencies": ["openai", "langchain"],
    "timeout": 30,
    "retry_count": 2
}