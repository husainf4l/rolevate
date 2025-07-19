import logging
from typing import Dict, Any
from fastapi import HTTPException

from livekit import agents
from livekit.agents import AgentSession, RoomInputOptions, WorkerOptions
from livekit.plugins import openai, elevenlabs, noise_cancellation, silero
from livekit.plugins.turn_detector.multilingual import MultilingualModel

from models.interview import InterviewConfig, InterviewStatus, ActiveInterviewsResponse, InterviewSessionInfo
from services.livekit_agent import ProfessionalHRAssistant
from config.settings import get_settings

logger = logging.getLogger(__name__)


class InterviewService:
    def __init__(self):
        self.active_sessions: Dict[str, Any] = {}
        self.settings = get_settings()
    
    async def create_interview_session(self, config: InterviewConfig) -> AgentSession:
        """Create and configure a new interview session"""
        try:
            session = AgentSession(
                stt=openai.STT(
                    model="whisper-1", 
                    language=config.language
                ),
                llm=openai.LLM(model=config.model),
                tts=elevenlabs.TTS(),
                vad=silero.VAD.load(),
                turn_detection=MultilingualModel(),
            )
            
            logger.info(f"Interview session created for {config.participant_name}")
            return session
            
        except Exception as e:
            logger.error(f"Failed to create interview session: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Failed to create session: {str(e)}")

    async def interview_entrypoint(self, ctx: agents.JobContext, config: InterviewConfig):
        """Enhanced interview entrypoint with professional structure"""
        try:
            session = await self.create_interview_session(config)
            
            await session.start(
                room=ctx.room,
                agent=ProfessionalHRAssistant(config),
                room_input_options=RoomInputOptions(
                    noise_cancellation=noise_cancellation.BVC(),
                ),
            )

            welcome_message = f"""
Hello {config.participant_name}, and welcome to your interview for the {config.position} position at {config.company}!

I'm your HR assistant and I'll be conducting this interview today. This will be a comprehensive interview covering your background, technical skills, and experience.

The interview will take approximately 45-60 minutes. Please feel free to ask questions at any time.

Are you ready to begin?
            """
            
            await session.generate_reply(instructions=welcome_message)
            
            self.active_sessions[config.room_name] = {
                "session": session,
                "config": config,
                "status": "active"
            }
            
            logger.info(f"Interview started for {config.participant_name} in room {config.room_name}")
            
        except Exception as e:
            logger.error(f"Error in interview entrypoint: {str(e)}")
            if config.room_name in self.active_sessions:
                self.active_sessions[config.room_name]["status"] = "error"
            raise

    def validate_environment(self) -> None:
        """Validate required environment variables"""
        missing_vars = self.settings.validate_required_vars()
        if missing_vars:
            raise HTTPException(
                status_code=500,
                detail=f"Missing required environment variables: {', '.join(missing_vars)}"
            )

    def session_exists(self, room_name: str) -> bool:
        """Check if a session already exists for the given room"""
        return room_name in self.active_sessions

    async def start_interview(self, config: InterviewConfig) -> InterviewStatus:
        """Start a new interview session"""
        if self.session_exists(config.room_name):
            raise HTTPException(
                status_code=400, 
                detail=f"Interview session already exists for room {config.room_name}"
            )
        
        try:
            self.validate_environment()
            
            # Initialize the session status
            self.active_sessions[config.room_name] = {
                "config": config,
                "status": "initializing"
            }
            
            logger.info(f"Interview initialization started for {config.participant_name}")
            
            return InterviewStatus(
                room_name=config.room_name,
                status="initializing",
                message=f"Interview session is being prepared for {config.participant_name}"
            )
            
        except Exception as e:
            logger.error(f"Failed to start interview: {str(e)}")
            # Clean up if initialization failed
            if config.room_name in self.active_sessions:
                del self.active_sessions[config.room_name]
            raise HTTPException(status_code=500, detail=str(e))

    def get_interview_status(self, room_name: str) -> InterviewStatus:
        """Get the status of an interview session"""
        if room_name not in self.active_sessions:
            raise HTTPException(
                status_code=404,
                detail=f"No interview session found for room {room_name}"
            )
        
        session_data = self.active_sessions[room_name]
        return InterviewStatus(
            room_name=room_name,
            status=session_data["status"],
            message=f"Interview for {session_data['config'].participant_name}"
        )

    def end_interview(self, room_name: str) -> dict:
        """End an interview session"""
        if room_name not in self.active_sessions:
            raise HTTPException(
                status_code=404,
                detail=f"No interview session found for room {room_name}"
            )
        
        session_data = self.active_sessions.pop(room_name)
        logger.info(f"Interview ended for room {room_name}")
        
        return {
            "message": f"Interview session for {session_data['config'].participant_name} has been ended",
            "room_name": room_name
        }

    def list_active_interviews(self) -> ActiveInterviewsResponse:
        """List all active interview sessions"""
        rooms = [
            InterviewSessionInfo(
                room_name=room_name,
                participant=session_data["config"].participant_name,
                status=session_data["status"],
                position=session_data["config"].position
            )
            for room_name, session_data in self.active_sessions.items()
        ]
        
        return ActiveInterviewsResponse(
            active_sessions=len(self.active_sessions),
            rooms=rooms
        )

    def get_worker_options(self, config: InterviewConfig) -> WorkerOptions:
        """Get worker options for the interview session"""
        return WorkerOptions(
            entrypoint_fnc=lambda ctx: self.interview_entrypoint(ctx, config)
        )