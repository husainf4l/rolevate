"""
Centralized configuration management with validation.
All environment variables are loaded and validated at startup.
"""

from pydantic_settings import BaseSettings
from pydantic import Field, field_validator
from typing import Optional


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    # GraphQL API Configuration
    graphql_endpoint: str = Field(
        ..., 
        description="GraphQL API endpoint URL"
    )
    rolevate_api_key: str = Field(
        ..., 
        description="API key for Rolevate backend authentication"
    )
    
    # LiveKit Configuration
    livekit_url: str = Field(
        ..., 
        description="LiveKit server URL"
    )
    livekit_api_key: str = Field(
        ..., 
        description="LiveKit API key"
    )
    livekit_api_secret: str = Field(
        ..., 
        description="LiveKit API secret"
    )
    
    # AWS Configuration
    aws_access_key_id: str = Field(
        ..., 
        description="AWS access key ID for S3"
    )
    aws_secret_access_key: str = Field(
        ..., 
        description="AWS secret access key"
    )
    aws_region: str = Field(
        default="me-central-1", 
        description="AWS region for S3 bucket"
    )
    aws_bucket_name: str = Field(
        ..., 
        description="S3 bucket name for recordings"
    )
    
    # Application Configuration
    log_level: str = Field(
        default="INFO",
        description="Logging level (DEBUG, INFO, WARNING, ERROR, CRITICAL)"
    )
    environment: str = Field(
        default="production",
        description="Environment name (development, staging, production)"
    )
    
    # HTTP Client Configuration
    http_timeout: int = Field(
        default=30,
        description="Default HTTP request timeout in seconds"
    )
    http_max_connections: int = Field(
        default=100,
        description="Maximum number of HTTP connections in pool"
    )
    
    # Retry Configuration
    max_retries: int = Field(
        default=3,
        description="Maximum number of retry attempts for failed requests"
    )
    retry_min_wait: int = Field(
        default=2,
        description="Minimum wait time between retries in seconds"
    )
    retry_max_wait: int = Field(
        default=10,
        description="Maximum wait time between retries in seconds"
    )
    
    @field_validator('log_level')
    @classmethod
    def validate_log_level(cls, v: str) -> str:
        """Ensure log level is valid."""
        valid_levels = ['DEBUG', 'INFO', 'WARNING', 'ERROR', 'CRITICAL']
        v_upper = v.upper()
        if v_upper not in valid_levels:
            raise ValueError(f"log_level must be one of {valid_levels}")
        return v_upper
    
    @field_validator('environment')
    @classmethod
    def validate_environment(cls, v: str) -> str:
        """Ensure environment is valid."""
        valid_envs = ['development', 'staging', 'production']
        v_lower = v.lower()
        if v_lower not in valid_envs:
            raise ValueError(f"environment must be one of {valid_envs}")
        return v_lower
    
    class Config:
        """Pydantic configuration."""
        env_file = ".env"
        case_sensitive = False
        extra = "ignore"


# Global settings instance - initialized once at module import
try:
    settings = Settings()
except Exception as e:
    print(f"❌ FATAL: Failed to load configuration: {e}")
    print("Please ensure all required environment variables are set in .env file")
    raise
