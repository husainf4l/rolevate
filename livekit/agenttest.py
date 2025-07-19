from dotenv import load_dotenv
from livekit import agents
from livekit.agents import Agent, AgentSession, JobContext
from livekit.plugins import openai
from livekit.plugins.google import STT as GoogleSTT
from livekit.plugins.elevenlabs import TTS as ElevenLabsTTS
from livekit.plugins.silero import VAD
from livekit import api
import os
import boto3
from botocore.exceptions import NoCredentialsError
import asyncio

load_dotenv()


class NewAgent(Agent):
    def __init__(
        self,
        candidate_name="the candidate",
        job_name="this position",
        company_name="our company",
        interview_prompt="",
        **kwargs,
    ):
        self.end_event = kwargs.pop("end_event", None)

        # Create dynamic instructions based on metadata
        base_instructions = f"You are Laila Al Noor — a smart, human-like AI HR assistant representing {company_name}. You can understand and respond in both Arabic and English. إذا تحدث المتقدم بالعربية، أجيبي بالعربية. If the candidate speaks in English, respond in English."

        greeting = f"Always start the conversation with a warm professional greeting, introducing yourself and welcoming {candidate_name} to their interview session for the {job_name} position at {company_name}."

        # Enhanced interview prompt integration
        if interview_prompt and interview_prompt.strip():
            interview_guidelines = f"\n\nIMPORTANT INTERVIEW GUIDELINES:\n{interview_prompt}\n\nYou MUST follow these specific guidelines throughout the entire interview. These guidelines are customized for the {job_name} position at {company_name} and should be strictly adhered to."
        else:
            interview_guidelines = f"\n\nConduct a professional interview for the {job_name} position, asking relevant questions about skills, experience, and qualifications."

        full_instructions = f"{base_instructions} {greeting}{interview_guidelines}"

        # Debug output to verify instructions
        print(f"[DEBUG] Agent instructions created:")
        print(f"[DEBUG] Instructions length: {len(full_instructions)} characters")
        print(f"[DEBUG] Instructions preview: {full_instructions[:200]}...")
        if interview_prompt:
            print(
                f"[DEBUG] Interview prompt included: YES ({len(interview_prompt)} chars)"
            )
        else:
            print(f"[DEBUG] Interview prompt included: NO")

        super().__init__(instructions=full_instructions, **kwargs)

    async def _on_agent_disconnected(self):
        """
        This is called when the agent is disconnected from the room.
        We can use this to signal the entrypoint to exit.
        """
        print("[INFO] Agent disconnected from the room.")
        # This is a good place to signal that the agent's work is done
        if hasattr(self, "end_event") and self.end_event:
            self.end_event.set()


async def entrypoint(ctx: JobContext):
    """
    Entrypoint for the agent.
    - Connects to the room
    - Extracts metadata
    - Creates a personalized agent
    - Starts the agent session
    - Manages recording and transcripts
    """
    openai_key = os.getenv("OPENAI_API_KEY")
    cred_path = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")

    # Event to signal when the agent is done
    end_event = asyncio.Event()

    # Connect to the room first to ensure metadata is available
    await ctx.connect()
    print("[INFO] Successfully connected to the room.")

    # Initialize defaults
    candidate_name = "the candidate"
    job_name = "this position"
    company_name = "our company"
    interview_prompt = ""

    print("[DEBUG] Attempting to extract metadata from connected room object...")

    # Metadata is now available in ctx.room.metadata after connect()
    if ctx.room.metadata:
        try:
            import json

            metadata = json.loads(ctx.room.metadata)
            candidate_name = metadata.get("candidateName", candidate_name)
            job_name = metadata.get("jobName", job_name)
            company_name = metadata.get("companyName", company_name)
            interview_prompt = metadata.get("interviewPrompt", interview_prompt)

            print(f"[DEBUG] Successfully extracted metadata from room object:")
            print(f"[DEBUG] - Candidate: {candidate_name}")
            print(f"[DEBUG] - Job: {job_name}")
            print(f"[DEBUG] - Company: {company_name}")
            print(
                f"[DEBUG] - Interview Prompt: {interview_prompt[:100]}..."
                if len(interview_prompt) > 100
                else f"[DEBUG] - Interview Prompt: {interview_prompt}"
            )

        except json.JSONDecodeError as e:
            print(f"[WARNING] Could not parse room metadata: {e}")
    else:
        print("[DEBUG] No room metadata found, using defaults.")

    # Print metadata tags for debugging and monitoring
    print("=" * 60)
    print("[METADATA] Agent Session Information")
    print("=" * 60)
    print(f"[META] Room Name: {ctx.room.name}")
    print(f"[META] Job ID: {ctx.job.id}")
    print(f"[META] Candidate Name: {candidate_name}")
    print(f"[META] Job Position: {job_name}")
    print(f"[META] Company: {company_name}")
    print(f"[META] Agent Port: {os.getenv('LIVEKIT_AGENT_PORT', '8006')}")
    print(f"[META] Google Credentials: {cred_path}")
    print(
        f"[META] OpenAI Key: {openai_key[:10]}...{openai_key[-5:] if openai_key else 'None'}"
    )
    print(f"[META] AWS Bucket: {os.getenv('AWS_BUCKET_NAME', 'Not Set')}")
    print(f"[META] AWS Region: {os.getenv('AWS_REGION', 'Not Set')}")
    print(f"[META] LiveKit URL: {os.getenv('LIVEKIT_URL', 'Not Set')}")
    print(f"[META] Supported Languages: en-US, ar-SA")
    print(f"[META] STT Model: latest_short")
    print(f"[META] Agent Class: NewAgent (Laila Al Noor)")
    print("=" * 60)

    # Initialize session with multilingual support (English primary, Arabic alternative)
    session = AgentSession(
        stt=GoogleSTT(
            credentials_file=cred_path,
            languages=["en-US", "ar-SA"],
            model="latest_short",
        ),
        llm=openai.LLM(api_key=openai_key),
        tts=ElevenLabsTTS(voice_id="21m00Tcm4TlvDq8ikWAM"),  # Rachel (female)
        vad=VAD.load(),  # Add VAD for better interruption handling
    )

    # Create agent with extracted metadata
    print(f"[DEBUG] About to create agent with extracted values:")
    print(f"[DEBUG] - Candidate: '{candidate_name}'")
    print(f"[DEBUG] - Job: '{job_name}'")
    print(f"[DEBUG] - Company: '{company_name}'")
    print(f"[DEBUG] - Interview Prompt Length: {len(interview_prompt)} characters")

    agent = NewAgent(
        candidate_name=candidate_name,
        job_name=job_name,
        company_name=company_name,
        interview_prompt=interview_prompt,
        end_event=end_event,  # Pass the event to the agent
    )

    print(f"[DEBUG] Agent created with:")
    print(f"[DEBUG] - Candidate: {candidate_name}")
    print(f"[DEBUG] - Job: {job_name}")
    print(f"[DEBUG] - Company: {company_name}")

    # Start session with the personalized agent
    await session.start(room=ctx.room, agent=agent)

    # The rest of the logic for recording and transcript saving remains
    # but the redundant metadata fetching is removed.
    print("=" * 60)
    print(
        "[INFO] Agent session started. Recording and transcript saving are configured."
    )
    print("=" * 60)

    # Create recordings directory if it doesn't exist
    recordings_dir = "recordings"
    os.makedirs(recordings_dir, exist_ok=True)

    # Set up recording with S3 storage (following documentation)
    try:
        req = api.RoomCompositeEgressRequest(
            room_name=ctx.room.name,
            audio_only=False,  # Record both audio and video
            file_outputs=[
                # S3 upload only (permissions updated)
                api.EncodedFileOutput(
                    file_type=api.EncodedFileType.MP4,
                    filepath=f"recordings/{ctx.room.name}_{ctx.job.id}.mp4",
                    s3=api.S3Upload(
                        bucket=os.getenv("AWS_BUCKET_NAME", "4wk-garage-media"),
                        region=os.getenv("AWS_REGION", "me-central-1"),
                        access_key=os.getenv("AWS_ACCESS_KEY_ID"),
                        secret=os.getenv("AWS_SECRET_ACCESS_KEY"),
                    ),
                )
            ],
        )

        lkapi = api.LiveKitAPI()
        res = await lkapi.egress.start_room_composite_egress(req)
        await lkapi.aclose()

        print(f"[INFO] Recording started: {res.egress_id}")
        print(
            f"[INFO] Recording will be saved to S3: s3://{os.getenv('AWS_BUCKET_NAME')}/recordings/{ctx.room.name}_{ctx.job.id}.mp4"
        )

        # Generate presigned URL for easy access
        try:
            s3_client = boto3.client(
                "s3",
                aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
                aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
                region_name=os.getenv("AWS_REGION"),
            )
            presigned_url = s3_client.generate_presigned_url(
                "get_object",
                Params={
                    "Bucket": os.getenv("AWS_BUCKET_NAME"),
                    "Key": f"recordings/{ctx.room.name}_{ctx.job.id}.mp4",
                },
                ExpiresIn=86400,  # 24 hours
            )
            print(f"[INFO] Recording access URL (24h): {presigned_url}")
        except NoCredentialsError:
            print("[WARNING] AWS credentials not found. Cannot generate presigned URL.")
        except Exception as url_error:
            print(f"[WARNING] Could not generate presigned URL: {url_error}")

    except Exception as e:
        print(f"[ERROR] Failed to start recording: {e}")
        print("[INFO] Continuing without recording...")

    # Add transcript recording when session ends
    async def save_transcript():
        current_date = ctx.job.id
        filename = f"{recordings_dir}/transcript_{ctx.room.name}_{current_date}.json"

        try:
            import json

            transcript_data = {
                "room_name": ctx.room.name,
                "job_id": ctx.job.id,
                "recording_url": (
                    presigned_url if "presigned_url" in locals() else "N/A"
                ),
                "session_history": (
                    session.history.to_dict()
                    if hasattr(session.history, "to_dict")
                    else str(session.history)
                ),
            }
            with open(filename, "w") as f:
                json.dump(transcript_data, f, indent=2)
            print(f"[INFO] Transcript saved to {filename}")
        except Exception as e:
            print(f"[ERROR] Failed to save transcript: {e}")

    ctx.add_shutdown_callback(save_transcript)
    print(f"[INFO] Agent running - transcript will be saved on session end.")

    # Wait for the agent to finish before exiting the entrypoint
    await end_event.wait()
    print("[INFO] Entrypoint finished.")


if __name__ == "__main__":
    port = int(os.getenv("LIVEKIT_AGENT_PORT", "8006"))
    options = agents.WorkerOptions(entrypoint_fnc=entrypoint, port=port)
    agents.cli.run_app(options)
