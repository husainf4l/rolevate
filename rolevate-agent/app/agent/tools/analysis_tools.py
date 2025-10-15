"""
CV Analysis and Scoring Tools
Tools for analyzing CV quality, completeness, and optimization opportunities
"""
from typing import Dict, Any, List, Optional, Tuple
import re
from collections import Counter

# Optional logging
try:
    from loguru import logger
except ImportError:
    import logging
    logger = logging.getLogger(__name__)


class CVAnalysisTool:
    """Tool for comprehensive CV analysis and scoring"""
    
    @staticmethod
    def calculate_experience_level(cv_data: Dict[str, Any]) -> str:
        """
        Calculate experience level based on work history
        
        Args:
            cv_data: Complete CV data
            
        Returns:
            Experience level (entry, mid, senior, executive)
        """
        experiences = cv_data.get("experiences", [])
        
        if not experiences:
            return "entry"
        
        total_years = 0
        leadership_roles = 0
        
        for exp in experiences:
            # Try to calculate years of experience
            start_year = CVAnalysisTool._extract_year(exp.get("start_date", ""))
            end_year = CVAnalysisTool._extract_year(exp.get("end_date", "")) or 2024
            
            if start_year and end_year:
                years = end_year - start_year
                total_years += max(years, 0)
            
            # Check for leadership indicators
            position = (exp.get("position", "") + " " + exp.get("title", "")).lower()
            leadership_keywords = ["manager", "director", "vp", "ceo", "cto", "lead", "head", "chief"]
            if any(keyword in position for keyword in leadership_keywords):
                leadership_roles += 1
        
        # Determine level
        if total_years >= 15 or leadership_roles >= 2:
            return "executive"
        elif total_years >= 8 or leadership_roles >= 1:
            return "senior"
        elif total_years >= 3:
            return "mid"
        else:
            return "entry"
    
    @staticmethod
    def analyze_skills_gap(cv_data: Dict[str, Any], target_role: str = None) -> Dict[str, Any]:
        """
        Analyze skills gaps for target role
        
        Args:
            cv_data: Complete CV data
            target_role: Target job role/title
            
        Returns:
            Skills gap analysis
        """
        current_skills = set()
        
        # Extract current skills
        skills = cv_data.get("skills", [])
        for skill in skills:
            if isinstance(skill, str):
                current_skills.add(skill.lower())
            elif isinstance(skill, dict):
                current_skills.add(skill.get("name", "").lower())
        
        # Extract skills from experience descriptions
        experiences = cv_data.get("experiences", [])
        for exp in experiences:
            achievements = exp.get("achievements", [])
            for achievement in achievements:
                # Simple skill extraction from text
                tech_terms = re.findall(r'\b(?:Python|Java|React|AWS|Docker|SQL|JavaScript|Node\.js|Angular|Vue|C\+\+|C#|Git|Linux|Kubernetes|MongoDB|PostgreSQL|Machine Learning|AI|Data Science|Analytics|Agile|Scrum)\b', achievement, re.IGNORECASE)
                for term in tech_terms:
                    current_skills.add(term.lower())
        
        # Define role-specific skill requirements
        role_skills = CVAnalysisTool._get_role_required_skills(target_role)
        
        # Calculate gaps
        missing_skills = set(skill.lower() for skill in role_skills) - current_skills
        matching_skills = set(skill.lower() for skill in role_skills) & current_skills
        
        return {
            "current_skills": list(current_skills),
            "required_skills": role_skills,
            "matching_skills": list(matching_skills),
            "missing_skills": list(missing_skills),
            "skill_match_percentage": len(matching_skills) / len(role_skills) * 100 if role_skills else 0
        }
    
    @staticmethod
    def calculate_ats_score(cv_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Calculate ATS (Applicant Tracking System) compatibility score
        
        Args:
            cv_data: Complete CV data
            
        Returns:
            ATS score and recommendations
        """
        score = 0
        max_score = 100
        issues = []
        recommendations = []
        
        # Contact information (20 points)
        personal_info = cv_data.get("personal_info", {})
        if personal_info.get("full_name"):
            score += 5
        else:
            issues.append("Missing full name")
        
        if personal_info.get("email"):
            score += 5
        else:
            issues.append("Missing email")
            
        if personal_info.get("phone"):
            score += 5
        else:
            issues.append("Missing phone number")
            
        if personal_info.get("location"):
            score += 5
        else:
            issues.append("Missing location")
        
        # Professional summary (15 points)
        summary = cv_data.get("summary", "")
        if summary and len(summary) >= 50:
            score += 15
        elif summary:
            score += 8
            recommendations.append("Expand professional summary to at least 50 characters")
        else:
            issues.append("Missing professional summary")
        
        # Work experience (25 points)
        experiences = cv_data.get("experiences", [])
        if experiences:
            score += 10
            # Check for detailed achievements
            total_achievements = sum(len(exp.get("achievements", [])) for exp in experiences)
            if total_achievements >= len(experiences) * 2:  # At least 2 per job
                score += 15
            else:
                score += 8
                recommendations.append("Add more detailed achievements for each role")
        else:
            issues.append("Missing work experience")
        
        # Education (10 points)
        education = cv_data.get("education", [])
        if education:
            score += 10
        else:
            issues.append("Missing education information")
        
        # Skills (20 points)
        skills = cv_data.get("skills", [])
        if skills:
            if len(skills) >= 8:
                score += 20
            elif len(skills) >= 4:
                score += 15
            else:
                score += 10
                recommendations.append("Add more relevant skills (aim for 8-12)")
        else:
            issues.append("Missing skills section")
        
        # Keyword density (10 points)
        all_text = CVAnalysisTool._extract_all_text(cv_data)
        keyword_score = CVAnalysisTool._calculate_keyword_density(all_text)
        score += keyword_score
        
        if keyword_score < 8:
            recommendations.append("Include more industry-relevant keywords")
        
        return {
            "ats_score": min(score, max_score),
            "grade": CVAnalysisTool._get_grade(score),
            "issues": issues,
            "recommendations": recommendations,
            "keyword_density_score": keyword_score
        }
    
    @staticmethod
    def analyze_content_quality(cv_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Analyze content quality and provide improvement suggestions
        
        Args:
            cv_data: Complete CV data
            
        Returns:
            Content quality analysis
        """
        analysis = {
            "overall_score": 0,
            "sections": {},
            "improvements": [],
            "strengths": []
        }
        
        total_score = 0
        section_count = 0
        
        # Analyze professional summary
        summary = cv_data.get("summary", "")
        if summary:
            summary_analysis = CVAnalysisTool._analyze_summary_quality(summary)
            analysis["sections"]["summary"] = summary_analysis
            total_score += summary_analysis["score"]
            section_count += 1
        
        # Analyze work experience
        experiences = cv_data.get("experiences", [])
        if experiences:
            exp_analysis = CVAnalysisTool._analyze_experience_quality(experiences)
            analysis["sections"]["experience"] = exp_analysis
            total_score += exp_analysis["score"]
            section_count += 1
        
        # Analyze skills presentation
        skills = cv_data.get("skills", [])
        if skills:
            skills_analysis = CVAnalysisTool._analyze_skills_quality(skills)
            analysis["sections"]["skills"] = skills_analysis
            total_score += skills_analysis["score"]
            section_count += 1
        
        # Calculate overall score
        analysis["overall_score"] = total_score / section_count if section_count > 0 else 0
        
        # Generate improvement suggestions
        if analysis["overall_score"] < 60:
            analysis["improvements"].append("Consider professional CV writing assistance")
        if analysis["overall_score"] < 80:
            analysis["improvements"].append("Use stronger action verbs and quantifiable achievements")
        
        return analysis
    
    @staticmethod
    def detect_industry(cv_data: Dict[str, Any]) -> str:
        """
        Detect industry based on CV content
        
        Args:
            cv_data: Complete CV data
            
        Returns:
            Detected industry
        """
        all_text = CVAnalysisTool._extract_all_text(cv_data).lower()
        
        industry_keywords = {
            "technology": ["software", "developer", "engineer", "programming", "coding", "tech", "IT", "system", "database", "cloud", "api", "agile"],
            "healthcare": ["medical", "patient", "clinical", "healthcare", "nurse", "doctor", "treatment", "diagnosis", "pharmaceutical"],
            "finance": ["financial", "banking", "investment", "accounting", "audit", "compliance", "risk", "portfolio", "trading"],
            "marketing": ["marketing", "advertising", "campaign", "brand", "social media", "content", "SEO", "digital marketing"],
            "education": ["teaching", "education", "curriculum", "student", "academic", "research", "university", "school"],
            "sales": ["sales", "revenue", "client", "customer", "quota", "pipeline", "CRM", "business development"],
            "consulting": ["consulting", "strategy", "advisory", "client", "project", "analysis", "recommendations"],
            "manufacturing": ["manufacturing", "production", "quality", "supply chain", "operations", "assembly", "logistics"]
        }
        
        industry_scores = {}
        for industry, keywords in industry_keywords.items():
            score = sum(1 for keyword in keywords if keyword in all_text)
            industry_scores[industry] = score
        
        # Return industry with highest score
        if industry_scores:
            return max(industry_scores, key=industry_scores.get)
        
        return "general"
    
    # Helper methods
    @staticmethod
    def _extract_year(date_str: str) -> Optional[int]:
        """Extract year from date string"""
        if not date_str:
            return None
        
        year_match = re.search(r'\b(19|20)\d{2}\b', date_str)
        if year_match:
            return int(year_match.group())
        
        return None
    
    @staticmethod
    def _get_role_required_skills(role: str) -> List[str]:
        """Get required skills for specific role"""
        role_skills = {
            "software engineer": ["Python", "JavaScript", "Git", "SQL", "API", "Agile"],
            "data scientist": ["Python", "Machine Learning", "SQL", "Statistics", "Data Analysis"],
            "product manager": ["Product Management", "Agile", "Analytics", "Strategy"],
            "marketing manager": ["Digital Marketing", "Analytics", "Campaign Management", "SEO"],
        }
        
        if role:
            for role_key, skills in role_skills.items():
                if role_key.lower() in role.lower():
                    return skills
        
        return []
    
    @staticmethod
    def _extract_all_text(cv_data: Dict[str, Any]) -> str:
        """Extract all text content from CV data"""
        text_parts = []
        
        # Add summary
        if cv_data.get("summary"):
            text_parts.append(cv_data["summary"])
        
        # Add experience
        for exp in cv_data.get("experiences", []):
            if exp.get("position"):
                text_parts.append(exp["position"])
            if exp.get("company"):
                text_parts.append(exp["company"])
            for achievement in exp.get("achievements", []):
                text_parts.append(achievement)
        
        # Add skills
        for skill in cv_data.get("skills", []):
            if isinstance(skill, str):
                text_parts.append(skill)
            elif isinstance(skill, dict):
                text_parts.append(skill.get("name", ""))
        
        return " ".join(text_parts)
    
    @staticmethod
    def _calculate_keyword_density(text: str) -> int:
        """Calculate keyword density score (0-10)"""
        # Simple keyword density calculation
        words = text.lower().split()
        total_words = len(words)
        
        if total_words == 0:
            return 0
        
        # Count professional keywords
        professional_keywords = [
            "managed", "developed", "implemented", "achieved", "improved",
            "created", "led", "optimized", "delivered", "increased"
        ]
        
        keyword_count = sum(1 for word in words if word in professional_keywords)
        density = (keyword_count / total_words) * 100
        
        # Score from 0-10 based on density
        if density >= 5:
            return 10
        elif density >= 3:
            return 8
        elif density >= 1:
            return 6
        else:
            return 3
    
    @staticmethod
    def _get_grade(score: int) -> str:
        """Convert score to letter grade"""
        if score >= 90:
            return "A+"
        elif score >= 85:
            return "A"
        elif score >= 80:
            return "B+"
        elif score >= 75:
            return "B"
        elif score >= 70:
            return "C+"
        elif score >= 65:
            return "C"
        elif score >= 60:
            return "D"
        else:
            return "F"
    
    @staticmethod
    def _analyze_summary_quality(summary: str) -> Dict[str, Any]:
        """Analyze professional summary quality"""
        score = 0
        issues = []
        
        # Length check
        if len(summary) >= 100:
            score += 30
        elif len(summary) >= 50:
            score += 20
        else:
            score += 10
            issues.append("Summary too short")
        
        # Action words check
        action_words = ["experienced", "skilled", "accomplished", "results-driven", "proven"]
        if any(word in summary.lower() for word in action_words):
            score += 25
        else:
            issues.append("Use stronger professional descriptors")
        
        # Quantification check
        if re.search(r'\d+', summary):
            score += 25
        else:
            issues.append("Add quantifiable achievements")
        
        # First person check
        if re.search(r'\bI\b|\bmy\b', summary, re.IGNORECASE):
            issues.append("Remove first-person pronouns")
        else:
            score += 20
        
        return {
            "score": min(score, 100),
            "issues": issues
        }
    
    @staticmethod
    def _analyze_experience_quality(experiences: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Analyze work experience quality"""
        score = 0
        issues = []
        
        # Number of achievements per role
        total_achievements = sum(len(exp.get("achievements", [])) for exp in experiences)
        avg_achievements = total_achievements / len(experiences) if experiences else 0
        
        if avg_achievements >= 3:
            score += 40
        elif avg_achievements >= 2:
            score += 30
        else:
            score += 20
            issues.append("Add more achievements per role")
        
        # Check for quantification
        quantified_count = 0
        for exp in experiences:
            for achievement in exp.get("achievements", []):
                if re.search(r'\d+[%$\w]*', achievement):
                    quantified_count += 1
        
        if quantified_count >= total_achievements * 0.7:
            score += 40
        elif quantified_count >= total_achievements * 0.5:
            score += 30
        else:
            score += 20
            issues.append("Add more quantified achievements")
        
        # Check for action verbs
        action_verb_count = 0
        for exp in experiences:
            for achievement in exp.get("achievements", []):
                if re.match(r'^[A-Z][a-z]+ed\b|^[A-Z][a-z]+\b', achievement):
                    action_verb_count += 1
        
        if action_verb_count >= total_achievements * 0.8:
            score += 20
        else:
            issues.append("Start achievements with strong action verbs")
        
        return {
            "score": min(score, 100),
            "issues": issues,
            "total_achievements": total_achievements,
            "quantified_achievements": quantified_count
        }
    
    @staticmethod
    def _analyze_skills_quality(skills: List) -> Dict[str, Any]:
        """Analyze skills section quality"""
        score = 0
        issues = []
        
        # Number of skills
        skill_count = len(skills)
        if skill_count >= 10:
            score += 50
        elif skill_count >= 6:
            score += 40
        elif skill_count >= 3:
            score += 30
        else:
            issues.append("Add more relevant skills")
        
        # Skill categorization
        if isinstance(skills[0], dict) and "category" in skills[0]:
            score += 30
        else:
            issues.append("Consider organizing skills by category")
        
        # Check for modern/relevant skills
        modern_skills = ["cloud", "agile", "api", "analytics", "automation", "ai", "machine learning"]
        skill_text = " ".join(str(skill).lower() for skill in skills)
        modern_count = sum(1 for skill in modern_skills if skill in skill_text)
        
        if modern_count >= 2:
            score += 20
        else:
            issues.append("Include more modern/relevant skills")
        
        return {
            "score": min(score, 100),
            "issues": issues,
            "skill_count": skill_count
        }


__all__ = ["CVAnalysisTool"]