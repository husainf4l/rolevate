#!/usr/bin/env python3

import logging
import os
import asyncio
from typing import Optional
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Configure logging - suppress asyncio warnings
logging.getLogger('asyncio').setLevel(logging.CRITICAL)

from livekit.agents import (
    Agent,
    AgentSession,
    JobContext,
    JobProcess,
    RoomInputOptions,
    WorkerOptions,
    cli,
)
from livekit.agents.llm import function_tool
from livekit.plugins import openai, elevenlabs, soniox, silero

from service.application_service import get_application_data
from service.recording_service import RecordingService
from service.interview_service import InterviewService

# Configure logging
logger = logging.getLogger("rolevate-agent")
logger.setLevel(logging.INFO)


class InterviewAssistant(Agent):
    """AI Interview Assistant for Rolevate"""
    
    def __init__(self, instructions: str, application_data: dict) -> None:
        super().__init__(instructions=instructions)
        self.application_data = application_data
    
    @function_tool
    async def get_application_info(self) -> str:
        """Get detailed information about the job position and company when the candidate asks.
        Use this when the candidate wants to know more about:
        - Job title, description, or salary
        - Company name, description, contact information
        """
        job = self.application_data.get("job", {})
        company = job.get("company", {})
        
        info = f"""Job Information:
- Title: {job.get('title', 'N/A')}
- Description: {job.get('description', 'N/A')}
- Salary: {job.get('salary', 'N/A')}

Company Information:
- Name: {company.get('name', 'N/A')}
- Description: {company.get('description', 'N/A')}
- Phone: {company.get('phone', 'N/A')}
- Email: {company.get('email', 'N/A')}"""
        
        return info


def prewarm(proc: JobProcess):
    """Prewarm models to reduce latency"""
    proc.userdata["vad"] = silero.VAD.load()
    logger.info("VAD model prewarmed")


async def entrypoint(ctx: JobContext):
    """Main entry point for the LiveKit agent."""
    
    logger.info(f"Connecting to room {ctx.room.name}")
    
    # Extract application_id from room name (format: interview-{application_id}-{suffix})
    parts = ctx.room.name.split('-')
    if len(parts) >= 6:
        application_id = '-'.join(parts[1:6])
    else:
        logger.error(f"Invalid room name format: {ctx.room.name}")
        return
    
    # Fetch application data
    application_data = get_application_data(application_id)
    if not application_data:
        logger.error("Failed to fetch application data")
        return
    
    # Initialize services
    recording_service = RecordingService()
    interview_service = InterviewService()
    recording_id = None
    interview_id = None
    
    try:
        # 1. Create interview record
        candidate_id = application_data.get("candidate", {}).get("id")
        if candidate_id:
            interview_id = interview_service.create_interview(
                application_id=application_id,
                interviewer_id=candidate_id,
                room_id=ctx.room.name
            )
            if interview_id:
                logger.info(f"Interview created: {interview_id}")
        
        # 2. Start recording
        recording_id = await recording_service.start_recording(ctx.room.name, application_id)
        if recording_id:
            logger.info(f"Recording started: {recording_id}")
        
        # 3. Build interview instructions
        interview_prompt = application_data.get("job", {}).get("interviewPrompt", "")
        interview_language = application_data.get("job", {}).get("interviewLanguage", "English")
        candidate_name = application_data.get("candidate", {}).get("name", "Candidate")
        company_name = application_data.get("job", {}).get("company", {}).get("name", "the company")
        job_title = application_data.get("job", {}).get("title", "this position")
        cv_analysis = application_data.get("cvAnalysisResults", "")
        
        # Remove visual assessment instructions (agent is audio-only)
        visual_keywords = [
            "الكاميرا", "إضاءة", "الخلفية", "المظهر", "الملابس", "camera", "lighting", 
            "background", "appearance", "posture", "eye contact", "facial expressions",
            "body language", "visual", "observe", "see", "watch", "look"
        ]
        
        # Clean the prompt
        prompt_lines = interview_prompt.split('\n')
        cleaned_lines = []
        for line in prompt_lines:
            # Skip lines that contain visual assessment keywords
            if not any(keyword in line.lower() for keyword in visual_keywords):
                cleaned_lines.append(line)
        
        interview_prompt = '\n'.join(cleaned_lines)
        
        # Add audio-only note
        audio_note = "\n\nIMPORTANT: This is an AUDIO-ONLY interview. You cannot see the candidate. Focus only on their voice responses, tone, and content. Do not mention or ask about visual elements like lighting, camera, background, or appearance."
        
        instructions = f"""Candidate Name: {candidate_name}
Company Name: {company_name}
Job Title: {job_title}

{interview_prompt}{audio_note}

CV Analysis:
{cv_analysis}

Note: You have access to get_application_info() tool for company/job details."""
        
        # 4. Create agent session
        session = AgentSession(
            stt=soniox.STT(params=soniox.STTOptions(language_hints=["ar", "en"])),
            llm=openai.LLM(model="gpt-4o-mini"),
            tts=elevenlabs.TTS(voice_id="u0TsaWvt0v8migutHM3M"),
            vad=ctx.proc.userdata["vad"],
        )
        
        # 5. Setup transcript capture (only if interview was created)
        if interview_id:
            @session.on("user_speech_committed")
            def on_user_speech(message):
                if message.content:
                    asyncio.create_task(
                        save_transcript(interview_service, interview_id, message.content, candidate_name, interview_language)
                    )
            
            @session.on("agent_speech_committed")
            def on_agent_speech(message):
                if message.content:
                    asyncio.create_task(
                        save_transcript(interview_service, interview_id, message.content, "Laila Al Noor", interview_language)
                    )
        
        # 6. Start the agent
        await session.start(
            agent=InterviewAssistant(instructions=instructions, application_data=application_data),
            room=ctx.room,
            room_input_options=RoomInputOptions(),
        )
        
        logger.info("Agent started - sending greeting")
        
        # 7. Agent greets first
        greeting_lang = "Arabic" if interview_language.lower() == "arabic" else "English"
        if greeting_lang == "Arabic":
            greeting = f"مرحباً، أنا ليلى النور من {company_name}. أهلاً بك {candidate_name}، هل أنت جاهز لبدء المقابلة؟"
        else:
            greeting = f"Hello, I'm Laila Al Noor from {company_name}. Welcome {candidate_name}, are you ready to begin the interview?"
        
        await session.say(greeting, allow_interruptions=True)
        
        logger.info("Greeting sent - waiting for candidate response")
        
        # 8. Wait for session to end
        await session.aclose()
        
    except Exception as e:
        logger.error(f"Error in interview session: {e}", exc_info=True)
    finally:
        # 8. Cleanup: stop recording and complete interview
        await cleanup_interview(recording_service, recording_id, interview_service, interview_id)


async def save_transcript(
    interview_service: InterviewService,
    interview_id: str,
    content: str,
    speaker: str,
    language: str
):
    """Save transcript entry"""
    try:
        lang_code = "ar" if language and language.lower() == "arabic" else "en"
        interview_service.add_transcript(
            interview_id=interview_id,
            content=content,
            speaker=speaker,
            language=lang_code
        )
    except Exception as e:
        logger.error(f"Failed to save transcript: {e}")


async def cleanup_interview(
    recording_service: RecordingService,
    recording_id: Optional[str],
    interview_service: InterviewService,
    interview_id: Optional[str]
):
    """Stop recording and complete interview"""
    recording_url = None
    
    # Stop recording if active
    if recording_id:
        logger.info("Stopping recording...")
        try:
            s3_path = await recording_service.stop_recording()
            
            # Validate S3 path before using it
            if s3_path and not s3_path.endswith('/') and 'interviews/' in s3_path:
                recording_url = s3_path
                logger.info(f"Recording saved: {recording_url}")
            else:
                logger.warning("Recording too short or failed to upload")
        except Exception as e:
            logger.error(f"Error stopping recording: {e}")
    
    # Complete interview record if exists
    if interview_id:
        logger.info(f"Completing interview: {interview_id}")
        try:
            interview_service.complete_interview(
                interview_id=interview_id,
                recording_url=recording_url
            )
            logger.info("Interview completed successfully")
        except Exception as e:
            logger.error(f"Error completing interview: {e}")


if __name__ == "__main__":
    cli.run_app(
        WorkerOptions(
            entrypoint_fnc=entrypoint,
            prewarm_fnc=prewarm,
        )
    )