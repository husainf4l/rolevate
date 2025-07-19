from dotenv import load_dotenv
from livekit import agents
from livekit.agents import Agent, AgentSession, RoomInputOptions, JobContext
from livekit.plugins import openai, google
from livekit.plugins.noise_cancellation import BVC
from livekit.plugins.silero import VAD
from livekit.plugins.elevenlabs import TTS as ElevenLabsTTS
from livekit.plugins.google import STT as GoogleSTT, TTS as GoogleTTS
import asyncio
import os


load_dotenv()


def read_file_content(path):
    with open(path, "r", encoding="utf-8") as f:
        return f.read()


class Assistant(Agent):
    def __init__(self):
        instructions = read_file_content("agent_instructions.txt")
        super().__init__(instructions=instructions)
        print("[DEBUG] Agent Assistant class initialized")


async def poll_and_save_history(session):
    print("[DEBUG] Starting poll_and_save_history task")
    saved_pairs = set()
    while True:
        history = getattr(session, "history", None)
        if history is not None and hasattr(history, "items"):
            messages = history.items  # FIX: items is a list, not a method
            print(f"[DEBUG] session.history.items: {messages}")
            # Look for Q&A pairs
            for i in range(1, len(messages)):
                prev_msg = messages[i - 1]
                curr_msg = messages[i]
                # Fix: ChatMessage content is a list, get first element or join if needed
                prev_content = prev_msg.content[0] if prev_msg.content else ""
                curr_content = curr_msg.content[0] if curr_msg.content else ""
                if prev_msg.role == "assistant" and curr_msg.role == "user":
                    pair_key = (prev_content, curr_content)
                    if pair_key not in saved_pairs:
                        user_id = (
                            None  # You can improve this if you have participant info
                        )
                        question = prev_content
                        answer = curr_content
                        language = getattr(session.stt, "language", None)
                        print(f"[DEBUG] Poll: Saving Q&A to DB: {question} | {answer}")
                        try:
                            # save_interview_history(user_id, question, answer, language)  # Disabled for now
                            saved_pairs.add(pair_key)
                            print(
                                "[DEBUG] Poll: DB save disabled - would have saved to DB successfully."
                            )
                        except Exception as e:
                            print(f"[ERROR] Poll: Failed to save to DB: {e}")
        else:
            print("[DEBUG] session.history has no items attribute or is None.")
        await asyncio.sleep(2)


async def entrypoint(ctx: JobContext):
    # create_history_table()  # Disabled for now
    print("[DEBUG] Database functionality disabled")
    # Use local path for Google credentials instead of Docker path
    cred_path = os.getenv("GOOGLE_APPLICATION_CREDENTIALS", "./google-credentials.json")
    openai_key = os.getenv("OPENAI_API_KEY")
    print(f"[DEBUG] Google credentials path: {cred_path}")
    print(f"[DEBUG] File exists: {os.path.exists(cred_path)}")
    print(f"[DEBUG] OpenAI API Key: {openai_key[:10]}...{openai_key[-5:]}")

    # Force reload environment variables
    with open(".env", "r") as f:
        for line in f:
            if line.strip() and not line.startswith("#") and not line.startswith("//"):
                key, value = line.strip().split("=", 1)
                os.environ[key] = value
                if key == "OPENAI_API_KEY":
                    print(
                        f"[DEBUG] Directly loaded OpenAI key: {value[:10]}...{value[-5:]}"
                    )
                    openai_key = value

    session = AgentSession(
        stt=GoogleSTT(credentials_file=cred_path),
        llm=openai.LLM(
            model="gpt-4o",
            temperature=0.5,
            api_key=openai_key,  # Explicitly pass the API key
        ),
        tts=ElevenLabsTTS(voice_id="21m00Tcm4TlvDq8ikWAM"),  # Rachel (female)
        vad=VAD.load(),
        # Use simple VAD-based turn detection
        min_endpointing_delay=0.5,  # Short delay before considering turn complete
        max_endpointing_delay=2.0,  # Maximum wait time
    )
    # Start polling in the background - DISABLED for now
    # asyncio.create_task(poll_and_save_history(session))
    print("[DEBUG] Background polling disabled")
    await session.start(
        room=ctx.room,
        agent=Assistant(),
        room_input_options=RoomInputOptions(
            noise_cancellation=BVC(),
        ),
    )
    await ctx.connect()

    # Generate initial greeting based on agent instructions
    await session.generate_reply(
        instructions="Greet the user as a professional AI interviewer and offer your assistance."
    )

    print("[DEBUG] Agent session started - waiting for user interactions")


if __name__ == "__main__":
    port = int(os.getenv("LIVEKIT_AGENT_PORT", "8005"))  # Default to port 8005
    options = agents.WorkerOptions(entrypoint_fnc=entrypoint, port=port)
    print(f"[INFO] Starting LiveKit agent on port {port}")
    agents.cli.run_app(options)
