"""
Template Selector Node - Intelligently choose the best CV template based on user profile and preferences
Selects optimal template design based on industry, experience level, and content analysis
"""
import asyncio
from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field
from loguru import logger
import json

from app.config import settings


class TemplateSelector:
    """Intelligent CV template selection service"""
    
    def __init__(self):
        # Available templates with their characteristics
        self.available_templates = {
            "modern": {
                "name": "Modern Professional",
                "description": "Clean, contemporary design with subtle colors and modern typography",
                "best_for": ["technology", "creative", "startup", "digital marketing"],
                "experience_levels": ["junior", "mid", "senior"],
                "features": ["color_accents", "modern_fonts", "clean_layout", "skill_bars"],
                "complexity": "medium",
                "ats_friendly": True,
                "visual_impact": "high"
            },
            "classic": {
                "name": "Classic Professional", 
                "description": "Traditional, conservative design focusing on content over aesthetics",
                "best_for": ["finance", "legal", "healthcare", "government", "consulting"],
                "experience_levels": ["mid", "senior", "executive"],
                "features": ["traditional_fonts", "minimal_colors", "structured_layout"],
                "complexity": "low",
                "ats_friendly": True,
                "visual_impact": "low"
            },
            "executive": {
                "name": "Executive Leadership",
                "description": "Sophisticated design for senior-level positions with emphasis on achievements",
                "best_for": ["management", "executive", "consulting", "finance"],
                "experience_levels": ["senior", "executive"],
                "features": ["elegant_typography", "achievement_highlights", "leadership_focus"],
                "complexity": "high", 
                "ats_friendly": True,
                "visual_impact": "medium"
            },
            "creative": {
                "name": "Creative Portfolio",
                "description": "Visually striking design for creative professionals and portfolios",
                "best_for": ["design", "marketing", "advertising", "media", "arts"],
                "experience_levels": ["junior", "mid", "senior"],
                "features": ["bold_colors", "creative_layout", "portfolio_sections", "visual_elements"],
                "complexity": "high",
                "ats_friendly": False,
                "visual_impact": "very_high"
            },
            "minimal": {
                "name": "Minimal Clean",
                "description": "Ultra-clean, minimal design focusing purely on content",
                "best_for": ["academic", "research", "technology", "startups"],
                "experience_levels": ["entry", "junior", "mid"],
                "features": ["minimal_design", "content_focused", "high_readability"],
                "complexity": "very_low",
                "ats_friendly": True,
                "visual_impact": "low"
            },
            "technical": {
                "name": "Technical Professional",
                "description": "Structured design optimized for technical roles with project highlights",
                "best_for": ["engineering", "software", "IT", "data_science", "devops"],
                "experience_levels": ["junior", "mid", "senior"],
                "features": ["technical_sections", "project_highlights", "skill_matrix", "code_friendly"],
                "complexity": "medium",
                "ats_friendly": True,
                "visual_impact": "medium"
            }
        }
        
        # Industry to template mapping
        self.industry_template_preferences = {
            "technology": ["technical", "modern", "minimal"],
            "finance": ["classic", "executive", "modern"],
            "healthcare": ["classic", "modern", "minimal"],
            "creative": ["creative", "modern", "technical"],
            "academic": ["minimal", "classic", "modern"],
            "legal": ["classic", "executive", "minimal"],
            "consulting": ["executive", "classic", "modern"],
            "sales": ["modern", "executive", "classic"],
            "marketing": ["creative", "modern", "technical"],
            "management": ["executive", "modern", "classic"],
            "engineering": ["technical", "modern", "minimal"],
            "default": ["modern", "classic", "minimal"]
        }
    
    def detect_industry_from_cv(self, cv_data: Dict[str, Any]) -> str:
        """Detect primary industry from CV data"""
        
        industry_keywords = {
            "technology": ["software", "developer", "engineer", "programming", "IT", "tech", "data", "AI", "ML", "DevOps", "cloud"],
            "finance": ["finance", "banking", "investment", "accounting", "analyst", "trader", "audit", "controller", "fintech"],
            "healthcare": ["healthcare", "medical", "nurse", "doctor", "clinical", "hospital", "therapy", "pharmaceutical", "biotech"],
            "creative": ["design", "creative", "marketing", "brand", "content", "media", "advertising", "art", "graphic"],
            "academic": ["professor", "researcher", "academic", "PhD", "university", "research", "scholar", "teaching", "education"],
            "legal": ["lawyer", "attorney", "legal", "counsel", "paralegal", "law", "litigation", "compliance", "regulatory"],
            "consulting": ["consultant", "consulting", "advisory", "strategy", "management consulting", "analyst"],
            "sales": ["sales", "business development", "account", "revenue", "client", "customer", "relationship", "BD"],
            "engineering": ["engineer", "engineering", "mechanical", "civil", "electrical", "chemical", "industrial"],
            "management": ["manager", "director", "executive", "VP", "CEO", "COO", "lead", "supervisor", "head"]
        }
        
        # Combine all relevant text
        text_sources = []
        
        # Job titles and descriptions
        for exp in cv_data.get("experiences", []):
            text_sources.extend([
                exp.get("job_title", ""),
                exp.get("description", ""),
                exp.get("company", "")
            ])
        
        # Education
        for edu in cv_data.get("education", []):
            text_sources.extend([
                edu.get("degree", ""),
                edu.get("field_of_study", ""),
                edu.get("institution", "")
            ])
        
        # Skills
        for skill_category in cv_data.get("skills", {}).values():
            if isinstance(skill_category, list):
                text_sources.extend(skill_category)
        
        combined_text = " ".join(text_sources).lower()
        
        # Score industries
        industry_scores = {}
        for industry, keywords in industry_keywords.items():
            score = sum(1 for keyword in keywords if keyword.lower() in combined_text)
            if score > 0:
                industry_scores[industry] = score
        
        return max(industry_scores.items(), key=lambda x: x[1])[0] if industry_scores else "default"
    
    def determine_experience_level(self, cv_data: Dict[str, Any]) -> str:
        """Determine experience level from CV data"""
        
        experiences = cv_data.get("experiences", [])
        
        if not experiences:
            return "entry"
        
        # Count years and seniority indicators
        total_positions = len(experiences)
        senior_keywords = ["director", "VP", "executive", "head of", "chief", "senior", "lead", "principal"]
        
        senior_positions = 0
        for exp in experiences:
            title = exp.get("job_title", "").lower()
            if any(keyword in title for keyword in senior_keywords):
                senior_positions += 1
        
        # Determine level
        if senior_positions >= 2 or any(keyword in title.lower() for exp in experiences 
                                       for title in [exp.get("job_title", "")] 
                                       for keyword in ["ceo", "cto", "vp", "director"]):
            return "executive"
        elif senior_positions >= 1 or total_positions >= 4:
            return "senior"
        elif total_positions >= 2:
            return "mid"
        elif total_positions >= 1:
            return "junior"
        else:
            return "entry"
    
    def analyze_cv_content_complexity(self, cv_data: Dict[str, Any]) -> str:
        """Analyze complexity of CV content to match template complexity"""
        
        complexity_score = 0
        
        # Count sections
        sections = len([k for k, v in cv_data.items() if v])
        complexity_score += sections * 0.5
        
        # Count experiences
        experiences = len(cv_data.get("experiences", []))
        complexity_score += experiences * 1.0
        
        # Count projects
        projects = len(cv_data.get("projects", []))
        complexity_score += projects * 0.8
        
        # Count certifications
        certifications = len(cv_data.get("certifications", []))
        complexity_score += certifications * 0.5
        
        # Count skill categories
        skill_categories = len(cv_data.get("skills", {}))
        complexity_score += skill_categories * 0.3
        
        # Classify complexity
        if complexity_score < 5:
            return "low"
        elif complexity_score < 10:
            return "medium"
        else:
            return "high"
    
    def score_template_match(self, template_name: str, template_info: Dict[str, Any], 
                           cv_data: Dict[str, Any], user_preferences: Dict[str, Any]) -> float:
        """Score how well a template matches the CV and preferences"""
        
        score = 0.0
        
        # Industry match (40% weight)
        industry = self.detect_industry_from_cv(cv_data)
        if industry in template_info.get("best_for", []):
            score += 40
        elif industry in self.industry_template_preferences.get(industry, []):
            preference_index = self.industry_template_preferences[industry].index(template_name)
            score += 40 - (preference_index * 10)  # Decreasing score for lower preference
        
        # Experience level match (25% weight)
        experience_level = self.determine_experience_level(cv_data)
        if experience_level in template_info.get("experience_levels", []):
            score += 25
        
        # Content complexity match (20% weight)
        content_complexity = self.analyze_cv_content_complexity(cv_data)
        template_complexity = template_info.get("complexity", "medium")
        
        complexity_match = {
            ("low", "very_low"): 20, ("low", "low"): 18, ("low", "medium"): 10,
            ("medium", "low"): 15, ("medium", "medium"): 20, ("medium", "high"): 15,
            ("high", "medium"): 15, ("high", "high"): 20, ("high", "very_high"): 18
        }
        score += complexity_match.get((content_complexity, template_complexity), 5)
        
        # User preferences (15% weight)
        if user_preferences:
            # ATS preference
            if user_preferences.get("ats_friendly", True) and template_info.get("ats_friendly", True):
                score += 5
            
            # Visual impact preference
            preferred_impact = user_preferences.get("visual_impact", "medium")
            template_impact = template_info.get("visual_impact", "medium")
            if preferred_impact == template_impact:
                score += 5
            
            # Explicit template preference
            if user_preferences.get("preferred_template") == template_name:
                score += 5
        
        return min(100, score)  # Cap at 100
    
    def select_optimal_template(self, cv_data: Dict[str, Any], 
                              user_preferences: Dict[str, Any] = None) -> Dict[str, Any]:
        """Select the optimal template based on CV data and user preferences"""
        
        if not user_preferences:
            user_preferences = {}
        
        logger.info("🎨 Analyzing CV for optimal template selection...")
        
        # Score all templates
        template_scores = {}
        for template_name, template_info in self.available_templates.items():
            score = self.score_template_match(template_name, template_info, cv_data, user_preferences)
            template_scores[template_name] = score
            logger.debug(f"Template '{template_name}' scored {score:.1f}")
        
        # Get top choice
        selected_template = max(template_scores.items(), key=lambda x: x[1])[0]
        selected_info = self.available_templates[selected_template]
        
        # Create selection result
        selection_result = {
            "selected_template": selected_template,
            "template_info": selected_info,
            "selection_reasoning": {
                "detected_industry": self.detect_industry_from_cv(cv_data),
                "experience_level": self.determine_experience_level(cv_data),
                "content_complexity": self.analyze_cv_content_complexity(cv_data),
                "match_score": template_scores[selected_template]
            },
            "alternative_templates": sorted(
                [(name, score) for name, score in template_scores.items() if name != selected_template],
                key=lambda x: x[1],
                reverse=True
            )[:2]  # Top 2 alternatives
        }
        
        logger.success(f"✅ Selected template: {selected_template} (score: {template_scores[selected_template]:.1f})")
        
        return selection_result


async def template_selector_node(state: Dict[str, Any]) -> Dict[str, Any]:
    """
    LangGraph node for intelligent template selection
    
    Input: state with 'cv_memory' and optional 'user_preferences'
    Output: state with 'selected_template' and 'template_selection_info'
    """
    logger.info("🎨 Starting template selection...")
    
    try:
        selector = TemplateSelector()
        
        # Get data from state
        cv_memory = state.get("cv_memory", {})
        user_preferences = state.get("user_preferences", {})
        
        if not cv_memory:
            logger.warning("No CV data found for template selection, using default")
            state["selected_template"] = "modern"
            state["processing_step"] = "template_selection_default"
            return state
        
        # Select optimal template
        selection_result = selector.select_optimal_template(cv_memory, user_preferences)
        
        # Update state
        state["selected_template"] = selection_result["selected_template"]
        state["template_selection_info"] = selection_result
        state["processing_step"] = "template_selection_complete"
        
        logger.success("✅ Template selection completed successfully")
        
        return state
        
    except Exception as e:
        logger.error(f"❌ Template selection failed: {e}")
        state["selected_template"] = "modern"  # Fallback
        state["processing_step"] = f"template_selection_error: {str(e)}"
        return state


# Input/Output Schemas for LangGraph
class TemplateSelectorInput(BaseModel):
    """Input schema for template selector node"""
    cv_memory: Dict[str, Any] = Field(..., description="CV data for template selection")
    user_preferences: Dict[str, Any] = Field(default_factory=dict, description="User template preferences")
    target_job: Optional[str] = Field(None, description="Target job for template optimization")


class TemplateSelectorOutput(BaseModel):
    """Output schema for template selector node"""
    selected_template: str = Field(..., description="Name of selected template")
    template_selection_info: Dict[str, Any] = Field(..., description="Information about template selection")
    processing_step: str = Field(..., description="Processing status")
    available_alternatives: List[str] = Field(default_factory=list, description="Alternative template options")


# Node metadata for LangGraph
TEMPLATE_SELECTOR_NODE_METADATA = {
    "name": "template_selector_node",
    "description": "Intelligently select optimal CV template based on content and preferences",
    "input_schema": TemplateSelectorInput,
    "output_schema": TemplateSelectorOutput,
    "dependencies": [],
    "timeout": 10,
    "retry_count": 1
}