from pydantic import BaseModel
from typing import Optional, Dict, Any


class AgentRequest(BaseModel):
    message: str
    context: Optional[Dict[str, Any]] = None


class AgentResponse(BaseModel):
    agent_name: str
    response: str
    status: str
    metadata: Optional[Dict[str, Any]] = None


class ChatRequest(BaseModel):
    message: str
    agent_type: str  # "research" or "writing"
    session_id: Optional[str] = None


class ChatResponse(BaseModel):
    agent_name: str
    response: str
    session_id: str
    timestamp: str