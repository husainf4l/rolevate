"""
Rolevate Interview Agent
Main entry point for the AI interview agent
"""

import logging
from dotenv import load_dotenv

from livekit.agents import JobContext, WorkerOptions, cli, tokenize
from livekit.agents.voice import Agent, AgentSession
from livekit.plugins import soniox, openai, elevenlabs, silero

load_dotenv()
logger = logging.getLogger("rolevate-agent")
logger.setLevel(logging.INFO)


class RolevateAgent(Agent):
    """Rolevate Interview Agent"""
    
    def __init__(self) -> None:
        # Configure Soniox STT with Arabic and English support
        stt_options = soniox.STTOptions(
            language_hints=["en", "ar"],  # Support both English and Arabic
        )
        
        super().__init__(
            instructions="""
                You are a professional AI interviewer for Rolevate.
                Conduct interviews in English or Arabic based on the candidate's preference.
                Be professional, friendly, and ask thoughtful questions.
            """,
            stt=soniox.STT(params=stt_options),
            llm=openai.LLM(model="gpt-5-mini"),
            tts=elevenlabs.TTS(
                voice_id="EkK5I93UQWFDigLMpZcX",
                auto_mode=True,
            ),
            vad=silero.VAD.load()
        )
    
    async def on_enter(self):
        """Called when agent enters the room"""
        await self.session.say("Hello! Welcome to your Rolevate interview. How are you today?")


async def entrypoint(ctx: JobContext) -> None:
    """Main entrypoint for the Rolevate interview agent."""
    
    # Initialize agent session
    session = AgentSession()
    
    # Start the session with our agent
    await session.start(
        agent=RolevateAgent(),
        room=ctx.room
    )
    
    logger.info("Rolevate agent session started with Soniox STT + GPT-4o-mini + ElevenLabs TTS")


if __name__ == "__main__":
    cli.run_app(WorkerOptions(entrypoint_fnc=entrypoint))
