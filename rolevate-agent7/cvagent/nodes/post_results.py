from ..tools.graphql_tool import post_cv_analysis, update_application_status
from typing import Dict


def post_results_node(state: Dict) -> Dict:
    candidateid = state.get("candidateid")
    application_id = state.get("application_id")
    analysis = state.get("analysis")
    cv_link = state.get("cv_link")
    jobid = state.get("jobid")
    extracted = state.get("extracted", {})
    api_key = state.get("system_api_key")
    
    if not analysis or not cv_link or not jobid:
        return state
    
    # Pass extracted candidate info and API key to post_cv_analysis
    res = post_cv_analysis(candidateid, application_id, analysis, cv_link, jobid, extracted, api_key)
    state["post_response"] = res
    
    # Update application status to "ANALYZED" after successful analysis
    # Valid statuses: PENDING, ANALYZED, REVIEWED, SHORTLISTED, INTERVIEWED, OFFERED, HIRED, REJECTED, WITHDRAWN
    if res:
        # Set status to ANALYZED after CV analysis is complete
        status_res = update_application_status(application_id, "ANALYZED", api_key)
        state["status_update_response"] = status_res
    
    return state
