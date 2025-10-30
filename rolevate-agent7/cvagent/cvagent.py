from langgraph.graph import StateGraph
from .state import CVState

# import node implementations
from .nodes.download_cv import download_cv
from .nodes.extract_info import extract_info
from .nodes.fetch_job import fetch_job_node
from .nodes.fetch_application import fetch_application_node
from .nodes.analyze import analyze_node
from .nodes.post_results import post_results_node


# Build StateGraph pipeline
graph = StateGraph(CVState)

graph.add_node("download_cv", download_cv)
graph.add_node("extract_info", extract_info)
graph.add_node("fetch_job", fetch_job_node)
graph.add_node("fetch_application", fetch_application_node)
graph.add_node("analyze", analyze_node)
graph.add_node("post_results", post_results_node)

# Connect nodes in sequence
graph.add_edge("download_cv", "extract_info")
graph.add_edge("extract_info", "fetch_job")
graph.add_edge("fetch_job", "fetch_application")
graph.add_edge("fetch_application", "analyze")
graph.add_edge("analyze", "post_results")

# Entry point
graph.set_entry_point("download_cv")

# compile
cv_agent = graph.compile()