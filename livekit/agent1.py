from dotenv import load_dotenv
from livekit import agents
from livekit.agents import Agent, AgentSession, RoomInputOptions, JobContext
from livekit.plugins import openai
from livekit.plugins.noise_cancellation import BVC
from livekit.plugins.silero import VAD
from livekit.plugins.google import STT as GoogleSTT
from db_logic import save_interview_history, get_job_ai_config
import asyncio
import os
import json

load_dotenv()

class Assistant(Agent):
    def __init__(self, candidate_id=None, job_id=None, instructions=None):
        if not instructions:
            raise ValueError("❌ No AI instructions provided - cannot start interview")
        
        super().__init__(instructions=instructions)
        self.candidate_id = candidate_id
        self.job_id = job_id
        self.has_greeted = False
        print(f"[INFO] ✅ Assistant initialized with instructions ({len(instructions)} chars)")

    def _extract_greeting(self):
        """Extract greeting from instructions - simple approach"""
        instructions = self.instructions
        
        # Look for greeting after "Start the interview with:"
        if 'Start the interview with:' in instructions:
            start_idx = instructions.find('Start the interview with:') + len('Start the interview with:')
            text_after = instructions[start_idx:].strip()
            
            # Remove quotes and find end of greeting
            text_after = text_after.strip('\'"')
            end_markers = ['" You are', "' You are", '\n\nYou are', '. You are']
            
            greeting = text_after
            for marker in end_markers:
                if marker in greeting:
                    greeting = greeting.split(marker)[0]
                    break
            
            greeting = greeting.replace('\\n', '. ').strip().strip('\'"')
            
            if len(greeting) > 20 and len(greeting) < 300:
                print(f"[DEBUG] ✅ Extracted greeting from instructions")
                return greeting
        
        # Fallback greeting
        print(f"[DEBUG] Using fallback greeting")
        return "Hello and welcome to your interview. I'm here to conduct your interview today. Let's begin."

async def entrypoint(ctx: JobContext):
    """Main entry point - simplified approach following LiveKit best practices"""
    print(f"[INFO] 🚀 Starting interview session...")
    
    # Extract metadata from room - CORRECTED ACCESS
    metadata = {}
    try:
        print(f"[DEBUG] Room name: {ctx.room.name}")
        print(f"[DEBUG] Room metadata: '{ctx.room.metadata}'")
        metadata = json.loads(ctx.room.metadata) if ctx.room.metadata else {}
        print(f"[DEBUG] Parsed metadata: {metadata}")
    except Exception as e:
        print(f"[ERROR] Failed to parse metadata: {e}")
    
    candidate_id = metadata.get('candidate_id')
    job_id = metadata.get('job_id')
    candidate_name = metadata.get('candidate_name', 'Unknown')
    job_title = metadata.get('job_title', 'Unknown Position')
    
    print(f"[INFO] Interview: {candidate_name} for {job_title}")
    print(f"[INFO] IDs - candidate: {candidate_id}, job: {job_id}")
    
    # Get AI configuration from database
    print(f"[INFO] Fetching AI config for job_id: {job_id}")
    job_ai_config = get_job_ai_config(job_id)
    
    # Check if we have valid AI instructions
    if not job_ai_config or (not job_ai_config.get('prompt') and not job_ai_config.get('instructions')):
        print(f"[ERROR] ❌ No AI instructions found for job_id: {job_id}")
        print(f"[ERROR] 🛑 Cannot start interview without AI configuration")
        return  # Stop the interview
    
    # Combine AI prompt and instructions
    ai_instructions = ""
    if job_ai_config.get('prompt') and job_ai_config.get('instructions'):
        ai_instructions = f"{job_ai_config['prompt']}\n\n{job_ai_config['instructions']}"
        print(f"[INFO] ✅ Using combined AI prompt + instructions ({len(ai_instructions)} chars)")
    elif job_ai_config.get('prompt'):
        ai_instructions = job_ai_config['prompt']
        print(f"[INFO] ✅ Using AI prompt ({len(ai_instructions)} chars)")
    elif job_ai_config.get('instructions'):
        ai_instructions = job_ai_config['instructions']
        print(f"[INFO] ✅ Using AI instructions ({len(ai_instructions)} chars)")
    
    # Setup credentials
    openai_key = os.getenv('OPENAI_API_KEY')
    cred_path = "/app/widd.json" if os.path.exists("/app/widd.json") else "widd.json"
    
    if not os.path.exists(cred_path):
        print(f"[ERROR] Google credentials not found at: {cred_path}")
        return
    
    # Create assistant with AI instructions
    try:
        print(f"[DEBUG] Creating assistant with instructions preview: {ai_instructions[:200]}...")
        assistant = Assistant(
            candidate_id=candidate_id,
            job_id=job_id,
            instructions=ai_instructions
        )
    except ValueError as e:
        print(f"[ERROR] {e}")
        return
    
    # Create session
    session = AgentSession(
        stt=GoogleSTT(credentials_file=cred_path),
        llm=openai.LLM(model="gpt-4o", temperature=0.5, api_key=openai_key),
        tts=openai.TTS(voice="nova"),
        vad=VAD.load(),
    )
    
    await ctx.connect()
    print(f"[INFO] ✅ Connected to room: {ctx.room.name}")
    
    # Set up event handler for new participants
    def on_participant_connected(participant):
        print(f"[INFO] 🎯 Participant connected: {participant.identity}")
        
        # Auto-greet new participants (not agent itself)
        if (not assistant.has_greeted and 
            participant.identity != "agent" and 
            participant.identity != "" and
            hasattr(participant, 'kind')):
            
            print(f"[INFO] ✅ Starting auto-greeting for: {participant.identity}")
            assistant.has_greeted = True
            
            # Create async task for greeting
            async def send_greeting():
                try:
                    greeting = assistant._extract_greeting()
                    print(f"[DEBUG] Sending greeting: {greeting[:100]}...")
                    await session.say(greeting)
                    print(f"[INFO] ✅ Interview started successfully!")
                except Exception as e:
                    print(f"[ERROR] Failed to send greeting: {e}")
            
            # Use asyncio.create_task as recommended by the error
            asyncio.create_task(send_greeting())
    
    ctx.room.on("participant_connected", on_participant_connected)
    
    # Start the session
    await session.start(
        room=ctx.room,
        agent=assistant,
        room_input_options=RoomInputOptions(noise_cancellation=BVC()),
    )
    
    print(f"[INFO] ✅ Interview session active - waiting for participants...")
    
    # Check for existing participants (in case they joined before event handler was set)
    await asyncio.sleep(1)  # Brief delay for room initialization
    
    participants = [p for p in ctx.room.remote_participants.values() 
                   if p.identity != "agent" and p.identity != "" and hasattr(p, 'kind')]
    
    if participants and not assistant.has_greeted:
        print(f"[INFO] Found existing participant: {participants[0].identity}")
        assistant.has_greeted = True
        
        try:
            greeting = assistant._extract_greeting()
            print(f"[DEBUG] Sending greeting to existing participant: {greeting[:100]}...")
            await session.say(greeting)
            print(f"[INFO] ✅ Interview started for existing participant!")
        except Exception as e:
            print(f"[ERROR] Failed to greet existing participant: {e}")
    
    # Keep the session alive
    try:
        while True:
            await asyncio.sleep(1)
            # Check if room is still connected
            if not ctx.room or ctx.room.connection_state != "connected":
                print(f"[INFO] Room disconnected, ending session")
                break
    except Exception as e:
        print(f"[INFO] Session ended: {e}")

if __name__ == "__main__":
    port = int(os.getenv('LIVEKIT_AGENT_PORT', '8005'))
    options = agents.WorkerOptions(entrypoint_fnc=entrypoint, port=port)
    print(f"[INFO] Starting LiveKit Interview Agent on port {port}")
    agents.cli.run_app(options)