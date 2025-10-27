"""
Configuration management for Rolevate Interview Agent
Centralized configuration with validation and environment management
"""

import os
from dataclasses import dataclass
from typing import Optional
from dotenv import load_dotenv

# Load environment variables
load_dotenv()


@dataclass
class APIConfig:
    """API configuration settings"""
    rolevate_api_url: str
    rolevate_api_key: Optional[str]
    timeout: int = 10  # seconds
    
    def validate(self) -> None:
        """Validate API configuration"""
        if not self.rolevate_api_url:
            raise ValueError("ROLEVATE_API_URL is required")


@dataclass
class LiveKitConfig:
    """LiveKit configuration settings"""
    url: str
    api_key: str
    api_secret: str
    
    def validate(self) -> None:
        """Validate LiveKit configuration"""
        if not all([self.url, self.api_key, self.api_secret]):
            raise ValueError("All LiveKit credentials are required")


@dataclass
class OpenAIConfig:
    """OpenAI configuration settings"""
    api_key: str
    model: str = "gpt-4o-mini"
    
    def validate(self) -> None:
        """Validate OpenAI configuration"""
        if not self.api_key:
            raise ValueError("OPENAI_API_KEY is required")


@dataclass
class ElevenLabsConfig:
    """ElevenLabs TTS configuration"""
    api_key: str
    voice_id: str = "EkK5I93UQWFDigLMpZcX"
    
    def validate(self) -> None:
        """Validate ElevenLabs configuration"""
        if not self.api_key:
            raise ValueError("ELEVENLABS_API_KEY is required")


@dataclass
class SonioxConfig:
    """Soniox STT configuration"""
    api_key: str
    supported_languages: list[str] = None
    
    def __post_init__(self):
        if self.supported_languages is None:
            self.supported_languages = ["en", "ar"]
    
    def validate(self) -> None:
        """Validate Soniox configuration"""
        if not self.api_key:
            raise ValueError("SONIOX_API_KEY is required")


@dataclass
class AgentConfig:
    """Agent behavior configuration"""
    room_name_prefix: str = "interview-"
    max_session_duration: int = 3600  # 1 hour in seconds
    enable_recording: bool = True
    enable_transcription: bool = True


class Settings:
    """
    Global application settings
    Singleton pattern for configuration management
    """
    
    _instance: Optional['Settings'] = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance
    
    def __init__(self):
        # Only initialize once
        if hasattr(self, '_initialized'):
            return
        
        self._initialized = True
        self._load_config()
    
    def _load_config(self) -> None:
        """Load all configuration from environment variables"""
        # API Configuration
        self.api = APIConfig(
            rolevate_api_url=os.getenv("ROLEVATE_API_URL", "https://rolevate.com/api/graphql"),
            rolevate_api_key=os.getenv("ROLEVATE_API_KEY"),
            timeout=int(os.getenv("API_TIMEOUT", "10"))
        )
        
        # LiveKit Configuration
        self.livekit = LiveKitConfig(
            url=os.getenv("LIVEKIT_URL", ""),
            api_key=os.getenv("LIVEKIT_API_KEY", ""),
            api_secret=os.getenv("LIVEKIT_API_SECRET", "")
        )
        
        # OpenAI Configuration
        self.openai = OpenAIConfig(
            api_key=os.getenv("OPENAI_API_KEY", ""),
            model=os.getenv("OPENAI_MODEL", "gpt-4o-mini")
        )
        
        # ElevenLabs Configuration
        self.elevenlabs = ElevenLabsConfig(
            api_key=os.getenv("ELEVENLABS_API_KEY", ""),
            voice_id=os.getenv("ELEVENLABS_VOICE_ID", "EkK5I93UQWFDigLMpZcX")
        )
        
        # Soniox Configuration
        self.soniox = SonioxConfig(
            api_key=os.getenv("SONIOX_API_KEY", "")
        )
        
        # Agent Configuration
        self.agent = AgentConfig(
            room_name_prefix=os.getenv("ROOM_NAME_PREFIX", "interview-"),
            max_session_duration=int(os.getenv("MAX_SESSION_DURATION", "3600")),
            enable_recording=os.getenv("ENABLE_RECORDING", "true").lower() == "true",
            enable_transcription=os.getenv("ENABLE_TRANSCRIPTION", "true").lower() == "true"
        )
    
    def validate(self) -> None:
        """Validate all configuration settings"""
        configs = [
            self.livekit,
            self.openai,
            self.elevenlabs,
            self.soniox
        ]
        
        for config in configs:
            config.validate()
    
    def __repr__(self) -> str:
        return (
            f"Settings(api_url={self.api.rolevate_api_url}, "
            f"livekit_url={self.livekit.url}, "
            f"openai_model={self.openai.model})"
        )


# Global settings instance
settings = Settings()
