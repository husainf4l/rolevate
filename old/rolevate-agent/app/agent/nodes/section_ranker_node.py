"""
Section Ranker Node - Reorder CV sections logically by relevance and industry standards
Optimizes section ordering based on job type, experience level, and industry best practices
"""
import asyncio
from typing import Dict, Any, List, Optional, Tuple
from pydantic import BaseModel, Field
from loguru import logger
import json
from datetime import datetime

from app.config import settings


class SectionRanker:
    """Intelligent CV section ordering and prioritization"""
    
    def __init__(self):
        # Default section orders by industry and experience level
        self.section_orders = {
            "technology": {
                "senior": ["personal_info", "summary", "experiences", "skills", "projects", "education", "certifications", "languages"],
                "mid": ["personal_info", "summary", "experiences", "education", "skills", "projects", "certifications", "languages"],
                "junior": ["personal_info", "summary", "education", "experiences", "projects", "skills", "certifications", "languages"],
                "entry": ["personal_info", "summary", "education", "projects", "skills", "experiences", "certifications", "languages"]
            },
            "finance": {
                "senior": ["personal_info", "summary", "experiences", "education", "certifications", "skills", "languages"],
                "mid": ["personal_info", "summary", "experiences", "education", "certifications", "skills", "languages"], 
                "junior": ["personal_info", "summary", "education", "experiences", "certifications", "skills", "languages"],
                "entry": ["personal_info", "summary", "education", "certifications", "experiences", "skills", "languages"]
            },
            "healthcare": {
                "senior": ["personal_info", "summary", "experiences", "education", "certifications", "skills", "languages"],
                "mid": ["personal_info", "summary", "experiences", "education", "certifications", "skills", "languages"],
                "junior": ["personal_info", "summary", "education", "experiences", "certifications", "skills", "languages"],
                "entry": ["personal_info", "summary", "education", "certifications", "experiences", "skills", "languages"]
            },
            "academic": {
                "all": ["personal_info", "summary", "education", "experiences", "projects", "certifications", "skills", "languages"]
            },
            "creative": {
                "all": ["personal_info", "summary", "projects", "experiences", "skills", "education", "certifications", "languages"]
            },
            "default": {
                "senior": ["personal_info", "summary", "experiences", "skills", "education", "certifications", "projects", "languages"],
                "mid": ["personal_info", "summary", "experiences", "education", "skills", "projects", "certifications", "languages"],
                "junior": ["personal_info", "summary", "education", "experiences", "skills", "projects", "certifications", "languages"],
                "entry": ["personal_info", "summary", "education", "skills", "experiences", "projects", "certifications", "languages"]
            }
        }
        
        # Industry detection keywords
        self.industry_keywords = {
            "technology": ["software", "developer", "engineer", "programming", "IT", "tech", "data", "AI", "ML", "DevOps"],
            "finance": ["finance", "banking", "investment", "accounting", "analyst", "trader", "audit", "controller"],
            "healthcare": ["healthcare", "medical", "nurse", "doctor", "clinical", "hospital", "therapy", "pharmaceutical"],
            "academic": ["professor", "researcher", "academic", "PhD", "university", "research", "scholar", "teaching"],
            "creative": ["designer", "artist", "creative", "marketing", "brand", "content", "media", "advertising"],
            "legal": ["lawyer", "attorney", "legal", "counsel", "paralegal", "law", "litigation", "compliance"],
            "sales": ["sales", "business development", "account", "revenue", "client", "customer", "relationship"],
            "management": ["manager", "director", "executive", "VP", "CEO", "COO", "lead", "supervisor", "head"]
        }
    
    def detect_industry(self, cv_data: Dict[str, Any]) -> str:
        """Detect primary industry from CV data"""
        
        # Combine all text for analysis
        text_sources = []
        
        # Add job titles and descriptions
        for exp in cv_data.get("experiences", []):
            text_sources.extend([
                exp.get("job_title", ""),
                exp.get("description", ""),
                exp.get("company", "")
            ])
        
        # Add education
        for edu in cv_data.get("education", []):
            text_sources.extend([
                edu.get("degree", ""),
                edu.get("field_of_study", ""),
                edu.get("institution", "")
            ])
        
        # Add skills
        for skill_category in cv_data.get("skills", {}).values():
            if isinstance(skill_category, list):
                text_sources.extend(skill_category)
        
        # Add summary
        text_sources.append(cv_data.get("summary", ""))
        
        # Combine and analyze
        combined_text = " ".join(text_sources).lower()
        
        # Count industry keyword matches
        industry_scores = {}
        for industry, keywords in self.industry_keywords.items():
            score = sum(1 for keyword in keywords if keyword.lower() in combined_text)
            if score > 0:
                industry_scores[industry] = score
        
        if not industry_scores:
            return "default"
        
        # Return industry with highest score
        return max(industry_scores.items(), key=lambda x: x[1])[0]
    
    def calculate_experience_level(self, cv_data: Dict[str, Any]) -> str:
        """Calculate experience level from CV data"""
        
        experiences = cv_data.get("experiences", [])
        
        if not experiences:
            return "entry"
        
        # Calculate total years of experience
        total_years = 0
        current_year = datetime.now().year
        
        for exp in experiences:
            start_date = exp.get("start_date", "")
            end_date = exp.get("end_date", "Present")
            
            try:
                # Parse start year
                if start_date and "-" in start_date:
                    start_year = int(start_date.split("-")[0])
                else:
                    continue
                
                # Parse end year
                if end_date.lower() in ["present", "current", "now"]:
                    end_year = current_year
                elif end_date and "-" in end_date:
                    end_year = int(end_date.split("-")[0])
                else:
                    end_year = start_year + 1  # Assume 1 year if no end date
                
                years = max(0, end_year - start_year)
                total_years += years
                
            except (ValueError, IndexError):
                # Skip invalid dates
                continue
        
        # Classify experience level
        if total_years < 2:
            return "entry"
        elif total_years < 5:
            return "junior"
        elif total_years < 10:
            return "mid"
        else:
            return "senior"
    
    def analyze_section_strengths(self, cv_data: Dict[str, Any]) -> Dict[str, float]:
        """Analyze strength/completeness of each CV section"""
        
        strengths = {}
        
        # Personal info strength
        personal_info = cv_data.get("personal_info", {})
        personal_score = 0
        required_personal = ["full_name", "email", "phone"]
        optional_personal = ["linkedin", "github", "website", "address"]
        
        for field in required_personal:
            if personal_info.get(field):
                personal_score += 0.4
        
        for field in optional_personal:
            if personal_info.get(field):
                personal_score += 0.1
        
        strengths["personal_info"] = min(1.0, personal_score)
        
        # Experience strength
        experiences = cv_data.get("experiences", [])
        if experiences:
            exp_score = min(1.0, len(experiences) * 0.3)  # More experiences = stronger
            # Bonus for detailed descriptions
            detailed_count = sum(1 for exp in experiences if len(exp.get("description", "")) > 50)
            exp_score += detailed_count * 0.1
            strengths["experiences"] = min(1.0, exp_score)
        else:
            strengths["experiences"] = 0.0
        
        # Education strength
        education = cv_data.get("education", [])
        if education:
            edu_score = min(1.0, len(education) * 0.5)
            # Bonus for higher degrees
            degree_levels = {"PhD": 1.0, "Master": 0.8, "Bachelor": 0.6, "Associate": 0.4}
            for edu in education:
                degree = edu.get("degree", "").lower()
                for level, bonus in degree_levels.items():
                    if level.lower() in degree:
                        edu_score += bonus * 0.2
                        break
            strengths["education"] = min(1.0, edu_score)
        else:
            strengths["education"] = 0.0
        
        # Skills strength
        skills = cv_data.get("skills", {})
        if skills:
            total_skills = sum(len(skill_list) for skill_list in skills.values() if isinstance(skill_list, list))
            skills_score = min(1.0, total_skills * 0.05)  # Each skill adds 5%
            strengths["skills"] = skills_score
        else:
            strengths["skills"] = 0.0
        
        # Projects strength
        projects = cv_data.get("projects", [])
        strengths["projects"] = min(1.0, len(projects) * 0.3) if projects else 0.0
        
        # Certifications strength
        certifications = cv_data.get("certifications", [])
        strengths["certifications"] = min(1.0, len(certifications) * 0.25) if certifications else 0.0
        
        # Languages strength
        languages = cv_data.get("languages", [])
        strengths["languages"] = min(1.0, len(languages) * 0.2) if languages else 0.0
        
        # Summary strength
        summary = cv_data.get("summary", "")
        strengths["summary"] = min(1.0, len(summary) / 200) if summary else 0.0
        
        return strengths
    
    def get_optimal_section_order(self, cv_data: Dict[str, Any], 
                                  user_preferences: Dict[str, Any] = None) -> List[str]:
        """Determine optimal section ordering"""
        
        # Detect industry and experience level
        industry = self.detect_industry(cv_data)
        experience_level = self.calculate_experience_level(cv_data)
        
        logger.info(f"Detected industry: {industry}, Experience level: {experience_level}")
        
        # Get base order
        if industry in self.section_orders:
            if experience_level in self.section_orders[industry]:
                base_order = self.section_orders[industry][experience_level][:]
            elif "all" in self.section_orders[industry]:
                base_order = self.section_orders[industry]["all"][:]
            else:
                base_order = self.section_orders["default"][experience_level][:]
        else:
            base_order = self.section_orders["default"][experience_level][:]
        
        # Analyze section strengths
        strengths = self.analyze_section_strengths(cv_data)
        
        # Apply user preferences if provided
        if user_preferences:
            priority_sections = user_preferences.get("priority_sections", [])
            hidden_sections = user_preferences.get("hidden_sections", [])
            
            # Move priority sections up
            for section in reversed(priority_sections):
                if section in base_order:
                    base_order.remove(section)
                    # Insert after summary (position 2)
                    insert_pos = min(2, len(base_order))
                    base_order.insert(insert_pos, section)
            
            # Remove hidden sections
            base_order = [s for s in base_order if s not in hidden_sections]
        
        # Filter out empty sections
        available_sections = []
        for section in base_order:
            if section == "personal_info":
                available_sections.append(section)  # Always include personal info
            elif section in cv_data and cv_data[section]:
                # Check if section has meaningful content
                content = cv_data[section]
                if isinstance(content, list) and len(content) > 0:
                    available_sections.append(section)
                elif isinstance(content, dict) and any(content.values()):
                    available_sections.append(section)
                elif isinstance(content, str) and content.strip():
                    available_sections.append(section)
        
        return available_sections
    
    def rank_and_reorder_cv_sections(self, cv_data: Dict[str, Any], 
                                   user_preferences: Dict[str, Any] = None) -> Tuple[Dict[str, Any], Dict[str, Any]]:
        """Main method to rank and reorder CV sections"""
        
        logger.info("📊 Starting section ranking and reordering...")
        
        # Get optimal order
        optimal_order = self.get_optimal_section_order(cv_data, user_preferences)
        
        # Create reordered CV data
        reordered_cv = {}
        
        # Add sections in optimal order
        for section in optimal_order:
            if section in cv_data:
                reordered_cv[section] = cv_data[section]
        
        # Add any remaining sections that weren't in the optimal order
        for section, content in cv_data.items():
            if section not in reordered_cv:
                reordered_cv[section] = content
        
        # Create ranking metadata
        ranking_info = {
            "detected_industry": self.detect_industry(cv_data),
            "experience_level": self.calculate_experience_level(cv_data),
            "section_order": optimal_order,
            "section_strengths": self.analyze_section_strengths(cv_data),
            "reorder_reasoning": f"Optimized for {self.detect_industry(cv_data)} industry, {self.calculate_experience_level(cv_data)} level"
        }
        
        logger.success(f"✅ Sections reordered: {' → '.join(optimal_order[:5])}...")
        
        return reordered_cv, ranking_info


async def section_ranker_node(state: Dict[str, Any]) -> Dict[str, Any]:
    """
    LangGraph node for section ranking and reordering
    
    Input: state with 'cv_memory' containing CV data
    Output: state with reordered 'cv_memory' and 'section_ranking_info'
    """
    logger.info("🎯 Starting section ranking and reordering...")
    
    try:
        ranker = SectionRanker()
        
        # Get data from state
        cv_memory = state.get("cv_memory", {})
        user_preferences = state.get("user_preferences", {})
        
        if not cv_memory:
            logger.warning("No CV data found for section ranking")
            state["processing_step"] = "section_ranking_skipped"
            return state
        
        # Rank and reorder sections
        reordered_cv, ranking_info = ranker.rank_and_reorder_cv_sections(cv_memory, user_preferences)
        
        # Update state
        state["cv_memory"] = reordered_cv
        state["section_ranking_info"] = ranking_info
        state["processing_step"] = "section_ranking_complete"
        
        logger.success("✅ Section ranking completed successfully")
        
        return state
        
    except Exception as e:
        logger.error(f"❌ Section ranking failed: {e}")
        state["processing_step"] = f"section_ranking_error: {str(e)}"
        return state


# Input/Output Schemas for LangGraph
class SectionRankerInput(BaseModel):
    """Input schema for section ranker node"""
    cv_memory: Dict[str, Any] = Field(..., description="CV data to reorder")
    user_preferences: Dict[str, Any] = Field(default_factory=dict, description="User preferences for section ordering")
    target_job: Optional[str] = Field(None, description="Target job for optimization")


class SectionRankerOutput(BaseModel):
    """Output schema for section ranker node"""
    cv_memory: Dict[str, Any] = Field(..., description="CV data with optimally ordered sections")
    section_ranking_info: Dict[str, Any] = Field(..., description="Information about ranking decisions")
    processing_step: str = Field(..., description="Processing status")


# Node metadata for LangGraph
SECTION_RANKER_NODE_METADATA = {
    "name": "section_ranker_node",
    "description": "Reorder CV sections logically by relevance and industry standards", 
    "input_schema": SectionRankerInput,
    "output_schema": SectionRankerOutput,
    "dependencies": [],
    "timeout": 15,
    "retry_count": 1
}