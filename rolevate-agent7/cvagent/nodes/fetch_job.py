from ..tools.graphql_tool import fetch_job
from typing import Dict


def fetch_job_node(state: Dict) -> Dict:
    jobid = state.get("jobid")
    if not jobid:
        return state
    api_key = state.get("system_api_key")
    job = fetch_job(jobid, api_key)
    state["job_info"] = job or {}
    return state
