"""Main entry point for CV Filler Agent."""
import sys
from pathlib import Path

# Add src to path
sys.path.insert(0, str(Path(__file__).parent))

from src.api.main import app
from src.core.config import settings

if __name__ == "__main__":
    import uvicorn
    
    # Ensure directories exist
    settings.ensure_directories()
    
    print("🚀 Starting Rolevate CV Filler Agent")
    print(f"   API: http://{settings.host}:{settings.port}")
    print(f"   Docs: http://{settings.host}:{settings.port}/docs")
    print()
    
    uvicorn.run(
        app,
        host=settings.host,
        port=settings.port,
        reload=settings.debug
    )
