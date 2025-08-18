"""
Agent10 Main Entry Point - Clean Implementation with Proper LiveKit Event Handling

This module provides the main entrypoint for Agent10, a LiveKit-based interview agent
that integrates with backend APIs for prompt management and transcript saving.
"""

import asyncio
import logging
import logging.config
import os
import sys
import time
from typing import Dict, Any

import aiohttp
from dotenv import load_dotenv
from livekit import agents
from livekit.agents import JobContext, AgentSession, RoomInputOptions, RoomOutputOptions
from livekit.plugins import google, silero

# Add the current directory to Python path for imports
current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, current_dir)

# Now we can import from local modules
from agent import InterviewAgent
from utils.metadata import MetadataExtractor
from utils.recording import RecordingManager
from utils.transcript_saver import create_transcript_saver

# Load environment variables from parent directory
load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))


# Configure production logging
def setup_logging():
    """Setup production-ready logging configuration"""
    log_dir = os.path.join(os.path.dirname(__file__), "..", "logs")
    os.makedirs(log_dir, exist_ok=True)

    LOGGING_CONFIG = {
        "version": 1,
        "disable_existing_loggers": False,
        "formatters": {
            "detailed": {
                "format": "%(asctime)s - %(name)s - %(levelname)s - %(funcName)s:%(lineno)d - %(message)s"
            },
            "simple": {"format": "%(levelname)s - %(message)s"},
        },
        "handlers": {
            "console": {
                "class": "logging.StreamHandler",
                "level": "INFO",
                "formatter": "detailed",
                "stream": "ext://sys.stdout",
            },
            "file": {
                "class": "logging.handlers.RotatingFileHandler",
                "level": "DEBUG",
                "formatter": "detailed",
                "filename": os.path.join(log_dir, "agent11-debug.log"),
                "maxBytes": 10485760,  # 10MB
                "backupCount": 5,
            },
            "error_file": {
                "class": "logging.handlers.RotatingFileHandler",
                "level": "ERROR",
                "formatter": "detailed",
                "filename": os.path.join(log_dir, "agent11-errors.log"),
                "maxBytes": 10485760,  # 10MB
                "backupCount": 3,
            },
        },
        "loggers": {
            "": {"level": "INFO", "handlers": ["console", "file", "error_file"]}
        },
    }

    logging.config.dictConfig(LOGGING_CONFIG)


# Setup logging
setup_logging()
logger = logging.getLogger("agent11-main")


async def save_video_to_backend(
    room_id: str, video_url: str, metadata: Dict[str, Any]
) -> bool:
    """Save video URL to backend."""
    backend_url = os.getenv("BACKEND_URL", "http://localhost:4005/api")
    endpoint = f"{backend_url}/interviews/room/{room_id}/save-video"

    payload = {
        "videoLink": video_url,
        "roomId": room_id,
    }

    # Add metadata if available
    if metadata:
        if "jobId" in metadata:
            payload["jobId"] = metadata["jobId"]
        if "candidateId" in metadata:
            payload["candidateId"] = metadata["candidateId"]
        if "companyId" in metadata:
            payload["companyId"] = metadata["companyId"]

    logger.info(f"Saving video URL to backend: {endpoint}")

    try:
        async with aiohttp.ClientSession() as session:
            async with session.post(endpoint, json=payload) as response:
                if response.status in [200, 201]:
                    logger.info("Successfully saved video URL to backend")
                    return True
                else:
                    response_text = await response.text()
                    logger.error(
                        f"Failed to save video URL. Status: {response.status}, Response: {response_text}"
                    )
                    return False
    except Exception as e:
        logger.error(f"Error saving video URL: {e}")
        return False


async def entrypoint(ctx: JobContext):
    """
    Main entrypoint for agent10 using proper LiveKit event handling patterns.
    """
    try:
        logger.info("🚀 Starting Agent10...")

        # Connection with retry logic
        max_retries = 3
        for attempt in range(max_retries):
            try:
                await ctx.connect()
                logger.info(f"✅ Connected to LiveKit on attempt {attempt + 1}")
                break
            except Exception as e:
                if attempt == max_retries - 1:
                    logger.error(f"❌ Failed to connect after {max_retries} attempts")
                    raise
                logger.warning(f"Connection attempt {attempt + 1} failed: {e}")
                await asyncio.sleep(2**attempt)  # Exponential backoff

        # Extract metadata
        metadata = MetadataExtractor.extract_from_room(ctx.room.metadata, ctx.room.name)
        room_id = ctx.room.name

        # DEBUG: Log the raw room metadata to see what we're getting
        logger.info(f"🔍 RAW ROOM METADATA: {ctx.room.metadata}")
        logger.info(f"🔍 EXTRACTED METADATA: {metadata}")

        # Log session info
        logger.info("=" * 50)
        logger.info("🎯 AGENT10 SESSION INFO")
        logger.info(f"Room ID: {room_id}")
        logger.info(f"Job ID: {ctx.job.id}")
        logger.info(f"Candidate: {metadata['candidateName']}")
        logger.info(f"Job: {metadata['jobName']}")
        logger.info(f"Company: {metadata['companyName']}")
        logger.info(f"Language: {metadata['interviewLanguage']}")
        logger.info(
            f"Backend Prompt: {'Yes' if metadata['interviewPrompt'] else 'No (using fallback)'}"
        )
        if metadata["interviewPrompt"]:
            logger.info(f"Prompt Preview: {metadata['interviewPrompt'][:100]}...")
        logger.info("=" * 50)

        # Validate environment variables
        required_vars = [
            "GOOGLE_API_KEY",
            "LIVEKIT_URL",
            "LIVEKIT_API_KEY",
            "LIVEKIT_API_SECRET",
        ]
        missing_vars = [var for var in required_vars if not os.getenv(var)]
        if missing_vars:
            raise ValueError(
                f"Required environment variables missing: {', '.join(missing_vars)}"
            )

        logger.info("✅ All required environment variables validated")

        # Setup recording with error handling
        recording_manager = RecordingManager(ctx)
        recording_url = None
        try:
            recording_url = await asyncio.wait_for(
                recording_manager.start_recording(), timeout=15.0
            )
            logger.info(f"✅ Recording started: {recording_url}")
        except asyncio.TimeoutError:
            logger.error("❌ Recording start timed out")
            # Continue without recording - decide based on requirements
        except Exception as e:
            logger.error(f"❌ Failed to start recording: {e}")
            # Continue without recording - could be made fatal if required

        # Setup transcript saver with error handling
        transcript_saver = None
        try:
            transcript_saver = create_transcript_saver(ctx.room.name)
            logger.info(f"✅ Transcript saver initialized for room: {ctx.room.name}")
        except Exception as e:
            logger.error(f"❌ Failed to initialize transcript saver: {e}")
            # Continue without transcript saving or fail based on requirements

        # Save video URL to backend
        video_url_to_save = recording_url
        if not recording_url or "amazonaws.com" in str(recording_url):
            bucket_name = os.getenv("AWS_BUCKET_NAME", "4wk-garage-media")
            region = os.getenv("AWS_REGION", "me-central-1")
            video_url_to_save = f"https://{bucket_name}.s3.{region}.amazonaws.com/recordings/{ctx.room.name}_{ctx.job.id}.mp4"

        if video_url_to_save:
            success = await save_video_to_backend(
                ctx.room.name, video_url_to_save, metadata
            )
            if success:
                logger.info("Video URL saved to backend")
            else:
                logger.warning("Failed to save video URL to backend")

        # Create agent with real-time model
        agent = InterviewAgent(
            ctx=ctx,
            candidate_name=metadata["candidateName"],
            job_name=metadata["jobName"],
            company_name=metadata["companyName"],
            interview_prompt=metadata["interviewPrompt"],
            cv_summary=metadata["cv_summary"],
            cv_analysis=metadata["cv_analysis"],
            interview_language=metadata["interviewLanguage"],
            transcript_saver=transcript_saver,
            metadata=metadata,
        )

        logger.info("✅ Agent created successfully")

        # Configure session for real-time processing
        session = AgentSession()

        # Start session with agent using real-time model
        logger.info("🎬 Starting agent session...")
        await session.start(
            agent=agent,
            room=ctx.room,
            room_input_options=RoomInputOptions(video_enabled=True),
            room_output_options=RoomOutputOptions(transcription_enabled=True),
        )

        logger.info("✅ Agent12 session active and ready")

        # Setup recording transcript saving (only for session history, not local files)
        if recording_url:
            try:
                recording_manager.setup_transcript_saving(session, recording_url)
                logger.info("✅ Recording transcript saving configured")
            except Exception as e:
                logger.error(f"❌ Failed to setup recording transcript saving: {e}")
        else:
            logger.warning(
                "⚠️ No recording URL available, skipping transcript saving setup"
            )

        # Create completion event and wait
        completion_event = asyncio.Event()

        # Setup shutdown with timeout
        async def on_shutdown():
            logger.info("🔄 Session ending - cleaning up...")

            # Save any remaining transcripts with timeout
            if transcript_saver:
                try:
                    await asyncio.wait_for(transcript_saver.cleanup(), timeout=5.0)
                    logger.info("✅ Transcript cleanup completed")
                except asyncio.TimeoutError:
                    logger.warning("⚠️ Transcript cleanup timed out")
                except Exception as e:
                    logger.error(
                        f"❌ Error during transcript cleanup: {e}", exc_info=True
                    )

            # Save video URL again as backup with timeout
            if video_url_to_save:
                try:
                    await asyncio.wait_for(
                        save_video_to_backend(
                            ctx.room.name, video_url_to_save, metadata
                        ),
                        timeout=10.0,
                    )
                    logger.info("✅ Video URL backup save completed")
                except asyncio.TimeoutError:
                    logger.warning("⚠️ Video URL backup save timed out")
                except Exception as e:
                    logger.error(
                        f"❌ Error saving video URL backup: {e}", exc_info=True
                    )

            completion_event.set()
            logger.info("✅ Cleanup completed, session ending")

        ctx.add_shutdown_callback(on_shutdown)

        # Wait for completion with timeout
        try:
            await asyncio.wait_for(completion_event.wait(), timeout=30.0)
            logger.info("✅ Agent11 session completed successfully")
        except asyncio.TimeoutError:
            logger.warning("⚠️ Session completion timed out, forcing exit")
            logger.info("✅ Agent11 session completed (timeout)")

    except Exception as e:
        logger.error(f"❌ Critical error in Agent11: {e}", exc_info=True)
        raise


if __name__ == "__main__":
    # Configure worker
    port = int(
        os.getenv("LIVEKIT_AGENT_PORT", "8008")
    )  # Changed default to match PM2 config
    options = agents.WorkerOptions(
        entrypoint_fnc=entrypoint,
        port=port,
    )

    logger.info(f"🚀 Starting Agent12 with Google Real-time model on port {port}")
    agents.cli.run_app(options)
