"""
Domain models for the interview system
Clean, immutable data structures representing business entities
"""

from dataclasses import dataclass
from typing import Optional
from enum import Enum


class InterviewLanguage(str, Enum):
    """Supported interview languages"""
    ENGLISH = "english"
    ARABIC = "arabic"
    
    @classmethod
    def from_string(cls, lang: Optional[str]) -> 'InterviewLanguage':
        """Parse language from string, defaulting to English"""
        if not lang:
            return cls.ENGLISH
        
        lang_lower = lang.lower()
        if lang_lower in ["ar", "arabic", "عربي"]:
            return cls.ARABIC
        return cls.ENGLISH


@dataclass(frozen=True)
class InterviewContext:
    """
    Immutable interview context
    
    Represents all information needed for an interview session.
    Uses frozen dataclass for immutability and thread-safety.
    """
    application_id: str
    candidate_name: Optional[str] = None
    job_title: Optional[str] = None
    company_name: Optional[str] = None
    interview_language: InterviewLanguage = InterviewLanguage.ENGLISH
    cv_analysis: Optional[str] = None
    
    def has_complete_info(self) -> bool:
        """Check if all essential context fields are populated"""
        return all([
            self.candidate_name,
            self.job_title,
            self.company_name
        ])
    
    def get_display_summary(self) -> str:
        """Get human-readable summary of interview context"""
        parts = []
        if self.candidate_name:
            parts.append(f"Candidate: {self.candidate_name}")
        if self.job_title:
            parts.append(f"Position: {self.job_title}")
        if self.company_name:
            parts.append(f"Company: {self.company_name}")
        parts.append(f"Language: {self.interview_language.value}")
        
        return " | ".join(parts)
    
    def __str__(self) -> str:
        """String representation"""
        return (
            f"InterviewContext(id={self.application_id[:8]}..., "
            f"candidate={self.candidate_name}, "
            f"job={self.job_title}, "
            f"language={self.interview_language.value})"
        )

