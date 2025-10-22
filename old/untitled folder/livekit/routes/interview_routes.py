from fastapi import APIRouter, BackgroundTasks, Depends
from livekit import agents

from models.interview import InterviewConfig, InterviewStatus, ActiveInterviewsResponse
from services.interview_service import InterviewService

router = APIRouter(prefix="/interview", tags=["interviews"])

# Dependency to get interview service instance
def get_interview_service() -> InterviewService:
    return InterviewService()


@router.post("/start", response_model=InterviewStatus)
async def start_interview(
    config: InterviewConfig, 
    background_tasks: BackgroundTasks,
    service: InterviewService = Depends(get_interview_service)
):
    """Start a new interview session"""
    # Start the interview session
    status = await service.start_interview(config)
    
    # Start the LiveKit agent in background
    background_tasks.add_task(
        agents.cli.run_app,
        service.get_worker_options(config)
    )
    
    return status


@router.get("/{room_name}/status", response_model=InterviewStatus)
async def get_interview_status(
    room_name: str,
    service: InterviewService = Depends(get_interview_service)
):
    """Get the status of an interview session"""
    return service.get_interview_status(room_name)


@router.delete("/{room_name}")
async def end_interview(
    room_name: str,
    service: InterviewService = Depends(get_interview_service)
):
    """End an interview session"""
    return service.end_interview(room_name)


@router.get("s", response_model=ActiveInterviewsResponse)
async def list_active_interviews(
    service: InterviewService = Depends(get_interview_service)
):
    """List all active interview sessions"""
    return service.list_active_interviews()