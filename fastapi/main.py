from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import shutil
from pathlib import Path
import tempfile
from agent import run_agent
import textwrap # Import textwrap
import os

# Configuration for session management
USE_SQL_SESSIONS = os.getenv("USE_SQL_SESSIONS", "true").lower() == "true"

# Initialize FastAPI application
app = FastAPI(
    title="Rolevate API",
    description="An application for processing job applications",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
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
    candidate_phone: str = Form(...), # Added candidate_phone
    cv_file: UploadFile = File(...)
):
    """
    Process a job application with a CV file, candidate ID, job post ID, and candidate phone.
    This endpoint accepts a candidate's CV file and relevant identifiers, processes the application,                                                                
    - candidate_id: Unique identifier for the candidate (must be a valid UUID)
    - job_post_id: Unique identifier for the job post (must be a valid UUID)
    - candidate_phone: Phone number of the candidate (for WhatsApp notifications)
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

# Job Post Creation endpoint with frontend-provided session management
@app.post("/create-job-post")
async def create_job_post(
    message: str = Form(...),
    company_id: str = Form(...),
    session_id: str = Form(...),  # Now required from frontend
    company_name: str = Form(None)
):
    """
    Create a job post through conversational AI agent with frontend-provided session ID.
    
    - message: User's message or input for the job post creation
    - company_id: Unique identifier for the company creating the job post
    - session_id: Session ID provided by frontend (required)
    - company_name: Name of the company (optional)
    """
    try:
        from agent.session_job_post_agent import get_session_job_post_agent
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
        
        # Choose session manager based on configuration
        if USE_SQL_SESSIONS:
            from agent.sql_session_job_post_agent import get_sql_session_job_post_agent
            agent = get_sql_session_job_post_agent()
            print("🗄️  Using SQL session management")
        else:
            from agent.session_job_post_agent import get_session_job_post_agent
            agent = get_session_job_post_agent()
            print("📁 Using JSON file session management")
        
        # Check if session already exists
        existing_session = agent.get_session_info(session_id)
        
        if existing_session.get("error"):
            # Session doesn't exist, create new one with provided ID
            result = agent.start_conversation_with_id(session_id, company_id, company_name)
            # Then process the first message
            if not result.get("error"):
                result = agent.continue_conversation(session_id, message)
        else:
            # Session exists, continue conversation
            result = agent.continue_conversation(session_id, message)
        
        print(f"DEBUG: create_job_post - Agent result: {result}")
        
        if result.get("error"):
            return {
                "status": "error",
                "error": result["error"],
                "session_id": session_id,
                "agent_response": result.get("response", "An error occurred"),
                "is_complete": False,
                "job_data": result.get("job_data", {}),
                "current_step": result.get("current_step", "getting_basic_info")
            }
        
        return {
            "status": "success",
            "session_id": session_id,
            "company_id": company_id,
            "company_name": company_name,
            "agent_response": result["response"],
            "is_complete": result["is_complete"],
            "job_data": result["job_data"],
            "current_step": result["current_step"]
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
    Continue a job post creation conversation using session ID.
    
    - message: User's message continuation
    - session_id: Session ID for conversation continuity
    - company_id: Company identifier (optional, for validation)
    - company_name: Company name (optional)
    """
    try:
        from agent.session_job_post_agent import get_session_job_post_agent
        
        print(f"DEBUG: job_post_chat - Message: {message[:100]}..., Session ID: {session_id}")
        
        # Choose session manager based on configuration
        if USE_SQL_SESSIONS:
            from agent.sql_session_job_post_agent import get_sql_session_job_post_agent
            agent = get_sql_session_job_post_agent()
            
            # For SQL sessions, check if session exists first
            session_info = agent.get_session_info(session_id)
            if session_info.get("error"):
                # Session doesn't exist, create it first
                print(f"DEBUG: Creating new SQL session {session_id}")
                create_result = agent.start_conversation_with_id(session_id, company_id or "default-company", company_name or "Default Company")
                if create_result.get("error"):
                    return {
                        "status": "error",
                        "error": create_result["error"],
                        "session_id": session_id,
                        "agent_response": "Failed to create session",
                        "is_complete": False,
                        "job_data": {},
                        "current_step": "getting_basic_info"
                    }
            
            # Now continue the conversation
            result = agent.continue_conversation(session_id, message)
        else:
            from agent.session_job_post_agent import get_session_job_post_agent
            agent = get_session_job_post_agent()
            result = agent.continue_conversation(session_id, message)
        
        print(f"DEBUG: job_post_chat - Agent result: {result}")
        
        if result.get("error"):
            return {
                "status": "error",
                "error": result["error"],
                "session_id": result.get("session_id"),
                "agent_response": result.get("response", "Session not found or expired"),
                "is_complete": False,
                "job_data": result.get("job_data", {}),
                "current_step": result.get("current_step", "getting_basic_info")
            }
        
        return {
            "status": "success",
            "session_id": result["session_id"],
            "agent_response": result["response"],
            "is_complete": result["is_complete"],
            "job_data": result["job_data"],
            "current_step": result["current_step"]
        }
        
    except Exception as e:
        print(f"ERROR: job_post_chat - Error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error in job post chat: {str(e)}")

# Get session information endpoint
@app.get("/job-post-session/{session_id}")
async def get_job_post_session(session_id: str):
    """
    Get information about a job post session.
    
    - session_id: Session ID to query
    """
    try:
        # Choose session manager based on configuration
        if USE_SQL_SESSIONS:
            from agent.sql_session_job_post_agent import get_sql_session_job_post_agent
            agent = get_sql_session_job_post_agent()
        else:
            from agent.session_job_post_agent import get_session_job_post_agent
            agent = get_session_job_post_agent()
        result = agent.get_session_info(session_id)
        
        if result.get("error"):
            raise HTTPException(status_code=404, detail=result["error"])
        
        return {
            "status": "success",
            **result
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"ERROR: get_job_post_session - Error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error getting session info: {str(e)}")

# Delete session endpoint
@app.delete("/job-post-session/{session_id}")
async def delete_job_post_session(session_id: str):
    """
    Delete a job post session.
    
    - session_id: Session ID to delete
    """
    try:
        # Choose session manager based on configuration
        if USE_SQL_SESSIONS:
            from agent.sql_session_job_post_agent import get_sql_session_job_post_agent
            agent = get_sql_session_job_post_agent()
        else:
            from agent.session_job_post_agent import get_session_job_post_agent
            agent = get_session_job_post_agent()
        success = agent.delete_session(session_id)
        
        if not success:
            raise HTTPException(status_code=404, detail="Session not found")
        
        return {
            "status": "success",
            "message": "Session deleted successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"ERROR: delete_job_post_session - Error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error deleting session: {str(e)}")

# Additional SQL session management endpoints
@app.get("/session-stats")
async def get_session_stats():
    """
    Get session statistics (only available with SQL session management).
    """
    if not USE_SQL_SESSIONS:
        raise HTTPException(status_code=501, detail="Statistics only available with SQL session management")
    
    try:
        from agent.sql_session_job_post_agent import get_sql_session_job_post_agent
        agent = get_sql_session_job_post_agent()
        stats = agent.get_session_stats()
        
        return {
            "status": "success",
            **stats
        }
        
    except Exception as e:
        print(f"ERROR: get_session_stats - Error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error getting session stats: {str(e)}")

@app.get("/company-sessions/{company_id}")
async def get_company_sessions(company_id: str, limit: int = 50):
    """
    Get all sessions for a specific company (only available with SQL session management).
    
    - company_id: Company identifier
    - limit: Maximum number of sessions to return
    """
    if not USE_SQL_SESSIONS:
        raise HTTPException(status_code=501, detail="Company sessions only available with SQL session management")
    
    try:
        from agent.sql_session_job_post_agent import get_sql_session_job_post_agent
        agent = get_sql_session_job_post_agent()
        sessions = agent.get_company_sessions(company_id, limit)
        
        return {
            "status": "success",
            "company_id": company_id,
            "sessions": sessions,
            "total_count": len(sessions)
        }
        
    except Exception as e:
        print(f"ERROR: get_company_sessions - Error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error getting company sessions: {str(e)}")

@app.post("/cleanup-expired-sessions")
async def cleanup_expired_sessions():
    """
    Clean up expired sessions (only available with SQL session management).
    """
    if not USE_SQL_SESSIONS:
        raise HTTPException(status_code=501, detail="Cleanup only available with SQL session management")
    
    try:
        from agent.sql_session_job_post_agent import get_sql_session_job_post_agent
        agent = get_sql_session_job_post_agent()
        deleted_count = agent.cleanup_expired_sessions()
        
        return {
            "status": "success",
            "message": f"Cleaned up {deleted_count} expired sessions",
            "deleted_count": deleted_count
        }
        
    except Exception as e:
        print(f"ERROR: cleanup_expired_sessions - Error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error cleaning up sessions: {str(e)}")

# Run the application with: uvicorn main:app --reload
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
