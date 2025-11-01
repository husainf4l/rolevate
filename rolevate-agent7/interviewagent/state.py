from typing import TypedDict, Optional, List, Dict, Any

class InterviewState(TypedDict, total=False):
    interview_id: str
    candidate_id: Optional[str]
    application_id: Optional[str]
    job_id: Optional[str]
    system_api_key: Optional[str]
    callback_url: Optional[str]
    
    # Interview data
    interview_info: Dict[str, Any]
    transcript_data: List[Dict[str, Any]]  # Array of transcript segments
    raw_transcript: str  # Combined transcript text
    
    # Analysis results
    analysis: Dict[str, Any]
    performance_scores: Dict[str, float]
    feedback: Dict[str, Any]
    
    # Additional context
    job_info: Dict[str, Any]
    application_info: Dict[str, Any]
    candidate_profile: Dict[str, Any]