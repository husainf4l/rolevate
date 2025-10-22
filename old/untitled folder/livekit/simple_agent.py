import logging
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from config.settings import get_settings

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

# Get application settings
settings = get_settings()

# Create FastAPI application
app = FastAPI(
    title=settings.api_title,
    description=settings.api_description,
    version=settings.api_version,
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "message": settings.api_title,
        "status": "active",
        "version": settings.api_version,
    }


@app.get("/health")
async def health_check():
    """Detailed health check endpoint"""
    missing_vars = settings.validate_required_vars()

    return {
        "status": "healthy" if not missing_vars else "unhealthy",
        "api_version": settings.api_version,
        "environment_status": {
            "required_vars_configured": len(missing_vars) == 0,
            "missing_vars": missing_vars,
        },
    }


@app.get("/test")
async def test_endpoint():
    """Test endpoint to verify server is running"""
    return {
        "message": "HR Interview Agent API is running successfully!",
        "livekit_url": settings.livekit_url,
        "api_keys_configured": {
            "livekit": bool(settings.livekit_api_key),
            "openai": bool(settings.openai_api_key),
            "elevenlabs": bool(settings.elevenlabs_api_key),
        },
    }


if __name__ == "__main__":
    uvicorn.run(
        "simple_agent:app",
        host=settings.app_host,
        port=settings.app_port,
        reload=settings.app_reload,
        log_level=settings.log_level,
    )
