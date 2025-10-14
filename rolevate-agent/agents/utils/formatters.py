"""
Smart Formatting Utilities for CV Data
Handles text wrapping, bullet formatting, date alignment, and other formatting improvements.
"""

import re
import textwrap
from typing import List, Dict, Any, Optional
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

class CVFormatter:
    """
    Handles smart formatting of CV data for better presentation.
    """
    
    def __init__(self, max_line_length: int = 100):
        """
        Initialize formatter with configuration.
        
        Args:
            max_line_length: Maximum characters per line for text wrapping
        """
        self.max_line_length = max_line_length
        
        # Date format mappings
        self.date_patterns = [
            (r'(\d{1,2})/(\d{1,2})/(\d{4})', r'\3-\2-\1'),  # MM/DD/YYYY -> YYYY-MM-DD
            (r'(\d{1,2})-(\d{1,2})-(\d{4})', r'\3-\2-\1'),   # MM-DD-YYYY -> YYYY-MM-DD
            (r'(\w+)\s+(\d{4})', r'\1 \2'),                   # Month YYYY
            (r'(\d{4})', r'\1'),                              # Just year
        ]
        
        # Month name mappings
        self.month_names = {
            '01': 'Jan', '02': 'Feb', '03': 'Mar', '04': 'Apr',
            '05': 'May', '06': 'Jun', '07': 'Jul', '08': 'Aug',
            '09': 'Sep', '10': 'Oct', '11': 'Nov', '12': 'Dec',
            '1': 'Jan', '2': 'Feb', '3': 'Mar', '4': 'Apr',
            '5': 'May', '6': 'Jun', '7': 'Jul', '8': 'Aug',
            '9': 'Sep'
        }
    
    def format_summary(self, summary: str) -> str:
        """
        Format summary text with proper line breaks and structure.
        
        Args:
            summary: Raw summary text
            
        Returns:
            Formatted summary text
        """
        if not summary or not summary.strip():
            return ""
        
        # Clean up the text
        cleaned = re.sub(r'\s+', ' ', summary.strip())
        
        # Wrap text at specified length
        wrapped = textwrap.fill(
            cleaned,
            width=self.max_line_length,
            break_long_words=False,
            break_on_hyphens=False
        )
        
        # Ensure proper sentence endings
        wrapped = re.sub(r'([.!?])\s*([A-Z])', r'\1 \2', wrapped)
        
        logger.debug(f"Formatted summary: {len(summary)} -> {len(wrapped)} chars")
        return wrapped
    
    def format_skills(self, skills: List[str]) -> str:
        """
        Format skills list with bullets and proper grouping.
        
        Args:
            skills: List of skill strings
            
        Returns:
            Formatted skills string with bullets
        """
        if not skills:
            return ""
        
        # Clean and deduplicate skills
        cleaned_skills = []
        seen = set()
        
        for skill in skills:
            if isinstance(skill, str):
                cleaned = skill.strip()
                if cleaned and cleaned.lower() not in seen:
                    cleaned_skills.append(cleaned)
                    seen.add(cleaned.lower())
        
        if not cleaned_skills:
            return ""
        
        # Format with bullets
        formatted_skills = []
        for skill in cleaned_skills:
            formatted_skills.append(f"• {skill}")
        
        # Group skills by line length
        result_lines = []
        current_line = ""
        
        for skill in formatted_skills:
            if len(current_line + skill) <= self.max_line_length:
                if current_line:
                    current_line += "  "  # Two spaces between skills on same line
                current_line += skill
            else:
                if current_line:
                    result_lines.append(current_line)
                current_line = skill
        
        if current_line:
            result_lines.append(current_line)
        
        logger.debug(f"Formatted {len(skills)} skills into {len(result_lines)} lines")
        return "\n".join(result_lines)
    
    def format_date(self, date_str: str) -> str:
        """
        Format date string to consistent format (Jan 2022, Present, etc.).
        
        Args:
            date_str: Raw date string
            
        Returns:
            Formatted date string
        """
        if not date_str or not date_str.strip():
            return ""
        
        cleaned = date_str.strip().lower()
        
        # Handle special cases
        if cleaned in ['present', 'current', 'now', 'ongoing']:
            return "Present"
        
        if cleaned in ['n/a', 'na', 'none', '-']:
            return ""
        
        # Try to parse and format date
        try:
            # Handle YYYY-MM-DD format
            if re.match(r'^\d{4}-\d{1,2}-\d{1,2}$', cleaned):
                year, month, day = cleaned.split('-')
                month_name = self.month_names.get(month, month)
                return f"{month_name} {year}"
            
            # Handle MM/YYYY or MM-YYYY format
            if re.match(r'^\d{1,2}[/-]\d{4}$', cleaned):
                parts = re.split(r'[/-]', cleaned)
                month, year = parts
                month_name = self.month_names.get(month, month)
                return f"{month_name} {year}"
            
            # Handle Month YYYY format
            month_year_match = re.match(r'^(\w+)\s+(\d{4})$', cleaned)
            if month_year_match:
                month, year = month_year_match.groups()
                # Standardize month names
                month_standard = {
                    'january': 'Jan', 'jan': 'Jan',
                    'february': 'Feb', 'feb': 'Feb',
                    'march': 'Mar', 'mar': 'Mar',
                    'april': 'Apr', 'apr': 'Apr',
                    'may': 'May',
                    'june': 'Jun', 'jun': 'Jun',
                    'july': 'Jul', 'jul': 'Jul',
                    'august': 'Aug', 'aug': 'Aug',
                    'september': 'Sep', 'sep': 'Sep', 'sept': 'Sep',
                    'october': 'Oct', 'oct': 'Oct',
                    'november': 'Nov', 'nov': 'Nov',
                    'december': 'Dec', 'dec': 'Dec'
                }.get(month.lower(), month.title())
                
                return f"{month_standard} {year}"
            
            # Handle just year
            if re.match(r'^\d{4}$', cleaned):
                return cleaned
            
            # If all else fails, return cleaned version
            return date_str.strip()
            
        except Exception as e:
            logger.warning(f"Could not parse date '{date_str}': {e}")
            return date_str.strip()
    
    def format_date_range(self, start_date: str, end_date: str) -> str:
        """
        Format date range with consistent alignment.
        
        Args:
            start_date: Start date string
            end_date: End date string
            
        Returns:
            Formatted date range (e.g., "Jan 2022 – Present")
        """
        formatted_start = self.format_date(start_date)
        formatted_end = self.format_date(end_date) or "Present"
        
        if not formatted_start and not formatted_end:
            return ""
        
        if not formatted_start:
            return formatted_end
        
        if not formatted_end or formatted_end == formatted_start:
            return formatted_start
        
        return f"{formatted_start} – {formatted_end}"
    
    def format_experience_description(self, description: str) -> str:
        """
        Format experience description with proper bullets and wrapping.
        
        Args:
            description: Raw description text
            
        Returns:
            Formatted description with bullets and proper line breaks
        """
        if not description or not description.strip():
            return ""
        
        # Clean the text
        cleaned = re.sub(r'\s+', ' ', description.strip())
        
        # Split into sentences/bullet points
        sentences = re.split(r'[.!]\s*', cleaned)
        sentences = [s.strip() for s in sentences if s.strip()]
        
        if not sentences:
            return ""
        
        # Format as bullet points if multiple sentences
        if len(sentences) > 1:
            formatted_bullets = []
            for sentence in sentences:
                if sentence:
                    # Ensure sentence ends with period
                    if not sentence.endswith(('.', '!', '?')):
                        sentence += '.'
                    
                    # Wrap long sentences
                    wrapped = textwrap.fill(
                        sentence,
                        width=self.max_line_length - 2,  # Account for bullet
                        initial_indent="• ",
                        subsequent_indent="  "
                    )
                    formatted_bullets.append(wrapped)
            
            return "\n".join(formatted_bullets)
        else:
            # Single sentence, just wrap
            sentence = sentences[0]
            if not sentence.endswith(('.', '!', '?')):
                sentence += '.'
            
            return textwrap.fill(
                sentence,
                width=self.max_line_length,
                break_long_words=False,
                break_on_hyphens=False
            )
    
    def format_complete_cv(self, cv_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Apply all formatting rules to complete CV data.
        
        Args:
            cv_data: Raw CV data dictionary
            
        Returns:
            Formatted CV data dictionary
        """
        if not cv_data:
            return cv_data
        
        # Create a copy to avoid modifying original
        formatted = cv_data.copy()
        
        # Format summary
        if formatted.get('summary'):
            formatted['summary'] = self.format_summary(formatted['summary'])
        
        # Format skills
        if formatted.get('skills'):
            if isinstance(formatted['skills'], list):
                formatted['skills_formatted'] = self.format_skills(formatted['skills'])
            else:
                # If skills is a string, try to parse it
                skills_str = str(formatted['skills'])
                skills_list = [s.strip() for s in re.split(r'[,;]', skills_str) if s.strip()]
                formatted['skills'] = skills_list
                formatted['skills_formatted'] = self.format_skills(skills_list)
        
        # Format experiences
        if formatted.get('experience'):
            for exp in formatted['experience']:
                if exp.get('start_date') or exp.get('end_date'):
                    exp['formatted_date_range'] = self.format_date_range(
                        exp.get('start_date', ''),
                        exp.get('end_date', '')
                    )
                
                if exp.get('description'):
                    exp['formatted_description'] = self.format_experience_description(
                        exp['description']
                    )
        
        # Format education
        if formatted.get('education'):
            for edu in formatted['education']:
                if edu.get('year'):
                    edu['formatted_year'] = self.format_date(edu['year'])
                
                if edu.get('start_date') or edu.get('end_date'):
                    edu['formatted_date_range'] = self.format_date_range(
                        edu.get('start_date', ''),
                        edu.get('end_date', '')
                    )
        
        logger.info("Applied complete CV formatting")
        return formatted


def format_cv_data(cv_data: Dict[str, Any], max_line_length: int = 100) -> Dict[str, Any]:
    """
    Convenience function to format CV data.
    
    Args:
        cv_data: Raw CV data dictionary
        max_line_length: Maximum characters per line
        
    Returns:
        Formatted CV data dictionary
    """
    formatter = CVFormatter(max_line_length=max_line_length)
    return formatter.format_complete_cv(cv_data)


def format_text_for_pdf(text: str, max_width: int = 100) -> str:
    """
    Format text specifically for PDF generation with WeasyPrint.
    
    Args:
        text: Input text
        max_width: Maximum characters per line
        
    Returns:
        PDF-optimized text
    """
    if not text:
        return ""
    
    # Replace common problematic characters
    text = text.replace('"', '"').replace('"', '"')
    text = text.replace(''', "'").replace(''', "'")
    text = text.replace('–', '-').replace('—', '-')
    
    # Wrap text
    wrapped = textwrap.fill(
        text,
        width=max_width,
        break_long_words=False,
        break_on_hyphens=False
    )
    
    return wrapped