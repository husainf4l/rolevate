"""
CV Validation Tool
Validates CV data structure and completeness
"""
from typing import Dict, List, Any

# Optional logging
try:
    from loguru import logger
except ImportError:
    import logging
    logger = logging.getLogger(__name__)


class CVValidationTool:
    """Tool for validating CV data quality and completeness"""
    
    @staticmethod
    def validate_cv_data(cv_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Validate CV data and return quality score
        
        Args:
            cv_data: CV data to validate
            
        Returns:
            Dict with validation results
        """
        issues = []
        score = 100
        
        # Check required fields
        personal_info = cv_data.get("personal_info", {})
        full_name = personal_info.get("full_name", "")
        if not full_name or len(full_name) < 2:
            issues.append("Full name is missing or too short")
            score -= 20
        
        contact_info = cv_data.get("contact_info", personal_info)
        if not contact_info.get("email"):
            issues.append("Email is missing")
            score -= 15
        
        if not cv_data.get("summary"):
            issues.append("Professional summary is missing")
            score -= 10
        
        # Check experience
        experiences = cv_data.get("experiences", cv_data.get("experience", []))
        if not experiences:
            issues.append("No work experience listed")
            score -= 25
        else:
            for exp in experiences:
                if not exp.get("achievements", []):
                    company = exp.get("company", "Unknown company")
                    issues.append(f"No achievements for {company}")
                    score -= 5
        
        # Check education
        education = cv_data.get("education", [])
        if not education:
            issues.append("No education listed")
            score -= 15
        
        # Check skills
        skills = cv_data.get("skills", [])
        skill_categories = cv_data.get("skill_categories", [])
        if not skills and not skill_categories:
            issues.append("No skills listed")
            score -= 10
        
        score = max(0, score)
        
        result = {
            "is_valid": score >= 50,
            "score": score,
            "issues": issues,
            "completeness": f"{score}%"
        }
        
        logger.info(f"CV Validation: {score}% complete, {len(issues)} issues")
        
        return result


class TemplateRecommendationTool:
    """Tool for recommending appropriate CV template"""
    
    @staticmethod
    def recommend_template(cv_data: Dict[str, Any]) -> str:
        """
        Recommend the best template based on CV data
        
        Args:
            cv_data: CV data to analyze
            
        Returns:
            Recommended template name
        """
        # Get job title from personal info or experiences
        job_title = cv_data.get("job_title", "")
        if not job_title and cv_data.get("experiences"):
            job_title = cv_data["experiences"][0].get("position", "")
        
        # Executive template for senior roles
        if job_title and any(
            keyword in job_title.lower() 
            for keyword in ["ceo", "cto", "director", "vp", "executive", "president"]
        ):
            return "executive_cv"
        
        # Modern template for tech roles
        skills = cv_data.get("skills", [])
        if skills and any(
            any(tech in skill.lower() for tech in ["python", "react", "aws", "docker", "kubernetes", "ai", "ml"])
            for skill in skills
        ):
            return "modern_cv"
        
        # Default to classic
        return "classic_cv"


__all__ = ["CVValidationTool", "TemplateRecommendationTool"]
