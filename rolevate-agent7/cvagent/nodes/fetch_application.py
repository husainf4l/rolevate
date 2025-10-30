from ..tools.graphql_tool import fetch_application
from typing import Dict


def fetch_application_node(state: Dict) -> Dict:
    application_id = state.get("application_id")
    if not application_id:
        return state
    api_key = state.get("system_api_key")
    app = fetch_application(application_id, api_key)
    state["application_info"] = app or {}
    return state
