"""
CV Validation Tool
Validates CV data structure and completeness
"""
from typing import Dict, List
from app.schema import CVData
from loguru import logger


class CVValidationTool:
    """Tool for validating CV data quality and completeness"""
    
    @staticmethod
    def validate_cv_data(cv_data: CVData) -> Dict[str, any]:
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
        if not cv_data.full_name or len(cv_data.full_name) < 2:
            issues.append("Full name is missing or too short")
            score -= 20
        
        if not cv_data.contact.email:
            issues.append("Email is missing")
            score -= 15
        
        if not cv_data.summary:
            issues.append("Professional summary is missing")
            score -= 10
        
        # Check experience
        if not cv_data.experience:
            issues.append("No work experience listed")
            score -= 25
        else:
            for exp in cv_data.experience:
                if not exp.achievements:
                    issues.append(f"No achievements for {exp.company}")
                    score -= 5
        
        # Check education
        if not cv_data.education:
            issues.append("No education listed")
            score -= 15
        
        # Check skills
        if not cv_data.skills and not cv_data.skill_categories:
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
    def recommend_template(cv_data: CVData) -> str:
        """
        Recommend the best template based on CV data
        
        Args:
            cv_data: CV data to analyze
            
        Returns:
            Recommended template name
        """
        # Executive template for senior roles
        if cv_data.job_title and any(
            keyword in cv_data.job_title.lower() 
            for keyword in ["ceo", "cto", "director", "vp", "executive", "president"]
        ):
            return "executive_cv"
        
        # Modern template for tech roles
        if cv_data.skills and any(
            skill.lower() in ["python", "react", "aws", "docker", "kubernetes", "ai", "ml"]
            for skill in cv_data.skills
        ):
            return "modern_cv"
        
        # Default to classic
        return "classic_cv"


__all__ = ["CVValidationTool", "TemplateRecommendationTool"]
