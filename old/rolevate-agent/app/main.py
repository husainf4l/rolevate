"""Clean FastAPI application for CV Filler Agent."""
import shutil
from pathlib import Path
from typing import Optional

from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Request, Depends
from fastapi.responses import FileResponse, JSONResponse, HTMLResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from loguru import logger

from app.services.cv_agent import CVFillerAgent
from app.models.schemas import CVData
from app.config import settings
from app.database import init_db
from app.api.auth_routes import router as auth_router, get_current_user_or_redirect
from app.api.cv_builder_routes import router as cv_builder_router
from app.api.resume_routes import router as resume_router
from app.api.chat_routes import router as chat_router
from app.models.user import User

# Initialize FastAPI app
app = FastAPI(
    title="Rolevate CV Filler Agent",
    description="AI-powered CV extraction and template filling service",
    version="2.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_router)
app.include_router(cv_builder_router, prefix="/api/v1")
app.include_router(resume_router, prefix="/api/v1")
app.include_router(chat_router)  # Already has /api/v1 prefix

# Initialize database
init_db()

# Initialize agent (lazy loading)
agent = None

def get_agent():
    """Get or initialize the CV agent."""
    global agent
    if agent is None:
        agent = CVFillerAgent()
    return agent

# Ensure directories exist
settings.ensure_directories()

# Setup Jinja2 templates
templates_dir = Path(__file__).parent / "templates"
templates = Jinja2Templates(directory=str(templates_dir))

# Mount static files if they exist
static_dir = Path(__file__).parent / "static"
if static_dir.exists():
    app.mount("/static", StaticFiles(directory=str(static_dir)), name="static")


@app.get("/", response_class=HTMLResponse)
async def root(request: Request):
    """Serve the homepage."""
    return templates.TemplateResponse(
        "pages/home.html", 
        {"request": request, "active_page": "home"}
    )


@app.get("/dashboard", response_class=HTMLResponse)
async def dashboard(request: Request):
    """Serve the dashboard page (client-side authentication)."""
    return templates.TemplateResponse(
        "pages/dashboard.html", 
        {
            "request": request, 
            "active_page": "dashboard"
        }
    )


@app.get("/cvbuilder", response_class=HTMLResponse)
async def cvbuilder_interface(request: Request):
    """Serve the CV builder interface (client-side authentication)."""
    return templates.TemplateResponse(
        "pages/cvbuilder.html", 
        {
            "request": request, 
            "active_page": "cvbuilder"
        }
    )


@app.get("/enhance", response_class=HTMLResponse)
async def enhance_interface(request: Request):
    """Serve the CV enhancement interface (client-side authentication)."""
    return templates.TemplateResponse(
        "pages/enhance.html", 
        {
            "request": request, 
            "active_page": "enhance"
        }
    )


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "agent": "ready"
    }


@app.post("/api/v1/cv/enhance", response_model=CVData)
async def enhance_cv(
    cv_data: CVData,
    enhancement_type: str = "complete"
):
    """
    Enhance existing CV data with AI.
    
    Args:
        cv_data: Structured CV data to enhance
        enhancement_type: Type of enhancement (content, design, keywords, complete)
        
    Returns:
        CVData: Enhanced CV data
    """
    logger.info(f"Enhancing CV with type: {enhancement_type}")
    
    try:
        enhanced_data = await agent.enhance_cv(cv_data, enhancement_type)
        return enhanced_data
        
    except Exception as e:
        logger.error(f"Enhancement failed: {e}")
        raise HTTPException(status_code=500, detail=f"Enhancement failed: {str(e)}")


@app.post("/api/v1/cv/fill")
async def fill_template(
    cv_data: CVData,
    template_name: str = "modern_cv",
    output_format: str = "pdf"
):
    """
    Fill CV template with provided data.
    
    Args:
        cv_data: Structured CV data
        template_name: Template to use (classic_cv, modern_cv, executive_cv)
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
        
        media_type = "application/pdf" if output_format == "pdf" else "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        
        return FileResponse(
            path=str(output_path),
            media_type=media_type,
            filename=output_path.name
        )
        
    except Exception as e:
        logger.error(f"Template filling failed: {e}")
        raise HTTPException(status_code=500, detail=f"Template filling failed: {str(e)}")


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
        dict: Available templates with descriptions
    """
    templates = agent.get_available_templates()
    return {
        "templates": templates,
        "descriptions": {
            "classic_cv": "Traditional CV layout with clean design",
            "modern_cv": "Modern CV with contemporary styling",
            "executive_cv": "Executive-level CV with professional layout"
        }
    }


if __name__ == "__main__":
    import uvicorn
    
    logger.info("🚀 Starting Rolevate CV Filler Agent")
    logger.info(f"   API: http://{settings.host}:{settings.port}")
    logger.info(f"   Docs: http://{settings.host}:{settings.port}/docs")
    
    uvicorn.run(
        "app.main:app",
        host=settings.host,
        port=settings.port,
        reload=settings.debug
    )
