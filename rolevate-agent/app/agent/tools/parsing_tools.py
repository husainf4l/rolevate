"""
Data Parsing and Processing Tools
Common functions for parsing and structuring CV data
"""
import re
from typing import Dict, Any, List, Optional

# Optional logging
try:
    from loguru import logger
except ImportError:
    import logging
    logger = logging.getLogger(__name__)


class DataParsingTool:
    """Tool for parsing structured data from CV text"""
    
    @staticmethod
    def parse_personal_info(text: str, extracted_data: Dict = None) -> Dict[str, Any]:
        """
        Parse personal information from text
        
        Args:
            text: Raw text containing personal info
            extracted_data: Previously extracted data to enhance
            
        Returns:
            Structured personal info
        """
        personal_info = extracted_data.get("personal_info", {}) if extracted_data else {}
        
        # Email pattern
        email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
        email_match = re.search(email_pattern, text)
        if email_match and not personal_info.get("email"):
            personal_info["email"] = email_match.group()
        
        # Phone pattern
        phone_pattern = r'(\+\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}'
        phone_match = re.search(phone_pattern, text)
        if phone_match and not personal_info.get("phone"):
            personal_info["phone"] = phone_match.group()
        
        # LinkedIn profile
        linkedin_pattern = r'linkedin\.com/in/[\w-]+'
        linkedin_match = re.search(linkedin_pattern, text, re.IGNORECASE)
        if linkedin_match and not personal_info.get("linkedin"):
            personal_info["linkedin"] = linkedin_match.group()
        
        # GitHub profile
        github_pattern = r'github\.com/[\w-]+'
        github_match = re.search(github_pattern, text, re.IGNORECASE)
        if github_match and not personal_info.get("github"):
            personal_info["github"] = github_match.group()
        
        # Location (simplified - look for common patterns)
        location_patterns = [
            r'(\w+,\s*\w+)',  # City, State
            r'(\w+,\s*\w+,\s*\w+)',  # City, State, Country
        ]
        
        for pattern in location_patterns:
            location_match = re.search(pattern, text)
            if location_match and not personal_info.get("location"):
                potential_location = location_match.group()
                # Basic validation - avoid matching random text
                if len(potential_location.split(',')) >= 2:
                    personal_info["location"] = potential_location
                    break
        
        return personal_info
    
    @staticmethod
    def parse_skills_from_text(text: str) -> List[str]:
        """
        Extract skills from text using common patterns
        
        Args:
            text: Text containing skills
            
        Returns:
            List of extracted skills
        """
        skills = []
        
        # Common skill indicators
        skill_indicators = [
            r'skills?:?\s*([^.\n]+)',
            r'technologies?:?\s*([^.\n]+)',
            r'expertise:?\s*([^.\n]+)',
            r'proficient in:?\s*([^.\n]+)',
        ]
        
        # Common technical skills (for better extraction)
        common_skills = [
            'Python', 'JavaScript', 'Java', 'C++', 'C#', 'React', 'Angular', 'Vue',
            'Node.js', 'Django', 'Flask', 'Spring', 'AWS', 'Azure', 'GCP',
            'Docker', 'Kubernetes', 'Git', 'SQL', 'MongoDB', 'PostgreSQL',
            'Machine Learning', 'AI', 'Data Science', 'Analytics'
        ]
        
        # Extract from skill sections
        for pattern in skill_indicators:
            matches = re.finditer(pattern, text, re.IGNORECASE)
            for match in matches:
                skill_text = match.group(1)
                # Split by common delimiters
                potential_skills = re.split(r'[,;|•\n-]+', skill_text)
                for skill in potential_skills:
                    skill = skill.strip()
                    if skill and len(skill) > 2:
                        skills.append(skill)
        
        # Look for common skills mentioned anywhere
        for skill in common_skills:
            if skill.lower() in text.lower() and skill not in skills:
                skills.append(skill)
        
        # Remove duplicates and clean up
        unique_skills = []
        for skill in skills:
            cleaned_skill = re.sub(r'[^\w\s+-.]', '', skill).strip()
            if cleaned_skill and cleaned_skill not in unique_skills:
                unique_skills.append(cleaned_skill)
        
        return unique_skills[:15]  # Limit to 15 skills
    
    @staticmethod
    def parse_experience_data(text: str, extracted_data: Dict = None) -> List[Dict[str, Any]]:
        """
        Parse work experience from text
        
        Args:
            text: Text containing experience info
            extracted_data: Previously extracted data
            
        Returns:
            List of experience entries
        """
        experiences = []
        
        # Look for experience sections
        experience_patterns = [
            r'(?:work experience|experience|employment history|professional experience)[\s\S]*?(?=\n\n|\n[A-Z]|\Z)',
            r'(\d{4}\s*[-–—]\s*(?:\d{4}|present|current))[\s\S]*?(?=\d{4}\s*[-–—]|\Z)'
        ]
        
        # Simple experience extraction (can be enhanced)
        date_pattern = r'\b((?:19|20)\d{2})\s*[-–—]\s*(?:((?:19|20)\d{2})|(?:present|current))\b'
        company_pattern = r'\b[A-Z][a-zA-Z\s&.,]+(?:Inc|LLC|Corp|Ltd|Company|Co\.)\b'
        
        date_matches = re.finditer(date_pattern, text, re.IGNORECASE)
        
        for match in date_matches:
            start_year = match.group(1)
            end_year = match.group(2) or "Present"
            
            # Find nearby company name
            context = text[max(0, match.start() - 200):match.end() + 200]
            company_match = re.search(company_pattern, context)
            
            experience = {
                "company": company_match.group() if company_match else "Company Name",
                "position": "Position Title",  # This would need more sophisticated extraction
                "start_date": start_year,
                "end_date": end_year,
                "achievements": [],
                "technologies": []
            }
            
            experiences.append(experience)
        
        return experiences[:5]  # Limit to 5 experiences


class DataValidationTool:
    """Tool for validating and cleaning CV data"""
    
    @staticmethod
    def validate_email(email: str) -> bool:
        """Validate email format"""
        if not email:
            return False
        pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        return bool(re.match(pattern, email))
    
    @staticmethod
    def validate_phone(phone: str) -> bool:
        """Validate phone number format"""
        if not phone:
            return False
        # Remove all non-digit characters and check length
        digits = re.sub(r'\D', '', phone)
        return 10 <= len(digits) <= 15
    
    @staticmethod
    def validate_url(url: str) -> bool:
        """Validate URL format"""
        if not url:
            return False
        pattern = r'^https?://(?:[-\w.])+(?:[:\d]+)?(?:/(?:[\w/_.])*(?:\?(?:[\w&=%.])*)?(?:#(?:[\w.])*)?)?$'
        return bool(re.match(pattern, url))
    
    @staticmethod
    def clean_text(text: str, max_length: int = None) -> str:
        """Clean and normalize text"""
        if not text:
            return ""
        
        # Remove extra whitespace
        text = ' '.join(text.split())
        
        # Remove special characters that might cause issues
        text = re.sub(r'[^\w\s.,;:!?()-]', '', text)
        
        # Truncate if needed
        if max_length and len(text) > max_length:
            text = text[:max_length].rsplit(' ', 1)[0] + '...'
        
        return text.strip()
    
    @staticmethod
    def calculate_completeness_score(cv_data: Dict[str, Any]) -> int:
        """Calculate CV completeness score (0-100)"""
        score = 0
        max_score = 100
        
        # Personal info (30 points)
        personal_info = cv_data.get("personal_info", {})
        if personal_info.get("full_name"):
            score += 10
        if personal_info.get("email"):
            score += 10
        if personal_info.get("phone"):
            score += 10
        
        # Professional summary (15 points)
        if cv_data.get("summary"):
            score += 15
        
        # Experience (25 points)
        experiences = cv_data.get("experiences", [])
        if experiences:
            score += 15
            # Bonus for detailed experiences
            if any(exp.get("achievements") for exp in experiences):
                score += 10
        
        # Education (15 points)
        if cv_data.get("education"):
            score += 15
        
        # Skills (15 points)
        skills = cv_data.get("skills", [])
        if skills:
            score += 10
            if len(skills) >= 5:
                score += 5
        
        return min(score, max_score)


__all__ = ["DataParsingTool", "DataValidationTool"]