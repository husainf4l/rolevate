"""
Date and Time Utility Tools
Common date formatting and parsing functions for CV processing
"""
from typing import Optional, Dict, Any
import re
from datetime import datetime, date

# Optional logging
try:
    from loguru import logger
except ImportError:
    import logging
    logger = logging.getLogger(__name__)


class DateFormattingTool:
    """Tool for standardizing date formatting in CVs"""
    
    @staticmethod
    def format_date(date_str: str) -> str:
        """
        Format date string to standard CV format
        
        Args:
            date_str: Raw date string
            
        Returns:
            Formatted date string (e.g., "Jan 2020")
        """
        if not date_str or date_str.lower() in ['present', 'current', 'ongoing']:
            return "Present"
        
        # Common date patterns
        patterns = [
            r'(\d{1,2})[/-](\d{1,2})[/-](\d{4})',  # MM/DD/YYYY or DD/MM/YYYY
            r'(\d{4})[/-](\d{1,2})[/-](\d{1,2})',  # YYYY/MM/DD
            r'(\d{4})',                             # YYYY only
            r'(\w+)\s+(\d{4})',                    # Month YYYY
            r'(\d{1,2})\s+(\w+)\s+(\d{4})',       # DD Month YYYY
        ]
        
        month_names = {
            '01': 'Jan', '02': 'Feb', '03': 'Mar', '04': 'Apr',
            '05': 'May', '06': 'Jun', '07': 'Jul', '08': 'Aug',
            '09': 'Sep', '10': 'Oct', '11': 'Nov', '12': 'Dec',
            'january': 'Jan', 'february': 'Feb', 'march': 'Mar', 'april': 'Apr',
            'may': 'May', 'june': 'Jun', 'july': 'Jul', 'august': 'Aug',
            'september': 'Sep', 'october': 'Oct', 'november': 'Nov', 'december': 'Dec'
        }
        
        try:
            # Try different patterns
            for pattern in patterns:
                match = re.search(pattern, date_str, re.IGNORECASE)
                if match:
                    groups = match.groups()
                    
                    if len(groups) == 1:  # Year only
                        return groups[0]
                    elif len(groups) == 2:  # Month Year
                        month, year = groups
                        if month.lower() in month_names:
                            return f"{month_names[month.lower()]} {year}"
                        return f"{month} {year}"
                    elif len(groups) == 3:  # Full date
                        if groups[0].isdigit() and len(groups[0]) == 4:  # YYYY/MM/DD
                            year, month, day = groups
                        else:  # MM/DD/YYYY or DD/MM/YYYY
                            month, day, year = groups
                        
                        if month in month_names:
                            return f"{month_names[month]} {year}"
                        return f"{month}/{year}"
            
            # If no pattern matches, try to extract year
            year_match = re.search(r'\b(19|20)\d{2}\b', date_str)
            if year_match:
                return year_match.group()
            
            return date_str  # Return as-is if can't parse
            
        except Exception as e:
            logger.warning(f"Date formatting error for '{date_str}': {e}")
            return date_str
    
    @staticmethod
    def format_duration(start_date: str, end_date: str) -> str:
        """
        Calculate and format duration between dates
        
        Args:
            start_date: Start date string
            end_date: End date string
            
        Returns:
            Duration string (e.g., "2 years 3 months")
        """
        try:
            if not start_date:
                return ""
            
            # Handle ongoing positions
            if not end_date or end_date.lower() in ['present', 'current', 'ongoing']:
                end_date = datetime.now().strftime("%Y-%m")
            
            # Parse dates (simplified)
            start_year = int(re.search(r'\b(19|20)\d{2}\b', start_date).group())
            end_year = int(re.search(r'\b(19|20)\d{2}\b', end_date).group())
            
            years = end_year - start_year
            
            if years == 0:
                return "Less than 1 year"
            elif years == 1:
                return "1 year"
            else:
                return f"{years} years"
                
        except Exception as e:
            logger.warning(f"Duration calculation error: {e}")
            return ""
    
    @staticmethod
    def parse_date_range(date_range: str) -> Dict[str, str]:
        """
        Parse date range string into start and end dates
        
        Args:
            date_range: Date range string (e.g., "Jan 2020 - Present")
            
        Returns:
            Dict with 'start_date' and 'end_date'
        """
        if not date_range:
            return {"start_date": "", "end_date": ""}
        
        # Common separators
        separators = [' - ', ' to ', ' — ', ' – ', '-', 'to']
        
        for sep in separators:
            if sep in date_range:
                parts = date_range.split(sep, 1)
                if len(parts) == 2:
                    return {
                        "start_date": parts[0].strip(),
                        "end_date": parts[1].strip()
                    }
        
        # Single date
        return {"start_date": date_range.strip(), "end_date": ""}


class PhoneFormattingTool:
    """Tool for standardizing phone number formatting"""
    
    @staticmethod
    def format_phone(phone: str) -> str:
        """
        Format phone number to standard format
        
        Args:
            phone: Raw phone number
            
        Returns:
            Formatted phone number
        """
        if not phone:
            return ""
        
        # Remove all non-digit characters
        digits = re.sub(r'\D', '', phone)
        
        if len(digits) == 10:
            return f"({digits[:3]}) {digits[3:6]}-{digits[6:]}"
        elif len(digits) == 11 and digits[0] == '1':
            return f"+1 ({digits[1:4]}) {digits[4:7]}-{digits[7:]}"
        elif len(digits) > 10:
            # International format
            return f"+{digits[:len(digits)-10]} ({digits[-10:-7]}) {digits[-7:-4]}-{digits[-4:]}"
        
        return phone  # Return as-is if can't format


__all__ = ["DateFormattingTool", "PhoneFormattingTool"]