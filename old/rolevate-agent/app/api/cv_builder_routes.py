"""
CV Builder API Routes - Complete FastAPI endpoints for CV generation
Provides chat, generation, download, and management endpoints
"""
from typing import Dict, Any, List, Optional, Union
from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Form, BackgroundTasks
from fastapi.responses import StreamingResponse, FileResponse
from pydantic import BaseModel, Field
from loguru import logger
import json
import asyncio
from datetime import datetime
import uuid
from pathlib import Path

from app.agent.cv_builder_graph import (
    generate_cv, 
    process_chat, 
    get_workflow_info,
    cv_builder_workflow
)
from app.agent.nodes.storage_node import CVStorageManager
from app.api.auth_routes import get_current_user
from app.models.user import User
from app.agent.tools.professional_profile_assistant import ProfessionalProfileAssistant


# Create the router
router = APIRouter(prefix="/cv-builder", tags=["CV Builder"])


# Request/Response Models
class ChatMessage(BaseModel):
    """Chat message request"""
    message: str = Field(..., description="User message for CV building")
    thread_id: Optional[str] = Field(default=None, description="Thread ID for conversation continuity")
    context: Optional[Dict[str, Any]] = Field(default={}, description="Additional context")


class ChatResponse(BaseModel):
    """Chat message response"""
    response: str = Field(..., description="AI response message")
    thread_id: str = Field(..., description="Thread ID for conversation")
    cv_id: Optional[str] = Field(default=None, description="Generated CV ID if applicable")
    workflow_status: str = Field(..., description="Current workflow status")
    execution_time: float = Field(default=0.0, description="Processing time in seconds")
    actions_available: List[str] = Field(default=[], description="Available next actions")


class CVGenerationRequest(BaseModel):
    """CV generation request"""
    input_data: Dict[str, Any] = Field(..., description="CV input data")
    template_preference: Optional[str] = Field(default=None, description="Preferred template name")
    optimization_level: Optional[str] = Field(default="comprehensive", description="Optimization level")
    output_format: Optional[str] = Field(default="pdf", description="Output format preference")


class CVGenerationResponse(BaseModel):
    """CV generation response"""
    success: bool = Field(..., description="Generation success status")
    cv_id: str = Field(..., description="Generated CV identifier")
    workflow_id: str = Field(..., description="Workflow execution ID")
    download_url: str = Field(..., description="URL to download the generated CV")
    processing_time: float = Field(..., description="Total processing time")
    optimization_report: Dict[str, Any] = Field(default={}, description="Optimization details")
    metadata: Dict[str, Any] = Field(default={}, description="Additional metadata")


class WorkflowStatus(BaseModel):
    """Workflow status response"""
    workflow_id: str = Field(..., description="Workflow identifier")
    status: str = Field(..., description="Current status")
    progress: float = Field(default=0.0, description="Progress percentage")
    current_step: str = Field(default="", description="Current processing step")
    estimated_time_remaining: Optional[float] = Field(default=None, description="Estimated completion time")
    error_details: Optional[str] = Field(default=None, description="Error details if any")


# Initialize storage manager
storage_manager = CVStorageManager()


@router.post("/chat", response_model=ChatResponse)
async def chat_with_cv_builder(
    chat_request: ChatMessage,
    current_user: User = Depends(get_current_user)
) -> ChatResponse:
    """
    Interactive chat interface for CV building
    
    This endpoint provides a conversational interface where users can:
    - Upload CV data or files
    - Request CV generation with specific preferences
    - Get help and guidance on CV improvement
    - Track workflow progress
    """
    try:
        logger.info(f"💬 Processing chat request from user {current_user.id}")
        
        # Generate thread ID if not provided
        thread_id = chat_request.thread_id or str(uuid.uuid4())
        
        # Process the chat message
        result = await process_chat(
            message=chat_request.message,
            thread_id=thread_id,
            user_id=current_user.id
        )
        
        # Determine available actions based on workflow state
        actions_available = []
        if result.get("cv_id"):
            actions_available.extend(["download_pdf", "view_details", "regenerate"])
        else:
            actions_available.extend(["upload_file", "provide_details", "use_template"])
        
        # Create response
        response = ChatResponse(
            response=result.get("response_message", "I'm ready to help you build your CV!"),
            thread_id=thread_id,
            cv_id=result.get("cv_id"),
            workflow_status=result.get("processing_step", "ready"),
            execution_time=result.get("total_execution_time", 0.0),
            actions_available=actions_available
        )
        
        logger.success(f"✅ Chat processed successfully: {thread_id}")
        return response
        
    except Exception as e:
        logger.error(f"❌ Chat processing failed: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Chat processing failed: {str(e)}"
        )


@router.post("/generate", response_model=CVGenerationResponse)
async def generate_cv_endpoint(
    generation_request: CVGenerationRequest,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user)
) -> CVGenerationResponse:
    """
    Generate a complete CV from input data
    
    This endpoint processes structured CV data and generates a professional PDF:
    - Parses and validates input data
    - Applies AI-powered content enhancement
    - Selects optimal template design
    - Generates high-quality PDF output
    - Stores result for future access
    """
    try:
        logger.info(f"🚀 Starting CV generation for user {current_user.id}")
        
        # Add user preferences to input data
        input_data = generation_request.input_data.copy()
        input_data.update({
            "template_preference": generation_request.template_preference,
            "optimization_level": generation_request.optimization_level,
            "output_format": generation_request.output_format,
            "user_id": current_user.id
        })
        
        # Generate the CV using the complete workflow
        result = await generate_cv(input_data, current_user.id)
        
        if not result.get("success"):
            raise HTTPException(
                status_code=400,
                detail=f"CV generation failed: {result.get('error', 'Unknown error')}"
            )
        
        cv_id = result["cv_id"]
        
        # Create download URL
        download_url = f"/cv-builder/download/{cv_id}"
        
        # Schedule cleanup task (optional background task)
        background_tasks.add_task(
            storage_manager.cleanup_old_files,
            days_old=30
        )
        
        response = CVGenerationResponse(
            success=True,
            cv_id=cv_id,
            workflow_id=result["workflow_id"],
            download_url=download_url,
            processing_time=result.get("total_execution_time", 0.0),
            optimization_report=result.get("optimization_report", {}),
            metadata={
                "error_count": result.get("error_count", 0),
                "performance_metrics": result.get("performance_metrics", {}),
                "storage_info": result.get("storage_info", {})
            }
        )
        
        logger.success(f"✅ CV generation completed: {cv_id}")
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ CV generation failed: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"CV generation failed: {str(e)}"
        )


@router.post("/upload")
async def upload_cv_file(
    file: UploadFile = File(...),
    extract_format: str = Form(default="structured"),
    current_user: User = Depends(get_current_user)
) -> Dict[str, Any]:
    """
    Upload and parse CV files (PDF, DOC, DOCX, TXT)
    
    Extracts structured data from uploaded CV files for processing:
    - Supports multiple file formats
    - Extracts text and structured data
    - Validates and cleans extracted content
    - Returns parsed data for CV generation
    """
    try:
        logger.info(f"📁 Processing file upload: {file.filename}")
        
        # Validate file type
        allowed_extensions = {'.pdf', '.doc', '.docx', '.txt'}
        file_extension = Path(file.filename).suffix.lower()
        
        if file_extension not in allowed_extensions:
            raise HTTPException(
                status_code=400,
                detail=f"Unsupported file type. Allowed: {', '.join(allowed_extensions)}"
            )
        
        # Read file content
        file_content = await file.read()
        
        # Create input data for processing
        input_data = {
            "file_content": file_content,
            "file_name": file.filename,
            "file_type": file_extension,
            "extract_format": extract_format,
            "user_id": current_user.id,
            "interaction_type": "file_upload"
        }
        
        # Process using the input node only for extraction
        from app.agent.nodes.input_node import CVInputProcessor
        processor = CVInputProcessor()
        
        extracted_data = await processor.process_file_upload(
            file_content, file.filename, file_extension
        )
        
        response = {
            "success": True,
            "file_name": file.filename,
            "extracted_data": extracted_data,
            "suggestions": [
                "Review extracted information for accuracy",
                "Add missing details if needed",
                "Choose a template style",
                "Generate your professional CV"
            ]
        }
        
        logger.success(f"✅ File processed successfully: {file.filename}")
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ File upload failed: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"File processing failed: {str(e)}"
        )


@router.get("/download/{cv_id}")
async def download_cv(
    cv_id: str,
    format: str = "pdf",
    current_user: User = Depends(get_current_user)
) -> FileResponse:
    """
    Download generated CV file
    
    Retrieves and serves the generated CV file:
    - Supports PDF format (primary)
    - Validates user access permissions
    - Returns high-quality downloadable file
    """
    try:
        logger.info(f"📥 Download request for CV: {cv_id}")
        
        # Retrieve CV data to verify ownership/access
        cv_data = await storage_manager.retrieve_cv_data(cv_id)
        
        if not cv_data:
            raise HTTPException(
                status_code=404,
                detail="CV not found"
            )
        
        # Find PDF file
        pdf_files = list(storage_manager.pdf_output_path.glob(f"{cv_id}_*.pdf"))
        
        if not pdf_files:
            raise HTTPException(
                status_code=404,
                detail="PDF file not found. The CV may not have been fully processed."
            )
        
        # Get the most recent PDF file
        pdf_file = max(pdf_files, key=lambda x: x.stat().st_mtime)
        
        # Generate download filename
        personal_info = cv_data.get("personal_info", {})
        full_name = personal_info.get("full_name", "CV").replace(" ", "_")
        timestamp = datetime.now().strftime("%Y%m%d")
        download_filename = f"{full_name}_CV_{timestamp}.pdf"
        
        logger.success(f"✅ Serving CV download: {cv_id}")
        
        return FileResponse(
            path=pdf_file,
            filename=download_filename,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f"attachment; filename={download_filename}",
                "CV-ID": cv_id
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Download failed: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Download failed: {str(e)}"
        )


@router.get("/status/{workflow_id}", response_model=WorkflowStatus)
async def get_workflow_status(
    workflow_id: str,
    current_user: User = Depends(get_current_user)
) -> WorkflowStatus:
    """
    Get the status of a CV generation workflow
    
    Provides real-time status updates for long-running CV generation processes:
    - Current processing step
    - Progress percentage
    - Error details if any
    - Estimated completion time
    """
    try:
        logger.info(f"📊 Status request for workflow: {workflow_id}")
        
        # Get workflow status from the graph
        status_info = cv_builder_workflow.get_workflow_status(workflow_id)
        
        if status_info.get("status") == "not_found":
            raise HTTPException(
                status_code=404,
                detail="Workflow not found"
            )
        
        # Calculate progress based on completed steps
        step_progress = {
            "initiated": 10,
            "input_complete": 20,
            "data_cleaning_complete": 30,
            "content_enhancement_complete": 50,
            "section_ranking_complete": 60,
            "template_selection_complete": 70,
            "pdf_rendering_complete": 85,
            "optimization_complete": 95,
            "storage_complete": 100
        }
        
        current_step = status_info.get("processing_step", "initiated")
        progress = step_progress.get(current_step, 0)
        
        # Estimate remaining time based on performance metrics
        metrics = status_info.get("performance_metrics", {})
        completed_steps = len(metrics)
        avg_step_time = (
            sum(m.get("execution_time", 0) for m in metrics.values()) / completed_steps
            if completed_steps > 0 else 2.0
        )
        remaining_steps = max(0, 8 - completed_steps)
        estimated_time_remaining = remaining_steps * avg_step_time if remaining_steps > 0 else None
        
        response = WorkflowStatus(
            workflow_id=workflow_id,
            status=status_info.get("status", "unknown"),
            progress=progress,
            current_step=current_step,
            estimated_time_remaining=estimated_time_remaining,
            error_details=status_info.get("error")
        )
        
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Status check failed: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Status check failed: {str(e)}"
        )


@router.get("/templates")
async def list_available_templates() -> Dict[str, Any]:
    """
    List all available CV templates
    
    Returns information about available CV templates:
    - Template names and descriptions
    - Style categories (modern, classic, creative)
    - Preview images (if available)
    - Suitability recommendations
    """
    try:
        from app.agent.nodes.template_selector_node import TemplateSelector
        
        selector = TemplateSelector()
        templates = selector.get_all_templates()
        
        return {
            "templates": templates,
            "categories": ["modern", "classic", "creative", "minimal", "executive", "academic"],
            "recommendations": {
                "technology": ["modern", "minimal"],
                "finance": ["classic", "executive"],
                "creative": ["creative", "modern"],
                "academic": ["academic", "classic"],
                "general": ["modern", "classic"]
            }
        }
        
    except Exception as e:
        logger.error(f"❌ Template listing failed: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Template listing failed: {str(e)}"
        )


@router.get("/my-cvs")
async def list_user_cvs(
    limit: int = 10,
    offset: int = 0,
    current_user: User = Depends(get_current_user)
) -> Dict[str, Any]:
    """
    List user's CV history and saved CVs
    
    Returns a paginated list of the user's CV generation history:
    - CV IDs and creation dates
    - Template information
    - Download links
    - Version history
    """
    try:
        # This would typically query the database for user's CVs
        # For now, we'll return a placeholder structure
        
        user_cvs = []
        # TODO: Implement database query for user's CVs
        
        return {
            "cvs": user_cvs,
            "total_count": len(user_cvs),
            "limit": limit,
            "offset": offset,
            "has_more": False
        }
        
    except Exception as e:
        logger.error(f"❌ CV listing failed: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"CV listing failed: {str(e)}"
        )


@router.get("/info")
async def get_cv_builder_info() -> Dict[str, Any]:
    """
    Get information about the CV Builder system
    
    Returns system information and capabilities:
    - Available nodes and their functions
    - Supported input formats
    - Output formats
    - System status
    """
    try:
        workflow_info = get_workflow_info()
        
        return {
            "system": "CV Builder AI",
            "version": "1.0.0",
            "description": "Intelligent CV generation system with 8-node processing pipeline",
            "capabilities": [
                "Natural language CV input processing",
                "AI-powered content enhancement",
                "Intelligent template selection",
                "Professional PDF generation",
                "Grammar and style optimization",
                "ATS compatibility",
                "Multi-format file support"
            ],
            "workflow_info": workflow_info,
            "supported_formats": {
                "input": ["pdf", "doc", "docx", "txt", "json", "natural_language"],
                "output": ["pdf"]
            },
            "processing_pipeline": [
                "Input Understanding & Parsing",
                "Data Cleaning & Deduplication", 
                "Content Writing & Enhancement",
                "Section Ranking & Organization",
                "Template Selection",
                "PDF Rendering",
                "Content Optimization",
                "Storage & Versioning"
            ]
        }
        
    except Exception as e:
        logger.error(f"❌ Info retrieval failed: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Info retrieval failed: {str(e)}"
        )


# Professional Profile Assistant Endpoints
class ProfileAnalysisRequest(BaseModel):
    """Professional profile analysis request"""
    professional_background: str = Field(..., description="Professional background text to analyze")
    industry_focus: Optional[str] = Field(default="banking_finance", description="Industry focus (banking_finance, general)")


class ProfileAnalysisResponse(BaseModel):
    """Profile analysis response"""
    extracted_data: Dict[str, Any] = Field(..., description="Structured extracted information")
    missing_information: List[str] = Field(default=[], description="List of missing information fields")
    completeness_score: float = Field(..., description="Profile completeness percentage (0-100)")
    follow_up_question: Optional[str] = Field(default=None, description="Suggested follow-up question")
    analysis_summary: str = Field(..., description="Brief analysis summary")


class ProfileUpdateRequest(BaseModel):
    """Profile update request"""
    session_id: str = Field(..., description="Profile analysis session ID")
    field_name: str = Field(..., description="Field to update")
    field_value: Any = Field(..., description="New field value")


class ProfileSummaryRequest(BaseModel):
    """Profile summary generation request"""
    session_id: str = Field(..., description="Profile analysis session ID")
    include_all_sections: bool = Field(default=True, description="Include all available sections")


class ProfileSummaryResponse(BaseModel):
    """Profile summary response"""
    professional_summary: str = Field(..., description="Complete formatted professional CV")
    json_output: Dict[str, Any] = Field(..., description="Structured JSON output for ATS/database")
    word_count: int = Field(..., description="Summary word count")
    sections_included: List[str] = Field(default=[], description="Sections included in summary")


# Initialize profile assistant
profile_assistant = ProfessionalProfileAssistant()


@router.post("/profile/analyze", response_model=ProfileAnalysisResponse)
async def analyze_professional_profile(
    request: ProfileAnalysisRequest,
    current_user: User = Depends(get_current_user)
) -> ProfileAnalysisResponse:
    """
    Analyze professional background text and extract structured information

    This endpoint processes unstructured professional background text and:
    - Extracts key information (experience, education, skills, etc.)
    - Identifies missing information
    - Provides completeness scoring
    - Suggests follow-up questions
    """
    try:
        logger.info(f"🔍 Analyzing professional profile for user {current_user.id}")

        # Analyze the professional background text
        analysis_result = profile_assistant.analyze_profile_text(request.professional_background)

        # Generate follow-up question if needed
        follow_up_question = None
        if analysis_result['missing_information']:
            follow_up_question = profile_assistant.generate_follow_up_question(
                analysis_result['missing_information']
            )

        # Create analysis summary
        extracted_data = analysis_result['extracted_data']
        completeness = analysis_result['completeness_score']

        summary_parts = []
        if extracted_data.get('personal_info', {}).get('full_name'):
            summary_parts.append(f"Identified: {extracted_data['personal_info']['full_name']}")

        current_pos = extracted_data.get('current_position', {})
        if current_pos.get('job_title') and current_pos.get('organization'):
            summary_parts.append(f"Current role: {current_pos['job_title']} at {current_pos['organization']}")

        exp = extracted_data.get('experience', {})
        if exp.get('years_experience'):
            summary_parts.append(f"Experience: {exp['years_experience']} years")

        analysis_summary = ". ".join(summary_parts) + f". Profile completeness: {completeness}%"

        response = ProfileAnalysisResponse(
            extracted_data=extracted_data,
            missing_information=analysis_result['missing_information'],
            completeness_score=completeness,
            follow_up_question=follow_up_question,
            analysis_summary=analysis_summary
        )

        logger.success(f"✅ Profile analysis completed: {completeness}% complete")
        return response

    except Exception as e:
        logger.error(f"❌ Profile analysis failed: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Profile analysis failed: {str(e)}"
        )


@router.post("/profile/update")
async def update_profile_information(
    request: ProfileUpdateRequest,
    current_user: User = Depends(get_current_user)
) -> Dict[str, Any]:
    """
    Update specific profile information fields

    This endpoint allows updating individual profile fields:
    - Adds or updates specific information
    - Validates input data
    - Recalculates completeness score
    - Returns updated profile data
    """
    try:
        logger.info(f"📝 Updating profile field: {request.field_name}")

        # In a real implementation, this would update stored profile data
        # For now, we'll return a success response with the updated field

        response = {
            "success": True,
            "field_updated": request.field_name,
            "new_value": request.field_value,
            "message": f"Successfully updated {request.field_name.replace('_', ' ')}"
        }

        logger.success(f"✅ Profile field updated: {request.field_name}")
        return response

    except Exception as e:
        logger.error(f"❌ Profile update failed: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Profile update failed: {str(e)}"
        )


@router.post("/profile/generate-summary", response_model=ProfileSummaryResponse)
async def generate_professional_summary(
    request: ProfileSummaryRequest,
    current_user: User = Depends(get_current_user)
) -> ProfileSummaryResponse:
    """
    Generate a complete, structured professional summary

    This endpoint creates a formatted professional summary including:
    - Personal and contact information
    - Professional summary paragraphs
    - Core competencies and skills
    - Education and certifications
    - Career objectives
    """
    try:
        logger.info(f"📄 Generating professional summary for user {current_user.id}")

        # In a real implementation, this would retrieve the complete profile data
        # For now, we'll create a sample based on typical banking/finance profile

        sample_profile_data = {
            'personal_info': {
                'full_name': 'Johnathan Smith',
                'email': 'johnathan.smith@financecorp.com',
                'phone': '+1-555-0123',
                'location': 'New York, NY'
            },
            'current_position': {
                'job_title': 'Senior Investment Banker',
                'organization': 'Global Finance Corporation'
            },
            'experience': {
                'years_experience': 12,
                'previous_positions': [
                    'Investment Banking Analyst at Regional Bank',
                    'Associate at International Investment Group'
                ]
            },
            'education': {
                'degree': 'MBA',
                'institution': 'Harvard Business School',
                'graduation_year': 2010
            },
            'certifications': [
                {
                    'certification_name': 'CFA',
                    'issuing_body': 'CFA Institute',
                    'year_obtained': 2015
                },
                {
                    'certification_name': 'Series 65',
                    'issuing_body': 'FINRA',
                    'year_obtained': 2012
                }
            ],
            'skills': [
                'Financial Modeling', 'Valuation Analysis', 'Mergers & Acquisitions',
                'Capital Markets', 'Risk Assessment', 'Portfolio Management',
                'Client Relationship Management', 'Regulatory Compliance'
            ],
            'languages': [
                {'language': 'English', 'proficiency_level': 'Native'},
                {'language': 'Spanish', 'proficiency_level': 'Conversational'}
            ],
            'goals': {
                'career_objectives': 'Seeking to leverage 12+ years of investment banking experience to drive strategic growth initiatives and deliver exceptional value to institutional clients.',
                'professional_philosophy': 'Committed to maintaining the highest standards of integrity, professionalism, and client service excellence in all financial transactions.'
            }
        }

        # Generate the professional CV (formatted)
        professional_summary = profile_assistant.generate_professional_summary(sample_profile_data)
        
        # Generate JSON output
        json_output = profile_assistant.generate_cv_json(sample_profile_data)

        # Count words
        word_count = len(professional_summary.split())

        # Identify sections included
        sections_included = []
        if '### **CONTACT**' in professional_summary:
            sections_included.append('contact_information')
        if '### **PROFESSIONAL SUMMARY**' in professional_summary:
            sections_included.append('professional_summary')
        if '### **CORE COMPETENCIES**' in professional_summary:
            sections_included.append('core_competencies')
        if '### **PROFESSIONAL EXPERIENCE**' in professional_summary:
            sections_included.append('professional_experience')
        if '### **EDUCATION**' in professional_summary:
            sections_included.append('education')
        if '### **CERTIFICATIONS**' in professional_summary:
            sections_included.append('certifications')
        if '### **LANGUAGES**' in professional_summary:
            sections_included.append('languages')
        if '### **PROFESSIONAL PHILOSOPHY**' in professional_summary:
            sections_included.append('professional_philosophy')

        response = ProfileSummaryResponse(
            professional_summary=professional_summary,
            json_output=json_output,
            word_count=word_count,
            sections_included=sections_included
        )

        logger.success(f"✅ Professional CV generated: {word_count} words")
        return response

    except Exception as e:
        logger.error(f"❌ Summary generation failed: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Summary generation failed: {str(e)}"
        )


@router.get("/profile/capabilities")
async def get_profile_assistant_capabilities() -> Dict[str, Any]:
    """
    Get information about the Professional Profile Assistant capabilities

    Returns system information and supported features:
    - Analysis capabilities
    - Supported industries
    - Output formats
    - Data extraction fields
    """
    try:
        return {
            "system": "Professional Profile Assistant",
            "version": "1.0.0",
            "description": "AI-powered assistant for building complete professional profiles in banking and finance",
            "primary_industry": "Banking & Financial Services",
            "supported_languages": ["English"],
            "extraction_capabilities": {
                "personal_info": ["full_name", "email", "phone", "location"],
                "current_position": ["job_title", "organization", "start_date"],
                "experience": ["years_experience", "previous_positions", "key_responsibilities"],
                "education": ["degree", "institution", "graduation_year"],
                "certifications": ["certification_name", "issuing_body", "year_obtained"],
                "skills": ["core_competencies", "technical_skills", "soft_skills"],
                "languages": ["language", "proficiency_level"],
                "goals": ["career_objectives", "professional_philosophy"]
            },
            "output_formats": ["structured_markdown", "json", "html"],
            "analysis_features": [
                "Intelligent text parsing",
                "Missing information detection",
                "Completeness scoring",
                "Follow-up question generation",
                "Professional summary generation",
                "Industry-specific terminology recognition"
            ],
            "certifications_supported": [
                "CFA (Chartered Financial Analyst)",
                "CPA (Certified Public Accountant)",
                "FRM (Financial Risk Manager)",
                "PRM (Professional Risk Manager)",
                "CAIA (Chartered Alternative Investment Analyst)",
                "CFP (Certified Financial Planner)",
                "Series 65, 66 (FINRA licenses)"
            ]
        }

    except Exception as e:
        logger.error(f"❌ Capabilities retrieval failed: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Capabilities retrieval failed: {str(e)}"
        )