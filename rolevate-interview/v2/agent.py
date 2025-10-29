#!/usr/bin/env python3
"""
Rolevate Interview Agent - Main Entry Point
AI-powered interview agent using LiveKit for real-time voice interaction.
"""

import asyncio
import logging
from typing import Optional
from dotenv import load_dotenv

# Load environment variables first
load_dotenv()

# Import config to validate environment early
from config import settings
from utils.logging_config import setup_logging

# Setup structured logging
setup_logging()

from livekit.agents import (
    Agent,
    JobContext,
    JobProcess,
    RoomInputOptions,
    WorkerOptions,
    cli,
)
from livekit.agents.llm import function_tool
from livekit.plugins import silero

from orchestrator import InterviewOrchestrator
from models import ApplicationData
from exceptions import RolevateException

logger = logging.getLogger(__name__)


class InterviewAssistant(Agent):
    """AI Interview Assistant for Rolevate with tool access."""
    
    def __init__(self, instructions: str, application_data: ApplicationData, greeting: str = "") -> None:
        """
        Initialize the interview assistant.
        
        Args:
            instructions: System instructions for the AI
            application_data: Application data for tool access
            greeting: Initial greeting to speak
        """
        super().__init__(instructions=instructions)
        self.application_data = application_data
        self.greeting = greeting
        self._greeted = False
    
    @function_tool
    async def get_application_info(self) -> str:
        """
        Get detailed information about the job position and company.
        Use this when the candidate asks about:
        - Job title, description, or salary
        - Company name, description, contact information
        
        Returns:
            Formatted string with job and company information
        """
        job = self.application_data.job
        company = job.company
        
        info = f"""Job Information:
- Title: {job.title}
- Description: {job.description or 'N/A'}
- Salary: {job.salary or 'N/A'}

Company Information:
- Name: {company.name}
- Description: {company.description or 'N/A'}
- Phone: {company.phone or 'N/A'}
- Email: {company.email or 'N/A'}"""
        
        return info


def prewarm(proc: JobProcess) -> None:
    """
    Prewarm models to reduce latency.
    
    Args:
        proc: Job process instance
    """
    proc.userdata["vad"] = silero.VAD.load()
    logger.info("VAD model prewarmed successfully")


async def entrypoint(ctx: JobContext) -> None:
    """
    Main entry point for the LiveKit agent.
    Orchestrates the complete interview workflow.
    
    Args:
        ctx: Job context from LiveKit
    """
    # Connect to the room immediately
    await ctx.connect()
    
    logger.info(
        "Agent starting",
        extra={
            "room_name": ctx.room.name,
            "environment": settings.environment
        }
    )
    
    # Initialize orchestrator
    try:
        orchestrator = InterviewOrchestrator(
            room_name=ctx.room.name,
            vad_model=ctx.proc.userdata["vad"]
        )
    except Exception as e:
        logger.error(
            f"Failed to parse room name: {e}",
            exc_info=True
        )
        ctx.shutdown()
        return
    
    try:
        # Setup phase: fetch data, create interview, start recording
        setup_success = await orchestrator.setup()
        if not setup_success:
            logger.error("Setup phase failed, aborting interview")
            await orchestrator.cleanup()
            ctx.shutdown()
            return
        
        # Build instructions and create agent session
        instructions = orchestrator.build_instructions()
        greeting = orchestrator.get_greeting()
        session = orchestrator.create_agent_session()
        
        logger.info(f"Starting agent with greeting: {greeting[:50]}...")
        
        # Start the agent with greeting
        await session.start(
            agent=InterviewAssistant(
                instructions=instructions,
                application_data=orchestrator.application_data,
                greeting=greeting
            ),
            room=ctx.room,
        )
        
        logger.info("Agent started successfully and is now active")
        
        # Say the greeting immediately to start the interview
        await asyncio.sleep(0.5)  # Small delay to ensure session is ready
        session.say(greeting)
        logger.info("Greeting delivered, interview started")
        
        # Keep the function running - the agent stays active until the room closes
        # Don't return/exit until the job is explicitly terminated
        try:
            await asyncio.Event().wait()  # Wait indefinitely
        except asyncio.CancelledError:
            logger.info("Agent cancelled by system")
        
    except RolevateException as e:
        logger.error(
            f"Rolevate error in interview: {e.message}",
            extra={"details": e.details},
            exc_info=True
        )
    except Exception as e:
        logger.error(
            f"Unexpected error in interview: {e}",
            exc_info=True
        )
    finally:
        # Cleanup phase: stop recording, complete interview, close services
        await orchestrator.cleanup()
        logger.info("Agent shutdown complete")
        
        # Properly shutdown the job context
        ctx.shutdown()


if __name__ == "__main__":
    logger.info(
        "Starting Rolevate Interview Agent",
        extra={
            "environment": settings.environment,
            "log_level": settings.log_level
        }
    )
    
    cli.run_app(
        WorkerOptions(
            entrypoint_fnc=entrypoint,
            prewarm_fnc=prewarm,
        )
    )