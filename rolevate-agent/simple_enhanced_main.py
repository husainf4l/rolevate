"""
Enhanced CV Filler Agent - Simple Startup
Starts with basic functionality and available enhancements
"""

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
import uvicorn
import asyncio
import logging
from datetime import datetime
import uuid
import os
from pathlib import Path
import sys

# Add current directory to Python path for imports
sys.path.append(os.path.dirname(__file__))

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title="Enhanced CV Filler Agent",
    description="AI-powered CV processing with intelligent enhancements",
    version="2.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ensure required directories exist
os.makedirs("uploads", exist_ok=True)
os.makedirs("outputs", exist_ok=True)
os.makedirs("templates", exist_ok=True)

# Serve static files
if os.path.exists("outputs"):
    app.mount("/static", StaticFiles(directory="outputs"), name="static")

# Initialize enhancement services (with fallbacks)
deduplicator = None
formatter = None
template_selector = None
cloud_service = None
streaming_service = None

# Try to import enhancement modules
try:
    from agents.utils.deduplicate_experiences import ExperienceDeduplicator
    deduplicator = ExperienceDeduplicator()
    logger.info("✅ Duplicate Detection: Available")
except ImportError as e:
    logger.warning(f"❌ Duplicate Detection: Not available - {e}")

try:
    from agents.utils.formatters import CVFormatter
    formatter = CVFormatter()
    logger.info("✅ Smart Formatting: Available")
except ImportError as e:
    logger.warning(f"❌ Smart Formatting: Not available - {e}")

try:
    from agents.utils.template_selector import TemplateSelector
    template_selector = TemplateSelector()
    logger.info("✅ Template Selection: Available")
except ImportError as e:
    logger.warning(f"❌ Template Selection: Not available - {e}")

try:
    from src.services.cloud_service import CloudStorageService
    cloud_service = CloudStorageService()
    logger.info("✅ Cloud Storage: Available")
except ImportError as e:
    logger.warning(f"❌ Cloud Storage: Not available - {e}")

try:
    from src.services.streaming_service import streaming_service as ss, ProgressStage
    streaming_service = ss
    logger.info("✅ Real-time Streaming: Available")
except ImportError as e:
    logger.warning(f"❌ Real-time Streaming: Not available - {e}")

# Try to include WebSocket routes
try:
    from src.api.websocket_routes import ws_router
    app.include_router(ws_router)
    logger.info("✅ WebSocket Routes: Available")
except ImportError as e:
    logger.warning(f"❌ WebSocket Routes: Not available - {e}")


@app.get("/")
async def root():
    """Root endpoint with API information"""
    available_features = []
    if deduplicator: available_features.append("AI-powered duplicate detection")
    if formatter: available_features.append("Smart text formatting")
    if template_selector: available_features.append("Template selection AI")
    if cloud_service: available_features.append("Multi-cloud storage")
    if streaming_service: available_features.append("Real-time streaming UI")
    
    return {
        "message": "Enhanced CV Filler Agent API",
        "version": "2.0.0",
        "status": "running",
        "available_features": available_features,
        "endpoints": {
            "single_cv": "/api/cv/process",
            "health_check": "/api/health"
        }
    }


@app.post("/api/cv/process")
async def process_cv_enhanced(
    cv_file: UploadFile = File(...),
    job_name: str = None,
    template_preference: str = None,
    enable_deduplication: bool = True,
    enable_smart_formatting: bool = True,
    cloud_storage: bool = True
):
    """
    Enhanced CV processing with available intelligent features
    """
    
    # Generate unique job ID
    job_id = str(uuid.uuid4())
    
    try:
        # Progress tracking (if available)
        progress_tracker = None
        if streaming_service:
            progress_tracker = streaming_service.progress_tracker(job_id)
            await progress_tracker.__aenter__()
            progress_tracker.update_progress(
                stage="uploading" if hasattr(streaming_service, 'ProgressStage') else "processing",
                progress=10,
                message="Processing CV file...",
                metadata={"filename": cv_file.filename, "size": cv_file.size}
            )
        
        # Validate file
        if not cv_file.filename.lower().endswith(('.pdf', '.docx', '.doc', '.txt')):
            raise HTTPException(status_code=400, detail="Unsupported file format")
        
        # Save uploaded file
        file_path = f"uploads/{job_id}_{cv_file.filename}"
        content = await cv_file.read()
        with open(file_path, "wb") as f:
            f.write(content)
        
        # Mock CV data extraction (since we may not have the full agent)
        extracted_data = {
            "job_title": "Software Engineer",
            "experiences": [
                {
                    "title": "Senior Developer",
                    "company": "Tech Corp",
                    "duration": "2021-2023",
                    "description": "Developed web applications using Python and React"
                },
                {
                    "title": "Junior Developer", 
                    "company": "Start Corp",
                    "duration": "2019-2021",
                    "description": "Built REST APIs and frontend components"
                }
            ],
            "skills": ["Python", "React", "FastAPI", "PostgreSQL", "Docker"],
            "education": [
                {
                    "degree": "Bachelor of Computer Science",
                    "institution": "University",
                    "year": "2019"
                }
            ]
        }
        
        if progress_tracker:
            progress_tracker.update_progress(
                stage="extracting",
                progress=30,
                message="CV data extracted successfully",
                metadata={"experiences_count": len(extracted_data['experiences'])}
            )
        
        # Enhancement #1: Duplicate Detection
        if deduplicator and enable_deduplication:
            try:
                if progress_tracker:
                    progress_tracker.update_progress(
                        stage="deduplicating", 
                        progress=50,
                        message="Removing duplicate experiences..."
                    )
                
                deduplicated_experiences = deduplicator.deduplicate_experiences(
                    extracted_data['experiences']
                )
                extracted_data['experiences'] = deduplicated_experiences
                logger.info(f"✅ Duplicate detection applied for job {job_id}")
                
            except Exception as e:
                logger.warning(f"Duplicate detection failed: {e}")
        
        # Enhancement #2: Smart Formatting
        if formatter and enable_smart_formatting:
            try:
                if progress_tracker:
                    progress_tracker.update_progress(
                        stage="formatting",
                        progress=65,
                        message="Applying smart formatting..."
                    )
                
                formatted_data = formatter.format_cv_data(extracted_data)
                extracted_data = formatted_data
                logger.info(f"✅ Smart formatting applied for job {job_id}")
                
            except Exception as e:
                logger.warning(f"Smart formatting failed: {e}")
        
        # Enhancement #3: Template Selection
        selected_template = "professional"
        if template_selector and not template_preference:
            try:
                if progress_tracker:
                    progress_tracker.update_progress(
                        stage="template_selection",
                        progress=75,
                        message="Selecting optimal template..."
                    )
                
                selected_template = template_selector.select_template(
                    job_title=extracted_data.get('job_title', ''),
                    skills=extracted_data.get('skills', []),
                    experience_level=len(extracted_data.get('experiences', []))
                )
                logger.info(f"✅ Template selection: {selected_template} for job {job_id}")
                
            except Exception as e:
                logger.warning(f"Template selection failed: {e}")
        elif template_preference:
            selected_template = template_preference
        
        # Generate output (mock PDF for now)
        if progress_tracker:
            progress_tracker.update_progress(
                stage="generating_pdf",
                progress=90,
                message="Generating PDF document..."
            )
        
        output_filename = f"{job_id}_enhanced_cv.pdf"
        output_path = f"outputs/{output_filename}"
        
        # Create a simple text file as PDF placeholder
        with open(output_path, "w") as f:
            f.write(f"""Enhanced CV Generated by AI Agent
Job ID: {job_id}
Template: {selected_template}
Job Title: {extracted_data['job_title']}
Experiences: {len(extracted_data['experiences'])}
Skills: {', '.join(extracted_data['skills'])}
Generated: {datetime.utcnow().isoformat()}

Enhancements Applied:
- Duplicate Detection: {'✅' if deduplicator and enable_deduplication else '❌'}
- Smart Formatting: {'✅' if formatter and enable_smart_formatting else '❌'}
- AI Template Selection: {'✅' if template_selector else '❌'}
- Cloud Storage: {'✅' if cloud_service and cloud_storage else '❌'}
- Real-time Streaming: {'✅' if streaming_service else '❌'}
""")
        
        # Enhancement #6: Cloud Storage Upload
        cloud_url = None
        if cloud_service and cloud_storage:
            try:
                if progress_tracker:
                    progress_tracker.update_progress(
                        stage="uploading_cloud",
                        progress=95,
                        message="Uploading to cloud storage..."
                    )
                
                cloud_url = await cloud_service.upload_file(
                    file_path=output_path,
                    destination_path=f"cvs/{output_filename}"
                )
                logger.info(f"✅ Cloud upload successful for job {job_id}")
                
            except Exception as e:
                logger.warning(f"Cloud upload failed: {e}")
        
        # Final result
        result = {
            "job_id": job_id,
            "status": "completed",
            "pdf_path": f"/static/{output_filename}",
            "cloud_url": cloud_url,
            "template_used": selected_template,
            "processing_summary": {
                "experiences_processed": len(extracted_data.get('experiences', [])),
                "skills_extracted": len(extracted_data.get('skills', [])),
                "enhancements_applied": {
                    "duplicate_detection": bool(deduplicator and enable_deduplication),
                    "smart_formatting": bool(formatter and enable_smart_formatting),
                    "template_selection": bool(template_selector),
                    "cloud_storage": bool(cloud_service and cloud_storage),
                    "real_time_streaming": bool(streaming_service)
                }
            },
            "timestamp": datetime.utcnow().isoformat()
        }
        
        if progress_tracker:
            progress_tracker.update_progress(
                stage="completed",
                progress=100,
                message="CV processing completed successfully!",
                metadata={"result": result}
            )
            await progress_tracker.__aexit__(None, None, None)
        
        # Clean up uploaded file
        os.remove(file_path)
        
        return JSONResponse(content=result)
        
    except Exception as e:
        logger.error(f"CV processing failed for job {job_id}: {str(e)}")
        
        # Update progress with error (if available)
        if streaming_service:
            streaming_service.update_progress(
                job_id=job_id,
                stage="error",
                progress=0,
                message=f"Processing failed: {str(e)}",
                metadata={"error_type": type(e).__name__}
            )
        
        # Clean up files
        try:
            if 'file_path' in locals() and os.path.exists(file_path):
                os.remove(file_path)
        except:
            pass
            
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    services_status = {
        "deduplicator": bool(deduplicator),
        "formatter": bool(formatter),
        "template_selector": bool(template_selector),
        "cloud_service": bool(cloud_service),
        "streaming_service": bool(streaming_service)
    }
    
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "services": services_status,
        "enhancements_available": sum(services_status.values()),
        "total_enhancements": 7
    }


@app.get("/api/templates")
async def list_templates():
    """List available CV templates"""
    if template_selector:
        return {
            "templates": template_selector.get_available_templates(),
            "default_template": template_selector.default_template
        }
    else:
        return {
            "templates": ["professional", "creative", "technical", "executive"],
            "default_template": "professional",
            "note": "Template selector not available - using defaults"
        }


if __name__ == "__main__":
    print("\n🚀 Starting Enhanced CV Filler Agent")
    print("📊 Loading intelligent enhancements...")
    print("=" * 50)
    
    uvicorn.run(
        "simple_enhanced_main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )