"""FastAPI application for CV Filler Agent."""
import shutil
from pathlib import Path
from typing import Optional

from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.responses import FileResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from loguru import logger

from ..services.cv_agent import CVFillerAgent
from ..models.cv_schema import CVData, CVProcessRequest, CVProcessResponse
from ..core.config import settings
from ..utils.file_parser import FileParser
from .routes_cv import router as cv_router

# Initialize FastAPI app
app = FastAPI(
    title="Rolevate CV Filler Agent",
    description="AI-powered CV extraction and template filling service",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include CV router
app.include_router(cv_router, prefix="/cv", tags=["CV Filler"])

# Initialize agent
agent = CVFillerAgent()

# Ensure directories exist
settings.ensure_directories()


@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "service": "Rolevate CV Filler Agent",
        "version": "1.0.0",
        "status": "operational"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}


@app.post("/api/v1/cv/extract", response_model=CVData)
async def extract_cv(
    file: UploadFile = File(...),
    enhance: bool = Form(False)
):
    """
    Extract structured data from uploaded CV.
    
    Args:
        file: CV file (PDF, DOCX, TXT, or JSON)
        enhance: Whether to enhance extracted data with AI
        
    Returns:
        CVData: Structured CV data
    """
    logger.info(f"Received CV extraction request: {file.filename}")
    
    # Validate file extension
    file_ext = Path(file.filename).suffix.lower()
    if file_ext.lstrip('.') not in settings.allowed_extensions_list:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file format. Allowed: {settings.allowed_extensions}"
        )
    
    # Save uploaded file temporarily
    upload_path = Path(settings.upload_dir) / file.filename
    
    try:
        with open(upload_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Extract CV data
        cv_data = await agent.extract_only(upload_path, enhance=enhance)
        
        return cv_data
        
    except Exception as e:
        logger.error(f"Extraction failed: {e}")
        raise HTTPException(status_code=500, detail=f"Extraction failed: {str(e)}")
        
    finally:
        # Cleanup
        if upload_path.exists():
            upload_path.unlink()


@app.post("/api/v1/cv/fill")
async def fill_template(
    cv_data: CVData,
    template_name: str = "modern",
    output_format: str = "pdf"
):
    """
    Fill CV template with provided data.
    
    Args:
        cv_data: Structured CV data
        template_name: Template to use
        output_format: Output format (pdf or docx)
        
    Returns:
        FileResponse: Generated CV file
    """
    logger.info(f"Filling template: {template_name}, format: {output_format}")
    
    try:
        output_path = await agent.fill_template(
            cv_data=cv_data,
            template_name=template_name,
            output_format=output_format
        )
        
        return FileResponse(
            path=str(output_path),
            media_type="application/pdf" if output_format == "pdf" else "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            filename=output_path.name
        )
        
    except Exception as e:
        logger.error(f"Template filling failed: {e}")
        raise HTTPException(status_code=500, detail=f"Template filling failed: {str(e)}")


@app.post("/api/v1/cv/process", response_model=CVProcessResponse)
async def process_cv(
    file: UploadFile = File(...),
    template_name: str = Form("modern"),
    output_format: str = Form("pdf"),
    enhance: bool = Form(False)
):
    """
    Complete CV processing pipeline: upload → extract → fill → export.
    
    Args:
        file: CV file to process
        template_name: Template to use
        output_format: Output format (pdf or docx)
        enhance: Whether to enhance data with AI
        
    Returns:
        CVProcessResponse: Processing result with download link
    """
    logger.info(f"Processing CV: {file.filename}")
    
    # Validate file
    file_ext = Path(file.filename).suffix.lower()
    if file_ext.lstrip('.') not in settings.allowed_extensions_list:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file format. Allowed: {settings.allowed_extensions}"
        )
    
    upload_path = Path(settings.upload_dir) / file.filename
    
    try:
        # Save uploaded file
        with open(upload_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Process CV
        output_path, cv_data = await agent.process_cv(
            input_file=upload_path,
            template_name=template_name,
            output_format=output_format,
            enhance=enhance
        )
        
        # Generate download URL
        download_url = f"/api/v1/cv/download/{output_path.name}"
        
        return CVProcessResponse(
            success=True,
            message="CV processed successfully",
            file_path=str(output_path),
            download_url=download_url,
            cv_data=cv_data
        )
        
    except Exception as e:
        logger.error(f"CV processing failed: {e}")
        return CVProcessResponse(
            success=False,
            message=f"Processing failed: {str(e)}"
        )
        
    finally:
        # Cleanup upload
        if upload_path.exists():
            upload_path.unlink()


@app.get("/api/v1/cv/download/{filename}")
async def download_cv(filename: str):
    """
    Download generated CV file.
    
    Args:
        filename: Name of file to download
        
    Returns:
        FileResponse: CV file
    """
    file_path = Path(settings.output_dir) / filename
    
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found")
    
    media_type = "application/pdf" if filename.endswith('.pdf') else "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    
    return FileResponse(
        path=str(file_path),
        media_type=media_type,
        filename=filename
    )


@app.get("/api/v1/templates")
async def list_templates():
    """
    Get list of available CV templates.
    
    Returns:
        dict: Available templates
    """
    templates = agent.get_available_templates()
    return {"templates": templates}


@app.post("/api/v1/cv/preview")
async def preview_cv(cv_data: CVData, template_name: str = "modern"):
    """
    Generate HTML preview of CV.
    
    Args:
        cv_data: Structured CV data
        template_name: Template to use
        
    Returns:
        dict: HTML content
    """
    try:
        html = await agent.preview_html(cv_data, template_name)
        return {"html": html}
        
    except Exception as e:
        logger.error(f"Preview generation failed: {e}")
        raise HTTPException(status_code=500, detail=f"Preview failed: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    
    logger.info("Starting Rolevate CV Filler Agent API")
    uvicorn.run(
        "src.api.main:app",
        host=settings.host,
        port=settings.port,
        reload=settings.debug
    )
