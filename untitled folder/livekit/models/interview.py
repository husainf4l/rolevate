from pydantic import BaseModel, Field
from typing import Optional


class InterviewConfig(BaseModel):
    room_name: str = Field(..., description="LiveKit room name for the interview")
    participant_name: str = Field(..., description="Name of the candidate")
    position: str = Field(default=".NET Developer", description="Position being interviewed for")
    company: str = Field(default="UPT", description="Company name")
    language: str = Field(default="ar", description="Primary language for the interview")
    model: str = Field(default="gpt-4o-mini", description="OpenAI model to use")


class InterviewStatus(BaseModel):
    room_name: str
    status: str
    message: Optional[str] = None


class InterviewSessionInfo(BaseModel):
    room_name: str
    participant: str
    status: str
    position: str


class ActiveInterviewsResponse(BaseModel):
    active_sessions: int
    rooms: list[InterviewSessionInfo]