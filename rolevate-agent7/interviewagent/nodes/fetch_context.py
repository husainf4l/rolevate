from ..tools.graphql_tool import fetch_application_by_interview
from typing import Dict


def fetch_context_node(state: Dict) -> Dict:
    """Fetch additional context like application and job details"""
    interview_id = state.get("interview_id")
    if not interview_id:
        return state
    
    api_key = state.get("system_api_key")
    application = fetch_application_by_interview(interview_id, api_key)
    
    if application:
        state["application_info"] = application
        
        # Extract job info
        job = application.get("job", {})
        state["job_info"] = job
        
        # Extract candidate profile
        candidate = application.get("candidate", {})
        candidate_profile = candidate.get("candidateProfile", {})
        state["candidate_profile"] = candidate_profile
        
        print(f"🎯 Fetched context for interview:")
        print(f"   Job: {job.get('title', 'Unknown')}")
        print(f"   Candidate: {candidate.get('name', 'Unknown')}")
        print(f"   CV Analysis Available: {'Yes' if application.get('cvAnalysisResults') else 'No'}")
        
    else:
        state["application_info"] = {}
        state["job_info"] = {}
        state["candidate_profile"] = {}
        print(f"❌ Failed to fetch application context for interview: {interview_id}")
    
    return state