"""
Data Structuring Layer - Converts natural text into organized CV fields
Merges new inputs with existing user memory using Pydantic models
"""
from typing import Dict, Any, List, Optional, Union
from datetime import datetime
from loguru import logger
from pydantic import BaseModel, Field, validator
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, SystemMessage
from app.config import settings
import json
import re


class PersonalInfo(BaseModel):
    """Personal information structure"""
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    location: Optional[str] = None
    linkedin: Optional[str] = None
    github: Optional[str] = None
    website: Optional[str] = None


class Experience(BaseModel):
    """Work experience structure"""
    company: str
    position: str
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    duration: Optional[str] = None
    location: Optional[str] = None
    description: Optional[str] = None
    achievements: List[str] = Field(default_factory=list)
    technologies: List[str] = Field(default_factory=list)


class Education(BaseModel):
    """Education structure"""
    institution: str
    degree: str
    field_of_study: Optional[str] = None
    start_year: Optional[str] = None
    end_year: Optional[str] = None
    gpa: Optional[str] = None
    location: Optional[str] = None
    relevant_courses: List[str] = Field(default_factory=list)


class Skill(BaseModel):
    """Skill structure"""
    name: str
    category: Optional[str] = None  # e.g., "Programming", "Tools", "Languages"
    proficiency: Optional[str] = None  # e.g., "Expert", "Intermediate", "Beginner"


class CVMemory(BaseModel):
    """Complete CV memory structure"""
    personal_info: PersonalInfo = Field(default_factory=PersonalInfo)
    summary: Optional[str] = None
    experiences: List[Experience] = Field(default_factory=list)
    education: List[Education] = Field(default_factory=list)
    skills: List[Skill] = Field(default_factory=list)
    languages: List[str] = Field(default_factory=list)
    certifications: List[str] = Field(default_factory=list)
    selected_template: str = "modern"
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for JSON serialization"""
        return self.dict()


class DataStructurer:
    """Structure and merge CV data"""
    
    def __init__(self):
        import os
        os.environ["OPENAI_API_KEY"] = settings.openai_api_key
        self.llm = ChatOpenAI(
            model=settings.openai_model,
            temperature=0
        )
    
    def parse_personal_info(self, text: str, extracted_data: Dict) -> Dict[str, Any]:
        """Parse personal information from text"""
        info = {}
        
        # Extract from structured data first
        for key in ["name", "email", "phone", "location", "linkedin", "github", "website"]:
            if key in extracted_data:
                info[key] = extracted_data[key]
        
        # Use regex patterns for additional extraction
        patterns = {
            "email": r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b',
            "phone": r'[\+]?[1-9]?[0-9]{7,15}',
            "linkedin": r'(?:https?://)?(?:www\.)?linkedin\.com/in/[\w-]+',
            "github": r'(?:https?://)?(?:www\.)?github\.com/[\w-]+',
        }
        
        for field, pattern in patterns.items():
            if field not in info:
                match = re.search(pattern, text)
                if match:
                    info[field] = match.group()
        
        return info
    
    def parse_experience_data(self, text: str, extracted_data: Dict) -> Dict[str, Any]:
        """Parse experience data from text"""
        experience = {
            "company": "",
            "position": "",
            "description": text
        }
        
        # Extract from structured data
        for key in ["company", "position", "start_date", "end_date", "duration", "location"]:
            if key in extracted_data:
                experience[key] = extracted_data[key]
        
        # Try to extract company and position from text if not in structured data
        if not experience["company"]:
            # Look for patterns like "at Company" or "Software Engineer at Google"
            company_pattern = r'(?:at|for|with)\s+([A-Z][A-Za-z\s&.,]+?)(?:\s|$|\.|,)'
            match = re.search(company_pattern, text)
            if match:
                experience["company"] = match.group(1).strip()
        
        if not experience["position"]:
            # Common job titles
            positions = [
                "Software Engineer", "Data Scientist", "Product Manager", "Marketing Manager",
                "Sales Manager", "Business Analyst", "Project Manager", "Developer",
                "Designer", "Consultant", "Director", "VP", "CEO", "CTO", "CFO"
            ]
            for position in positions:
                if position.lower() in text.lower():
                    experience["position"] = position
                    break
        
        return experience
    
    def parse_education_data(self, text: str, extracted_data: Dict) -> Dict[str, Any]:
        """Parse education data from text"""
        education = {
            "institution": "",
            "degree": "",
            "description": text
        }
        
        # Extract from structured data
        for key in ["institution", "degree", "field_of_study", "start_year", "end_year", "gpa"]:
            if key in extracted_data:
                education[key] = extracted_data[key]
        
        # Extract degree types
        degrees = ["Bachelor", "Master", "PhD", "MBA", "BS", "MS", "BA", "MA"]
        for degree in degrees:
            if degree.lower() in text.lower() and not education["degree"]:
                education["degree"] = degree
                break
        
        return education
    
    def parse_skills_data(self, text: str, extracted_data: Dict) -> List[Dict[str, Any]]:
        """Parse skills from text"""
        skills = []
        
        # Common skill categories and their keywords
        skill_categories = {
            "Programming Languages": ["python", "javascript", "java", "c++", "c#", "ruby", "php", "go", "rust"],
            "Web Technologies": ["html", "css", "react", "angular", "vue", "node.js", "express", "django", "flask"],
            "Databases": ["mysql", "postgresql", "mongodb", "redis", "sqlite", "oracle"],
            "Cloud & DevOps": ["aws", "azure", "gcp", "docker", "kubernetes", "jenkins", "terraform"],
            "Tools & Frameworks": ["git", "jira", "slack", "figma", "photoshop", "excel", "powerpoint"],
            "Soft Skills": ["leadership", "communication", "teamwork", "problem-solving", "project management"]
        }
        
        # Extract from structured data
        if "skills" in extracted_data:
            for skill in extracted_data["skills"]:
                skills.append({"name": skill, "category": "General"})
        
        # Extract from text using patterns
        text_lower = text.lower()
        for category, keywords in skill_categories.items():
            for keyword in keywords:
                if keyword in text_lower:
                    skills.append({
                        "name": keyword.title(),
                        "category": category,
                        "proficiency": "Intermediate"
                    })
        
        return skills
    
    async def structure_data_with_llm(self, intent: str, text: str, extracted_data: Dict) -> Dict[str, Any]:
        """Use LLM to structure complex data"""
        
        structure_prompts = {
            "add_experience": {
                "system": "Extract work experience details from the text. Return JSON with company, position, start_date, end_date, location, description, achievements array, technologies array.",
                "example": '{"company": "Google", "position": "Software Engineer", "start_date": "2020", "end_date": "2023", "location": "Mountain View, CA", "description": "Developed scalable web applications", "achievements": ["Improved system performance by 40%"], "technologies": ["Python", "Django", "AWS"]}'
            },
            "add_education": {
                "system": "Extract education details from the text. Return JSON with institution, degree, field_of_study, start_year, end_year, gpa, location, relevant_courses array.",
                "example": '{"institution": "Stanford University", "degree": "Bachelor of Science", "field_of_study": "Computer Science", "start_year": "2016", "end_year": "2020", "gpa": "3.8", "location": "Stanford, CA", "relevant_courses": ["Data Structures", "Algorithms"]}'
            },
            "add_personal_info": {
                "system": "Extract personal information from the text. Return JSON with name, email, phone, location, linkedin, github, website.",
                "example": '{"name": "John Smith", "email": "john@example.com", "phone": "+1-555-0123", "location": "San Francisco, CA", "linkedin": "linkedin.com/in/johnsmith", "github": "github.com/johnsmith"}'
            }
        }
        
        if intent not in structure_prompts:
            return extracted_data
        
        try:
            prompt_config = structure_prompts[intent]
            system_prompt = f"{prompt_config['system']}\n\nExample output: {prompt_config['example']}\n\nOnly return valid JSON, no additional text."
            
            response = await self.llm.ainvoke([
                SystemMessage(content=system_prompt),
                HumanMessage(content=f"Text to process: {text}")
            ])
            
            structured_data = json.loads(response.content)
            return structured_data
            
        except Exception as e:
            logger.warning(f"LLM structuring failed for {intent}: {e}")
            return extracted_data
    
    def merge_with_memory(self, cv_memory: Dict, intent: str, new_data: Dict) -> CVMemory:
        """Merge new data with existing CV memory"""
        
        # Load existing memory or create new
        if cv_memory:
            memory = CVMemory(**cv_memory)
        else:
            memory = CVMemory()
        
        if intent == "add_personal_info":
            # Update personal info fields
            for key, value in new_data.items():
                if value and hasattr(memory.personal_info, key):
                    setattr(memory.personal_info, key, value)
        
        elif intent == "add_experience":
            # Add new experience
            try:
                exp = Experience(**new_data)
                # Check for duplicates
                existing = any(e.company.lower() == exp.company.lower() and 
                             e.position.lower() == exp.position.lower() 
                             for e in memory.experiences)
                if not existing:
                    memory.experiences.append(exp)
                else:
                    logger.info(f"Duplicate experience detected, updating existing entry")
                    # Update existing entry
                    for i, e in enumerate(memory.experiences):
                        if (e.company.lower() == exp.company.lower() and 
                            e.position.lower() == exp.position.lower()):
                            memory.experiences[i] = exp
                            break
            except Exception as e:
                logger.warning(f"Failed to add experience: {e}")
        
        elif intent == "add_education":
            # Add new education
            try:
                edu = Education(**new_data)
                # Check for duplicates
                existing = any(e.institution.lower() == edu.institution.lower() and 
                             e.degree.lower() == edu.degree.lower() 
                             for e in memory.education)
                if not existing:
                    memory.education.append(edu)
            except Exception as e:
                logger.warning(f"Failed to add education: {e}")
        
        elif intent == "add_skills":
            # Add new skills
            if "skills" in new_data:
                for skill_data in new_data["skills"]:
                    try:
                        skill = Skill(**skill_data) if isinstance(skill_data, dict) else Skill(name=skill_data)
                        # Check for duplicates
                        existing = any(s.name.lower() == skill.name.lower() for s in memory.skills)
                        if not existing:
                            memory.skills.append(skill)
                    except Exception as e:
                        logger.warning(f"Failed to add skill {skill_data}: {e}")
        
        elif intent == "add_summary":
            memory.summary = new_data.get("summary", new_data.get("description", ""))
        
        elif intent == "select_template":
            memory.selected_template = new_data.get("template", "modern")
        
        return memory


async def data_structuring_node(state: Dict[str, Any]) -> Dict[str, Any]:
    """
    Data Structuring Layer - Converts natural text into organized CV fields
    
    Args:
        state: Current agent state with intent and extracted data
        
    Returns:
        Updated state with structured CV memory
    """
    logger.info("Data Structuring Layer: Organizing CV data")
    
    try:
        intent = state.get("intent", "")
        extracted_data = state.get("extracted_data", {})
        user_message = state.get("user_message", "")
        current_memory = state.get("cv_memory", {})
        
        if not intent:
            return {
                **state,
                "error": "No intent provided for data structuring"
            }
        
        structurer = DataStructurer()
        
        # Structure data based on intent
        if intent == "add_personal_info":
            structured_data = structurer.parse_personal_info(user_message, extracted_data)
        elif intent == "add_experience":
            structured_data = structurer.parse_experience_data(user_message, extracted_data)
        elif intent == "add_education":
            structured_data = structurer.parse_education_data(user_message, extracted_data)
        elif intent == "add_skills":
            skills = structurer.parse_skills_data(user_message, extracted_data)
            structured_data = {"skills": skills}
        elif intent == "add_summary":
            structured_data = {"summary": user_message}
        elif intent == "select_template":
            structured_data = {"template": extracted_data.get("template", "modern")}
        else:
            # For complex intents, use LLM
            structured_data = await structurer.structure_data_with_llm(intent, user_message, extracted_data)
        
        # Merge with existing memory
        updated_memory = structurer.merge_with_memory(current_memory, intent, structured_data)
        
        logger.success(f"Data structured and merged for intent: {intent}")
        
        # Generate appropriate response
        response_messages = {
            "add_personal_info": "Personal information updated! What else would you like to add?",
            "add_experience": f"Added experience at {structured_data.get('company', 'your company')}. Any other positions?",
            "add_education": f"Added education from {structured_data.get('institution', 'your institution')}. Any other qualifications?",
            "add_skills": f"Added {len(structured_data.get('skills', []))} skills. What other technologies do you know?",
            "add_summary": "Professional summary updated! Ready to add work experience?",
            "select_template": f"Template set to {structured_data.get('template', 'modern')}. Your CV will look great!"
        }
        
        assistant_message = response_messages.get(intent, "Information updated successfully!")
        
        return {
            **state,
            "cv_memory": updated_memory.to_dict(),
            "structured_data": structured_data,
            "messages": state.get("messages", []) + [
                {"role": "assistant", "content": assistant_message}
            ]
        }
        
    except Exception as e:
        logger.error(f"Data structuring failed: {e}")
        return {
            **state,
            "error": f"Data structuring failed: {str(e)}"
        }