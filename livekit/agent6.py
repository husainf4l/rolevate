"""
LiveKit AI Interview Agent - Best Practices (Agent 6)
======================================================

This file contains the core logic for the AI interview agent, following
a modular and best-practices-oriented structure.

Key Features:
- **Modular Design**: Separates configuration and services into their own modules.
- **Centralized Configuration**: Uses a typed config object for all settings.
- **Dependency Injection**: Services are explicitly passed where needed.
- **Clear Entrypoint**: The `entrypoint` function is clean and orchestrates the setup.
"""

import asyncio
import logging

from livekit import agents
from livekit.agents import Agent, AgentSession, JobContext
from livekit.plugins import openai, elevenlabs, silero

# Import from our new modules
from config import config
from services import MetadataExtractor, RecordingManager

# Configure logging
logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)


class InterviewAgent(Agent):
    """
    The core AI Interview Agent, responsible for interaction logic.
    """

    def __init__(
        self,
        candidate_name: str,
        job_name: str,
        company_name: str,
        interview_prompt: str,
        **kwargs,
    ):
        self.candidate_name = candidate_name
        self.job_name = job_name
        self.company_name = company_name
        self.interview_prompt = interview_prompt

        instructions = self._build_instructions()
        super().__init__(instructions=instructions, **kwargs)
        logger.info(f"InterviewAgent initialized for {candidate_name}")

    async def on_connected(self) -> None:
        """Called when the agent connects to the room. Sends the initial greeting."""
        logger.info("Agent connected, sending welcome message.")
        greeting = (
            f"مرحباً {self.candidate_name}! أهلاً وسهلاً! Hello {self.candidate_name}, and welcome! "
            f"I'm Laila Al Noor, your AI HR assistant from {self.company_name}. "
            f"I'm delighted to be conducting your interview today for the {self.job_name} position. "
            f"I can communicate in both Arabic and English. Please feel free to use "
            f"whichever language you prefer. Are you ready to get started?"
        )
        await self.say(greeting)
        await super().on_connected()

    def _build_instructions(self) -> str:
        """Builds the dynamic system prompt for the LLM."""
        base_instructions = (
            f"You are Laila Al Noor — a professional, empathetic AI HR assistant "
            f"representing {self.company_name}. You are fluent in both Arabic and English. "
            f"إذا تحدث المتقدم بالعربية، أجيبي بالعربية بطلاقة. "
            f"If the candidate speaks in English, respond naturally in English."
        )
        if self.interview_prompt:
            interview_section = f"\n\nINTERVIEW PROTOCOL:\n{self.interview_prompt}"
        else:
            interview_section = (
                f"\n\nConduct a structured interview for the {self.job_name} position."
            )
        return f"{base_instructions}{interview_section}"


async def entrypoint(ctx: JobContext):
    """
    Main entrypoint for the interview agent.
    Orchestrates the setup and execution of the agent session.
    """
    logger.info(f"Starting agent entrypoint for room: {ctx.room.name}")
    try:
        await ctx.connect()
        logger.info("Successfully connected to the room.")

        metadata = MetadataExtractor.extract_from_room(ctx.room.metadata)

        session = AgentSession(
            stt=openai.STT(api_key=config.openai_api_key, model="whisper-1"),
            llm=openai.LLM(api_key=config.openai_api_key),
            tts=elevenlabs.TTS(voice_id=config.elevenlabs_voice_id),
            vad=silero.VAD.load(),
        )

        agent = InterviewAgent(**metadata)

        recording_manager = RecordingManager(ctx, config)
        recording_url = await recording_manager.start_recording()
        recording_manager.setup_transcript_saving(session, recording_url)

        logger.info("Starting agent session...")
        await session.start(room=ctx.room, agent=agent)
        logger.info("Agent session started.")

        completion_event = asyncio.Event()
        ctx.add_shutdown_callback(lambda: completion_event.set())
        await completion_event.wait()

    except Exception:
        logger.critical("Fatal error in agent entrypoint.", exc_info=True)
    finally:
        logger.info("Agent entrypoint finished.")
        if "recording_manager" in locals():
            await recording_manager.close()


if __name__ == "__main__":
    logger.info(f"Starting LiveKit agent worker on port {config.livekit_agent_port}")
    agents.cli.run_app(
        agents.WorkerOptions(
            entrypoint_fnc=entrypoint,
            port=config.livekit_agent_port,
        )
    )
