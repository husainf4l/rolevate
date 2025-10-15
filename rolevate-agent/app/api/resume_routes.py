"""
Resume API Routes - Dedicated endpoints for resume operations
Provides comprehensive resume management, optimization, and export functionality
"""
from typing import Dict, Any, List, Optional, Union
from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Form, BackgroundTasks, Query, Path as FastAPIPath
from fastapi.responses import StreamingResponse, FileResponse, JSONResponse
from pydantic import BaseModel, Field
from loguru import logger
import json
import asyncio
from datetime import datetime, timezone
import uuid
from pathlib import Path
import tempfile
import aiofiles

from app.agent.cv_builder_graph import cv_builder_workflow
from app.agent.nodes.storage_node import CVStorageManager
from app.api.auth_routes import get_current_user
from app.services.cloud_storage_service import get_cloud_storage
from app.services.anthropic_service import get_anthropic_service
from app.services.language_tool_service import LanguageToolService
from app.models.user import User
from app.config import settings


# Create the router
router = APIRouter(prefix="/resume", tags=["Resume Management"])


# Request/Response Models
class ResumeUploadRequest(BaseModel):
    """Resume upload and processing request"""
    job_description: Optional[str] = Field(default=None, description="Target job description")
    optimization_level: str = Field(default="comprehensive", description="Optimization level: basic, standard, comprehensive")
    target_format: str = Field(default="modern", description="Output format/template")
    include_analysis: bool = Field(default=True, description="Include detailed analysis report")


class ResumeProcessingResponse(BaseModel):
    """Resume processing response"""
    resume_id: str = Field(..., description="Generated resume ID")
    status: str = Field(..., description="Processing status")
    processing_time: float = Field(..., description="Processing time in seconds")
    extracted_data: Optional[Dict[str, Any]] = Field(default=None, description="Extracted CV data")
    optimization_report: Optional[Dict[str, Any]] = Field(default=None, description="Optimization analysis")
    download_urls: Dict[str, str] = Field(default={}, description="Available download URLs")
    storage_info: Optional[Dict[str, Any]] = Field(default=None, description="Storage location info")


class ResumeAnalysisResponse(BaseModel):
    """Resume analysis response"""
    resume_id: str = Field(..., description="Resume ID")
    analysis: Dict[str, Any] = Field(..., description="Comprehensive resume analysis")
    suggestions: List[str] = Field(default=[], description="Improvement suggestions")
    score: int = Field(..., description="Overall quality score (1-10)")
    industry_match: str = Field(..., description="Detected industry match")
    services_used: List[str] = Field(default=[], description="AI services used for analysis")


class ResumeListItem(BaseModel):
    """Resume list item"""
    resume_id: str = Field(..., description="Resume ID")
    created_at: str = Field(..., description="Creation timestamp")
    last_modified: str = Field(..., description="Last modification timestamp")
    title: Optional[str] = Field(default=None, description="Resume title/name")
    industry: Optional[str] = Field(default=None, description="Target industry")
    storage_type: str = Field(..., description="Storage location type")
    file_size: Optional[int] = Field(default=None, description="File size in bytes")


class ResumeOptimizationRequest(BaseModel):
    """Resume optimization request"""
    job_description: Optional[str] = Field(default=None, description="Target job description for tailoring")
    optimization_settings: Dict[str, Any] = Field(default={}, description="Optimization preferences")
    ai_service: str = Field(default="auto", description="AI service preference: auto, openai, anthropic")
    include_grammar_check: bool = Field(default=True, description="Include LanguageTool grammar checking")


@router.post("/upload", response_model=ResumeProcessingResponse)
async def upload_resume(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(..., description="Resume file (PDF, DOCX, TXT)"),
    job_description: Optional[str] = Form(default=None),
    optimization_level: str = Form(default="comprehensive"),
    target_format: str = Form(default="modern"),
    include_analysis: bool = Form(default=True),
    current_user: Optional[User] = Depends(get_current_user)
):
    """
    Upload and process a resume file
    
    - **file**: Resume file in PDF, DOCX, or TXT format
    - **job_description**: Optional job description for tailored optimization
    - **optimization_level**: Level of processing (basic, standard, comprehensive)
    - **target_format**: Output template format
    - **include_analysis**: Whether to include detailed analysis
    """
    
    start_time = datetime.now()
    resume_id = str(uuid.uuid4())
    
    try:
        # Validate file
        if file.content_type not in ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "text/plain"]:
            raise HTTPException(status_code=400, detail="Unsupported file type. Please use PDF, DOCX, or TXT.")
        
        if file.size > settings.max_file_size_bytes:
            raise HTTPException(status_code=400, detail=f"File too large. Maximum size: {settings.max_file_size_mb}MB")
        
        # Read file content
        content = await file.read()
        
        # Initialize workflow state
        workflow_state = {
            "file_content": content,
            "filename": file.filename,
            "content_type": file.content_type,
            "job_description": job_description,
            "optimization_level": optimization_level,
            "target_format": target_format,
            "user_id": current_user.id if current_user else None,
            "resume_id": resume_id
        }
        
        logger.info(f"📄 Processing resume upload: {file.filename} ({file.size} bytes)")
        
        # Process with CV builder workflow
        result = await cv_builder_workflow.ainvoke(workflow_state)
        
        processing_time = (datetime.now() - start_time).total_seconds()
        
        # Prepare response
        response_data = {
            "resume_id": resume_id,
            "status": result.get("processing_step", "completed"),
            "processing_time": processing_time,
            "extracted_data": result.get("cv_memory"),
            "download_urls": {}
        }
        
        # Add optimization report if requested
        if include_analysis and result.get("optimization_report"):
            response_data["optimization_report"] = result["optimization_report"]
        
        # Add storage info
        if result.get("storage_metadata"):
            response_data["storage_info"] = result["storage_metadata"]
        
        # Generate download URLs (mock for now)
        response_data["download_urls"] = {
            "pdf": f"/resume/{resume_id}/download/pdf",
            "json": f"/resume/{resume_id}/download/json",
            "docx": f"/resume/{resume_id}/download/docx"
        }
        
        logger.success(f"✅ Resume processed successfully: {resume_id}")
        return ResumeProcessingResponse(**response_data)
        
    except Exception as e:
        logger.error(f"❌ Resume processing failed: {e}")
        raise HTTPException(status_code=500, detail=f"Resume processing failed: {str(e)}")


@router.get("/{resume_id}", response_model=Dict[str, Any])
async def get_resume(
    resume_id: str,
    include_analysis: bool = Query(default=False, description="Include analysis data"),
    current_user: Optional[User] = Depends(get_current_user)
):
    """
    Retrieve a specific resume by ID
    
    - **resume_id**: Unique resume identifier
    - **include_analysis**: Whether to include analysis and optimization data
    """
    
    try:
        # Get resume from storage
        cloud_storage = get_cloud_storage()
        resume_data = await cloud_storage.retrieve_cv_file(
            resume_id, 
            current_user.id if current_user else None
        )
        
        if not resume_data:
            raise HTTPException(status_code=404, detail="Resume not found")
        
        response = {
            "resume_id": resume_id,
            "cv_data": resume_data["cv_data"],
            "metadata": resume_data["metadata"],
            "last_modified": resume_data["last_modified"],
            "storage_type": resume_data["storage_type"]
        }
        
        # Add analysis if requested
        if include_analysis:
            anthropic_service = get_anthropic_service()
            if anthropic_service.available:
                analysis = await anthropic_service.analyze_cv_section(
                    "complete_resume", 
                    resume_data["cv_data"],
                    resume_data["cv_data"]
                )
                response["analysis"] = analysis
        
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Failed to retrieve resume {resume_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve resume")


@router.get("/{resume_id}/analyze", response_model=ResumeAnalysisResponse)
async def analyze_resume(
    resume_id: str,
    job_description: Optional[str] = Query(default=None, description="Job description for tailored analysis"),
    current_user: Optional[User] = Depends(get_current_user)
):
    """
    Analyze a resume for quality, ATS compatibility, and improvements
    
    - **resume_id**: Resume to analyze
    - **job_description**: Optional job description for targeted analysis
    """
    
    try:
        # Get resume data
        cloud_storage = get_cloud_storage()
        resume_data = await cloud_storage.retrieve_cv_file(
            resume_id,
            current_user.id if current_user else None
        )
        
        if not resume_data:
            raise HTTPException(status_code=404, detail="Resume not found")
        
        cv_data = resume_data["cv_data"]
        services_used = []
        
        # Perform comprehensive analysis
        analysis = {
            "sections_analyzed": {},
            "overall_score": 0,
            "industry_detected": "general",
            "ats_compatibility": {},
            "improvement_areas": [],
            "strengths": []
        }
        
        # Use Anthropic for detailed analysis if available
        anthropic_service = get_anthropic_service()
        if anthropic_service.available:
            services_used.append("Anthropic Claude")
            
            # Analyze each section
            sections_to_analyze = ["summary", "experiences", "education", "skills"]
            total_score = 0
            section_count = 0
            
            for section_name in sections_to_analyze:
                if section_name in cv_data and cv_data[section_name]:
                    section_analysis = await anthropic_service.analyze_cv_section(
                        section_name,
                        cv_data[section_name],
                        cv_data
                    )
                    
                    if section_analysis.get("available"):
                        analysis["sections_analyzed"][section_name] = section_analysis
                        if "score" in section_analysis:
                            total_score += section_analysis["score"]
                            section_count += 1
            
            # Calculate overall score
            if section_count > 0:
                analysis["overall_score"] = round(total_score / section_count)
        
        # Use LanguageTool for grammar analysis
        language_tool = LanguageToolService()
        services_used.append("LanguageTool")
        
        grammar_issues = 0
        for section_name, section_data in cv_data.items():
            if isinstance(section_data, str) and section_data.strip():
                grammar_result = language_tool.check_cv_section(section_data, section_name)
                grammar_issues += len(grammar_result.get("corrections", []))
        
        analysis["grammar_analysis"] = {
            "total_issues": grammar_issues,
            "quality_score": max(1, 10 - (grammar_issues // 2))  # Deduct points for grammar issues
        }
        
        # Generate suggestions
        suggestions = []
        if grammar_issues > 5:
            suggestions.append(f"Address {grammar_issues} grammar and spelling issues")
        if analysis["overall_score"] < 7:
            suggestions.append("Strengthen professional language and impact statements")
        if "experiences" not in cv_data or not cv_data["experiences"]:
            suggestions.append("Add detailed work experience with quantifiable achievements")
        
        # Detect industry
        industry_detected = "general"
        if "experiences" in cv_data:
            # Simple industry detection logic
            text_content = " ".join([
                exp.get("job_title", "") + " " + exp.get("description", "")
                for exp in cv_data["experiences"]
            ]).lower()
            
            industry_keywords = {
                "technology": ["software", "developer", "engineer", "tech"],
                "finance": ["finance", "banking", "analyst"],
                "healthcare": ["healthcare", "medical", "clinical"],
                "sales": ["sales", "business development", "revenue"]
            }
            
            for industry, keywords in industry_keywords.items():
                if any(keyword in text_content for keyword in keywords):
                    industry_detected = industry
                    break
        
        return ResumeAnalysisResponse(
            resume_id=resume_id,
            analysis=analysis,
            suggestions=suggestions,
            score=analysis.get("overall_score", 5),
            industry_match=industry_detected,
            services_used=services_used
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Resume analysis failed for {resume_id}: {e}")
        raise HTTPException(status_code=500, detail="Resume analysis failed")


@router.post("/{resume_id}/optimize", response_model=Dict[str, Any])
async def optimize_resume(
    resume_id: str,
    optimization_request: ResumeOptimizationRequest,
    current_user: Optional[User] = Depends(get_current_user)
):
    """
    Optimize an existing resume with advanced AI services
    
    - **resume_id**: Resume to optimize
    - **optimization_request**: Optimization preferences and settings
    """
    
    try:
        # Get resume data
        cloud_storage = get_cloud_storage()
        resume_data = await cloud_storage.retrieve_cv_file(
            resume_id,
            current_user.id if current_user else None
        )
        
        if not resume_data:
            raise HTTPException(status_code=404, detail="Resume not found")
        
        cv_data = resume_data["cv_data"].copy()
        
        # Run optimization workflow
        optimization_state = {
            "cv_memory": cv_data,
            "job_description": optimization_request.job_description,
            "ai_service_preference": optimization_request.ai_service,
            "grammar_check_enabled": optimization_request.include_grammar_check,
            "optimization_settings": optimization_request.optimization_settings
        }
        
        # Import optimizer directly
        from app.agent.nodes.optimizer_node import optimizer_node
        
        result = await optimizer_node(optimization_state)
        
        # Store the optimized version
        optimized_cv = result.get("cv_memory", cv_data)
        storage_result = await cloud_storage.store_cv_file(
            f"{resume_id}_optimized_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
            optimized_cv,
            current_user.id if current_user else None
        )
        
        return {
            "resume_id": resume_id,
            "optimized_resume_id": storage_result.get("key", "unknown"),
            "optimization_report": result.get("optimization_report", {}),
            "optimized_data": optimized_cv,
            "storage_info": storage_result,
            "status": "completed"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Resume optimization failed for {resume_id}: {e}")
        raise HTTPException(status_code=500, detail="Resume optimization failed")


@router.get("/{resume_id}/download/{format}")
async def download_resume(
    resume_id: str,
    format: str,
    current_user: Optional[User] = Depends(get_current_user)
):
    """
    Download a resume in the specified format
    
    - **resume_id**: Resume to download
    - **format**: Output format (pdf, json, docx)
    """
    
    try:
        # Get resume data
        cloud_storage = get_cloud_storage()
        resume_data = await cloud_storage.retrieve_cv_file(
            resume_id,
            current_user.id if current_user else None
        )
        
        if not resume_data:
            raise HTTPException(status_code=404, detail="Resume not found")
        
        cv_data = resume_data["cv_data"]
        
        if format.lower() == "json":
            # Return JSON data
            import io
            json_content = json.dumps(cv_data, indent=2, ensure_ascii=False)
            json_bytes = json_content.encode('utf-8')
            
            return StreamingResponse(
                io.BytesIO(json_bytes),
                media_type="application/json",
                headers={"Content-Disposition": f"attachment; filename=resume_{resume_id}.json"}
            )
        
        elif format.lower() == "pdf":
            # Generate PDF (placeholder - integrate with PDF generation service)
            logger.info("PDF generation requested - integration needed")
            raise HTTPException(status_code=501, detail="PDF generation not yet implemented")
        
        elif format.lower() == "docx":
            # Generate DOCX (placeholder - integrate with DOCX generation service)
            logger.info("DOCX generation requested - integration needed")
            raise HTTPException(status_code=501, detail="DOCX generation not yet implemented")
        
        else:
            raise HTTPException(status_code=400, detail="Unsupported format. Use: pdf, json, or docx")
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Download failed for {resume_id}: {e}")
        raise HTTPException(status_code=500, detail="Download failed")


@router.get("/", response_model=List[ResumeListItem])
async def list_resumes(
    limit: int = Query(default=50, description="Maximum number of resumes to return"),
    offset: int = Query(default=0, description="Number of resumes to skip"),
    current_user: Optional[User] = Depends(get_current_user)
):
    """
    List all resumes for the current user
    
    - **limit**: Maximum number of results
    - **offset**: Pagination offset
    """
    
    try:
        # This is a placeholder - actual implementation would query storage/database
        logger.info("Resume listing requested - full implementation needed")
        
        # Return empty list for now
        return []
        
    except Exception as e:
        logger.error(f"❌ Failed to list resumes: {e}")
        raise HTTPException(status_code=500, detail="Failed to list resumes")


@router.delete("/{resume_id}")
async def delete_resume(
    resume_id: str,
    current_user: Optional[User] = Depends(get_current_user)
):
    """
    Delete a resume and all associated files
    
    - **resume_id**: Resume to delete
    """
    
    try:
        cloud_storage = get_cloud_storage()
        success = await cloud_storage.delete_cv_files(
            resume_id,
            current_user.id if current_user else None
        )
        
        if success:
            return {"message": f"Resume {resume_id} deleted successfully"}
        else:
            raise HTTPException(status_code=404, detail="Resume not found or deletion failed")
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Failed to delete resume {resume_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete resume")


# Health check endpoint
@router.get("/health")
async def resume_service_health():
    """Check the health status of resume services"""
    
    # Check service availability
    cloud_storage = get_cloud_storage()
    anthropic_service = get_anthropic_service()
    language_tool = LanguageToolService()
    
    return {
        "status": "healthy",
        "services": {
            "cloud_storage": cloud_storage.get_storage_info(),
            "anthropic": anthropic_service.get_service_status(),
            "language_tool": {
                "available": language_tool.tool is not None,
                "service": "LanguageTool Grammar Checker"
            },
            "openai": {
                "available": bool(settings.openai_api_key and settings.openai_api_key != "fake-key"),
                "model": settings.openai_model
            }
        },
        "timestamp": datetime.now(timezone.utc).isoformat()
    }