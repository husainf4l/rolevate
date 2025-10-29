"""
Interview Orchestrator - Manages the complete interview workflow.
Separates business logic from LiveKit agent implementation.
"""

import asyncio
import logging
from typing import Optional, List
from datetime import datetime

from livekit.agents import AgentSession
from livekit.plugins import openai, elevenlabs, soniox, silero

from service.application_service import ApplicationService
from service.interview_service import InterviewService
from models import ApplicationData
from exceptions import RolevateException
from utils.room_parser import parse_application_id_from_room

logger = logging.getLogger(__name__)


class InterviewOrchestrator:
    """
    Orchestrates the complete interview workflow from start to finish.
    Handles service initialization, interview lifecycle, and cleanup.
    """
    
    def __init__(self, room_name: str, vad_model):
        """
        Initialize the orchestrator with room context.
        
        Args:
            room_name: LiveKit room name
            vad_model: Pre-warmed VAD model
        """
        self.room_name = room_name
        self.vad_model = vad_model
        
        # Extract application ID from room name
        self.application_id = parse_application_id_from_room(room_name)
        
        # Initialize services
        self.application_service = ApplicationService()
        self.interview_service = InterviewService()
        
        # State tracking
        self.interview_id: Optional[str] = None
        self.application_data: Optional[ApplicationData] = None
        self.transcript_tasks: List[asyncio.Task] = []
        
        logger.info(
            "InterviewOrchestrator initialized",
            extra={
                "room_name": room_name,
                "application_id": self.application_id
            }
        )
    
    async def setup(self) -> bool:
        """
        Setup phase: Fetch data and create interview record.
        
        Returns:
            True if setup successful, False otherwise
        """
        try:
            # 1. Fetch application data
            logger.info(
                "Fetching application data",
                extra={"application_id": self.application_id}
            )
            self.application_data = await self.application_service.get_application_data(
                self.application_id
            )
            
            if not self.application_data:
                logger.error("Failed to fetch application data")
                return False
            
            # 2. Create interview record
            candidate_id = self.application_data.candidate.id
            self.interview_id = await self.interview_service.create_interview(
                application_id=self.application_id,
                interviewer_id=candidate_id,
                room_id=self.room_name
            )
            
            if self.interview_id:
                logger.info(
                    "Interview created",
                    extra={"interview_id": self.interview_id}
                )
            
            return True
            
        except RolevateException as e:
            logger.error(
                f"Setup failed: {e.message}",
                extra={"details": e.details},
                exc_info=True
            )
            return False
        except Exception as e:
            logger.error(f"Unexpected setup error: {e}", exc_info=True)
            return False
    
    def build_instructions(self) -> str:
        """
        Build interview instructions for the AI agent.
        
        Returns:
            Formatted instruction string
        """
        if not self.application_data:
            return ""
        
        job = self.application_data.job
        candidate = self.application_data.candidate
        
        interview_prompt = job.interview_prompt or ""
        interview_language = job.interview_language or "English"
        candidate_name = candidate.name or "Candidate"
        company_name = job.company.name or "the company"
        job_title = job.title or "this position"
        cv_analysis = self.application_data.cv_analysis_results or ""
        
        # Remove visual assessment instructions (audio-only interview)
        visual_keywords = [
            "الكاميرا", "إضاءة", "الخلفية", "المظهر", "الملابس", 
            "camera", "lighting", "background", "appearance", "posture",
            "eye contact", "facial expressions", "body language", 
            "visual", "observe", "see", "watch", "look"
        ]
        
        # Clean the prompt
        prompt_lines = interview_prompt.split('\n')
        cleaned_lines = [
            line for line in prompt_lines
            if not any(keyword in line.lower() for keyword in visual_keywords)
        ]
        interview_prompt = '\n'.join(cleaned_lines)
        
        # Add audio-only note
        audio_note = (
            "\n\nIMPORTANT: This is an AUDIO-ONLY interview. "
            "You cannot see the candidate. Focus only on their voice responses, "
            "tone, and content. Do not mention or ask about visual elements."
        )
        
        # Normalize language name for clearer instruction
        is_arabic = any(word in interview_language.lower() for word in ["arabic", "عربي", "ar"])
        language_display = "Arabic (العربية)" if is_arabic else "English"
        
        # Add explicit language instruction
        language_instruction = (
            f"\n\n🔴 CRITICAL LANGUAGE REQUIREMENT 🔴\n"
            f"You MUST conduct this ENTIRE interview EXCLUSIVELY in {language_display}.\n"
            f"- Every single response must be in {language_display}\n"
            f"- Every question must be in {language_display}\n"
            f"- ALL follow-ups must be in {language_display}\n"
            f"- NEVER switch to another language\n"
            f"- If the candidate speaks another language, politely ask them to continue in {language_display}\n"
            f"This is a strict requirement. Do not deviate from {language_display} under any circumstances."
        )
        
        # Get greeting for starting the interview
        greeting = self.get_greeting()
        
        instructions = f"""You are Laila Al Noor, an AI interviewer for {company_name}.

CANDIDATE: {candidate_name}
POSITION: {job_title}
COMPANY: {company_name}

{interview_prompt}{audio_note}{language_instruction}

CV SUMMARY:
{cv_analysis}

CRITICAL - START IMMEDIATELY:
1. Begin with this greeting: "{greeting}"
2. Then ask your first interview question
3. Do NOT wait for candidate to speak first - YOU lead the conversation
4. You can use get_application_info() tool for company/job details

IMPORTANT - CONVERSATION FLOW:
- Listen to the FULL answer/response from the candidate
- Do NOT interrupt or jump to next question after just hearing "okay" or "تمام" (tamam)
- Common filler words are: "okay", "ok", "sure", "yes", "yeah", "تمام", "حسناً", "تمام التمام"
- These are just acknowledgments - wait for the actual answer/explanation
- Only move to the next question when candidate gives a substantive answer or clearly says they're done
- If candidate gives a short answer, ask follow-up questions to get more detail
- Keep the conversation natural and flowing

Remember: Conduct ENTIRE interview in {language_display} only."""
        
        return instructions
    
    def create_agent_session(self) -> AgentSession:
        """
        Create and configure the LiveKit agent session with optimized settings.
        
        Returns:
            Configured AgentSession with performance optimizations
        """
        from config import settings
        
        session = AgentSession(
            stt=soniox.STT(
                params=soniox.STTOptions(
                    language_hints=["ar", "en"]
                )
            ),
            llm=openai.LLM(model="gpt-4o-mini"),
            tts=elevenlabs.TTS(voice_id="u0TsaWvt0v8migutHM3M"),
            vad=self.vad_model,
        )
        
        # Setup transcript capture if interview was created
        if self.interview_id and self.application_data:
            candidate_name = self.application_data.candidate.name
            interview_language = self.application_data.job.interview_language
            
            @session.on("user_speech_committed")
            def on_user_speech(message):
                if message.content:
                    task = asyncio.create_task(
                        self._save_transcript(
                            message.content,
                            candidate_name,
                            interview_language
                        )
                    )
                    self.transcript_tasks.append(task)
            
            @session.on("agent_speech_committed")
            def on_agent_speech(message):
                if message.content:
                    task = asyncio.create_task(
                        self._save_transcript(
                            message.content,
                            "Laila Al Noor",
                            interview_language
                        )
                    )
                    self.transcript_tasks.append(task)
        
        return session
    
    def get_greeting(self) -> str:
        """
        Generate the initial greeting in the appropriate language.
        
        Returns:
            Greeting message string
        """
        if not self.application_data:
            return "Hello, welcome to the interview."
        
        job = self.application_data.job
        candidate = self.application_data.candidate
        
        interview_language = job.interview_language or "English"
        candidate_name = candidate.name or "Candidate"
        company_name = job.company.name or "the company"
        
        # Check if Arabic (case-insensitive, supports variations)
        is_arabic = any(word in interview_language.lower() for word in ["arabic", "عربي", "ar"])
        
        if is_arabic:
            return (
                f"مرحباً {candidate_name}، أنا ليلى النور من {company_name}. "
                f"كيف حالك اليوم؟"
            )
        else:
            return (
                f"Hello {candidate_name}, I am Laila Al Noor from {company_name}. "
                f"How are you today?"
            )
    
    async def _save_transcript(
        self,
        content: str,
        speaker: str,
        language: str
    ) -> None:
        """
        Save a transcript entry (internal method).
        
        Args:
            content: Transcript content
            speaker: Speaker name
            language: Language code
        """
        if not self.interview_id:
            return
        
        try:
            lang_code = "ar" if language and language.lower() == "arabic" else "en"
            await self.interview_service.add_transcript(
                interview_id=self.interview_id,
                content=content,
                speaker=speaker,
                language=lang_code
            )
        except Exception as e:
            logger.error(
                f"Failed to save transcript: {e}",
                extra={"interview_id": self.interview_id, "speaker": speaker}
            )
    
    async def cleanup(self) -> None:
        """
        Cleanup phase: Complete interview and close services.
        Ensures all resources are properly released.
        """
        logger.info("Starting cleanup")
        
        # Wait for pending transcript tasks
        if self.transcript_tasks:
            logger.info(f"Waiting for {len(self.transcript_tasks)} transcript tasks")
            await asyncio.gather(*self.transcript_tasks, return_exceptions=True)
        
        # Complete interview record if exists
        if self.interview_id:
            try:
                logger.info(f"Completing interview: {self.interview_id}")
                await self.interview_service.complete_interview(
                    interview_id=self.interview_id,
                    recording_url=None
                )
                logger.info("Interview completed successfully")
            except Exception as e:
                logger.error(f"Error completing interview: {e}", exc_info=True)
        
        # Close service connections
        try:
            await self.application_service.close()
            await self.interview_service.close()
            logger.info("All services closed")
        except Exception as e:
            logger.error(f"Error closing services: {e}", exc_info=True)
        
        logger.info("Cleanup completed")
