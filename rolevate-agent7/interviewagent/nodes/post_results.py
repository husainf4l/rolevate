from ..tools.graphql_tool import update_interview_analysis
from typing import Dict


def post_results_node(state: Dict) -> Dict:
    """Post interview analysis results back to the backend"""
    interview_id = state.get("interview_id")
    analysis = state.get("analysis")
    api_key = state.get("system_api_key")
    
    if not analysis or not interview_id:
        print("⚠️  No analysis results to post")
        return state
    
    # Post analysis results
    result = update_interview_analysis(interview_id, analysis, api_key)
    state["post_response"] = result
    
    if result:
        print(f"✅ Successfully posted interview analysis results")
        print(f"   Interview ID: {interview_id}")
        print(f"   Overall Score: {analysis.get('overall_score', 0)}/100")
    else:
        print(f"❌ Failed to post interview analysis results")
    
    return state