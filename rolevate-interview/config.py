"""
Configuration settings for Rolevate Interview Agent
"""

import os
from dotenv import load_dotenv

load_dotenv()

# API Configuration
ROLEVATE_API_URL = os.getenv("ROLEVATE_API_URL", "https://rolevate.com/api/graphql")
ROLEVATE_API_KEY = os.getenv("ROLEVATE_API_KEY")

# LiveKit Configuration
LIVEKIT_URL = os.getenv("LIVEKIT_URL")
LIVEKIT_API_KEY = os.getenv("LIVEKIT_API_KEY")
LIVEKIT_API_SECRET = os.getenv("LIVEKIT_API_SECRET")

# OpenAI Configuration
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-4o-mini")

# ElevenLabs Configuration
ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY")
ELEVENLABS_VOICE_ID = os.getenv("ELEVENLABS_VOICE_ID", "EkK5I93UQWFDigLMpZcX")

# Soniox Configuration
SONIOX_API_KEY = os.getenv("SONIOX_API_KEY")

# Agent Configuration
SUPPORTED_LANGUAGES = ["en", "ar"]
DEFAULT_TIMEOUT = 10  # seconds for API calls

# Room Configuration
ROOM_NAME_PREFIX = "interview-"
