from fastapi import FastAPI
from pydantic import BaseModel
from typing import Optional
from cvagent.cvagent import cv_agent
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

@app.get("/")
async def read_root():
    return {"Hello": "World"}

@app.post("/cv-analysis")
async def cv_analysis(request: CVAnalysisRequest):
    # Use the LangGraph CV agent for analysis
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

