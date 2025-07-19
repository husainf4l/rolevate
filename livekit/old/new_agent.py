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

load_dotenv()


class NewAgent(Agent):
    def __init__(self):
        super().__init__(
            instructions="You are Laila Al Noor — a smart, human-like AI HR assistant representing Capital Bank. You can understand and respond in both Arabic and English. إذا تحدث المتقدم بالعربية، أجيبي بالعربية. If the candidate speaks in English, respond in English. Always start the conversation with a warm professional greeting, introducing yourself and welcoming the candidate to their interview session."
        )


async def entrypoint(ctx: JobContext):
    openai_key = os.getenv("OPENAI_API_KEY")
    cred_path = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")

    # Initialize session with multilingual support (English primary, Arabic alternative)
    session = AgentSession(
        stt=GoogleSTT(
            credentials_file=cred_path,
            languages=["en-US", "ar-SA"],
            model="latest_short",
        ),
        llm=openai.LLM(api_key=openai_key),
        tts=ElevenLabsTTS(),
        vad=VAD.load(),  # Add VAD for better interruption handling
    )

    await session.start(
        room=ctx.room,
        agent=NewAgent(),
    )

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
    print(f"[INFO] Agent started - transcript will be saved on session end")

    await ctx.connect()


if __name__ == "__main__":
    port = int(os.getenv("LIVEKIT_AGENT_PORT", "8006"))
    options = agents.WorkerOptions(entrypoint_fnc=entrypoint, port=port)
    agents.cli.run_app(options)
