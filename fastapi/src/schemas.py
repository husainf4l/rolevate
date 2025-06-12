from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum


class CVAnalysisStatus(str, Enum):
    PENDING = "pending"
    ANALYZING = "analyzing"
    COMPLETED = "completed"
    FAILED = "failed"


class CVUploadRequest(BaseModel):
    """Simplified request model for CV upload"""
    candidate_phone: str = Field(..., description="Phone number of the candidate")
    job_id: str = Field(..., description="Job ID for the position")


class CVAnalysisResponse(BaseModel):
    """Response model for CV analysis"""
    id: str
    cvUrl: str
    
    # Candidate information (extracted from CV)
    candidateName: Optional[str]
    candidateEmail: Optional[str]
    candidatePhone: str
    jobId: str
    
    # Analysis results
    extractedText: Optional[str]
    overallScore: float
    skillsScore: float
    experienceScore: float
    educationScore: float
    languageScore: Optional[float]
    certificationScore: Optional[float]
    summary: str
    strengths: Optional[List[str]]
    weaknesses: Optional[List[str]]
    suggestedImprovements: Optional[List[str]]
    skills: Optional[List[str]]
    experience: Optional[Dict[str, Any]]
    education: Optional[Dict[str, Any]]
    certifications: Optional[List[str]]
    languages: Optional[Dict[str, Any]]
    
    # Processing metadata
    aiModel: Optional[str]
    processingTime: Optional[int]
    analyzedAt: datetime
    status: str
    whatsappLink: Optional[str]


class WhatsAppMessageRequest(BaseModel):
    """Request model for WhatsApp message"""
    phone_number: str = Field(..., description="Phone number to send message to")
    template_name: str = Field(..., description="Template name to use")
    variables: Dict[str, Any] = Field(default_factory=dict, description="Template variables")


class WhatsAppResponse(BaseModel):
    """Response model for WhatsApp message"""
    success: bool
    message: str
    whatsapp_link: Optional[str]
