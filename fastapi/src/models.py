from sqlalchemy import Column, Integer, String, Text, DateTime, JSON, Enum as SQLEnum, Float, ARRAY
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.sql import func
from src.schemas import CVAnalysisStatus

Base = declarative_base()


class CVAnalysis(Base):
    """Database model for CV analysis - includes candidate information extracted from CV"""
    __tablename__ = "cv_analyses"

    id = Column(String, primary_key=True, index=True)
    cvUrl = Column(String, nullable=False)
    extractedText = Column(Text, nullable=True)
    
    # Candidate information (extracted from CV)
    candidateName = Column(String, nullable=True)
    candidateEmail = Column(String, nullable=True)
    candidatePhone = Column(String, nullable=False)  # Required from form
    jobId = Column(String, nullable=False)  # Required from form
    
    # Analysis scores
    overallScore = Column(Float, nullable=False, default=0.0)
    skillsScore = Column(Float, nullable=False, default=0.0)
    experienceScore = Column(Float, nullable=False, default=0.0)
    educationScore = Column(Float, nullable=False, default=0.0)
    languageScore = Column(Float, nullable=True)
    certificationScore = Column(Float, nullable=True)
    
    # Analysis results
    summary = Column(Text, nullable=False, default="Analysis pending...")
    strengths = Column(ARRAY(Text), nullable=True)
    weaknesses = Column(ARRAY(Text), nullable=True)
    suggestedImprovements = Column(ARRAY(Text), nullable=True)
    skills = Column(ARRAY(Text), nullable=True)
    experience = Column(JSONB, nullable=True)
    education = Column(JSONB, nullable=True)
    certifications = Column(ARRAY(Text), nullable=True)
    languages = Column(JSONB, nullable=True)
    
    # Processing metadata
    aiModel = Column(String, nullable=True)
    processingTime = Column(Integer, nullable=True)
    analyzedAt = Column(DateTime, nullable=False, server_default=func.now())
    
    # Status and links
    status = Column(String, nullable=False, default="pending")
    whatsappLink = Column(String, nullable=True)
    
    # Legacy fields (for compatibility)
    applicationId = Column(String, nullable=True)
    candidateId = Column(String, nullable=True)

    def __repr__(self):
        return f"<CVAnalysis(id={self.id}, candidateName={self.candidateName}, jobId={self.jobId}, overallScore={self.overallScore})>"
