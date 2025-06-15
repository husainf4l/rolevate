from dotenv import load_dotenv
import logging
import json
import os

from livekit import agents
from livekit.agents import Agent, AgentSession, RoomInputOptions, WorkerOptions, JobContext
from livekit.plugins import openai, elevenlabs, noise_cancellation, silero
from livekit.plugins.turn_detector.multilingual import MultilingualModel

load_dotenv()


class Assistant(Agent):
    def __init__(self, job_title=None, company=None, description=None, requirements=None):
        instructions = self._build_instructions(job_title, company, description, requirements)
        super().__init__(instructions=instructions)

    def _build_instructions(self, title, company, description, requirements):
        intro = (
            f"You are a professional HR assistant conducting an interview"
            f" for the position of {title or 'a role'} at {company or 'the company'}.\n"
            "Ask the candidate about their experience, skills, and how they match the job.\n"
            "Maintain a professional yet friendly tone throughout the interview."
        )
        if description:
            intro += f"\n\nJob Description:\n{description}"
        if requirements:
            intro += f"\n\nKey Requirements:\n{requirements}"
        return intro


async def entrypoint(ctx: JobContext):
    print(f"[INFO] 🚀 Starting interview session in room: {ctx.room.name}")
    await ctx.connect()

    metadata = None
    if ctx.room and ctx.room.metadata:
        try:
            metadata = json.loads(ctx.room.metadata)
            print(f"[INFO] ✅ Metadata found with keys: {list(metadata.keys())}")
        except json.JSONDecodeError:
            print("[WARN] ❌ Invalid metadata format")

    assistant = Assistant(
        job_title=metadata.get("job_title") if metadata else None,
        company=metadata.get("company") if metadata else None,
        description=metadata.get("job_description") if metadata else None,
        requirements=metadata.get("job_requirements") if metadata else None,
    )

    session = AgentSession(
        stt=openai.STT(model="whisper-1"),
        llm=openai.LLM(model="gpt-4o-mini"),
        tts=elevenlabs.TTS(voice_id="21m00Tcm4TlvDq8ikWAM"),
        vad=silero.VAD.load(),
        turn_detection=MultilingualModel(),
    )

    await session.start(
        room=ctx.room,
        agent=assistant,
        room_input_options=RoomInputOptions(
            noise_cancellation=noise_cancellation.BVC()
        ),
    )

    await session.generate_reply(
        instructions=(
            f"Hello and welcome! I’m the HR assistant conducting your interview"
            f"{f' for the {metadata.get('job_title')}' if metadata and metadata.get('job_title') else ''}"
            f"{f' at {metadata.get('company')}' if metadata and metadata.get('company') else ''}. "
            "Let’s get started."
        )
    )


if __name__ == "__main__":
    agents.cli.run_app(WorkerOptions(entrypoint_fnc=entrypoint))
