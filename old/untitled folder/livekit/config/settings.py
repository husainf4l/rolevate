import os
from functools import lru_cache
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # LiveKit Configuration
    livekit_url: str = ""
    livekit_api_key: str = ""
    livekit_api_secret: str = ""

    # OpenAI Configuration
    openai_api_key: str = ""

    # ElevenLabs Configuration
    elevenlabs_api_key: str = ""

    # Application Configuration
    app_host: str = "0.0.0.0"
    app_port: int = 8000
    app_reload: bool = True
    log_level: str = "info"

    # API Configuration
    api_title: str = "HR Interview Agent API"
    api_description: str = (
        "Professional LiveKit-based HR interview agent for .NET developer positions"
    )
    api_version: str = "1.0.0"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = (
            "ignore"  # Allow extra fields from .env that aren't defined in the model
        )

    @property
    def required_env_vars(self) -> list[str]:
        return ["livekit_url", "livekit_api_key", "livekit_api_secret"]

    def validate_required_vars(self) -> list[str]:
        """Return list of missing required environment variables"""
        missing_vars = []
        for var in self.required_env_vars:
            if not getattr(self, var):
                missing_vars.append(var.upper())
        return missing_vars


@lru_cache()
def get_settings() -> Settings:
    return Settings()
