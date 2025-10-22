"""Agent module for CV processing orchestration"""

# Optional imports to avoid dependency issues when only using tools
try:
    from app.agent.agent import CVProcessingAgent
    __all__ = ["CVProcessingAgent"]
except ImportError:
    # If dependencies are missing, only expose what's available
    __all__ = []
