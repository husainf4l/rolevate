from fastapi import FastAPI, File, UploadFile, Form, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
import shutil
from pathlib import Path
import tempfile
from agent import run_agent
import textwrap # Import textwrap
import os
import json

USE_SQL_SESSIONS = os.getenv("USE_SQL_SESSIONS", "true").lower() == "true"

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


@app.post("/apply")
async def apply(
    candidate_id: str = Form(...),
    job_post_id: str = Form(...),
    candidate_phone: str = Form(...),
    cv_file: UploadFile = File(...)
):
    """
    Process a job application with a CV file, candidate ID, job post ID, and candidate phone.
    This endpoint accepts a candidate's CV file and relevant identifiers, processes the application.
    
    - candidate_id: Unique identifier for the candidate (must be a valid UUID)
    - job_post_id: Unique identifier for the job post (must be a valid UUID)
    - candidate_phone: Phone number of the candidate
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
            
            print(f"DEBUG: main.py - Candidate ID: {candidate_id}, Job Post ID: {job_post_id}, Candidate Phone: {candidate_phone}, CV Path: {cv_content}") # Added candidate_phone to log

            # Prepare the input for the agent using textwrap.dedent and then strip
            raw_user_input = f"""
            Process job application:
            - Candidate ID: {candidate_id}
            - Job Post ID: {job_post_id}
            - Candidate Phone: {candidate_phone} 
            - CV: {cv_content}
            """
            user_input = textwrap.dedent(raw_user_input).strip()
            
            # Call the LangGraph agent
            print(f"DEBUG: main.py - About to call run_agent with input:\n{user_input}") # Log the exact input
            messages = run_agent(user_input)
            print(f"DEBUG: main.py - Agent finished. Response messages: {messages}")
            
            # Extract the response from the agent
            response = messages[-1].content if messages else "No response from agent"
            
            return {
                "status": "success",
                "candidate_id": candidate_id,
                "job_post_id": job_post_id,
                "candidate_phone": candidate_phone, # Added candidate_phone to response
                "cv_filename": cv_file.filename,
                "agent_response": response
            }
            
    except Exception as e:
        print(f"ERROR: main.py - Error processing application: {str(e)}") # Add logging for the exception
        raise HTTPException(status_code=500, detail=f"Error processing application: {str(e)}")

# Job Post Creation endpoint using direct job post agent
@app.post("/create-job-post")
async def create_job_post(
    message: str = Form(...),
    company_id: str = Form(...),
    session_id: str = Form(...),  # Now required from frontend
    company_name: str = Form(None)
):
    """
    Create a job post through conversational AI agent.
    
    - message: User's message or input for the job post creation
    - company_id: Unique identifier for the company creating the job post
    - session_id: Session ID provided by frontend (required)
    - company_name: Name of the company (optional)
    """
    try:
        from agent.job_post_agent import run_job_post_agent
        import uuid
        
        # Validate session ID format
        try:
            uuid.UUID(session_id)
        except ValueError:
            raise HTTPException(
                status_code=400,
                detail="session_id must be a valid UUID format"
            )
        
        print(f"DEBUG: create_job_post - Message: {message[:100]}..., Company ID: {company_id}, Company Name: {company_name}, Session ID: {session_id}")
        
        # Call the job post agent directly with the message and company info
        result = run_job_post_agent(message, company_id, company_name)
        
        print(f"DEBUG: create_job_post - Agent result: {result}")
        
        # Extract response from agent messages
        agent_response = result[-1].content if result else "No response from agent"
        
        return {
            "status": "success",
            "session_id": session_id,
            "company_id": company_id,
            "company_name": company_name,
            "agent_response": agent_response,
            "is_complete": False,  # For now, assume not complete in single call
            "job_data": {},
            "current_step": "processing"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"ERROR: create_job_post - Error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error creating job post: {str(e)}")

# Job Post Chat endpoint for continuing conversations
@app.post("/job-post-chat")
async def job_post_chat(
    message: str = Form(...),
    session_id: str = Form(...),
    company_id: str = Form(None),
    company_name: str = Form(None)
):
    """
    Continue a job post creation conversation using direct job post agent.
    
    - message: User's message continuation
    - session_id: Session ID for conversation continuity
    - company_id: Company identifier (optional, for validation)
    - company_name: Company name (optional)
    """
    try:
        from agent.job_post_agent import run_job_post_agent
        
        print(f"DEBUG: job_post_chat - Message: {message[:100]}..., Session ID: {session_id}")
        
        # Call the job post agent directly
        result = run_job_post_agent(message, company_id, company_name)
        
        print(f"DEBUG: job_post_chat - Agent result: {result}")
        
        # Extract response from agent messages
        agent_response = result[-1].content if result else "No response from agent"
        
        return {
            "status": "success",
            "session_id": session_id,
            "agent_response": agent_response,
            "is_complete": False,  # For now, assume not complete in single call
            "job_data": {},
            "current_step": "processing"
        }
        
    except Exception as e:
        print(f"ERROR: job_post_chat - Error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error in job post chat: {str(e)}")

# Get session information endpoint (simplified version)
@app.get("/job-post-session/{session_id}")
async def get_job_post_session(session_id: str):
    """
    Get information about a job post session (simplified version).
    
    - session_id: Session ID to query
    """
    try:
        import uuid
        
        # Validate session ID format
        try:
            uuid.UUID(session_id)
        except ValueError:
            raise HTTPException(
                status_code=400,
                detail="session_id must be a valid UUID format"
            )
        
        # Since we don't have session persistence, return a basic response
        # indicating the session exists but with minimal data
        return {
            "status": "success",
            "session_id": session_id,
            "exists": True,
            "current_step": "processing",
            "job_data": {},
            "is_complete": False,
            "message": "Session found (simplified mode - no persistent state)"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"ERROR: get_job_post_session - Error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error getting session info: {str(e)}")

# Run the application with: uvicorn main:app --reload
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
