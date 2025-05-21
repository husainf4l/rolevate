from dotenv import load_dotenv
from livekit import agents
from livekit.agents import Agent, AgentSession, RoomInputOptions, JobContext
from livekit.plugins import openai, google
from livekit.plugins.noise_cancellation import BVC
from livekit.plugins.silero import VAD
from livekit.plugins.elevenlabs import TTS as ElevenLabsTTS
from livekit.plugins.google import STT as GoogleSTT
from db_logic import save_interview_history, create_history_table
import asyncio


load_dotenv()

def read_file_content(path):
    with open(path, 'r', encoding='utf-8') as f:
        return f.read()

class Assistant(Agent):
    def __init__(self):
        instructions = read_file_content('agent_instructions.txt')
        super().__init__(instructions=instructions)

    async def on_message(self, message, session, participant):
        print("[DEBUG] on_message called")
        print(f"[DEBUG] message: {message}")
        print(f"[DEBUG] message role: {getattr(message, 'role', None)}")
        print(f"[DEBUG] session.history: {session.history}")
        # Only process and respond to user messages
        if hasattr(message, 'role') and message.role == 'user':
            if session.history and len(session.history) >= 2:
                last_agent = session.history[-2]
                last_user = session.history[-1]
                print(f"[DEBUG] last_agent: {last_agent}")
                print(f"[DEBUG] last_user: {last_user}")
                if last_agent.get('role') == 'assistant' and last_user.get('role') == 'user':
                    user_id = str(participant.identity) if participant and hasattr(participant, 'identity') else None
                    question = last_agent.get('content')
                    answer = last_user.get('content')
                    language = getattr(session.stt, 'language', None)
                    print(f"[DEBUG] Attempting to save to DB: user_id={user_id}, question={question}, answer={answer}, language={language}")
                    try:
                        save_interview_history(user_id, question, answer, language)
                        print("[DEBUG] Saved to DB successfully.")
                    except Exception as e:
                        print(f"[ERROR] Failed to save to DB: {e}")
            else:
                print("[DEBUG] session.history does not have enough entries or is missing.")
            # Respond immediately to user
            return await super().on_message(message, session, participant)
        else:
            print("[DEBUG] Ignoring non-user message in on_message.")
            return None

    async def on_user_message(self, message, session, participant):
        print("[DEBUG] on_user_message called")
        print(f"[DEBUG] message: {message}")
        print(f"[DEBUG] session.history: {session.history}")
        # Try to get the last agent message as the question
        if session.history and len(session.history) >= 1:
            last_agent = session.history[-1] if session.history[-1].get('role') == 'assistant' else None
            if last_agent:
                user_id = str(participant.identity) if participant and hasattr(participant, 'identity') else None
                question = last_agent.get('content')
                answer = message.get('content') if isinstance(message, dict) else str(message)
                language = getattr(session.stt, 'language', None)
                print(f"[DEBUG] Attempting to save to DB (on_user_message): user_id={user_id}, question={question}, answer={answer}, language={language}")
                try:
                    save_interview_history(user_id, question, answer, language)
                    print("[DEBUG] Saved to DB successfully (on_user_message).")
                except Exception as e:
                    print(f"[ERROR] Failed to save to DB (on_user_message): {e}")
        else:
            print("[DEBUG] session.history does not have enough entries or is missing (on_user_message).")
        # Call super if needed
        if hasattr(super(), 'on_user_message'):
            return await super().on_user_message(message, session, participant)
        return None

async def poll_and_save_history(session):
    print("[DEBUG] Starting poll_and_save_history task")
    saved_pairs = set()
    while True:
        history = getattr(session, 'history', None)
        if history is not None and hasattr(history, 'items'):
            messages = history.items  # FIX: items is a list, not a method
            print(f"[DEBUG] session.history.items: {messages}")
            # Look for Q&A pairs
            for i in range(1, len(messages)):
                prev_msg = messages[i-1]
                curr_msg = messages[i]
                # Fix: ChatMessage content is a list, get first element or join if needed
                prev_content = prev_msg.content[0] if prev_msg.content else ''
                curr_content = curr_msg.content[0] if curr_msg.content else ''
                if prev_msg.role == 'assistant' and curr_msg.role == 'user':
                    pair_key = (prev_content, curr_content)
                    if pair_key not in saved_pairs:
                        user_id = None  # You can improve this if you have participant info
                        question = prev_content
                        answer = curr_content
                        language = getattr(session.stt, 'language', None)
                        print(f"[DEBUG] Poll: Saving Q&A to DB: {question} | {answer}")
                        try:
                            save_interview_history(user_id, question, answer, language)
                            saved_pairs.add(pair_key)
                            print("[DEBUG] Poll: Saved to DB successfully.")
                        except Exception as e:
                            print(f"[ERROR] Poll: Failed to save to DB: {e}")
        else:
            print("[DEBUG] session.history has no items attribute or is None.")
        await asyncio.sleep(2)

async def entrypoint(ctx: JobContext):
    create_history_table()
    session = AgentSession(
        stt=GoogleSTT(),
        llm=openai.LLM(
            model="gpt-4o",
            temperature=0.5
        ),
        tts=ElevenLabsTTS(voice_id="21m00Tcm4TlvDq8ikWAM"),  # Rachel (female)
        vad=VAD.load(),
    )
    # Start polling in the background
    asyncio.create_task(poll_and_save_history(session))
    await session.start(
        room=ctx.room,
        agent=Assistant(),
        room_input_options=RoomInputOptions(
            noise_cancellation=BVC(),
        ),
    )
    await ctx.connect()
    # Only inject the system message ONCE at the start
    system_message = read_file_content('agent_system_message.txt')
    await session.generate_reply(instructions=system_message)
    # Do NOT call generate_reply again after this; let the agent/LLM handle the flow

if __name__ == "__main__":
    agents.cli.run_app(agents.WorkerOptions(entrypoint_fnc=entrypoint))
