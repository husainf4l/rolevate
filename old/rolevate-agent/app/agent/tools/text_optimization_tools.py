"""
Text Optimization and Enhancement Tools
Common functions for improving CV text quality and consistency
"""
import re
from typing import Dict, Any, List, Tuple, Optional

# Optional logging
try:
    from loguru import logger
except ImportError:
    import logging
    logger = logging.getLogger(__name__)


class TextOptimizationTool:
    """Tool for optimizing CV text content"""
    
    # Common weak verbs and their stronger replacements
    VERB_IMPROVEMENTS = {
        "did": ["executed", "performed", "accomplished"],
        "made": ["created", "developed", "generated", "produced"],
        "worked on": ["collaborated on", "contributed to", "managed"],
        "helped": ["assisted", "supported", "facilitated", "enabled"],
        "was responsible for": ["managed", "oversaw", "directed", "led"],
        "dealt with": ["managed", "handled", "resolved", "addressed"],
        "got": ["achieved", "obtained", "secured", "acquired"],
        "used": ["utilized", "leveraged", "employed", "applied"],
        "worked with": ["collaborated with", "partnered with", "coordinated with"],
    }
    
    # Action verbs by category
    ACTION_VERBS = {
        "leadership": ["led", "managed", "directed", "supervised", "coordinated", "mentored"],
        "achievement": ["achieved", "accomplished", "delivered", "exceeded", "completed"],
        "creation": ["created", "developed", "designed", "built", "implemented", "established"],
        "improvement": ["improved", "enhanced", "optimized", "streamlined", "increased"],
        "analysis": ["analyzed", "evaluated", "assessed", "researched", "investigated"],
        "communication": ["presented", "communicated", "negotiated", "collaborated", "facilitated"]
    }
    
    @staticmethod
    def enhance_bullet_points(text: str, context: str = "general") -> str:
        """
        Enhance bullet points with stronger action verbs and quantification
        
        Args:
            text: Original bullet point text
            context: Context for optimization (leadership, technical, etc.)
            
        Returns:
            Enhanced bullet point
        """
        if not text:
            return text
        
        enhanced_text = text.strip()
        
        # Start with action verb if not already
        if not re.match(r'^[A-Z][a-z]+ed|^[A-Z][a-z]+', enhanced_text):
            # Try to find and move action verb to front
            verb_pattern = r'\b(managed|created|developed|led|improved|implemented|designed|built)\b'
            verb_match = re.search(verb_pattern, enhanced_text, re.IGNORECASE)
            if verb_match:
                verb = verb_match.group().capitalize()
                enhanced_text = re.sub(verb_pattern, '', enhanced_text, flags=re.IGNORECASE).strip()
                enhanced_text = f"{verb} {enhanced_text}"
        
        # Replace weak verbs with stronger alternatives
        for weak_verb, strong_verbs in TextOptimizationTool.VERB_IMPROVEMENTS.items():
            if weak_verb in enhanced_text.lower():
                # Choose appropriate strong verb based on context
                replacement = strong_verbs[0]  # Default
                if context == "leadership" and "managed" in strong_verbs:
                    replacement = "managed"
                elif context == "technical" and "developed" in strong_verbs:
                    replacement = "developed"
                
                enhanced_text = re.sub(
                    re.escape(weak_verb), 
                    replacement, 
                    enhanced_text, 
                    flags=re.IGNORECASE
                )
        
        # Remove redundant phrases
        redundant_phrases = [
            r'\bresponsibilities included?\b',
            r'\bduties included?\b',
            r'\btasks included?\b',
            r'\bmain responsibilities?\b'
        ]
        
        for phrase in redundant_phrases:
            enhanced_text = re.sub(phrase, '', enhanced_text, flags=re.IGNORECASE).strip()
        
        # Ensure proper capitalization
        if enhanced_text:
            enhanced_text = enhanced_text[0].upper() + enhanced_text[1:]
        
        return enhanced_text
    
    @staticmethod
    def add_quantification_suggestions(text: str) -> Tuple[str, List[str]]:
        """
        Suggest quantification improvements for achievements
        
        Args:
            text: Original text
            
        Returns:
            Tuple of (text, list of suggestions)
        """
        suggestions = []
        
        # Look for opportunities to add metrics
        metric_opportunities = [
            (r'\bimproved\b', "Consider adding percentage improvement (e.g., 'improved by 25%')"),
            (r'\bincreased\b', "Consider adding specific numbers (e.g., 'increased sales by $50K')"),
            (r'\breduced\b', "Consider adding percentage reduction (e.g., 'reduced costs by 30%')"),
            (r'\bmanaged\b', "Consider adding team size or budget (e.g., 'managed team of 8')"),
            (r'\bsaved\b', "Consider adding amount saved (e.g., 'saved $100K annually')"),
        ]
        
        for pattern, suggestion in metric_opportunities:
            if re.search(pattern, text, re.IGNORECASE):
                # Check if already quantified
                if not re.search(r'\d+[%$\w]*', text):
                    suggestions.append(suggestion)
        
        return text, suggestions
    
    @staticmethod
    def optimize_professional_summary(summary: str) -> str:
        """
        Optimize professional summary for impact and clarity
        
        Args:
            summary: Original summary text
            
        Returns:
            Optimized summary
        """
        if not summary:
            return summary
        
        optimized = summary.strip()
        
        # Remove first-person pronouns
        first_person_patterns = [
            (r'\bI am\b', 'Experienced'),
            (r'\bI have\b', 'Possessing'),
            (r'\bI work\b', 'Working'),
            (r'\bI specialize\b', 'Specializing'),
            (r'\bMy experience\b', 'Experience'),
            (r'\bI\'ve\b', ''),
            (r'\bI\b', ''),
        ]
        
        for pattern, replacement in first_person_patterns:
            optimized = re.sub(pattern, replacement, optimized, flags=re.IGNORECASE)
        
        # Clean up extra spaces
        optimized = ' '.join(optimized.split())
        
        # Ensure it starts with a strong descriptor
        strong_starters = [
            'Experienced', 'Results-driven', 'Accomplished', 'Strategic',
            'Dynamic', 'Innovative', 'Dedicated', 'Proven', 'Skilled'
        ]
        
        if not any(optimized.startswith(starter) for starter in strong_starters):
            # Try to identify the role and add appropriate starter
            if 'engineer' in optimized.lower():
                optimized = f"Experienced {optimized}"
            elif 'manager' in optimized.lower():
                optimized = f"Results-driven {optimized}"
            else:
                optimized = f"Accomplished {optimized}"
        
        return optimized
    
    @staticmethod
    def check_consistency(cv_data: Dict[str, Any]) -> List[Dict[str, str]]:
        """
        Check for consistency issues in CV data
        
        Args:
            cv_data: Complete CV data
            
        Returns:
            List of consistency issues found
        """
        issues = []
        
        # Date format consistency
        all_dates = []
        experiences = cv_data.get("experiences", [])
        education = cv_data.get("education", [])
        
        for exp in experiences:
            if exp.get("start_date"):
                all_dates.append(exp["start_date"])
            if exp.get("end_date"):
                all_dates.append(exp["end_date"])
        
        for edu in education:
            if edu.get("start_date"):
                all_dates.append(edu["start_date"])
            if edu.get("end_date"):
                all_dates.append(edu["end_date"])
        
        # Check date formats
        date_formats = set()
        for date_str in all_dates:
            if re.match(r'\d{4}', date_str):
                date_formats.add("year_only")
            elif re.match(r'\w+ \d{4}', date_str):
                date_formats.add("month_year")
            elif re.match(r'\d{1,2}/\d{4}', date_str):
                date_formats.add("mm_yyyy")
        
        if len(date_formats) > 1:
            issues.append({
                "type": "date_format",
                "message": "Inconsistent date formats used throughout CV",
                "suggestion": "Use consistent date format (e.g., 'Jan 2020')"
            })
        
        # Check bullet point consistency
        all_bullets = []
        for exp in experiences:
            all_bullets.extend(exp.get("achievements", []))
        
        if all_bullets:
            # Check if all start with action verbs
            action_verb_count = 0
            for bullet in all_bullets:
                if re.match(r'^[A-Z][a-z]+ed\b|^[A-Z][a-z]+\b', bullet):
                    action_verb_count += 1
            
            if action_verb_count < len(all_bullets) * 0.8:
                issues.append({
                    "type": "bullet_format",
                    "message": "Inconsistent bullet point formatting",
                    "suggestion": "Start all bullet points with strong action verbs"
                })
        
        return issues
    
    @staticmethod
    def suggest_keywords_by_industry(industry: str) -> List[str]:
        """
        Suggest relevant keywords based on industry
        
        Args:
            industry: Industry identifier
            
        Returns:
            List of suggested keywords
        """
        industry_keywords = {
            "technology": [
                "software development", "agile", "scrum", "DevOps", "cloud computing",
                "API integration", "data analysis", "machine learning", "automation"
            ],
            "marketing": [
                "digital marketing", "campaign management", "SEO", "content strategy",
                "brand development", "analytics", "lead generation", "conversion optimization"
            ],
            "finance": [
                "financial analysis", "risk management", "compliance", "budgeting",
                "financial modeling", "investment strategy", "cost optimization"
            ],
            "healthcare": [
                "patient care", "clinical research", "healthcare compliance", "medical protocols",
                "quality assurance", "patient safety", "healthcare technology"
            ],
            "general": [
                "project management", "team leadership", "problem solving", "communication",
                "strategic planning", "process improvement", "stakeholder management"
            ]
        }
        
        return industry_keywords.get(industry.lower(), industry_keywords["general"])


__all__ = ["TextOptimizationTool"]