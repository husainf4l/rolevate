"""
Data models using Pydantic for type safety and validation.
"""

from typing import Optional, List, Literal
from datetime import datetime
from pydantic import BaseModel, Field, field_validator


class CompanyInfo(BaseModel):
    """Company information model."""
    name: str
    description: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None


class JobInfo(BaseModel):
    """Job information model."""
    id: str
    title: str
    description: Optional[str] = None
    salary: Optional[str] = None
    company: CompanyInfo
    interview_prompt: str = Field(alias="interviewPrompt")
    interview_language: str = Field(default="English", alias="interviewLanguage")
    
    class Config:
        populate_by_name = True


class CandidateInfo(BaseModel):
    """Candidate information model."""
    id: str
    name: str


class ApplicationData(BaseModel):
    """Complete application data model."""
    candidate: CandidateInfo
    cv_analysis_results: Optional[str] = Field(None, alias="cvAnalysisResults")
    job: JobInfo
    
    @field_validator('cv_analysis_results', mode='before')
    @classmethod
    def convert_cv_analysis(cls, v):
        """Convert CV analysis results to string if it's a dict."""
        if v is None:
            return None
        if isinstance(v, dict):
            # Convert dict to formatted string
            import json
            return json.dumps(v, indent=2)
        return str(v)
    
    class Config:
        populate_by_name = True


class TranscriptEntry(BaseModel):
    """Individual transcript entry model."""
    interview_id: str = Field(alias="interviewId")
    content: str
    speaker: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    confidence: Optional[float] = Field(None, ge=0.0, le=1.0)
    language: Optional[str] = None
    
    @field_validator('language')
    @classmethod
    def validate_language(cls, v: Optional[str]) -> Optional[str]:
        """Ensure language code is valid if provided."""
        if v is not None:
            valid_codes = ['en', 'ar', 'en-US', 'ar-SA']
            if v not in valid_codes:
                raise ValueError(f"language must be one of {valid_codes}")
        return v
    
    class Config:
        populate_by_name = True


class InterviewStatus(str):
    """Interview status enum."""
    SCHEDULED = "SCHEDULED"
    IN_PROGRESS = "IN_PROGRESS"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"
    NO_SHOW = "NO_SHOW"


class InterviewType(str):
    """Interview type enum."""
    VIDEO = "VIDEO"
    PHONE = "PHONE"
    IN_PERSON = "IN_PERSON"


class CreateInterviewInput(BaseModel):
    """Input model for creating an interview."""
    application_id: str = Field(alias="applicationId")
    interviewer_id: str = Field(alias="interviewerId")
    scheduled_at: datetime = Field(default_factory=datetime.utcnow, alias="scheduledAt")
    type: Literal["VIDEO", "PHONE", "IN_PERSON"] = "VIDEO"
    status: Literal["SCHEDULED", "IN_PROGRESS", "COMPLETED", "CANCELLED", "NO_SHOW"] = "SCHEDULED"
    room_id: Optional[str] = Field(None, alias="roomId")
    
    class Config:
        populate_by_name = True
        json_encoders = {
            datetime: lambda v: v.isoformat() if v else None
        }


class UpdateInterviewInput(BaseModel):
    """Input model for updating an interview."""
    status: Optional[Literal["SCHEDULED", "IN_PROGRESS", "COMPLETED", "CANCELLED", "NO_SHOW"]] = None
    recording_url: Optional[str] = Field(None, alias="recordingUrl")
    duration: Optional[float] = None
    feedback: Optional[str] = None
    rating: Optional[float] = Field(None, ge=0.0, le=5.0)
    ai_analysis: Optional[dict] = Field(None, alias="aiAnalysis")
    
    class Config:
        populate_by_name = True
        exclude_none = True


class InterviewResponse(BaseModel):
    """Interview response model."""
    id: str
    status: str
    scheduled_at: Optional[datetime] = Field(None, alias="scheduledAt")
    created_at: Optional[datetime] = Field(None, alias="createdAt")
    updated_at: Optional[datetime] = Field(None, alias="updatedAt")
    recording_url: Optional[str] = Field(None, alias="recordingUrl")
    
    class Config:
        populate_by_name = True


class RecordingInfo(BaseModel):
    """Recording information model."""
    egress_id: str
    status: str
    started_at: Optional[int] = None
    ended_at: Optional[int] = None
    s3_path: Optional[str] = None
