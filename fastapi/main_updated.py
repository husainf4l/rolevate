from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Optional
import os
from dotenv import load_dotenv

from src.database import get_db, create_tables
from src.schemas import CVUploadRequest, CVAnalysisResponse, WhatsAppResponse
from src.services.cv_service import CVAnalysisService
from src.models import CVAnalysis
from src.utils.pdf_processor import pdf_processor

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
    print("✅ Database connection established")
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
            "create_analysis": "/api/cv/create",
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


@app.post("/api/cv/create", response_model=CVAnalysisResponse)
async def create_cv_analysis(
    candidateId: str = Form(...),
    applicationId: str = Form(...),
    cv_file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """
    Upload PDF CV and create analysis record
    
    This endpoint:
    1. Accepts a PDF CV file upload
    2. Extracts text from the PDF
    3. Creates a new CV analysis record
    4. Returns the analysis details for further processing
    """
    try:
        # Validate and extract text from PDF
        extracted_text = await pdf_processor.extract_text_from_pdf(cv_file)
        
        if not extracted_text.strip():
            raise HTTPException(status_code=400, detail="Could not extract text from the PDF file")
        
        # Save the uploaded file (optional)
        file_content = await cv_file.read()
        file_path = pdf_processor.save_uploaded_file(file_content, cv_file.filename or "cv.pdf")
        
        # Create CV analysis record
        analysis = cv_service.create_cv_analysis(
            db=db,
            cvUrl=file_path,
            candidateId=candidateId,
            applicationId=applicationId,
            extracted_text=extracted_text  # Store the extracted text
        )
        
        # Convert to response model
        return CVAnalysisResponse(
            id=analysis.id,
            cvUrl=analysis.cvUrl,
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
            applicationId=analysis.applicationId,
            candidateId=analysis.candidateId
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create CV analysis: {str(e)}")


@app.post("/api/cv/analyze/{analysis_id}", response_model=CVAnalysisResponse)
async def analyze_cv(
    analysis_id: str,
    db: Session = Depends(get_db)
):
    """
    Analyze CV using the CV Analysis Agent
    
    This endpoint:
    1. Triggers the CV Analysis LangGraph agent
    2. Extracts skills, experience, education, etc.
    3. Calculates a CV score
    4. Updates the database with results
    """
    try:
        # Process CV analysis
        analysis = await cv_service.process_cv_analysis(db=db, analysis_id=analysis_id)
        
        # Convert to response model
        return CVAnalysisResponse(
            id=analysis.id,
            cvUrl=analysis.cvUrl,
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
            applicationId=analysis.applicationId,
            candidateId=analysis.candidateId
        )
        
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to analyze CV: {str(e)}")


@app.post("/api/whatsapp/send/{analysis_id}", response_model=WhatsAppResponse)
async def send_whatsapp_message(
    analysis_id: str,
    request_data: Dict[str, Any],
    db: Session = Depends(get_db)
):
    """
    Send WhatsApp message using the WhatsApp Agent
    
    This endpoint:
    1. Triggers the WhatsApp LangGraph agent
    2. Generates a message from a template
    3. Creates a WhatsApp link
    4. Optionally sends via WhatsApp Business API
    """
    try:
        # Send WhatsApp message
        whatsapp_result = await cv_service.send_whatsapp_message(
            db=db, 
            analysis_id=analysis_id, 
            template_name=template_name,
            phone_number=phone_number
        )
        
        # Return WhatsApp response
        return WhatsAppResponse(
            success=whatsapp_result.get("success", False),
            message=whatsapp_result.get("message", ""),
            whatsapp_link=whatsapp_result.get("whatsapp_link")
        )
        
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
        applicationId=analysis.applicationId,
        candidateId=analysis.candidateId
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
            applicationId=analysis.applicationId,
            candidateId=analysis.candidateId
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
        "main_updated:app", 
        host=host, 
        port=port, 
        reload=True
    )
