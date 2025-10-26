"""
Rolevate Interview Agent
Main entry point for the AI interview agent
"""

import logging

from livekit.agents import (
    AgentSession,
    JobContext,
    JobProcess,
    WorkerOptions,
    cli,
    tokenize,
)
from livekit.plugins import soniox, openai, elevenlabs, silero

# Import configuration
from config import (
    SUPPORTED_LANGUAGES,
    OPENAI_MODEL,
    ELEVENLABS_VOICE_ID,
)

# Import modules
from api_client import RolevateAPIClient
from agent import RolevateAgent
from utils import parse_application_id, setup_logging

# Setup logging
setup_logging(logging.INFO)
logger = logging.getLogger("rolevate-agent")



def prewarm(proc: JobProcess):
    """
    Prewarm function to load resources before agent starts.
    
    This function is called before the agent starts processing jobs,
    allowing us to preload VAD (Voice Activity Detection) model.
    
    Args:
        proc: The job process context
    """
    proc.userdata["vad"] = silero.VAD.load()


async def entrypoint(ctx: JobContext) -> None:
    """
    Main entry point for the agent.
    
    This function is called for each new interview session. It:
    1. Parses the application ID from the room name
    2. Fetches interview context from the API
    3. Configures the agent with STT, LLM, and TTS
    4. Starts the interview session
    
    Args:
        ctx: The job context containing room and connection information
    """
    ctx.log_context_fields = {"room": ctx.room.name}
    
    # Parse application ID from room name
    application_id = parse_application_id(ctx.room.name)
    
    # Fetch interview context from API
    interview_context = None
    if application_id:
        api_client = RolevateAPIClient()
        interview_context = await api_client.fetch_interview_details(application_id)
    
    # Configure STT with language hints
    stt_options = soniox.STTOptions(
        language_hints=SUPPORTED_LANGUAGES,
    )
    
    # Get or load VAD
    vad = ctx.proc.userdata.get("vad") or silero.VAD.load()
    
    # Create agent session
    session = AgentSession(
        stt=soniox.STT(params=stt_options),
        llm=openai.LLM(model=OPENAI_MODEL),
        tts=elevenlabs.TTS(
            voice_id=ELEVENLABS_VOICE_ID,
            auto_mode=True,
            word_tokenizer=tokenize.blingfire.SentenceTokenizer(),
        ),
        vad=vad,
        preemptive_generation=True,
    )
    
    # Create agent with interview context
    agent = RolevateAgent(interview_context=interview_context)
    
    # Start the session
    await session.start(
        agent=agent,
        room=ctx.room,
    )
    
    # Connect to the room
    await ctx.connect()
    
    logger.info("Rolevate agent session started successfully")


if __name__ == "__main__":
    cli.run_app(WorkerOptions(entrypoint_fnc=entrypoint, prewarm_fnc=prewarm))
