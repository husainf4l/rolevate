"""
Main entrypoint for the interview agent.
"""

import asyncio
import logging
import os
from dotenv import load_dotenv
from livekit import agents
from livekit.agents import AgentSession, JobContext
from livekit.plugins import openai
from livekit.plugins.openai import STT as OpenAISTT
from livekit.plugins.elevenlabs import TTS as ElevenLabsTTS
from livekit.plugins.silero import VAD

from .agent import InterviewAgent
from .utils.metadata import MetadataExtractor
from .utils.recording import RecordingManager

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)


async def entrypoint(ctx: JobContext):
    """
    Main entrypoint for the interview agent.

    Flow:
    1. Connect to room and extract metadata
    2. Configure multilingual session (STT, LLM, TTS)
    3. Create personalized agent
    4. Start recording and session
    5. Wait for completion
    """
    logger.info(f"Starting interview agent for room: {ctx.room.name}")

    try:
        # Connect to room first
        await ctx.connect()
        logger.info("Successfully connected to room")

        # Extract metadata from room
        metadata = MetadataExtractor.extract_from_room(ctx.room.metadata)

        # Log session information
        logger.info("=" * 60)
        logger.info("INTERVIEW SESSION STARTED")
        logger.info("=" * 60)
        logger.info(f"Room: {ctx.room.name}")
        logger.info(f"Job ID: {ctx.job.id}")
        logger.info(f"Candidate: {metadata['candidateName']}")
        logger.info(f"Position: {metadata['jobName']}")
        logger.info(f"Company: {metadata['companyName']}")
        logger.info(
            f"Interview Guidelines: {'Yes' if metadata['interviewPrompt'] else 'No'}"
        )
        logger.info(f"CV Summary: {'Yes' if metadata['cv_summary'] else 'No'}")
        logger.info(f"CV Analysis: {'Yes' if metadata['cv_analysis'] else 'No'}")
        logger.info("=" * 60)

        # Validate required environment variables
        required_env_vars = ["OPENAI_API_KEY"]
        for var in required_env_vars:
            if not os.getenv(var):
                raise ValueError(f"Required environment variable {var} is not set")

        # Configure multilingual session with OpenAI Whisper for better performance
        session = AgentSession(
            stt=OpenAISTT(
                api_key=os.getenv("OPENAI_API_KEY"),
                model="whisper-1",  # OpenAI Whisper model
                # Removed language parameter - Whisper auto-detects language by default
            ),
            llm=openai.LLM(model="gpt-4o"),
            tts=ElevenLabsTTS(
                voice_id="21m00Tcm4TlvDq8ikWAM",  # Rachel voice
            ),
            # VAD with default settings - custom parameters not supported in this version
            vad=VAD.load(),
        )

        # Create personalized agent
        agent = InterviewAgent(
            ctx=ctx,
            candidate_name=metadata["candidateName"],
            job_name=metadata["jobName"],
            company_name=metadata["companyName"],
            interview_prompt=metadata["interviewPrompt"],
            cv_summary=metadata["cv_summary"],
            cv_analysis=metadata["cv_analysis"],
        )

        # Setup recording
        recording_manager = RecordingManager(ctx)
        recording_url = await recording_manager.start_recording()
        recording_manager.setup_transcript_saving(session, recording_url)

        # Start agent session
        await session.start(room=ctx.room, agent=agent)
        logger.info("Agent session started successfully")

        # Create completion event and wait
        completion_event = asyncio.Event()

        # Setup graceful shutdown
        async def on_shutdown():
            logger.info("Session ending - cleaning up resources")
            completion_event.set()

        ctx.add_shutdown_callback(on_shutdown)

        # Wait for session completion
        await completion_event.wait()
        logger.info("Interview session completed")

    except Exception as e:
        logger.error(f"Fatal error in interview agent: {e}")
        raise


if __name__ == "__main__":
    # Configure worker
    port = int(os.getenv("LIVEKIT_AGENT_PORT", "8006"))
    options = agents.WorkerOptions(
        entrypoint_fnc=entrypoint,
        port=port,
    )

    logger.info(f"Starting LiveKit agent on port {port}")
    agents.cli.run_app(options)
