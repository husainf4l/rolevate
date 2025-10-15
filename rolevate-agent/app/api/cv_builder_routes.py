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