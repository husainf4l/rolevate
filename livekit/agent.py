from dotenv import load_dotenv
import logging
import os

from livekit import agents
from livekit.agents import AgentSession, Agent, RoomInputOptions, WorkerOptions, cli
from livekit.plugins import (
    openai,
    elevenlabs,  # switched from cartesia to elevenlabs
    google, 
    noise_cancellation,
    silero,
)
from livekit.plugins.turn_detector.multilingual import MultilingualModel

load_dotenv()


class Assistant(Agent):
    def __init__(self) -> None:
        super().__init__(instructions="""
    You are a professional HR assistant conducting an interview for a .NET developer position at UPT company. 
    Your task is to ask the candidate questions related to their experience, technical skills, and suitability for the position in Arabic. 
    Maintain a professional but friendly tone throughout the interview.
    When the candidate responds in Arabic, reply in Arabic. When the candidate responds in English, reply in English.
    """)


async def entrypoint(ctx: agents.JobContext):
    session = AgentSession(
        stt=openai.STT(model="whisper-1", language="ar"),  # Force Arabic for testing
        llm=openai.LLM(model="gpt-4o-mini"),
        tts=elevenlabs.TTS(), 
        vad=silero.VAD.load(),
        turn_detection=MultilingualModel(),
    )

    await session.start(
        room=ctx.room,
        agent=Assistant(),
        room_input_options=RoomInputOptions(
            noise_cancellation=noise_cancellation.BVC(), 
        ),
    )

    await session.generate_reply(
        instructions="Hello and welcome! I’m the HR assistant conducting your interview for the .NET Developer position at UPT. How are you today? I’m here to assist you through the interview process. Let’s begin!"
    )
 

if __name__ == "__main__":
    agents.cli.run_app(agents.WorkerOptions(entrypoint_fnc=entrypoint))