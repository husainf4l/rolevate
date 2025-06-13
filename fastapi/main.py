from fastapi import FastAPI, File, UploadFile, Form, HTTPException
import shutil
from pathlib import Path
import tempfile
from agent import run_agent

# Initialize FastAPI application
app = FastAPI(
    title="Rolevate API",
    description="An application for processing job applications",
    version="1.0.0"
)

# Root endpoint
@app.get("/")
async def root():
    return {"message": "Welcome to Rolevate API"}

# Application endpoint
@app.post("/apply")
async def apply(
    candidate_id: str = Form(...),
    job_post_id: str = Form(...),
    cv_file: UploadFile = File(...)
):
    """
    Process a job application with a CV file, candidate ID, and job post ID.
    
    - candidate_id: Unique identifier for the candidate (must be a valid UUID)
    - job_post_id: Unique identifier for the job post (must be a valid UUID)
    - cv_file: Uploaded CV file in PDF or DOCX format
    """
    # Validate UUIDs before processing
    import uuid
    try:
        uuid.UUID(candidate_id)
        uuid.UUID(job_post_id)
    except ValueError:
        raise HTTPException(
            status_code=400, 
            detail="Both candidate_id and job_post_id must be valid UUIDs"
        )
    try:
        # Create temp directory to store the file
        with tempfile.TemporaryDirectory() as temp_dir:
            # Create file path
            file_path = Path(temp_dir) / cv_file.filename
            
            # Save the file
            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(cv_file.file, buffer)
            
            # Pass the actual file path to the agent
            cv_content = str(file_path)
            
            # Prepare the input for the agent
            user_input = f"""
            Process job application:
            - Candidate ID: {candidate_id}
            - Job Post ID: {job_post_id}
            - CV: {cv_content}
            """
            
            # Call the LangGraph agent
            messages = run_agent(user_input)
            
            # Extract the response from the agent
            response = messages[-1].content if messages else "No response from agent"
            
            return {
                "status": "success",
                "candidate_id": candidate_id,
                "job_post_id": job_post_id,
                "cv_filename": cv_file.filename,
                "agent_response": response
            }
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing application: {str(e)}")

# Run the application with: uvicorn main:app --reload
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
