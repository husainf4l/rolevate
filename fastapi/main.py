from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Optional
import os
import time
from dotenv import load_dotenv

from src.database import get_db, create_tables
from src.schemas import (
    CVUploadRequest, CVAnalysisResponse, WhatsAppMessageRequest, 
    WhatsAppResponse, CVAnalysisStatus
)
from src.services.cv_service import CVAnalysisService
from src.models import CVAnalysis

# Load environment variables
load_dotenv()

# Create FastAPI app
app = FastAPI(
    title="CV Analysis API with LangGraph Agents",
    description="A FastAPI application with 2 LangGraph agents for CV analysis and WhatsApp messaging",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure this properly for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize service
cv_service = CVAnalysisService()

# Create tables on startup
@app.on_event("startup")
async def startup_event():
    """Create database tables on startup"""
    create_tables()
    print("✅ Database tables created successfully")
    print("🚀 FastAPI server started")
    print("📊 CV Analysis Agent initialized")
    print("📱 WhatsApp Agent initialized")


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "CV Analysis API with LangGraph Agents",
        "version": "1.0.0",
        "status": "running",
        "endpoints": {
            "docs": "/docs",
            "redoc": "/redoc",
            "upload_cv": "/api/cv/upload",
            "analyze_cv": "/api/cv/analyze/{analysis_id}",
            "send_whatsapp": "/api/whatsapp/send/{analysis_id}",
            "get_analysis": "/api/cv/{analysis_id}",
            "list_analyses": "/api/cv/list"
        }
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "agents": {
            "cv_analysis_agent": "running",
            "whatsapp_agent": "running"
        }
    }


@app.post("/api/cv/upload", response_model=CVAnalysisResponse)
async def upload_cv(
    candidate_phone: str = Form(...),
    job_id: str = Form(...),
    cv_file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """
    Upload CV and create analysis record - Simplified workflow
    
    This endpoint:
    1. Accepts only CV file, phone number, and job ID
    2. Extracts text from CV and runs LLM analysis
    3. Extracts candidate information (name, email) from CV content
    4. Creates analysis record with all extracted information
    5. Returns analysis results
    """
    try:
        # Validate file
        if not cv_file.filename:
            raise HTTPException(status_code=400, detail="No CV file provided")
        
        # Create uploads directory if it doesn't exist
        upload_dir = "uploads"
        os.makedirs(upload_dir, exist_ok=True)
        
        # Save uploaded file
        file_extension = os.path.splitext(cv_file.filename)[1]
        cv_file_path = os.path.join(upload_dir, f"{candidate_phone}_{int(time.time())}{file_extension}")
        
        with open(cv_file_path, "wb") as buffer:
            content = await cv_file.read()
            buffer.write(content)
        
        # Create CV analysis record
        analysis = cv_service.create_cv_analysis(
            db=db,
            cv_file_path=cv_file_path,
            candidate_phone=candidate_phone,
            job_id=job_id
        )
        
        # Process CV analysis in background (extract candidate info and analyze)
        try:
            analysis = await cv_service.process_cv_analysis(db, analysis.id)
        except Exception as e:
            print(f"Error during CV analysis: {e}")
            # Continue with basic analysis record even if processing fails
        
        # Convert to response model
        return CVAnalysisResponse(
            id=analysis.id,
            cvUrl=analysis.cvUrl,
            candidateName=analysis.candidateName,
            candidateEmail=analysis.candidateEmail,
            candidatePhone=analysis.candidatePhone,
            jobId=analysis.jobId,
            extractedText=analysis.extractedText,
            overallScore=analysis.overallScore,
            skillsScore=analysis.skillsScore,
            experienceScore=analysis.experienceScore,
            educationScore=analysis.educationScore,
            languageScore=analysis.languageScore,
            certificationScore=analysis.certificationScore,
            summary=analysis.summary,
            strengths=analysis.strengths,
            weaknesses=analysis.weaknesses,
            suggestedImprovements=analysis.suggestedImprovements,
            skills=analysis.skills,
            experience=analysis.experience,
            education=analysis.education,
            certifications=analysis.certifications,
            languages=analysis.languages,
            aiModel=analysis.aiModel,
            processingTime=analysis.processingTime,
            analyzedAt=analysis.analyzedAt,
            status=analysis.status,
            whatsappLink=analysis.whatsappLink
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to upload CV: {str(e)}")


@app.post("/api/cv/analyze/{analysis_id}", response_model=CVAnalysisResponse)
async def analyze_cv(
    analysis_id: str,
    db: Session = Depends(get_db)
):
    """
    Re-analyze an existing CV (if initial analysis failed or needs update)
    """
    try:
        # Process CV analysis
        analysis = await cv_service.process_cv_analysis(db, analysis_id)
        
        if not analysis:
            raise HTTPException(status_code=404, detail="Analysis not found")
        
        # Convert to response model
        return CVAnalysisResponse(
            id=analysis.id,
            cvUrl=analysis.cvUrl,
            candidateName=analysis.candidateName,
            candidateEmail=analysis.candidateEmail,
            candidatePhone=analysis.candidatePhone,
            jobId=analysis.jobId,
            extractedText=analysis.extractedText,
            overallScore=analysis.overallScore,
            skillsScore=analysis.skillsScore,
            experienceScore=analysis.experienceScore,
            educationScore=analysis.educationScore,
            languageScore=analysis.languageScore,
            certificationScore=analysis.certificationScore,
            summary=analysis.summary,
            strengths=analysis.strengths,
            weaknesses=analysis.weaknesses,
            suggestedImprovements=analysis.suggestedImprovements,
            skills=analysis.skills,
            experience=analysis.experience,
            education=analysis.education,
            certifications=analysis.certifications,
            languages=analysis.languages,
            aiModel=analysis.aiModel,
            processingTime=analysis.processingTime,
            analyzedAt=analysis.analyzedAt,
            status=analysis.status,
            whatsappLink=analysis.whatsappLink
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to analyze CV: {str(e)}")


@app.post("/api/whatsapp/send/{analysis_id}")
async def send_whatsapp_message(
    analysis_id: str,
    db: Session = Depends(get_db)
):
    """
    Send WhatsApp message with rolevate room link
    
    This endpoint:
    1. Sends WhatsApp message with the rolevate.com room link
    2. Uses the candidate's phone number from the analysis
    3. Returns success/failure status
    """
    try:
        # Send WhatsApp message
        result = await cv_service.send_whatsapp_message(db=db, analysis_id=analysis_id)
        
        return {
            "success": result.get("success", False),
            "message": result.get("message", ""),
            "phone_number": result.get("phone_number", ""),
            "whatsapp_link": result.get("whatsapp_link", "")
        }
        
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to send WhatsApp message: {str(e)}")


@app.get("/api/cv/{analysis_id}", response_model=CVAnalysisResponse)
async def get_cv_analysis(
    analysis_id: str,
    db: Session = Depends(get_db)
):
    """Get CV analysis by ID"""
    analysis = cv_service.get_analysis(db=db, analysis_id=analysis_id)
    
    if not analysis:
        raise HTTPException(status_code=404, detail="CV analysis not found")
    
    return CVAnalysisResponse(
        id=analysis.id,
        cvUrl=analysis.cvUrl,
        candidateName=analysis.candidateName,
        candidateEmail=analysis.candidateEmail,
        candidatePhone=analysis.candidatePhone,
        jobId=analysis.jobId,
        extractedText=analysis.extractedText,
        overallScore=analysis.overallScore,
        skillsScore=analysis.skillsScore,
        experienceScore=analysis.experienceScore,
        educationScore=analysis.educationScore,
        languageScore=analysis.languageScore,
        certificationScore=analysis.certificationScore,
        summary=analysis.summary,
        strengths=analysis.strengths,
        weaknesses=analysis.weaknesses,
        suggestedImprovements=analysis.suggestedImprovements,
        skills=analysis.skills,
        experience=analysis.experience,
        education=analysis.education,
        certifications=analysis.certifications,
        languages=analysis.languages,
        aiModel=analysis.aiModel,
        processingTime=analysis.processingTime,
        analyzedAt=analysis.analyzedAt,
        status=analysis.status,
        whatsappLink=analysis.whatsappLink
    )


@app.get("/api/cv/list", response_model=List[CVAnalysisResponse])
async def list_cv_analyses(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """List all CV analyses"""
    analyses = cv_service.list_analyses(db=db, skip=skip, limit=limit)
    
    return [
        CVAnalysisResponse(
            id=analysis.id,
            candidate_name=analysis.candidate_name,
            candidate_email=analysis.candidate_email,
            candidate_phone=analysis.candidate_phone,
            position=analysis.position,
            status=analysis.status,
            analysis_result=analysis.analysis_result,
            whatsapp_link=analysis.whatsapp_link,
            created_at=analysis.created_at,
            updated_at=analysis.updated_at
        )
        for analysis in analyses
    ]


@app.get("/api/templates")
async def get_whatsapp_templates():
    """Get available WhatsApp templates"""
    return {
        "templates": {
            "cv_received": "Template for when CV is received and analyzed",
            "interview_invitation": "Template for interview invitation",
            "follow_up": "Template for follow-up messages"
        }
    }


if __name__ == "__main__":
    import uvicorn
    
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", 8000))
    
    uvicorn.run(
        "main:app", 
        host=host, 
        port=port, 
        reload=True
    )
