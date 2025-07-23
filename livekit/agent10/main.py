"""
Agent10 Main Entry Point - Clean Implementation with Proper LiveKit Event Handling

This module provides the main entrypoint for Agent10, a LiveKit-based interview agent
that integrates with backend APIs for prompt management and transcript saving.
"""

import asyncio
import logging
import os
import sys
import time
from typing import Dict, Any

import aiohttp
from dotenv import load_dotenv
from livekit import agents
from livekit.agents import JobContext, AgentSession
from livekit.plugins import openai, google
from livekit.plugins.openai import STT as OpenAISTT
from livekit.plugins.elevenlabs import TTS as ElevenLabsTTS
from livekit.plugins.silero import VAD

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

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("agent10-main")


async def save_video_to_backend(
    room_id: str, video_url: str, metadata: Dict[str, Any]
) -> bool:
    """Save video URL to backend."""
    backend_url = os.getenv("BACKEND_URL", "http://localhost:4005")
    endpoint = f"{backend_url}/api/interviews/room/{room_id}/save-video"

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
        await ctx.connect()

        # Extract metadata
        metadata = MetadataExtractor.extract_from_room(ctx.room.metadata, ctx.room.name)
        room_id = ctx.room.name

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
        required_vars = ["OPENAI_API_KEY", "GOOGLE_API_KEY"]
        for var in required_vars:
            if not os.getenv(var):
                raise ValueError(f"Required environment variable {var} is not set")

        # Configure session with clean setup
        session = AgentSession(
            stt=OpenAISTT(
                api_key=os.getenv("OPENAI_API_KEY"),
                model="whisper-1",
            ),
            llm=google.LLM(
                model="gemini-1.5-pro",
                api_key=os.getenv("GOOGLE_API_KEY"),
            ),
            tts=ElevenLabsTTS(
                voice_id="21m00Tcm4TlvDq8ikWAM",  # Rachel voice
            ),
            vad=VAD.load(
                activation_threshold=0.6,
                min_silence_duration=0.8,
                min_speech_duration=0.1,
                prefix_padding_duration=0.3,
            ),
        )

        # Setup recording
        recording_manager = RecordingManager(ctx)
        recording_url = await recording_manager.start_recording()
        logger.info(f"Recording started: {recording_url}")

        # Setup transcript saver
        transcript_saver = create_transcript_saver(ctx.room.name)
        logger.info(f"✅ Transcript saver initialized for room: {ctx.room.name}")

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

        # Create agent
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

        # Set up proper LiveKit event handlers BEFORE starting session
        @session.on("conversation_item_added")
        def on_conversation_item_added(event):
            """Handle conversation items being added - official LiveKit pattern"""
            try:
                item = event.item
                if item.type == "message":
                    logger.info(
                        f"📝 Conversation item: {item.role} - {item.text_content[:100]}..."
                    )

                    # Save transcript based on role
                    if item.role == "user":
                        transcript_saver.save_user_speech(
                            content=item.text_content,
                            start_time=time.time(),
                            end_time=time.time(),
                            confidence=None,
                            language=metadata.get("interviewLanguage", "english"),
                            speaker_name=metadata.get("candidateName", "Candidate"),
                        )
                        logger.info("✅ User transcript saved")

                    elif item.role == "assistant":
                        transcript_saver.save_agent_speech(
                            content=item.text_content,
                            start_time=time.time(),
                            end_time=time.time(),
                            language=metadata.get("interviewLanguage", "english"),
                        )
                        logger.info("✅ Agent transcript saved")

            except Exception as e:
                logger.error(f"Error handling conversation item: {e}")

        @session.on("user_input_transcribed")
        def on_user_input_transcribed(event):
            """Handle real-time user input transcription"""
            try:
                if event.is_final:
                    logger.info(f"🎤 User transcript: {event.transcript[:100]}...")
                    # Note: conversation_item_added will handle the actual saving
            except Exception as e:
                logger.error(f"Error handling user input: {e}")

        @session.on("close")
        def on_session_close(event):
            """Handle session close"""
            try:
                logger.info(
                    f"🔚 Session closed: {event.error if event.error else 'normal'}"
                )

                # Log final statistics
                if hasattr(session, "history") and session.history:
                    total_items = len(session.history.items)
                    user_msgs = sum(
                        1
                        for item in session.history.items
                        if item.type == "message" and item.role == "user"
                    )
                    agent_msgs = sum(
                        1
                        for item in session.history.items
                        if item.type == "message" and item.role == "assistant"
                    )
                    logger.info(
                        f"📊 Final stats: {total_items} total, {user_msgs} user, {agent_msgs} agent"
                    )

            except Exception as e:
                logger.error(f"Error in session close handler: {e}")

        # Test transcript saving
        logger.info("🧪 Testing transcript saving...")
        transcript_saver.save_system_message(
            "Agent10 session started with proper LiveKit event handlers",
            "SESSION_START",
        )

        # Start session with agent
        logger.info("🎬 Starting agent session...")
        await session.start(agent=agent, room=ctx.room)

        # Generate initial greeting
        await session.generate_reply(
            instructions="Greet the user and start the interview"
        )

        logger.info("✅ Agent10 session active and ready")

        # Setup recording transcript saving (only for session history, not local files)
        recording_manager.setup_transcript_saving(session, recording_url)

        # Create completion event and wait
        completion_event = asyncio.Event()

        # Setup shutdown with timeout
        async def on_shutdown():
            logger.info("Session ending - cleaning up")

            try:
                # Save any remaining transcripts with timeout
                await asyncio.wait_for(transcript_saver.cleanup(), timeout=5.0)
                logger.info("Transcript cleanup completed")
            except asyncio.TimeoutError:
                logger.warning("Transcript cleanup timed out")
            except Exception as e:
                logger.error(f"Error during transcript cleanup: {e}")

            # Save video URL again as backup with timeout
            if video_url_to_save:
                try:
                    await asyncio.wait_for(
                        save_video_to_backend(
                            ctx.room.name, video_url_to_save, metadata
                        ),
                        timeout=10.0,
                    )
                    logger.info("Video URL backup save completed")
                except asyncio.TimeoutError:
                    logger.warning("Video URL backup save timed out")
                except Exception as e:
                    logger.error(f"Error saving video URL backup: {e}")

            completion_event.set()
            logger.info("Cleanup completed, session ending")

        ctx.add_shutdown_callback(on_shutdown)

        # Wait for completion with timeout
        try:
            await asyncio.wait_for(completion_event.wait(), timeout=30.0)
            logger.info("Agent10 session completed")
        except asyncio.TimeoutError:
            logger.warning("Session completion timed out, forcing exit")
            logger.info("Agent10 session completed (timeout)")

    except Exception as e:
        logger.error(f"❌ Error in Agent10: {e}")
        raise


if __name__ == "__main__":
    # Configure worker
    port = int(os.getenv("LIVEKIT_AGENT_PORT", "8010"))
    options = agents.WorkerOptions(
        entrypoint_fnc=entrypoint,
        port=port,
    )

    logger.info(f"Starting Agent10 on port {port}")
    agents.cli.run_app(options)
