"""
LiveKit AI Interview Agent - Best Practices Implementation
=========================================================

A production-ready AI interview agent with:
- Multilingual support (Arabic/English)
- Dynamic personalization using room metadata
- Robust error handling and logging
- Clean separation of concerns
- Proper resource management
- Comprehensive recording and transcription

Author: GitHub Copilot
Version: 1.0.0
"""

import asyncio
import json
import logging
import os
from typing import Optional, Dict, Any
from datetime import datetime
from dotenv import load_dotenv
from livekit import agents, api
from livekit.agents import Agent, AgentSession, JobContext
from livekit.plugins import openai
from livekit.plugins.openai import STT as OpenAISTT
from livekit.plugins.elevenlabs import TTS as ElevenLabsTTS
from livekit.plugins.silero import VAD
import boto3
from botocore.exceptions import NoCredentialsError

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)


class InterviewAgent(Agent):
    """
    AI Interview Agent with dynamic personalization capabilities.

    Supports:
    - Multilingual conversations (Arabic/English)
    - Dynamic instruction generation based on room metadata
    - Personalized greetings and interview guidelines
    - Enhanced audio processing and debugging
    """

    def __init__(
        self,
        candidate_name: str = "the candidate",
        job_name: str = "this position",
        company_name: str = "our company",
        interview_prompt: str = "",
        **kwargs,
    ):
        """
        Initialize the interview agent with personalized instructions.

        Args:
            candidate_name: Name of the interview candidate
            job_name: Position being interviewed for
            company_name: Company conducting the interview
            interview_prompt: Specific interview guidelines and questions
            **kwargs: Additional arguments passed to parent Agent class
        """
        self.candidate_name = candidate_name
        self.job_name = job_name
        self.company_name = company_name
        self.interview_prompt = interview_prompt

        # Generate dynamic instructions
        instructions = self._build_instructions()

        # Log agent configuration
        logger.info(
            f"Creating InterviewAgent for {candidate_name} - {job_name} at {company_name}"
        )
        logger.info(f"Instructions length: {len(instructions)} characters")

        # Initialize parent Agent with generated instructions
        super().__init__(instructions=instructions, **kwargs)

    async def on_user_speech_committed(self, message):
        """Log when user speech is detected and processed."""
        logger.info(f"[AUDIO] User speech detected: '{message.content[:50]}...'")
        return await super().on_user_speech_committed(message)

    async def on_user_started_speaking(self):
        """Log when user starts speaking."""
        logger.info("[AUDIO] User started speaking - VAD triggered")
        return await super().on_user_started_speaking()

    async def on_user_stopped_speaking(self):
        """Log when user stops speaking."""
        logger.info("[AUDIO] User stopped speaking - processing speech")
        return await super().on_user_stopped_speaking()

    async def on_connected(self) -> None:
        """Called when agent connects to the room - send initial greeting."""
        logger.info("Agent connected to room - sending welcome message")

        # Create personalized welcome message
        if self.candidate_name == "the candidate":
            greeting = (
                f"مرحباً! أهلاً وسهلاً! Hello and welcome! I'm Laila Al Noor, your AI HR assistant "
                f"from {self.company_name}. I'm here to conduct your interview for the {self.job_name} position. "
                f"I can speak with you in both Arabic and English - feel free to use whichever language "
                f"you're most comfortable with. Shall we begin?"
            )
        else:
            greeting = (
                f"مرحباً {self.candidate_name}! أهلاً وسهلاً! Hello {self.candidate_name}, and welcome! "
                f"I'm Laila Al Noor, your AI HR assistant from {self.company_name}. "
                f"I'm delighted to be conducting your interview today for the {self.job_name} position. "
                f"I can communicate with you in both Arabic and English, so please feel free to use "
                f"whichever language you prefer. Are you ready to get started?"
            )

        # Send the welcome message
        await self.say(greeting)

        return await super().on_connected()

    def _build_instructions(self) -> str:
        """
        Build dynamic agent instructions based on metadata.

        Returns:
            Complete instruction string for the agent
        """
        # Base personality and capabilities
        base_instructions = (
            f"You are Laila Al Noor — a professional, empathetic AI HR assistant "
            f"representing {self.company_name}. You are fluent in both Arabic and English. "
            f"إذا تحدث المتقدم بالعربية، أجيبي بالعربية بطلاقة وود. "
            f"If the candidate speaks in English, respond naturally in English."
        )

        # Personalized greeting
        greeting = (
            f"Always begin with a warm, professional greeting. Introduce yourself as Laila "
            f"and welcome {self.candidate_name} to their interview for the {self.job_name} "
            f"position at {self.company_name}."
        )

        # Interview guidelines
        if self.interview_prompt and self.interview_prompt.strip():
            interview_section = (
                f"\n\nINTERVIEW PROTOCOL:\n{self.interview_prompt}\n\n"
                f"CRITICAL: Follow these guidelines precisely throughout the interview. "
                f"They are specifically designed for the {self.job_name} role at {self.company_name}. "
                f"Maintain professionalism while being conversational and supportive."
            )
        else:
            interview_section = (
                f"\n\nConduct a structured professional interview for the {self.job_name} position. "
                f"Focus on relevant skills, experience, and cultural fit. Ask thoughtful follow-up "
                f"questions and provide a positive candidate experience."
            )

        return f"{base_instructions}\n\n{greeting}{interview_section}"


class MetadataExtractor:
    """Utility class for extracting and validating room metadata."""

    @staticmethod
    def extract_from_room(room_metadata: Optional[str]) -> Dict[str, str]:
        """
        Extract metadata from room object.

        Args:
            room_metadata: JSON string containing room metadata

        Returns:
            Dictionary with extracted metadata or defaults
        """
        defaults = {
            "candidateName": "the candidate",
            "jobName": "this position",
            "companyName": "our company",
            "interviewPrompt": "",
        }

        if not room_metadata:
            logger.warning("No room metadata found, using defaults")
            return defaults

        try:
            metadata = json.loads(room_metadata)

            # Extract and validate metadata
            extracted = {
                "candidateName": metadata.get(
                    "candidateName", defaults["candidateName"]
                ),
                "jobName": metadata.get("jobName", defaults["jobName"]),
                "companyName": metadata.get("companyName", defaults["companyName"]),
                "interviewPrompt": metadata.get(
                    "interviewPrompt", defaults["interviewPrompt"]
                ),
            }

            logger.info(
                f"Successfully extracted metadata: {extracted['candidateName']} - {extracted['jobName']} at {extracted['companyName']}"
            )
            return extracted

        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse room metadata: {e}")
            return defaults


class RecordingManager:
    """Manages interview recording and S3 storage."""

    def __init__(self, ctx: JobContext):
        self.ctx = ctx
        self.recordings_dir = "recordings"
        os.makedirs(self.recordings_dir, exist_ok=True)

    async def start_recording(self) -> Optional[str]:
        """
        Start room recording with S3 storage.

        Returns:
            Presigned URL for accessing the recording, or None if failed
        """
        try:
            # Configure recording request
            req = api.RoomCompositeEgressRequest(
                room_name=self.ctx.room.name,
                audio_only=False,
                file_outputs=[
                    api.EncodedFileOutput(
                        file_type=api.EncodedFileType.MP4,
                        filepath=f"recordings/{self.ctx.room.name}_{self.ctx.job.id}.mp4",
                        s3=api.S3Upload(
                            bucket=os.getenv("AWS_BUCKET_NAME", "4wk-garage-media"),
                            region=os.getenv("AWS_REGION", "me-central-1"),
                            access_key=os.getenv("AWS_ACCESS_KEY_ID"),
                            secret=os.getenv("AWS_SECRET_ACCESS_KEY"),
                        ),
                    )
                ],
            )

            # Start recording
            lkapi = api.LiveKitAPI()
            res = await lkapi.egress.start_room_composite_egress(req)
            await lkapi.aclose()

            logger.info(f"Recording started: {res.egress_id}")

            # Generate presigned URL
            return self._generate_presigned_url()

        except Exception as e:
            logger.error(f"Failed to start recording: {e}")
            return None

    def _generate_presigned_url(self) -> Optional[str]:
        """Generate presigned URL for S3 access."""
        try:
            s3_client = boto3.client(
                "s3",
                aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
                aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
                region_name=os.getenv("AWS_REGION"),
            )

            url = s3_client.generate_presigned_url(
                "get_object",
                Params={
                    "Bucket": os.getenv("AWS_BUCKET_NAME"),
                    "Key": f"recordings/{self.ctx.room.name}_{self.ctx.job.id}.mp4",
                },
                ExpiresIn=86400,  # 24 hours
            )

            logger.info("Generated presigned URL for recording access")
            return url

        except (NoCredentialsError, Exception) as e:
            logger.warning(f"Could not generate presigned URL: {e}")
            return None

    def setup_transcript_saving(
        self, session: AgentSession, recording_url: Optional[str] = None
    ):
        """Setup automatic transcript saving on session end."""

        async def save_transcript():
            filename = f"{self.recordings_dir}/transcript_{self.ctx.room.name}_{self.ctx.job.id}.json"

            try:
                transcript_data = {
                    "room_name": self.ctx.room.name,
                    "job_id": self.ctx.job.id,
                    "timestamp": datetime.now().isoformat(),
                    "recording_url": recording_url or "N/A",
                    "session_history": (
                        session.history.to_dict()
                        if hasattr(session.history, "to_dict")
                        else str(session.history)
                    ),
                }

                with open(filename, "w", encoding="utf-8") as f:
                    json.dump(transcript_data, f, indent=2, ensure_ascii=False)

                logger.info(f"Transcript saved: {filename}")

            except Exception as e:
                logger.error(f"Failed to save transcript: {e}")

        self.ctx.add_shutdown_callback(save_transcript)


async def entrypoint(ctx: JobContext):
    """
    Main entrypoint for the interview agent.

    Flow:
    1. Connect to room and extract metadata
    2. Configure multilingual session (STT, LLM, TTS)
    3. Create personalized agent
    4. Start recording and session
    5. Wait for completion
    """
    logger.info(f"Starting interview agent for room: {ctx.room.name}")

    try:
        # Connect to room first
        await ctx.connect()
        logger.info("Successfully connected to room")

        # Extract metadata from room
        metadata = MetadataExtractor.extract_from_room(ctx.room.metadata)

        # Log session information
        logger.info("=" * 60)
        logger.info("INTERVIEW SESSION STARTED")
        logger.info("=" * 60)
        logger.info(f"Room: {ctx.room.name}")
        logger.info(f"Job ID: {ctx.job.id}")
        logger.info(f"Candidate: {metadata['candidateName']}")
        logger.info(f"Position: {metadata['jobName']}")
        logger.info(f"Company: {metadata['companyName']}")
        logger.info(
            f"Interview Guidelines: {'Yes' if metadata['interviewPrompt'] else 'No'}"
        )
        logger.info("=" * 60)

        # Validate required environment variables
        required_env_vars = ["OPENAI_API_KEY"]
        for var in required_env_vars:
            if not os.getenv(var):
                raise ValueError(f"Required environment variable {var} is not set")

        # Configure multilingual session with OpenAI Whisper for better performance
        session = AgentSession(
            stt=OpenAISTT(
                api_key=os.getenv("OPENAI_API_KEY"),
                model="whisper-1",  # OpenAI Whisper model
                # Removed language parameter - Whisper auto-detects language by default
            ),
            llm=openai.LLM(api_key=os.getenv("OPENAI_API_KEY")),
            tts=ElevenLabsTTS(
                voice_id="21m00Tcm4TlvDq8ikWAM",  # Rachel voice
            ),
            # VAD with default settings - custom parameters not supported in this version
            vad=VAD.load(),
        )

        # Create personalized agent
        agent = InterviewAgent(
            candidate_name=metadata["candidateName"],
            job_name=metadata["jobName"],
            company_name=metadata["companyName"],
            interview_prompt=metadata["interviewPrompt"],
        )

        # Setup recording
        recording_manager = RecordingManager(ctx)
        recording_url = await recording_manager.start_recording()
        recording_manager.setup_transcript_saving(session, recording_url)

        # Start agent session
        await session.start(room=ctx.room, agent=agent)
        logger.info("Agent session started successfully")

        # Create completion event and wait
        completion_event = asyncio.Event()

        # Setup graceful shutdown
        async def on_shutdown():
            logger.info("Session ending - cleaning up resources")
            completion_event.set()

        ctx.add_shutdown_callback(on_shutdown)

        # Wait for session completion
        await completion_event.wait()
        logger.info("Interview session completed")

    except Exception as e:
        logger.error(f"Fatal error in interview agent: {e}")
        raise


if __name__ == "__main__":
    # Configure worker
    port = int(os.getenv("LIVEKIT_AGENT_PORT", "8006"))
    options = agents.WorkerOptions(
        entrypoint_fnc=entrypoint,
        port=port,
    )

    logger.info(f"Starting LiveKit agent on port {port}")
    agents.cli.run_app(options)
