from fastapi import FastAPI
from pydantic import BaseModel
from typing import Optional
import os
from cvagent.cvagent import cv_agent
from interviewagent.interviewagent import interview_agent
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

app = FastAPI()

class CVAnalysisRequest(BaseModel):
    cv_link: str
    jobid: str
    application_id: str
    candidateid: str
    systemApiKey: Optional[str] = None
    callbackUrl: Optional[str] = None

class InterviewAnalysisRequest(BaseModel):
    interview_id: str
    systemApiKey: Optional[str] = None

@app.get("/")
async def read_root():
    return {"message": "Rolevate Analysis Services", "services": ["cv-analysis", "interview-analysis"]}

@app.post("/cv-analysis")
async def cv_analysis(request: CVAnalysisRequest):
    """Analyze CV against job requirements"""
    result = cv_agent.invoke({
        "cv_link": request.cv_link,
        "jobid": request.jobid,
        "application_id": request.application_id,
        "candidateid": request.candidateid,
        "system_api_key": request.systemApiKey,
        "callback_url": request.callbackUrl,
        "analysis": ""
    })
    return result

@app.post("/interview-analysis")
async def interview_analysis(request: InterviewAnalysisRequest):
    """Analyze interview performance and generate feedback"""
    result = interview_agent.invoke({
        "interview_id": request.interview_id,
        "system_api_key": request.systemApiKey or os.environ.get("SYSTEM_API_KEY")
    })
    return result

