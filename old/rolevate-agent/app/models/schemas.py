"""Pydantic models for CV data structure."""
from typing import Optional, List
from datetime import date
from pydantic import BaseModel, Field


class ContactInfo(BaseModel):
    """Contact information."""
    email: Optional[str] = None
    phone: Optional[str] = None
    location: Optional[str] = None
    linkedin: Optional[str] = None
    website: Optional[str] = None
    github: Optional[str] = None


class Experience(BaseModel):
    """Work experience entry."""
    job_title: str
    company: str
    location: Optional[str] = None
    start_date: Optional[str] = None  # Flexible date format
    end_date: Optional[str] = None  # "Present" or actual date
    is_current: bool = False
    description: Optional[str] = None
    achievements: List[str] = Field(default_factory=list)
    technologies: List[str] = Field(default_factory=list)


class Education(BaseModel):
    """Education entry."""
    degree: str
    institution: str
    location: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    gpa: Optional[str] = None
    honors: Optional[str] = None
    description: Optional[str] = None
    coursework: List[str] = Field(default_factory=list)


class Certification(BaseModel):
    """Certification or license."""
    name: str
    issuer: str
    issue_date: Optional[str] = None
    expiry_date: Optional[str] = None
    credential_id: Optional[str] = None
    credential_url: Optional[str] = None


class Project(BaseModel):
    """Project entry."""
    name: str
    description: str
    role: Optional[str] = None
    date: Optional[str] = None
    technologies: List[str] = Field(default_factory=list)
    url: Optional[str] = None
    highlights: List[str] = Field(default_factory=list)


class Language(BaseModel):
    """Language proficiency."""
    language: str
    proficiency: str  # e.g., "Native", "Fluent", "Professional", "Basic"


class SkillCategory(BaseModel):
    """Categorized skills."""
    category: str
    skills: List[str]


class CVData(BaseModel):
    """Complete CV data structure."""
    
    # Basic Information
    full_name: str
    job_title: Optional[str] = None
    contact: ContactInfo = Field(default_factory=ContactInfo)
    
    # Professional Summary
    summary: Optional[str] = None
    
    # Core Sections
    experience: List[Experience] = Field(default_factory=list)
    education: List[Education] = Field(default_factory=list)
    
    # Skills (can be flat list or categorized)
    skills: List[str] = Field(default_factory=list)
    skill_categories: List[SkillCategory] = Field(default_factory=list)
    
    # Additional Sections
    certifications: List[Certification] = Field(default_factory=list)
    projects: List[Project] = Field(default_factory=list)
    languages: List[Language] = Field(default_factory=list)
    
    # Optional Fields
    awards: List[str] = Field(default_factory=list)
    publications: List[str] = Field(default_factory=list)
    volunteer: List[str] = Field(default_factory=list)
    interests: List[str] = Field(default_factory=list)
    
    class Config:
        json_schema_extra = {
            "example": {
                "full_name": "John Doe",
                "job_title": "Senior Software Engineer",
                "contact": {
                    "email": "john.doe@example.com",
                    "phone": "+1-234-567-8900",
                    "location": "San Francisco, CA",
                    "linkedin": "https://linkedin.com/in/johndoe"
                },
                "summary": "Experienced software engineer with 8+ years...",
                "experience": [
                    {
                        "job_title": "Senior Software Engineer",
                        "company": "Tech Corp",
                        "location": "San Francisco, CA",
                        "start_date": "2020-01",
                        "end_date": "Present",
                        "is_current": True,
                        "achievements": [
                            "Led team of 5 engineers",
                            "Improved performance by 40%"
                        ]
                    }
                ],
                "skills": ["Python", "React", "AWS", "Docker"]
            }
        }


class CVProcessRequest(BaseModel):
    """Request model for CV processing."""
    template_name: str = "modern"
    output_format: str = "pdf"  # pdf or docx
    cv_data: Optional[CVData] = None


class CVProcessResponse(BaseModel):
    """Response model for CV processing."""
    success: bool
    message: str
    file_path: Optional[str] = None
    download_url: Optional[str] = None
    cv_data: Optional[CVData] = None


# Database Models (SQLAlchemy)
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, JSON, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime, timezone

Base = declarative_base()


class CVDataDB(Base):
    """Database model for storing CV data."""
    __tablename__ = "cv_data"
    
    id = Column(Integer, primary_key=True, index=True)
    cv_id = Column(String(255), unique=True, index=True, nullable=False)
    user_id = Column(String(255), ForeignKey("users.id"), nullable=True)
    cv_data = Column(JSON, nullable=False)
    version_hash = Column(String(255), nullable=False)
    status = Column(String(50), default="active")
    created_at = Column(DateTime(timezone=True), default=datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=datetime.now(timezone.utc), onupdate=datetime.now(timezone.utc))
    
    # Relationships
    versions = relationship("CVVersion", back_populates="cv_data")


class CVVersion(Base):
    """Database model for CV version history."""
    __tablename__ = "cv_versions"
    
    id = Column(Integer, primary_key=True, index=True)
    cv_data_id = Column(Integer, ForeignKey("cv_data.id"), nullable=False)
    version_hash = Column(String(255), nullable=False)
    cv_data_snapshot = Column(JSON, nullable=False)
    created_at = Column(DateTime(timezone=True), default=datetime.now(timezone.utc))
    
    # Relationships
    cv_data = relationship("CVDataDB", back_populates="versions")


class CVTemplate(Base):
    """Database model for CV templates."""
    __tablename__ = "cv_templates"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)
    description = Column(Text, nullable=True)
    template_file = Column(String(255), nullable=False)
    style_category = Column(String(50), nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), default=datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=datetime.now(timezone.utc), onupdate=datetime.now(timezone.utc))
