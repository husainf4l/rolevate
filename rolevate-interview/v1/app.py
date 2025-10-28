"""
Rolevate Interview Agent - Simplified
"""

import logging
import asyncio
import aiohttp
from pathlib import Path

from livekit.agents import AgentSession, JobContext, JobProcess, WorkerOptions, cli, tokenize
from livekit.plugins import soniox, openai, elevenlabs, silero

from .core.config import settings
from .services.api_client import RolevateAPIClient
from .services.s3_service import upload_video_to_s3
from .agents.interview_agent import InterviewAgent
from .utils.helpers import parse_application_id

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler(Path(__file__).parent / "logs" / "agent.log")
    ]
)
logger = logging.getLogger(__name__)


def prewarm(proc: JobProcess) -> None:
    """Preload VAD model"""
    try:
        proc.userdata["vad"] = silero.VAD.load()
        settings.validate()
    except Exception as e:
        logger.error(f"Prewarm failed: {e}")
        raise


async def fetch_context(application_id: str):
    """Fetch interview context from API"""
    if not application_id:
        return None
    api_client = RolevateAPIClient()
    try:
        return await api_client.fetch_interview_context(application_id)
    finally:
        await api_client.close()


async def upload_and_save_video(ctx: JobContext, application_id: str):
    """Upload video to S3 and save URL to backend"""
    # Register disconnect handler
    @ctx.room.on("disconnected")
    def on_disconnect():
        asyncio.create_task(_process_recording(ctx, application_id))
    
async def _process_recording(ctx: JobContext, application_id: str):
    """Process recording after room ends"""
    recording_path = Path(f"recordings/{ctx.room.name}.mp4")
    if not recording_path.exists():
        return
    
    # Upload to S3
    video_url = upload_video_to_s3(str(recording_path), application_id)
    if not video_url:
        return
    
    # Save to backend
    if settings.backend_url:
        try:
            async with aiohttp.ClientSession() as session:
                await session.post(
                    f"{settings.backend_url}/applications/{application_id}/video",
                    json={"videoUrl": video_url},
                    timeout=aiohttp.ClientTimeout(total=10)
                )
            logger.info(f"✅ Video saved: {application_id}")
        except Exception as e:
            logger.error(f"Backend save failed: {e}")
    
    # Cleanup
    recording_path.unlink()



async def entrypoint(ctx: JobContext) -> None:
    """Main entry point for interview session"""
    try:
        logger.info("Starting entrypoint")
        application_id = parse_application_id(ctx.room.name)
        logger.info(f"Parsed application_id: {application_id}")
        
        # Connect to room first
        logger.info("Connecting to room")
        await ctx.connect()
        logger.info("Connected to room")
        
        # Fetch context and start recording handler
        logger.info("Fetching context")
        interview_context = await fetch_context(application_id)
        logger.info(f"Fetched context: {interview_context}")
        if application_id and settings.aws_bucket_name:
            asyncio.create_task(upload_and_save_video(ctx, application_id))
        
        # Configure session
        logger.info("Creating AgentSession")
        session = AgentSession(
            stt=soniox.STT(params=soniox.STTOptions(language_hints=["en", "ar"])),
            llm=openai.LLM(model=settings.openai.model),
            tts=elevenlabs.TTS(
                voice_id=settings.elevenlabs.voice_id,
                model="eleven_turbo_v2",  # Faster model
                auto_mode=True,
                # word_tokenizer=tokenize.blingfire.SentenceTokenizer(),
                # encoding="pcm_22050",  # Use default
                # streaming_latency=1,  # Use default
            ),
            vad=ctx.proc.userdata.get("vad") or silero.VAD.load(),
            preemptive_generation=True,
        )
        logger.info("AgentSession created")
        
        # Start agent with room access for vision tool
        logger.info("Creating InterviewAgent")
        agent = InterviewAgent(context=interview_context, room=ctx.room)
        logger.info("InterviewAgent created")
        
        logger.info("Starting session")
        await session.start(agent=agent, room=ctx.room)
        logger.info("Session started")
    except Exception as e:
        logger.error(f"Entrypoint error: {e}")
        import traceback
        traceback.print_exc()
        raise



def main():
    """Start the agent"""
    # Scale based on environment
    # Development: 3 processes
    # Production: 10-50 processes per server (based on CPU/RAM)
    import os
    num_processes = int(os.getenv("AGENT_PROCESSES", "3"))
    
    logger.info(f"🚀 Rolevate Agent v4.2.0 - CV Analysis + GPT-4o Mini - {settings.openai.model}")
    logger.info(f"📊 Concurrent capacity: {num_processes} interviews")
    
    cli.run_app(WorkerOptions(
        entrypoint_fnc=entrypoint, 
        prewarm_fnc=prewarm,
        num_idle_processes=num_processes  # Configurable via env
    ))



if __name__ == "__main__":
    main()
