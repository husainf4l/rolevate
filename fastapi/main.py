from fastapi import FastAPI, File, UploadFile, Form, HTTPException
import shutil
from pathlib import Path
import tempfile
from agent import run_agent
from agent.job_post_agent import run_job_post_agent  # Import the new job post agent
import textwrap # Import textwrap

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

# Job Post Creation endpoint
@app.post("/create-job-post")
async def create_job_post(
    message: str = Form(...),
    company_id: str = Form(...),
    company_name: str = Form(None)
):
    """
    Create a job post through conversational AI agent.
    
    - message: User's message or input for the job post creation
    - company_id: Unique identifier for the company creating the job post
    - company_name: Name of the company (optional)
    """
    try:
        print(f"DEBUG: create_job_post - Message: {message[:100]}..., Company ID: {company_id}, Company Name: {company_name}")
        
        # Call the job post agent
        messages = run_job_post_agent(
            user_input=message,
            company_id=company_id,
            company_name=company_name
        )
        
        print(f"DEBUG: create_job_post - Agent finished. Response messages: {len(messages)} messages")
        
        # Extract the response from the agent
        response = messages[-1].content if messages else "No response from agent"
        
        return {
            "status": "success",
            "company_id": company_id,
            "company_name": company_name,
            "agent_response": response,
            "message_count": len(messages)
        }
        
    except Exception as e:
        print(f"ERROR: create_job_post - Error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error creating job post: {str(e)}")

# Job Post Chat endpoint for continuing conversations
@app.post("/job-post-chat")
async def job_post_chat(
    message: str = Form(...),
    company_id: str = Form(...),
    company_name: str = Form(None),
    session_id: str = Form(None)
):
    """
    Continue a job post creation conversation.
    
    - message: User's message continuation
    - company_id: Company identifier
    - company_name: Company name
    - session_id: Optional session ID for conversation continuity (future enhancement)
    """
    try:
        print(f"DEBUG: job_post_chat - Message: {message[:100]}..., Company ID: {company_id}")
        
        # For now, treat each message as a new conversation
        # In the future, you could implement session management
        messages = run_job_post_agent(
            user_input=message,
            company_id=company_id,
            company_name=company_name
        )
        
        response = messages[-1].content if messages else "No response from agent"
        
        return {
            "status": "success",
            "company_id": company_id,
            "agent_response": response,
            "session_id": session_id
        }
        
    except Exception as e:
        print(f"ERROR: job_post_chat - Error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error in job post chat: {str(e)}")

# Run the application with: uvicorn main:app --reload
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
