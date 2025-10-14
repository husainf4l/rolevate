"""
Enhanced CV Filler Agent - Complete Integration
Updates main FastAPI app to include all 7 intelligent enhancements
"""

from fastapi import FastAPI, File, UploadFile, HTTPException, Depends
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

# Import all enhancement modules
from agents.utils.deduplicate_experiences import ExperienceDeduplicator
from agents.utils.formatters import CVFormatter
from agents.utils.template_selector import TemplateSelector
from src.api.routes_batch import BatchProcessor
from agents.nodes.cv_filler_node import CVFillerNode
from src.services.cloud_service import CloudStorageService
from src.services.streaming_service import streaming_service, ProgressStage
from src.api.websocket_routes import ws_router

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title="Enhanced CV Filler Agent",
    description="AI-powered CV processing with 7 intelligent enhancements",
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

# Include WebSocket routes
app.include_router(ws_router)

# Initialize enhancement services
deduplicator = ExperienceDeduplicator()
formatter = CVFormatter()
template_selector = TemplateSelector()
batch_processor = BatchProcessor()
cv_filler_node = CVFillerNode()
cloud_service = CloudStorageService()

# Ensure required directories exist
os.makedirs("uploads", exist_ok=True)
os.makedirs("outputs", exist_ok=True)
os.makedirs("templates", exist_ok=True)

# Serve static files
app.mount("/static", StaticFiles(directory="outputs"), name="static")


@app.get("/")
async def root():
    """Root endpoint with API information"""
    return {
        "message": "Enhanced CV Filler Agent API",
        "version": "2.0.0",
        "features": [
            "AI-powered duplicate detection",
            "Smart text formatting",
            "Template selection AI", 
            "Batch processing mode",
            "LangGraph workflow integration",
            "Multi-cloud storage",
            "Real-time streaming UI"
        ],
        "endpoints": {
            "single_cv": "/api/cv/process",
            "batch_upload": "/api/batch/upload",
            "websocket_progress": "/ws/progress/{job_id}",
            "batch_progress": "/ws/batch_progress/{batch_id}"
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
    Enhanced CV processing with all 7 intelligent features
    
    Features:
    1. Duplicate detection and merging
    2. Smart text formatting 
    3. AI template selection
    4. Real-time progress streaming
    5. LangGraph workflow
    6. Cloud storage integration
    7. Comprehensive error handling
    """
    
    # Generate unique job ID
    job_id = str(uuid.uuid4())
    
    try:
        # Initialize progress tracking
        with streaming_service.progress_tracker(job_id) as tracker:
            
            # Stage 1: File upload and validation
            tracker.update_progress(
                stage=ProgressStage.UPLOADING,
                progress=10,
                message="Validating uploaded file...",
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
            
            # Stage 2: CV data extraction
            tracker.update_progress(
                stage=ProgressStage.EXTRACTING,
                progress=25,
                message="Extracting CV data using AI...",
                metadata={"file_path": file_path}
            )
            
            # Use LangGraph workflow for extraction
            extracted_data = await cv_filler_node.process_cv_complete(file_path)
            
            experiences_count = len(extracted_data.get('experiences', []))
            skills_count = len(extracted_data.get('skills', []))
            
            # Stage 3: Duplicate detection
            if enable_deduplication and experiences_count > 0:
                tracker.update_progress(
                    stage=ProgressStage.DEDUPLICATING,
                    progress=40,
                    message="Detecting and merging duplicate experiences...",
                    metadata={
                        "experiences_count": experiences_count,
                        "similarity_threshold": 0.85
                    }
                )
                
                deduplicated_experiences = deduplicator.deduplicate_experiences(
                    extracted_data['experiences']
                )
                extracted_data['experiences'] = deduplicated_experiences
                
                removed_count = experiences_count - len(deduplicated_experiences)
                if removed_count > 0:
                    tracker.update_progress(
                        stage=ProgressStage.DEDUPLICATING,
                        progress=45,
                        message=f"Removed {removed_count} duplicate experiences",
                        metadata={"duplicates_removed": removed_count}
                    )
            
            # Stage 4: Smart formatting
            if enable_smart_formatting:
                tracker.update_progress(
                    stage=ProgressStage.FORMATTING,
                    progress=55,
                    message="Applying smart text formatting...",
                    metadata={"formatter_rules": formatter.get_formatting_rules()}
                )
                
                formatted_data = formatter.format_cv_data(extracted_data)
                extracted_data = formatted_data
            
            # Stage 5: AI template selection
            tracker.update_progress(
                stage=ProgressStage.TEMPLATE_SELECTION,
                progress=70,
                message="Selecting optimal CV template...",
                metadata={"job_title": extracted_data.get('job_title', 'Unknown')}
            )
            
            if template_preference:
                selected_template = template_preference
            else:
                selected_template = template_selector.select_template(
                    job_title=extracted_data.get('job_title', ''),
                    skills=extracted_data.get('skills', []),
                    experience_level=len(extracted_data.get('experiences', []))
                )
            
            # Stage 6: CV rendering
            tracker.update_progress(
                stage=ProgressStage.RENDERING,
                progress=80,
                message=f"Rendering CV with {selected_template} template...",
                metadata={
                    "template_used": selected_template,
                    "experiences_count": len(extracted_data.get('experiences', [])),
                    "skills_count": len(extracted_data.get('skills', []))
                }
            )
            
            # Simulate CV rendering (replace with actual template engine)
            await asyncio.sleep(1)
            
            # Stage 7: PDF generation
            tracker.update_progress(
                stage=ProgressStage.GENERATING_PDF,
                progress=90,
                message="Generating final PDF document...",
            )
            
            # Generate output filename
            output_filename = f"{job_id}_enhanced_cv.pdf"
            output_path = f"outputs/{output_filename}"
            
            # Simulate PDF generation (replace with actual PDF generator)
            with open(output_path, "w") as f:
                f.write("Enhanced CV PDF content would be here")
            
            # Stage 8: Cloud storage upload
            cloud_url = None
            if cloud_storage:
                tracker.update_progress(
                    stage=ProgressStage.UPLOADING_CLOUD,
                    progress=95,
                    message="Uploading to cloud storage...",
                )
                
                try:
                    cloud_url = await cloud_service.upload_file(
                        file_path=output_path,
                        destination_path=f"cvs/{output_filename}"
                    )
                except Exception as e:
                    logger.warning(f"Cloud upload failed: {str(e)}")
                    # Continue without cloud storage
            
            # Stage 9: Completion
            result = {
                "job_id": job_id,
                "status": "completed",
                "pdf_path": f"/static/{output_filename}",
                "cloud_url": cloud_url,
                "template_used": selected_template,
                "processing_summary": {
                    "experiences_processed": len(extracted_data.get('experiences', [])),
                    "skills_extracted": len(extracted_data.get('skills', [])),
                    "duplicates_removed": experiences_count - len(extracted_data.get('experiences', [])) if enable_deduplication else 0,
                    "formatting_applied": enable_smart_formatting,
                    "cloud_stored": cloud_url is not None
                },
                "timestamp": datetime.utcnow().isoformat()
            }
            
            tracker.update_progress(
                stage=ProgressStage.COMPLETED,
                progress=100,
                message="CV processing completed successfully!",
                metadata={"result": result}
            )
            
            # Clean up uploaded file
            os.remove(file_path)
            
            return JSONResponse(content=result)
            
    except Exception as e:
        logger.error(f"CV processing failed for job {job_id}: {str(e)}")
        
        # Update progress with error
        streaming_service.update_progress(
            job_id=job_id,
            stage=ProgressStage.ERROR,
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


@app.post("/api/batch/upload")
async def process_batch_upload(
    batch_file: UploadFile = File(...),
    enable_deduplication: bool = True,
    enable_smart_formatting: bool = True,
    cloud_storage: bool = True
):
    """
    Batch CV processing with concurrent execution
    
    Upload a ZIP file containing multiple CVs for parallel processing.
    """
    
    batch_id = str(uuid.uuid4())
    
    try:
        # Save uploaded ZIP file
        zip_path = f"uploads/batch_{batch_id}.zip"
        content = await batch_file.read()
        with open(zip_path, "wb") as f:
            f.write(content)
        
        # Process batch using BatchProcessor
        results = await batch_processor.process_batch(
            zip_file_path=zip_path,
            batch_id=batch_id,
            options={
                "enable_deduplication": enable_deduplication,
                "enable_smart_formatting": enable_smart_formatting,
                "cloud_storage": cloud_storage
            }
        )
        
        # Clean up ZIP file
        os.remove(zip_path)
        
        return JSONResponse(content={
            "batch_id": batch_id,
            "status": "completed",
            "results": results,
            "processed_count": len(results),
            "timestamp": datetime.utcnow().isoformat()
        })
        
    except Exception as e:
        logger.error(f"Batch processing failed for batch {batch_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "services": {
            "deduplicator": deduplicator.is_loaded(),
            "formatter": True,
            "template_selector": True,
            "cloud_service": cloud_service.is_available(),
            "streaming_service": True
        }
    }


@app.get("/api/templates")
async def list_templates():
    """List available CV templates"""
    return {
        "templates": template_selector.get_available_templates(),
        "default_template": template_selector.default_template
    }


if __name__ == "__main__":
    print("\n🚀 Starting Enhanced CV Filler Agent")
    print("📊 Features: 7 Intelligent Enhancements")
    print("🔗 WebSocket: Real-time Progress Streaming")
    print("☁️  Storage: Multi-cloud Integration")
    print("🎯 AI: Smart Template Selection & Deduplication")
    print("📱 UI: React Components Ready")
    print("=" * 50)
    
    uvicorn.run(
        "enhanced_main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )