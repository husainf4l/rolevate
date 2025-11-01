from ..tools.graphql_tool import fetch_interview
from typing import Dict


def fetch_interview_node(state: Dict) -> Dict:
    """Fetch interview details from the backend"""
    interview_id = state.get("interview_id")
    if not interview_id:
        return state
    
    api_key = state.get("system_api_key")
    interview = fetch_interview(interview_id, api_key)
    
    if interview:
        state["interview_info"] = interview
        
        # Extract related IDs for easier access
        application = interview.get("application", {})
        state["application_id"] = application.get("id")
        state["candidate_id"] = application.get("candidateId")
        state["job_id"] = application.get("jobId")
        
        print(f"📋 Fetched interview details for: {interview_id}")
        print(f"   Status: {interview.get('status')}")
        print(f"   Type: {interview.get('type')}")
        print(f"   Duration: {interview.get('duration')} minutes" if interview.get('duration') else "   Duration: Not recorded")
    else:
        state["interview_info"] = {}
        print(f"❌ Failed to fetch interview: {interview_id}")
    
    return state