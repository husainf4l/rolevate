from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Optional
import os
import time
from dotenv import load_dotenv

from src.database import get_db, create_tables
from src.schemas import CVAnalysisResponse
from src.services.cv_service import CVAnalysisService
from src.models import CVAnalysis

# Load environment variables
load_dotenv()

# Create FastAPI app
app = FastAPI(
    title="CV Analysis API - Simplified",
    description="Simple CV workflow: Upload -> Extract -> Analyze -> Update DB -> Send WhatsApp",
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
        "message": "CV Analysis API - Simplified Workflow",
        "version": "1.0.0",
        "status": "running",
        "workflow": "Upload CV -> Extract Text -> Analyze -> Update DB -> Send WhatsApp",
        "endpoints": {
            "docs": "/docs",
            "upload_cv": "/api/cv/upload",
            "get_analysis": "/api/cv/{analysis_id}",
            "list_analyses": "/api/cv/list"
        }
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "workflow": "ready"
    }


@app.post("/api/cv/upload", response_model=CVAnalysisResponse)
async def upload_and_process_cv(
    candidate_phone: str = Form(..., description="Candidate's phone number"),
    job_id: str = Form(..., description="Job ID for the position"),
    cv_file: UploadFile = File(..., description="CV file (PDF)"),
    db: Session = Depends(get_db)
):
    """
    Complete CV workflow in one endpoint:
    1. Upload CV file 
    2. Extract text from CV
    3. Analyze CV using LLM (extract candidate info, skills, etc.)
    4. Update database with all results
    5. Send WhatsApp message with interview room link
    """
    try:
        # Validate file
        if not cv_file.filename:
            raise HTTPException(status_code=400, detail="No CV file provided")
        
        # Create uploads directory if it doesn't exist
        upload_dir = "uploads"
        os.makedirs(upload_dir, exist_ok=True)
        
        # Save uploaded file with timestamp
        timestamp = int(time.time())
        file_extension = os.path.splitext(cv_file.filename)[1]
        cv_file_path = os.path.join(upload_dir, f"{candidate_phone}_{timestamp}{file_extension}")
        
        with open(cv_file_path, "wb") as buffer:
            content = await cv_file.read()
            buffer.write(content)
        
        print(f"✅ CV file saved: {cv_file_path}")
        
        # Process complete workflow (extract text -> analyze -> update DB -> send WhatsApp)
        analysis = await cv_service.process_complete_workflow(
            db=db,
            cv_file_path=cv_file_path,
            candidate_phone=candidate_phone,
            job_id=job_id
        )
        
        print(f"✅ Complete workflow finished for analysis ID: {analysis.id}")
        
        # Return analysis results (using current database schema)
        return CVAnalysisResponse(
            id=analysis.id,
            cvUrl=analysis.cvUrl,
            candidateName=None,  # Will be available after database migration
            candidateEmail=None,  # Will be available after database migration  
            candidatePhone=candidate_phone,  # From form input
            jobId=job_id,  # From form input
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
            status="completed",  # Mock status
            whatsappLink=f"https://rolevate.com/room?phonenumber={candidate_phone}&jobid={job_id}"
        )
        
    except Exception as e:
        print(f"❌ Complete workflow failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to process CV: {str(e)}")


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
        for analysis in analyses
    ]


if __name__ == "__main__":
    import uvicorn
    
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", 8000))
    
    uvicorn.run(
        "main_simple:app", 
        host=host, 
        port=port, 
        reload=True
    )
