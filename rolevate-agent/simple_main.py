"""Simple FastAPI server for CV processing without complex dependencies."""
from fastapi import FastAPI, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pathlib import Path
import json

app = FastAPI(
    title="Rolevate CV Filler Agent",
    description="AI-powered CV extraction and template filling service",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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

@app.post("/cv/fill-cv/")
async def fill_cv(file: UploadFile, template: str = Form("classic_cv.html")):
    """
    CV processing endpoint.
    
    Args:
        file: CV file upload
        template: Template name to use
        
    Returns:
        Processing result with extracted data
    """
    try:
        # Read file content
        content = await file.read()
        text = content.decode("utf-8", errors="ignore")
        
        # Mock extracted data for demonstration
        mock_data = {
            "name": "John Doe",
            "title": "Software Engineer", 
            "contact": "john.doe@example.com",
            "summary": "Experienced software engineer with expertise in Python and FastAPI",
            "skills": ["Python", "FastAPI", "JavaScript", "React"],
            "experience": [
                {
                    "title": "Senior Software Engineer",
                    "company": "Tech Corp",
                    "start_date": "2020-01-01",
                    "end_date": "Present",
                    "description": "Led development of web applications"
                }
            ],
            "education": [
                {
                    "degree": "Bachelor of Computer Science",
                    "institution": "University of Technology",
                    "year": "2019"
                }
            ]
        }
        
        return {
            "status": "success",
            "message": f"CV processed successfully using template: {template}",
            "file_info": {
                "filename": file.filename,
                "size": len(content),
                "content_preview": text[:200] + "..." if len(text) > 200 else text
            },
            "extracted_data": mock_data,
            "template_used": template
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Processing failed: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    print("🚀 Starting Simple Rolevate CV Filler Agent")
    print("   API: http://0.0.0.0:8000")
    print("   Docs: http://0.0.0.0:8000/docs")
    print()
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)