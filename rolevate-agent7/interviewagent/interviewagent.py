from langgraph.graph import StateGraph
from .state import InterviewState

# Import node implementations
from .nodes.fetch_interview import fetch_interview_node
from .nodes.extract_transcript import extract_transcript_node
from .nodes.fetch_context import fetch_context_node
from .nodes.analyze_performance import analyze_performance_node
from .nodes.post_results import post_results_node


# Build StateGraph pipeline for interview analysis
graph = StateGraph(InterviewState)

# Add nodes
graph.add_node("fetch_interview", fetch_interview_node)
graph.add_node("extract_transcript", extract_transcript_node)
graph.add_node("fetch_context", fetch_context_node)
graph.add_node("analyze_performance", analyze_performance_node)
graph.add_node("post_results", post_results_node)

# Connect nodes in sequence
graph.add_edge("fetch_interview", "extract_transcript")
graph.add_edge("extract_transcript", "fetch_context")
graph.add_edge("fetch_context", "analyze_performance")
graph.add_edge("analyze_performance", "post_results")

# Entry point
graph.set_entry_point("fetch_interview")

# Compile the interview analysis agent
interview_agent = graph.compile()