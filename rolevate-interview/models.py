"""
Data models for Rolevate Interview Agent
"""

from dataclasses import dataclass
from typing import Optional


@dataclass
class InterviewContext:
    """
    Represents the context of an interview session.
    
    This class stores all relevant information about an interview,
    including the application ID, candidate details, job information,
    and company details.
    """
    application_id: str
    candidate_name: Optional[str] = None
    job_title: Optional[str] = None
    company_name: Optional[str] = None
    interview_language: Optional[str] = None
    
    def has_complete_info(self) -> bool:
        """Check if all interview context fields are populated."""
        return all([
            self.candidate_name,
            self.job_title,
            self.company_name
        ])
    
    def __str__(self) -> str:
        """String representation of interview context."""
        return (
            f"InterviewContext(candidate={self.candidate_name}, "
            f"job={self.job_title}, company={self.company_name})"
        )
