"""
Configuration management - Simplified
"""

import os
from dataclasses import dataclass
from dotenv import load_dotenv

load_dotenv()


@dataclass
class Settings:
    """Application settings loaded from environment variables"""
    
    # Required fields (no defaults)
    livekit_url: str
    livekit_api_key: str
    livekit_api_secret: str
    openai_api_key: str
    elevenlabs_api_key: str
    soniox_api_key: str
    
    # Optional fields (with defaults)
    api_url: str = "https://rolevate.com/api/graphql"
    api_key: str = ""
    api_timeout: int = 10
    openai_model: str = "gpt-4o-mini"
    elevenlabs_voice_id: str = "K6EjAWq39CfwwPD4jafo"
    
    # AWS S3 Configuration
    aws_access_key_id: str = ""
    aws_secret_access_key: str = ""
    aws_region: str = "me-central-1"
    aws_bucket_name: str = ""
    backend_url: str = ""
    
    def validate(self) -> None:
        """Validate required settings"""
        required = [
            (self.livekit_url, "LIVEKIT_URL"),
            (self.livekit_api_key, "LIVEKIT_API_KEY"),
            (self.livekit_api_secret, "LIVEKIT_API_SECRET"),
            (self.openai_api_key, "OPENAI_API_KEY"),
            (self.elevenlabs_api_key, "ELEVENLABS_API_KEY"),
            (self.soniox_api_key, "SONIOX_API_KEY"),
        ]
        
        for value, name in required:
            if not value:
                raise ValueError(f"{name} is required")
    
    @property
    def livekit(self):
        """LiveKit config compatibility"""
        return type('obj', (), {
            'url': self.livekit_url,
            'api_key': self.livekit_api_key,
            'api_secret': self.livekit_api_secret
        })()
    
    @property
    def openai(self):
        """OpenAI config compatibility"""
        return type('obj', (), {
            'api_key': self.openai_api_key,
            'model': self.openai_model
        })()
    
    @property
    def elevenlabs(self):
        """ElevenLabs config compatibility"""
        return type('obj', (), {
            'api_key': self.elevenlabs_api_key,
            'voice_id': self.elevenlabs_voice_id
        })()
    
    @property
    def soniox(self):
        """Soniox config compatibility"""
        return type('obj', (), {
            'api_key': self.soniox_api_key,
            'supported_languages': ["en", "ar"]
        })()
    
    @property
    def api(self):
        """API config compatibility"""
        return type('obj', (), {
            'rolevate_api_url': self.api_url,
            'rolevate_api_key': self.api_key,
            'timeout': self.api_timeout
        })()
    
    @property
    def aws(self):
        """AWS config compatibility"""
        return type('obj', (), {
            'access_key_id': self.aws_access_key_id,
            'secret_access_key': self.aws_secret_access_key,
            'region': self.aws_region,
            'bucket_name': self.aws_bucket_name
        })()


# Global settings instance
settings = Settings(
    livekit_url=os.getenv("LIVEKIT_URL", ""),
    livekit_api_key=os.getenv("LIVEKIT_API_KEY", ""),
    livekit_api_secret=os.getenv("LIVEKIT_API_SECRET", ""),
    openai_api_key=os.getenv("OPENAI_API_KEY", ""),
    elevenlabs_api_key=os.getenv("ELEVENLABS_API_KEY", ""),
    soniox_api_key=os.getenv("SONIOX_API_KEY", ""),
    api_url=os.getenv("ROLEVATE_API_URL", "https://rolevate.com/api/graphql"),
    api_key=os.getenv("ROLEVATE_API_KEY", ""),
    api_timeout=int(os.getenv("API_TIMEOUT", "10")),
    openai_model=os.getenv("OPENAI_MODEL", "gpt-4o-mini"),
    elevenlabs_voice_id=os.getenv("ELEVENLABS_VOICE_ID", "K6EjAWq39CfwwPD4jafo"),
    aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID", ""),
    aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY", ""),
    aws_region=os.getenv("AWS_REGION", "me-central-1"),
    aws_bucket_name=os.getenv("AWS_BUCKET_NAME", ""),
    backend_url=os.getenv("BACKEND_URL", ""),
)
