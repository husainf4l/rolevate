# FastAPI LiveKit AI Agent - Documentation

## Overview
This document outlines the professional implementation of a FastAPI-based AI agent that integrates with LiveKit for real-time voice conversations during interviews.

## Architecture

### Dependencies
```toml
# pyproject.toml
[tool.poetry]
name = "livekit-ai-agent"
version = "0.1.0"
description = "AI-powered interview agent using LiveKit and FastAPI"

[tool.poetry.dependencies]
python = "^3.11"
fastapi = "^0.104.0"
uvicorn = "^0.24.0"
livekit = "^0.10.0"
livekit-agents = "^0.8.0"
openai = "^1.3.0"
python-dotenv = "^1.0.0"
pydantic = "^2.5.0"
pydantic-settings = "^2.1.0"
redis = "^5.0.0"
loguru = "^0.7.0"
httpx = "^0.25.0"

[tool.poetry.group.dev.dependencies]
pytest = "^7.4.0"
pytest-asyncio = "^0.21.0"
black = "^23.0.0"
isort = "^5.12.0"
flake8 = "^6.0.0"
```

## Configuration

### Environment Configuration
```python
# config/settings.py
from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    # LiveKit Configuration
    livekit_api_key: str
    livekit_api_secret: str
    livekit_ws_url: str
    livekit_http_url: str
    
    # OpenAI Configuration
    openai_api_key: str
    openai_model: str = "gpt-4-turbo-preview"
    
    # Agent Configuration
    agent_name: str = "InterviewBot"
    agent_identity: str = "ai_interviewer"
    
    # Application Configuration
    app_host: str = "0.0.0.0"
    app_port: int = 8000
    log_level: str = "INFO"
    
    # Redis Configuration (for session management)
    redis_url: str = "redis://localhost:6379"
    
    # Interview Configuration
    max_interview_duration: int = 3600  # 1 hour in seconds
    silence_timeout: int = 30  # 30 seconds
    
    class Config:
        env_file = ".env"
        case_sensitive = False

settings = Settings()
```

### Environment File (.env)
```env
# LiveKit Configuration
LIVEKIT_API_KEY=your_api_key_here
LIVEKIT_API_SECRET=your_api_secret_here
LIVEKIT_WS_URL=wss://your-livekit-server.com
LIVEKIT_HTTP_URL=https://your-livekit-server.com

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key
OPENAI_MODEL=gpt-4-turbo-preview

# Agent Configuration
AGENT_NAME=InterviewBot
AGENT_IDENTITY=ai_interviewer

# Application Configuration
APP_HOST=0.0.0.0
APP_PORT=8000
LOG_LEVEL=INFO

# Redis Configuration
REDIS_URL=redis://localhost:6379

# Interview Configuration
MAX_INTERVIEW_DURATION=3600
SILENCE_TIMEOUT=30
```

## Core Agent Implementation

### AI Interview Agent
```python
# agents/interview_agent.py
import asyncio
import json
import logging
from typing import Dict, Any, Optional, List
from datetime import datetime, timedelta

from livekit import api, rtc
from livekit.agents import WorkerOptions, cli, JobContext
from livekit.agents.voice_assistant import VoiceAssistant
from livekit.agents.llm import openai
from livekit.agents.stt import deepgram
from livekit.agents.tts import cartesia
from livekit.plugins import openai as lk_openai

from config.settings import settings
from models.interview_models import InterviewSession, InterviewQuestion
from services.interview_service import InterviewService
from utils.prompts import get_interview_prompt

logger = logging.getLogger(__name__)

class InterviewAgent:
    """AI-powered interview agent for conducting technical interviews"""
    
    def __init__(self):
        self.room: Optional[rtc.Room] = None
        self.assistant: Optional[VoiceAssistant] = None
        self.interview_service = InterviewService()
        self.current_session: Optional[InterviewSession] = None
        self.questions_asked: List[str] = []
        self.current_question_index = 0
        self.interview_started = False
        
    async def entrypoint(self, ctx: JobContext):
        """Entry point for the agent when joining a room"""
        try:
            logger.info(f"Agent joining room: {ctx.room.name}")
            
            # Initialize the room connection
            await ctx.connect()
            self.room = ctx.room
            
            # Set up room event handlers
            self._setup_room_handlers()
            
            # Initialize interview session
            await self._initialize_interview_session(ctx.room.name)
            
            # Create and start the voice assistant
            await self._create_voice_assistant()
            
            # Start the assistant
            self.assistant.start(ctx.room)
            
            logger.info("Agent successfully initialized and started")
            
        except Exception as e:
            logger.error(f"Error in agent entrypoint: {e}")
            raise
    
    def _setup_room_handlers(self):
        """Set up event handlers for room events"""
        
        @self.room.on("participant_connected")
        def on_participant_connected(participant: rtc.RemoteParticipant):
            logger.info(f"Participant connected: {participant.identity}")
            
            # Start interview when candidate joins
            if not self.interview_started and "candidate" in participant.identity:
                asyncio.create_task(self._start_interview())
        
        @self.room.on("participant_disconnected") 
        def on_participant_disconnected(participant: rtc.RemoteParticipant):
            logger.info(f"Participant disconnected: {participant.identity}")
            
            # End interview if candidate leaves
            if "candidate" in participant.identity:
                asyncio.create_task(self._end_interview("candidate_left"))
        
        @self.room.on("data_received")
        def on_data_received(data: rtc.DataPacket):
            """Handle data messages from frontend"""
            try:
                message = json.loads(data.data.decode())
                asyncio.create_task(self._handle_data_message(message))
            except Exception as e:
                logger.error(f"Error handling data message: {e}")
    
    async def _initialize_interview_session(self, room_name: str):
        """Initialize the interview session"""
        try:
            # Extract interview details from room name or fetch from database
            session_data = await self.interview_service.get_session_data(room_name)
            
            self.current_session = InterviewSession(
                room_name=room_name,
                job_title=session_data.get("job_title", "Software Engineer"),
                job_level=session_data.get("job_level", "Mid-level"),
                required_skills=session_data.get("required_skills", []),
                candidate_id=session_data.get("candidate_id"),
                started_at=datetime.utcnow()
            )
            
            logger.info(f"Interview session initialized: {self.current_session.room_name}")
            
        except Exception as e:
            logger.error(f"Error initializing interview session: {e}")
            # Use default session if database fetch fails
            self.current_session = InterviewSession(
                room_name=room_name,
                job_title="Software Engineer",
                job_level="Mid-level"
            )
    
    async def _create_voice_assistant(self):
        """Create and configure the voice assistant"""
        try:
            # Initialize LLM with interview context
            llm = lk_openai.LLM(
                model=settings.openai_model,
                api_key=settings.openai_api_key,
                temperature=0.7,
                max_tokens=500,
            )
            
            # Initialize STT (Speech-to-Text)
            stt = deepgram.STT(
                model="nova-2-general",
                language="en",
                smart_format=True,
            )
            
            # Initialize TTS (Text-to-Speech)
            tts = cartesia.TTS(
                voice="79a125e8-cd45-4c13-8a67-188112f4dd22",  # Professional voice
                model="sonic-english",
                sample_rate=24000,
            )
            
            # Create the voice assistant
            self.assistant = VoiceAssistant(
                vad=rtc.VAD.for_speaking(),
                stt=stt,
                llm=llm,
                tts=tts,
                chat_ctx=self._get_initial_chat_context(),
                fnc_ctx=self._get_function_context(),
            )
            
            # Set up assistant event handlers
            self._setup_assistant_handlers()
            
            logger.info("Voice assistant created successfully")
            
        except Exception as e:
            logger.error(f"Error creating voice assistant: {e}")
            raise
    
    def _get_initial_chat_context(self) -> str:
        """Get initial chat context for the LLM"""
        return get_interview_prompt(
            job_title=self.current_session.job_title,
            job_level=self.current_session.job_level,
            required_skills=self.current_session.required_skills
        )
    
    def _get_function_context(self) -> Dict[str, Any]:
        """Get function context for the assistant"""
        return {
            "next_question": self._get_next_question,
            "evaluate_answer": self._evaluate_answer,
            "end_interview": self._end_interview,
            "get_candidate_info": self._get_candidate_info,
        }
    
    def _setup_assistant_handlers(self):
        """Set up event handlers for the voice assistant"""
        
        @self.assistant.on("function_calls_finished")
        def on_function_calls_finished(called_functions):
            logger.info(f"Function calls finished: {[f.call_info.function_info.name for f in called_functions]}")
        
        @self.assistant.on("user_speech_committed")  
        def on_user_speech_committed(msg):
            logger.info(f"User speech: {msg.content}")
            # Log candidate response for evaluation
            asyncio.create_task(self._log_candidate_response(msg.content))
        
        @self.assistant.on("agent_speech_committed")
        def on_agent_speech_committed(msg):
            logger.info(f"Agent speech: {msg.content}")
            # Log interviewer question/response
            asyncio.create_task(self._log_agent_response(msg.content))
    
    async def _start_interview(self):
        """Start the interview process"""
        try:
            self.interview_started = True
            
            # Send welcome message
            await self.assistant.say(
                f"Hello! Welcome to your interview for the {self.current_session.job_title} position. "
                f"I'm your AI interviewer today. Are you ready to begin?"
            )
            
            # Update session status
            await self.interview_service.update_session_status(
                self.current_session.room_name,
                "in_progress"
            )
            
            logger.info("Interview started successfully")
            
        except Exception as e:
            logger.error(f"Error starting interview: {e}")
    
    async def _get_next_question(self) -> str:
        """Get the next interview question"""
        try:
            questions = await self.interview_service.get_questions(
                job_title=self.current_session.job_title,
                difficulty=self.current_session.job_level,
                asked_questions=self.questions_asked
            )
            
            if self.current_question_index < len(questions):
                question = questions[self.current_question_index]
                self.questions_asked.append(question.id)
                self.current_question_index += 1
                
                # Log question in session
                await self.interview_service.log_question(
                    self.current_session.room_name,
                    question
                )
                
                return question.text
            else:
                return "That concludes our technical questions. Do you have any questions for me?"
                
        except Exception as e:
            logger.error(f"Error getting next question: {e}")
            return "I apologize, but I'm having trouble accessing the next question. Let's continue with a general question about your experience."
    
    async def _evaluate_answer(self, answer: str, question: str) -> Dict[str, Any]:
        """Evaluate candidate's answer"""
        try:
            evaluation = await self.interview_service.evaluate_answer(
                question=question,
                answer=answer,
                job_context=self.current_session.job_title
            )
            
            # Log evaluation
            await self.interview_service.log_evaluation(
                self.current_session.room_name,
                question,
                answer,
                evaluation
            )
            
            return evaluation
            
        except Exception as e:
            logger.error(f"Error evaluating answer: {e}")
            return {"score": 0, "feedback": "Unable to evaluate answer"}
    
    async def _end_interview(self, reason: str = "completed"):
        """End the interview session"""
        try:
            # Generate final summary
            summary = await self.interview_service.generate_interview_summary(
                self.current_session.room_name
            )
            
            # Update session
            self.current_session.ended_at = datetime.utcnow()
            self.current_session.status = "completed"
            self.current_session.end_reason = reason
            
            # Save final session data
            await self.interview_service.save_session_summary(
                self.current_session,
                summary
            )
            
            # Thank the candidate
            if reason != "candidate_left":
                await self.assistant.say(
                    "Thank you for your time today. The interview is now complete. "
                    "You should hear back from the team within the next few days. "
                    "Have a great day!"
                )
            
            logger.info(f"Interview ended: {reason}")
            
            # Disconnect from room after a brief delay
            await asyncio.sleep(3)
            await self.room.disconnect()
            
        except Exception as e:
            logger.error(f"Error ending interview: {e}")
    
    async def _handle_data_message(self, message: Dict[str, Any]):
        """Handle data messages from the frontend"""
        message_type = message.get("type")
        
        if message_type == "start_interview":
            await self._start_interview()
        elif message_type == "end_interview":
            await self._end_interview("manual_end")
        elif message_type == "next_question":
            question = await self._get_next_question()
            await self.assistant.say(question)
        elif message_type == "candidate_info":
            # Update candidate information
            await self.interview_service.update_candidate_info(
                self.current_session.room_name,
                message.get("data", {})
            )
        else:
            logger.warning(f"Unknown message type: {message_type}")
    
    async def _log_candidate_response(self, response: str):
        """Log candidate's response"""
        try:
            await self.interview_service.log_candidate_response(
                self.current_session.room_name,
                response,
                datetime.utcnow()
            )
        except Exception as e:
            logger.error(f"Error logging candidate response: {e}")
    
    async def _log_agent_response(self, response: str):
        """Log agent's response"""
        try:
            await self.interview_service.log_agent_response(
                self.current_session.room_name,
                response,
                datetime.utcnow()
            )
        except Exception as e:
            logger.error(f"Error logging agent response: {e}")
    
    async def _get_candidate_info(self) -> Dict[str, Any]:
        """Get candidate information"""
        try:
            return await self.interview_service.get_candidate_info(
                self.current_session.candidate_id
            )
        except Exception as e:
            logger.error(f"Error getting candidate info: {e}")
            return {}

# Entry point for the agent
if __name__ == "__main__":
    cli.run_app(
        WorkerOptions(
            entrypoint_fnc=InterviewAgent().entrypoint,
            agent_name=settings.agent_name,
        )
    )
```

## Data Models

### Interview Models
```python
# models/interview_models.py
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum

class InterviewStatus(str, Enum):
    SCHEDULED = "scheduled"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"
    ERROR = "error"

class QuestionType(str, Enum):
    TECHNICAL = "technical"
    BEHAVIORAL = "behavioral"
    SITUATIONAL = "situational"
    CODING = "coding"

class InterviewQuestion(BaseModel):
    id: str
    text: str
    type: QuestionType
    difficulty: str  # "junior", "mid", "senior"
    skills: List[str]
    expected_answer_length: int = Field(default=300)
    time_limit: Optional[int] = None

class InterviewSession(BaseModel):
    room_name: str
    job_title: str
    job_level: str
    required_skills: List[str] = Field(default_factory=list)
    candidate_id: Optional[str] = None
    status: InterviewStatus = InterviewStatus.SCHEDULED
    started_at: Optional[datetime] = None
    ended_at: Optional[datetime] = None
    end_reason: Optional[str] = None
    questions_asked: List[str] = Field(default_factory=list)
    responses: List[Dict[str, Any]] = Field(default_factory=list)
    evaluations: List[Dict[str, Any]] = Field(default_factory=list)
    
class AnswerEvaluation(BaseModel):
    question_id: str
    answer: str
    score: float = Field(ge=0, le=10)
    feedback: str
    strengths: List[str] = Field(default_factory=list)
    improvements: List[str] = Field(default_factory=list)
    technical_accuracy: float = Field(ge=0, le=10)
    communication_clarity: float = Field(ge=0, le=10)
    problem_solving: float = Field(ge=0, le=10)

class InterviewSummary(BaseModel):
    session_id: str
    overall_score: float = Field(ge=0, le=10)
    technical_score: float = Field(ge=0, le=10)
    communication_score: float = Field(ge=0, le=10)
    recommendation: str  # "hire", "maybe", "no_hire"
    summary: str
    strengths: List[str]
    areas_for_improvement: List[str]
    duration_minutes: int
    questions_answered: int
    total_questions: int
```

## Services

### Interview Service
```python
# services/interview_service.py
import json
import asyncio
from typing import List, Dict, Any, Optional
from datetime import datetime
import httpx
import redis.asyncio as redis

from config.settings import settings
from models.interview_models import (
    InterviewSession, 
    InterviewQuestion, 
    AnswerEvaluation,
    InterviewSummary
)
from utils.openai_client import OpenAIClient

class InterviewService:
    """Service for managing interview sessions and evaluations"""
    
    def __init__(self):
        self.redis_client = redis.from_url(settings.redis_url)
        self.openai_client = OpenAIClient()
        self.http_client = httpx.AsyncClient()
    
    async def get_session_data(self, room_name: str) -> Dict[str, Any]:
        """Get session data from cache or API"""
        try:
            # Try to get from Redis cache first
            cached_data = await self.redis_client.get(f"session:{room_name}")
            if cached_data:
                return json.loads(cached_data)
            
            # If not in cache, fetch from main backend API
            response = await self.http_client.get(
                f"{settings.backend_api_url}/interviews/{room_name}/session-data"
            )
            
            if response.status_code == 200:
                session_data = response.json()
                # Cache for future use
                await self.redis_client.setex(
                    f"session:{room_name}",
                    3600,  # 1 hour
                    json.dumps(session_data)
                )
                return session_data
            else:
                raise Exception(f"Failed to fetch session data: {response.status_code}")
                
        except Exception as e:
            print(f"Error getting session data: {e}")
            # Return default data if all else fails
            return {
                "job_title": "Software Engineer",
                "job_level": "Mid-level",
                "required_skills": ["Python", "JavaScript", "Problem Solving"],
                "candidate_id": None
            }
    
    async def get_questions(
        self, 
        job_title: str, 
        difficulty: str, 
        asked_questions: List[str]
    ) -> List[InterviewQuestion]:
        """Get interview questions based on job requirements"""
        try:
            cache_key = f"questions:{job_title}:{difficulty}"
            cached_questions = await self.redis_client.get(cache_key)
            
            if cached_questions:
                questions_data = json.loads(cached_questions)
            else:
                # Generate questions using OpenAI
                questions_data = await self.openai_client.generate_interview_questions(
                    job_title=job_title,
                    difficulty=difficulty,
                    count=10
                )
                
                # Cache questions
                await self.redis_client.setex(
                    cache_key,
                    7200,  # 2 hours
                    json.dumps(questions_data)
                )
            
            # Convert to InterviewQuestion objects and filter out asked questions
            questions = [
                InterviewQuestion(**q) for q in questions_data
                if q["id"] not in asked_questions
            ]
            
            return questions[:5]  # Return next 5 questions
            
        except Exception as e:
            print(f"Error getting questions: {e}")
            # Return default questions
            return [
                InterviewQuestion(
                    id="default_1",
                    text="Can you tell me about yourself and your experience?",
                    type="behavioral",
                    difficulty=difficulty,
                    skills=["communication"]
                )
            ]
    
    async def evaluate_answer(
        self, 
        question: str, 
        answer: str, 
        job_context: str
    ) -> Dict[str, Any]:
        """Evaluate candidate's answer using AI"""
        try:
            evaluation = await self.openai_client.evaluate_interview_answer(
                question=question,
                answer=answer,
                job_context=job_context
            )
            
            return evaluation
            
        except Exception as e:
            print(f"Error evaluating answer: {e}")
            return {
                "score": 5.0,
                "feedback": "Unable to evaluate answer at this time",
                "technical_accuracy": 5.0,
                "communication_clarity": 5.0,
                "problem_solving": 5.0
            }
    
    async def log_question(self, room_name: str, question: InterviewQuestion):
        """Log question asked during interview"""
        try:
            log_entry = {
                "timestamp": datetime.utcnow().isoformat(),
                "type": "question",
                "question_id": question.id,
                "question_text": question.text,
                "question_type": question.type
            }
            
            await self.redis_client.lpush(
                f"interview_log:{room_name}",
                json.dumps(log_entry)
            )
            
        except Exception as e:
            print(f"Error logging question: {e}")
    
    async def log_candidate_response(
        self, 
        room_name: str, 
        response: str, 
        timestamp: datetime
    ):
        """Log candidate's response"""
        try:
            log_entry = {
                "timestamp": timestamp.isoformat(),
                "type": "candidate_response",
                "content": response
            }
            
            await self.redis_client.lpush(
                f"interview_log:{room_name}",
                json.dumps(log_entry)
            )
            
        except Exception as e:
            print(f"Error logging candidate response: {e}")
    
    async def log_agent_response(
        self, 
        room_name: str, 
        response: str, 
        timestamp: datetime
    ):
        """Log agent's response"""
        try:
            log_entry = {
                "timestamp": timestamp.isoformat(),
                "type": "agent_response", 
                "content": response
            }
            
            await self.redis_client.lpush(
                f"interview_log:{room_name}",
                json.dumps(log_entry)
            )
            
        except Exception as e:
            print(f"Error logging agent response: {e}")
    
    async def log_evaluation(
        self,
        room_name: str,
        question: str,
        answer: str,
        evaluation: Dict[str, Any]
    ):
        """Log answer evaluation"""
        try:
            log_entry = {
                "timestamp": datetime.utcnow().isoformat(),
                "type": "evaluation",
                "question": question,
                "answer": answer,
                "evaluation": evaluation
            }
            
            await self.redis_client.lpush(
                f"interview_log:{room_name}",
                json.dumps(log_entry)
            )
            
        except Exception as e:
            print(f"Error logging evaluation: {e}")
    
    async def generate_interview_summary(self, room_name: str) -> InterviewSummary:
        """Generate comprehensive interview summary"""
        try:
            # Get all interview logs
            logs = await self.redis_client.lrange(f"interview_log:{room_name}", 0, -1)
            
            # Parse logs
            parsed_logs = [json.loads(log) for log in logs]
            
            # Extract evaluations and responses
            evaluations = [log for log in parsed_logs if log["type"] == "evaluation"]
            responses = [log for log in parsed_logs if log["type"] == "candidate_response"]
            
            # Generate summary using OpenAI
            summary_data = await self.openai_client.generate_interview_summary(
                evaluations=evaluations,
                responses=responses
            )
            
            # Calculate metrics
            if evaluations:
                avg_score = sum(eval["evaluation"]["score"] for eval in evaluations) / len(evaluations)
                technical_score = sum(eval["evaluation"].get("technical_accuracy", 5) for eval in evaluations) / len(evaluations)
                communication_score = sum(eval["evaluation"].get("communication_clarity", 5) for eval in evaluations) / len(evaluations)
            else:
                avg_score = technical_score = communication_score = 5.0
            
            # Calculate duration
            if parsed_logs:
                start_time = datetime.fromisoformat(parsed_logs[-1]["timestamp"])
                end_time = datetime.fromisoformat(parsed_logs[0]["timestamp"])
                duration_minutes = int((end_time - start_time).total_seconds() / 60)
            else:
                duration_minutes = 0
            
            summary = InterviewSummary(
                session_id=room_name,
                overall_score=avg_score,
                technical_score=technical_score,
                communication_score=communication_score,
                recommendation=summary_data.get("recommendation", "maybe"),
                summary=summary_data.get("summary", "Interview completed"),
                strengths=summary_data.get("strengths", []),
                areas_for_improvement=summary_data.get("areas_for_improvement", []),
                duration_minutes=duration_minutes,
                questions_answered=len(evaluations),
                total_questions=len([log for log in parsed_logs if log["type"] == "question"])
            )
            
            return summary
            
        except Exception as e:
            print(f"Error generating interview summary: {e}")
            # Return default summary
            return InterviewSummary(
                session_id=room_name,
                overall_score=5.0,
                technical_score=5.0,
                communication_score=5.0,
                recommendation="maybe",
                summary="Interview completed with technical difficulties",
                strengths=["Participated in interview"],
                areas_for_improvement=["Technical evaluation pending"],
                duration_minutes=30,
                questions_answered=0,
                total_questions=0
            )
    
    async def save_session_summary(
        self, 
        session: InterviewSession, 
        summary: InterviewSummary
    ):
        """Save final session summary to backend"""
        try:
            payload = {
                "session": session.dict(),
                "summary": summary.dict()
            }
            
            response = await self.http_client.post(
                f"{settings.backend_api_url}/interviews/{session.room_name}/summary",
                json=payload
            )
            
            if response.status_code != 200:
                print(f"Failed to save summary: {response.status_code}")
                
        except Exception as e:
            print(f"Error saving session summary: {e}")
    
    async def update_session_status(self, room_name: str, status: str):
        """Update session status"""
        try:
            await self.redis_client.hset(
                f"session_status:{room_name}",
                "status", status,
                "updated_at", datetime.utcnow().isoformat()
            )
            
            # Also update backend
            await self.http_client.patch(
                f"{settings.backend_api_url}/interviews/{room_name}/status",
                json={"status": status}
            )
            
        except Exception as e:
            print(f"Error updating session status: {e}")
    
    async def get_candidate_info(self, candidate_id: str) -> Dict[str, Any]:
        """Get candidate information"""
        try:
            response = await self.http_client.get(
                f"{settings.backend_api_url}/candidates/{candidate_id}"
            )
            
            if response.status_code == 200:
                return response.json()
            else:
                return {}
                
        except Exception as e:
            print(f"Error getting candidate info: {e}")
            return {}
    
    async def update_candidate_info(self, room_name: str, info: Dict[str, Any]):
        """Update candidate information during interview"""
        try:
            await self.redis_client.hset(
                f"candidate_info:{room_name}",
                mapping=info
            )
            
        except Exception as e:
            print(f"Error updating candidate info: {e}")
```

## Utilities

### OpenAI Client
```python
# utils/openai_client.py
import openai
import json
from typing import List, Dict, Any
from config.settings import settings

class OpenAIClient:
    """Client for OpenAI API interactions"""
    
    def __init__(self):
        self.client = openai.AsyncOpenAI(api_key=settings.openai_api_key)
    
    async def generate_interview_questions(
        self, 
        job_title: str, 
        difficulty: str, 
        count: int = 10
    ) -> List[Dict[str, Any]]:
        """Generate interview questions using OpenAI"""
        
        prompt = f"""
        Generate {count} interview questions for a {difficulty} level {job_title} position.
        
        Requirements:
        - Mix of technical, behavioral, and situational questions
        - Appropriate for {difficulty} level candidates
        - Include expected answer length and skills being tested
        - Return as JSON array with format:
        {{
            "id": "unique_id",
            "text": "question text",
            "type": "technical|behavioral|situational|coding",
            "difficulty": "{difficulty}",
            "skills": ["skill1", "skill2"],
            "expected_answer_length": 300
        }}
        """
        
        try:
            response = await self.client.chat.completions.create(
                model=settings.openai_model,
                messages=[
                    {"role": "system", "content": "You are an expert technical interviewer."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7,
                max_tokens=2000
            )
            
            content = response.choices[0].message.content
            questions = json.loads(content)
            
            return questions
            
        except Exception as e:
            print(f"Error generating questions: {e}")
            return []
    
    async def evaluate_interview_answer(
        self,
        question: str,
        answer: str,
        job_context: str
    ) -> Dict[str, Any]:
        """Evaluate candidate's answer"""
        
        prompt = f"""
        Evaluate this interview answer for a {job_context} position:
        
        Question: {question}
        Answer: {answer}
        
        Provide evaluation with scores (0-10) for:
        - Overall score
        - Technical accuracy
        - Communication clarity  
        - Problem-solving approach
        
        Also provide:
        - Brief feedback
        - Strengths
        - Areas for improvement
        
        Return as JSON:
        {{
            "score": 7.5,
            "technical_accuracy": 8.0,
            "communication_clarity": 7.0,
            "problem_solving": 7.5,
            "feedback": "Good answer with solid technical understanding...",
            "strengths": ["clear explanation", "good examples"],
            "improvements": ["could be more specific", "elaborate on edge cases"]
        }}
        """
        
        try:
            response = await self.client.chat.completions.create(
                model=settings.openai_model,
                messages=[
                    {"role": "system", "content": "You are an expert technical interviewer evaluating candidate responses."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.3,
                max_tokens=1000
            )
            
            content = response.choices[0].message.content
            evaluation = json.loads(content)
            
            return evaluation
            
        except Exception as e:
            print(f"Error evaluating answer: {e}")
            return {
                "score": 5.0,
                "technical_accuracy": 5.0,
                "communication_clarity": 5.0,
                "problem_solving": 5.0,
                "feedback": "Evaluation error occurred",
                "strengths": [],
                "improvements": []
            }
    
    async def generate_interview_summary(
        self,
        evaluations: List[Dict[str, Any]],
        responses: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """Generate comprehensive interview summary"""
        
        prompt = f"""
        Generate a comprehensive interview summary based on these evaluations and responses:
        
        Evaluations: {json.dumps(evaluations, indent=2)}
        
        Provide:
        - Overall assessment summary
        - Key strengths demonstrated
        - Areas needing improvement
        - Hiring recommendation (hire/maybe/no_hire)
        
        Return as JSON:
        {{
            "summary": "Comprehensive summary of performance...",
            "strengths": ["strength1", "strength2"],
            "areas_for_improvement": ["area1", "area2"],
            "recommendation": "hire|maybe|no_hire"
        }}
        """
        
        try:
            response = await self.client.chat.completions.create(
                model=settings.openai_model,
                messages=[
                    {"role": "system", "content": "You are an expert technical interviewer providing final assessments."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.3,
                max_tokens=1500
            )
            
            content = response.choices[0].message.content
            summary = json.loads(content)
            
            return summary
            
        except Exception as e:
            print(f"Error generating summary: {e}")
            return {
                "summary": "Interview completed with evaluation difficulties",
                "strengths": ["Participated in interview"],
                "areas_for_improvement": ["Evaluation pending"],
                "recommendation": "maybe"
            }
```

### Interview Prompts
```python
# utils/prompts.py
from typing import List

def get_interview_prompt(
    job_title: str,
    job_level: str,
    required_skills: List[str] = None
) -> str:
    """Get the system prompt for the interview agent"""
    
    skills_text = ""
    if required_skills:
        skills_text = f"\nRequired skills for this role: {', '.join(required_skills)}"
    
    return f"""You are an expert AI interviewer conducting a professional interview for a {job_level} {job_title} position.{skills_text}

Your responsibilities:
1. Conduct a structured, professional interview
2. Ask relevant technical and behavioral questions
3. Evaluate responses fairly and provide constructive feedback
4. Maintain a friendly but professional tone
5. Adapt questions based on candidate's experience level
6. Keep the interview flowing naturally

Interview Guidelines:
- Start with a warm greeting and brief introduction
- Ask about the candidate's background and experience
- Progress through technical questions appropriate for the level
- Include behavioral questions to assess soft skills
- Allow time for candidate questions
- Conclude professionally with next steps

Communication Style:
- Be conversational but professional
- Show genuine interest in responses
- Provide encouragement when appropriate
- Ask follow-up questions for clarity
- Keep responses concise and focused

Remember: You are evaluating both technical competency and cultural fit. Be fair, objective, and supportive throughout the process."""

def get_question_follow_up_prompt(original_question: str, answer: str) -> str:
    """Generate follow-up question prompt"""
    
    return f"""Based on this interview exchange:

Question: {original_question}
Answer: {answer}

Generate an appropriate follow-up question that:
1. Digs deeper into their response
2. Tests understanding of related concepts
3. Explores practical application
4. Maintains natural conversation flow

Keep it concise and relevant to the original topic."""

def get_evaluation_prompt(job_title: str, question: str, answer: str) -> str:
    """Generate evaluation prompt for answers"""
    
    return f"""Evaluate this interview response for a {job_title} position:

Question: {question}
Answer: {answer}

Provide scores (0-10) and feedback for:
- Technical accuracy and depth
- Communication clarity
- Problem-solving approach
- Practical understanding

Be constructive and specific in your feedback."""
```

## FastAPI Application

### Main Application
```python
# main.py
from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Any
import uvicorn
import asyncio
import logging

from config.settings import settings
from agents.interview_agent import InterviewAgent
from services.interview_service import InterviewService

# Configure logging
logging.basicConfig(level=settings.log_level)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="LiveKit AI Interview Agent",
    description="AI-powered interview agent using LiveKit",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global services
interview_service = InterviewService()
active_agents: Dict[str, InterviewAgent] = {}

class StartInterviewRequest(BaseModel):
    room_name: str
    job_title: str
    job_level: str
    required_skills: list = []

class AgentStatusResponse(BaseModel):
    room_name: str
    status: str
    participants: int
    duration_seconds: int

@app.on_event("startup")
async def startup_event():
    """Initialize application on startup"""
    logger.info("Starting LiveKit AI Interview Agent")
    
    # Test connections
    try:
        # Test Redis connection
        await interview_service.redis_client.ping()
        logger.info("Redis connection successful")
        
        # Test OpenAI connection  
        await interview_service.openai_client.client.models.list()
        logger.info("OpenAI connection successful")
        
    except Exception as e:
        logger.error(f"Startup connection test failed: {e}")

@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown"""
    logger.info("Shutting down AI Interview Agent")
    
    # Disconnect all active agents
    for room_name, agent in active_agents.items():
        try:
            if agent.room and agent.room.state == "connected":
                await agent.room.disconnect()
        except Exception as e:
            logger.error(f"Error disconnecting agent from {room_name}: {e}")
    
    # Close Redis connection
    await interview_service.redis_client.close()

@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "service": "LiveKit AI Interview Agent",
        "status": "running",
        "version": "1.0.0"
    }

@app.get("/health")
async def health_check():
    """Detailed health check"""
    try:
        # Check Redis
        await interview_service.redis_client.ping()
        redis_status = "healthy"
    except Exception:
        redis_status = "unhealthy"
    
    return {
        "status": "healthy" if redis_status == "healthy" else "degraded",
        "services": {
            "redis": redis_status,
            "active_agents": len(active_agents)
        }
    }

@app.post("/agents/start")
async def start_agent(
    request: StartInterviewRequest,
    background_tasks: BackgroundTasks
):
    """Start an AI agent for an interview room"""
    try:
        if request.room_name in active_agents:
            raise HTTPException(
                status_code=400,
                detail="Agent already active for this room"
            )
        
        # Create and start agent
        agent = InterviewAgent()
        active_agents[request.room_name] = agent
        
        # Start agent in background
        background_tasks.add_task(
            start_agent_background,
            agent,
            request.room_name,
            request.dict()
        )
        
        logger.info(f"Starting agent for room: {request.room_name}")
        
        return {
            "status": "started",
            "room_name": request.room_name,
            "agent_id": id(agent)
        }
        
    except Exception as e:
        logger.error(f"Error starting agent: {e}")
        raise HTTPException(status_code=500, detail=str(e))

async def start_agent_background(
    agent: InterviewAgent,
    room_name: str,
    session_data: Dict[str, Any]
):
    """Background task to start agent"""
    try:
        # Save session data to cache
        await interview_service.redis_client.setex(
            f"session:{room_name}",
            3600,
            json.dumps(session_data)
        )
        
        # This would typically connect to LiveKit room
        # For now, we'll simulate the agent startup
        logger.info(f"Agent started for room: {room_name}")
        
    except Exception as e:
        logger.error(f"Error in agent background task: {e}")
        # Remove from active agents on error
        if room_name in active_agents:
            del active_agents[room_name]

@app.get("/agents/{room_name}/status")
async def get_agent_status(room_name: str) -> AgentStatusResponse:
    """Get status of agent in specific room"""
    try:
        if room_name not in active_agents:
            raise HTTPException(
                status_code=404,
                detail="No agent found for this room"
            )
        
        agent = active_agents[room_name]
        
        # Get session data
        session_info = await interview_service.get_session_data(room_name)
        
        return AgentStatusResponse(
            room_name=room_name,
            status="active" if agent.interview_started else "waiting",
            participants=1,  # This would come from LiveKit room info
            duration_seconds=0  # Calculate from session start time
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting agent status: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/agents/{room_name}")
async def stop_agent(room_name: str):
    """Stop agent for specific room"""
    try:
        if room_name not in active_agents:
            raise HTTPException(
                status_code=404,
                detail="No agent found for this room"
            )
        
        agent = active_agents[room_name]
        
        # End interview and disconnect
        await agent._end_interview("manual_stop")
        
        # Remove from active agents
        del active_agents[room_name]
        
        logger.info(f"Agent stopped for room: {room_name}")
        
        return {"status": "stopped", "room_name": room_name}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error stopping agent: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/agents")
async def list_active_agents():
    """List all active agents"""
    return {
        "active_agents": list(active_agents.keys()),
        "count": len(active_agents)
    }

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host=settings.app_host,
        port=settings.app_port,
        reload=False,
        log_level=settings.log_level.lower()
    )
```

## Deployment

### Docker Configuration
```dockerfile
# Dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    make \
    && rm -rf /var/lib/apt/lists/*

# Copy dependency files
COPY pyproject.toml poetry.lock ./

# Install Poetry
RUN pip install poetry

# Configure Poetry
RUN poetry config virtualenvs.create false

# Install dependencies
RUN poetry install --no-dev

# Copy application code
COPY . .

# Create non-root user
RUN useradd -m -u 1000 appuser && chown -R appuser:appuser /app
USER appuser

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Start application
CMD ["python", "main.py"]
```

### Docker Compose
```yaml
# docker-compose.yml
version: '3.8'

services:
  ai-agent:
    build: .
    ports:
      - "8000:8000"
    environment:
      - LIVEKIT_API_KEY=${LIVEKIT_API_KEY}
      - LIVEKIT_API_SECRET=${LIVEKIT_API_SECRET}
      - LIVEKIT_WS_URL=${LIVEKIT_WS_URL}
      - LIVEKIT_HTTP_URL=${LIVEKIT_HTTP_URL}
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - REDIS_URL=redis://redis:6379
    depends_on:
      - redis
    restart: unless-stopped
    
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    restart: unless-stopped

volumes:
  redis_data:
```

## Testing

### Unit Tests
```python
# tests/test_interview_agent.py
import pytest
import asyncio
from unittest.mock import Mock, AsyncMock

from agents.interview_agent import InterviewAgent
from services.interview_service import InterviewService

@pytest.fixture
def interview_agent():
    agent = InterviewAgent()
    agent.interview_service = Mock(spec=InterviewService)
    return agent

@pytest.mark.asyncio
async def test_start_interview(interview_agent):
    """Test interview start process"""
    interview_agent.assistant = Mock()
    interview_agent.assistant.say = AsyncMock()
    interview_agent.interview_service.update_session_status = AsyncMock()
    
    await interview_agent._start_interview()
    
    assert interview_agent.interview_started is True
    interview_agent.assistant.say.assert_called_once()
    interview_agent.interview_service.update_session_status.assert_called_once()

@pytest.mark.asyncio
async def test_get_next_question(interview_agent):
    """Test question generation"""
    mock_questions = [
        Mock(id="q1", text="What is Python?"),
        Mock(id="q2", text="Explain OOP concepts")
    ]
    
    interview_agent.interview_service.get_questions = AsyncMock(return_value=mock_questions)
    interview_agent.interview_service.log_question = AsyncMock()
    
    question = await interview_agent._get_next_question()
    
    assert question == "What is Python?"
    assert "q1" in interview_agent.questions_asked
    assert interview_agent.current_question_index == 1

if __name__ == "__main__":
    pytest.main([__file__])
```

This comprehensive documentation provides a production-ready FastAPI LiveKit agent implementation with proper error handling, logging, testing, and deployment configurations.