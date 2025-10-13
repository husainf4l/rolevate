"""Configuration management for CV Filler Agent."""
import os
from typing import Literal
from pydantic_settings import BaseSettings
from pydantic import Field


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    # OpenAI Configuration
    openai_api_key: str = Field(..., alias="OPENAI_API_KEY")
    openai_model: str = Field(default="gpt-4-turbo-preview", alias="OPENAI_MODEL")
    
    # Server Configuration
    host: str = Field(default="0.0.0.0", alias="HOST")
    port: int = Field(default=8000, alias="PORT")
    debug: bool = Field(default=False, alias="DEBUG")
    
    # Storage Configuration
    storage_type: Literal["local", "s3"] = Field(default="local", alias="STORAGE_TYPE")
    upload_dir: str = Field(default="./uploads", alias="UPLOAD_DIR")
    output_dir: str = Field(default="./outputs", alias="OUTPUT_DIR")
    
    # AWS S3 Configuration
    aws_access_key_id: str = Field(default="", alias="AWS_ACCESS_KEY_ID")
    aws_secret_access_key: str = Field(default="", alias="AWS_SECRET_ACCESS_KEY")
    aws_region: str = Field(default="us-east-1", alias="AWS_REGION")
    s3_bucket_name: str = Field(default="", alias="S3_BUCKET_NAME")
    
    # Agent Configuration
    max_file_size_mb: int = Field(default=10, alias="MAX_FILE_SIZE_MB")
    allowed_extensions: str = Field(default="pdf,txt,json,docx", alias="ALLOWED_EXTENSIONS")
    default_template: str = Field(default="modern", alias="DEFAULT_TEMPLATE")
    
    # Logging
    log_level: str = Field(default="INFO", alias="LOG_LEVEL")
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = False
    
    @property
    def allowed_extensions_list(self) -> list[str]:
        """Get list of allowed file extensions."""
        return [ext.strip() for ext in self.allowed_extensions.split(",")]
    
    @property
    def max_file_size_bytes(self) -> int:
        """Get maximum file size in bytes."""
        return self.max_file_size_mb * 1024 * 1024
    
    def ensure_directories(self):
        """Create necessary directories if they don't exist."""
        os.makedirs(self.upload_dir, exist_ok=True)
        os.makedirs(self.output_dir, exist_ok=True)


# Global settings instance
settings = Settings()
