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
    
    def __init__(self, instructions: str, application_data: ApplicationData) -> None:
        """
        Initialize the interview assistant.
        
        Args:
            instructions: System instructions for the AI
            application_data: Application data for tool access
        """
        super().__init__(instructions=instructions)
        self.application_data = application_data
    
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
    orchestrator = None
    
    try:
        # Connect to the room
        await ctx.connect()
        
        logger.info(
            "Agent starting",
            extra={"room_name": ctx.room.name}
        )
        
        # Initialize orchestrator
        orchestrator = InterviewOrchestrator(
            room_name=ctx.room.name,
            vad_model=ctx.proc.userdata["vad"]
        )
        
        # Setup phase: fetch data and create interview record
        setup_success = await orchestrator.setup()
        if not setup_success:
            logger.error("Setup phase failed, aborting interview")
            return
        
        # Build instructions and create session
        instructions = orchestrator.build_instructions()
        session = orchestrator.create_agent_session()
        
        # Start the agent - it will begin speaking based on instructions
        await session.start(
            agent=InterviewAssistant(
                instructions=instructions,
                application_data=orchestrator.application_data
            ),
            room=ctx.room,
        )
        
        logger.info("Agent started and active")
        
        # Keep running until the job is terminated by LiveKit
        while True:
            await asyncio.sleep(1)
        
    except asyncio.CancelledError:
        logger.info("Agent cancelled")
    except RolevateException as e:
        logger.error(f"Interview error: {e.message}", extra={"details": e.details})
    except Exception as e:
        logger.error(f"Unexpected error: {e}", exc_info=True)
    finally:
        # Cleanup resources
        if orchestrator:
            await orchestrator.cleanup()
        logger.info("Agent shutdown complete")


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