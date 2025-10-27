"""
FastAPI Web Controller for Rolevate Interview Agent
Provides a web interface to monitor and control the interview agent
"""

import os
import logging
import asyncio
from datetime import datetime
from typing import List, Optional, Dict, Any
from pathlib import Path

from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse, JSONResponse
from pydantic import BaseModel
import psutil

from api_client import RolevateAPIClient
from models import InterviewContext

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("web-controller")

# FastAPI app
app = FastAPI(
    title="Rolevate Agent Controller",
    description="Web interface for monitoring and controlling the Rolevate interview agent",
    version="1.0.0"
)

# Data models
class AgentStatus(BaseModel):
    """Agent status information"""
    is_running: bool
    uptime: Optional[float] = None
    memory_usage: Optional[float] = None
    cpu_usage: Optional[float] = None
    active_sessions: int = 0

class InterviewRequest(BaseModel):
    """Request to fetch interview details"""
    application_id: str

class SystemInfo(BaseModel):
    """System information"""
    python_version: str
    platform: str
    memory_total: float
    memory_available: float
    cpu_count: int

# WebSocket manager for real-time updates
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except:
                pass

manager = ConnectionManager()

# Helper functions
def get_agent_process() -> Optional[psutil.Process]:
    """Find the running agent process"""
    for proc in psutil.process_iter(['pid', 'name', 'cmdline']):
        try:
            cmdline = proc.info.get('cmdline', [])
            if cmdline and any('main.py' in cmd for cmd in cmdline):
                return proc
        except (psutil.NoSuchProcess, psutil.AccessDenied):
            continue
    return None

def get_agent_status() -> AgentStatus:
    """Get current agent status"""
    proc = get_agent_process()
    
    if proc:
        try:
            with proc.oneshot():
                return AgentStatus(
                    is_running=True,
                    uptime=(datetime.now() - datetime.fromtimestamp(proc.create_time())).total_seconds(),
                    memory_usage=proc.memory_info().rss / 1024 / 1024,  # MB
                    cpu_usage=proc.cpu_percent(interval=0.1),
                    active_sessions=0  # TODO: Track active sessions
                )
        except (psutil.NoSuchProcess, psutil.AccessDenied):
            pass
    
    return AgentStatus(is_running=False, active_sessions=0)

def get_system_info() -> SystemInfo:
    """Get system information"""
    import sys
    import platform
    
    memory = psutil.virtual_memory()
    
    return SystemInfo(
        python_version=sys.version,
        platform=platform.platform(),
        memory_total=memory.total / 1024 / 1024 / 1024,  # GB
        memory_available=memory.available / 1024 / 1024 / 1024,  # GB
        cpu_count=psutil.cpu_count()
    )

def read_log_file(filename: str, lines: int = 100) -> List[str]:
    """Read last N lines from a log file"""
    log_path = Path("logs") / filename
    
    if not log_path.exists():
        return []
    
    try:
        with open(log_path, 'r') as f:
            all_lines = f.readlines()
            return all_lines[-lines:]
    except Exception as e:
        logger.error(f"Error reading log file {filename}: {e}")
        return []

# API Routes
@app.get("/", response_class=HTMLResponse)
async def root():
    """Serve the main HTML controller interface"""
    html_path = Path(__file__).parent / "static" / "controller.html"
    
    if html_path.exists():
        return html_path.read_text()
    
    # Fallback: Return inline HTML if file doesn't exist
    return """
    <!DOCTYPE html>
    <html>
    <head>
        <title>Rolevate Agent Controller</title>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <script src="https://cdn.tailwindcss.com"></script>
    </head>
    <body class="bg-gray-100">
        <div class="container mx-auto p-6">
            <h1 class="text-3xl font-bold text-gray-800 mb-6">🤖 Rolevate Agent Controller</h1>
            <div class="bg-white rounded-lg shadow-md p-6">
                <p class="text-gray-600">Loading controller interface...</p>
                <p class="text-sm text-red-600 mt-2">Note: Static HTML file not found. Please create static/controller.html</p>
            </div>
        </div>
    </body>
    </html>
    """

@app.get("/api/status")
async def get_status():
    """Get agent status"""
    return get_agent_status()

@app.get("/api/system")
async def get_system():
    """Get system information"""
    return get_system_info()

@app.get("/api/logs/{log_type}")
async def get_logs(log_type: str, lines: int = 100):
    """Get log files"""
    valid_logs = {
        "combined": "pm2-combined.log",
        "error": "pm2-error.log",
        "out": "pm2-out.log"
    }
    
    if log_type not in valid_logs:
        raise HTTPException(status_code=400, detail="Invalid log type")
    
    log_lines = read_log_file(valid_logs[log_type], lines)
    
    return {
        "log_type": log_type,
        "lines": log_lines,
        "count": len(log_lines)
    }

@app.post("/api/interview/details")
async def get_interview_details(request: InterviewRequest):
    """Fetch interview details from Rolevate API"""
    try:
        api_client = RolevateAPIClient()
        context = await api_client.fetch_interview_details(request.application_id)
        
        if not context:
            raise HTTPException(status_code=404, detail="Interview details not found")
        
        return {
            "application_id": context.application_id,
            "candidate_name": context.candidate_name,
            "job_title": context.job_title,
            "company_name": context.company_name,
            "interview_language": context.interview_language,
            "has_complete_info": context.has_complete_info()
        }
    except Exception as e:
        logger.error(f"Error fetching interview details: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/agent/start")
async def start_agent():
    """Start the agent (via PM2 or direct command)"""
    proc = get_agent_process()
    
    if proc:
        return {"message": "Agent is already running", "pid": proc.pid}
    
    try:
        # Try to start via PM2
        result = os.system("pm2 start ecosystem.config.js")
        
        if result == 0:
            return {"message": "Agent started successfully via PM2"}
        else:
            # Fallback: start directly
            os.system("nohup python main.py dev > logs/direct-output.log 2>&1 &")
            return {"message": "Agent started directly (PM2 not available)"}
    except Exception as e:
        logger.error(f"Error starting agent: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/agent/stop")
async def stop_agent():
    """Stop the agent"""
    proc = get_agent_process()
    
    if not proc:
        return {"message": "Agent is not running"}
    
    try:
        proc.terminate()
        proc.wait(timeout=10)
        return {"message": "Agent stopped successfully"}
    except psutil.TimeoutExpired:
        proc.kill()
        return {"message": "Agent force killed"}
    except Exception as e:
        logger.error(f"Error stopping agent: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/agent/restart")
async def restart_agent():
    """Restart the agent"""
    try:
        # Stop first
        await stop_agent()
        # Wait a bit
        await asyncio.sleep(2)
        # Start again
        return await start_agent()
    except Exception as e:
        logger.error(f"Error restarting agent: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """WebSocket endpoint for real-time updates"""
    await manager.connect(websocket)
    try:
        while True:
            # Send status updates every 2 seconds
            status = get_agent_status()
            await websocket.send_json({
                "type": "status_update",
                "data": status.dict()
            })
            await asyncio.sleep(2)
    except WebSocketDisconnect:
        manager.disconnect(websocket)

# Health check
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

if __name__ == "__main__":
    import uvicorn
    
    # Create logs directory if it doesn't exist
    Path("logs").mkdir(exist_ok=True)
    
    # Create static directory if it doesn't exist
    Path("static").mkdir(exist_ok=True)
    
    print("🚀 Starting Rolevate Agent Web Controller...")
    print("📊 Dashboard: http://localhost:8004")
    print("📡 API Docs: http://localhost:8004/docs")
    
    uvicorn.run(app, host="0.0.0.0", port=8004, log_level="info")
