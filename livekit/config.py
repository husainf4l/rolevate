"""
Configuration Management for the LiveKit Interview Agent.
=========================================================

This module centralizes all application configuration, loading values
from environment variables and providing a single, typed configuration object.
"""

import os
import logging
from dataclasses import dataclass
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

logger = logging.getLogger(__name__)

@dataclass
class AppConfig:
    """Typed configuration for the application."""
    openai_api_key: str
    aws_bucket_name: str
    aws_region: str
    aws_access_key_id: str
    aws_secret_access_key: str
    livekit_agent_port: int
    elevenlabs_voice_id: str = "21m00Tcm4TlvDq8ikWAM"  # Default voice

    def __post_init__(self):
        """Validate critical configuration after initialization."""
        if not self.openai_api_key:
            logger.error("CRITICAL: OPENAI_API_KEY is not set.")
            raise ValueError("OPENAI_API_KEY environment variable is missing.")
        logger.info("Application configuration loaded and validated.")

def load_config() -> AppConfig:
    """
    Loads configuration from environment variables and returns an AppConfig object.
    """
    port_str = os.getenv("LIVEKIT_AGENT_PORT", "8006")
    try:
        port = int(port_str)
    except (ValueError, TypeError):
        logger.warning(f"Invalid LIVEKIT_AGENT_PORT '{port_str}'. Using default 8006.")
        port = 8006

    return AppConfig(
        openai_api_key=os.getenv("OPENAI_API_KEY"),
        aws_bucket_name=os.getenv("AWS_BUCKET_NAME", "4wk-garage-media"),
        aws_region=os.getenv("AWS_REGION", "me-central-1"),
        aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
        aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
        livekit_agent_port=port,
    )

# Create a global config instance to be used throughout the application
try:
    config = load_config()
except ValueError as e:
    logger.critical(f"Failed to initialize configuration: {e}")
    # Exit if critical configuration is missing
    exit(1)
