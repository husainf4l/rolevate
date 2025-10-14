"""
Streaming Service for Real-time Progress Updates
Provides WebSocket-based progress streaming for CV processing jobs.
"""

import asyncio
import json
import uuid
from typing import Dict, Any, List, Optional, Set
from datetime import datetime
import logging

from fastapi import WebSocket, WebSocketDisconnect
from enum import Enum

logger = logging.getLogger(__name__)

class ProgressStage(Enum):
    """CV processing progress stages."""
    INITIALIZED = "initialized"
    UPLOADING = "uploading"
    EXTRACTING = "extracting"
    DEDUPLICATING = "deduplicating"
    FORMATTING = "formatting"
    TEMPLATE_SELECTION = "template_selection"
    RENDERING = "rendering"
    GENERATING_PDF = "generating_pdf"
    UPLOADING_CLOUD = "uploading_cloud"
    COMPLETED = "completed"
    ERROR = "error"

class ProgressUpdate:
    """Progress update data structure."""
    
    def __init__(
        self,
        job_id: str,
        stage: ProgressStage,
        progress: float,
        message: str,
        metadata: Optional[Dict[str, Any]] = None
    ):
        self.job_id = job_id
        self.stage = stage
        self.progress = progress  # 0.0 to 1.0
        self.message = message
        self.metadata = metadata or {}
        self.timestamp = datetime.now()
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for JSON serialization."""
        return {
            "job_id": self.job_id,
            "stage": self.stage.value,
            "progress": self.progress,
            "message": self.message,
            "metadata": self.metadata,
            "timestamp": self.timestamp.isoformat(),
            "percentage": int(self.progress * 100)
        }

class ConnectionManager:
    """Manages WebSocket connections for progress updates."""
    
    def __init__(self):
        # Active connections by job_id
        self.connections: Dict[str, Set[WebSocket]] = {}
        # Global connections (listening to all jobs)
        self.global_connections: Set[WebSocket] = set()
    
    async def connect(self, websocket: WebSocket, job_id: Optional[str] = None):
        """Accept a WebSocket connection."""
        await websocket.accept()
        
        if job_id:
            if job_id not in self.connections:
                self.connections[job_id] = set()
            self.connections[job_id].add(websocket)
            logger.info(f"Client connected to job {job_id}")
        else:
            self.global_connections.add(websocket)
            logger.info("Client connected globally")
    
    def disconnect(self, websocket: WebSocket, job_id: Optional[str] = None):
        """Remove a WebSocket connection."""
        if job_id and job_id in self.connections:
            self.connections[job_id].discard(websocket)
            if not self.connections[job_id]:
                del self.connections[job_id]
            logger.info(f"Client disconnected from job {job_id}")
        else:
            self.global_connections.discard(websocket)
            logger.info("Global client disconnected")
    
    async def send_to_job(self, job_id: str, message: Dict[str, Any]):
        """Send message to all connections listening to a specific job."""
        if job_id in self.connections:
            disconnected = []
            
            for websocket in self.connections[job_id]:
                try:
                    await websocket.send_text(json.dumps(message))
                except Exception as e:
                    logger.warning(f"Failed to send to websocket: {e}")
                    disconnected.append(websocket)
            
            # Clean up disconnected websockets
            for ws in disconnected:
                self.connections[job_id].discard(ws)
    
    async def broadcast(self, message: Dict[str, Any]):
        """Broadcast message to all global connections."""
        disconnected = []
        
        for websocket in self.global_connections:
            try:
                await websocket.send_text(json.dumps(message))
            except Exception as e:
                logger.warning(f"Failed to broadcast: {e}")
                disconnected.append(websocket)
        
        # Clean up disconnected websockets
        for ws in disconnected:
            self.global_connections.discard(ws)

class StreamingService:
    """Service for managing progress streaming."""
    
    def __init__(self):
        self.manager = ConnectionManager()
        self.job_progress: Dict[str, ProgressUpdate] = {}
        self.stage_weights = {
            ProgressStage.INITIALIZED: 0.0,
            ProgressStage.UPLOADING: 0.05,
            ProgressStage.EXTRACTING: 0.20,
            ProgressStage.DEDUPLICATING: 0.30,
            ProgressStage.FORMATTING: 0.40,
            ProgressStage.TEMPLATE_SELECTION: 0.50,
            ProgressStage.RENDERING: 0.70,
            ProgressStage.GENERATING_PDF: 0.85,
            ProgressStage.UPLOADING_CLOUD: 0.95,
            ProgressStage.COMPLETED: 1.0,
            ProgressStage.ERROR: 0.0
        }
    
    async def update_progress(
        self,
        job_id: str,
        stage: ProgressStage,
        message: str,
        metadata: Optional[Dict[str, Any]] = None,
        custom_progress: Optional[float] = None
    ):
        """
        Update job progress and notify connected clients.
        
        Args:
            job_id: Job identifier
            stage: Current processing stage
            message: Human-readable progress message
            metadata: Additional metadata
            custom_progress: Override default progress calculation
        """
        # Calculate progress
        if custom_progress is not None:
            progress = max(0.0, min(1.0, custom_progress))
        else:
            progress = self.stage_weights.get(stage, 0.0)
        
        # Create progress update
        update = ProgressUpdate(job_id, stage, progress, message, metadata)
        self.job_progress[job_id] = update
        
        # Prepare message
        message_data = {
            "type": "progress_update",
            "data": update.to_dict()
        }
        
        # Send to job-specific listeners
        await self.manager.send_to_job(job_id, message_data)
        
        # Broadcast to global listeners
        await self.manager.broadcast(message_data)
        
        logger.debug(f"Progress update: {job_id} - {stage.value} ({progress*100:.1f}%)")
    
    async def complete_job(self, job_id: str, result: Dict[str, Any]):
        """Mark job as completed and send final update."""
        await self.update_progress(
            job_id,
            ProgressStage.COMPLETED,
            "CV processing completed successfully!",
            {"result": result}
        )
        
        # Send completion message
        completion_message = {
            "type": "job_completed",
            "data": {
                "job_id": job_id,
                "result": result,
                "timestamp": datetime.now().isoformat()
            }
        }
        
        await self.manager.send_to_job(job_id, completion_message)
        await self.manager.broadcast(completion_message)
    
    async def error_job(self, job_id: str, error: str, details: Optional[Dict[str, Any]] = None):
        """Mark job as failed and send error update."""
        await self.update_progress(
            job_id,
            ProgressStage.ERROR,
            f"Error: {error}",
            {"error": error, "details": details or {}}
        )
        
        # Send error message
        error_message = {
            "type": "job_error",
            "data": {
                "job_id": job_id,
                "error": error,
                "details": details or {},
                "timestamp": datetime.now().isoformat()
            }
        }
        
        await self.manager.send_to_job(job_id, error_message)
        await self.manager.broadcast(error_message)
    
    def get_job_status(self, job_id: str) -> Optional[Dict[str, Any]]:
        """Get current status of a job."""
        if job_id in self.job_progress:
            return self.job_progress[job_id].to_dict()
        return None
    
    def get_all_jobs(self) -> List[Dict[str, Any]]:
        """Get status of all jobs."""
        return [update.to_dict() for update in self.job_progress.values()]

# Global streaming service instance
streaming_service = StreamingService()

class ProgressTracker:
    """Context manager for tracking progress of CV processing jobs."""
    
    def __init__(self, job_id: str, total_stages: int = 8):
        self.job_id = job_id
        self.total_stages = total_stages
        self.current_stage = 0
        
    async def __aenter__(self):
        await streaming_service.update_progress(
            self.job_id,
            ProgressStage.INITIALIZED,
            "Starting CV processing..."
        )
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if exc_type is not None:
            await streaming_service.error_job(
                self.job_id,
                str(exc_val),
                {"exception_type": exc_type.__name__}
            )
        else:
            await streaming_service.complete_job(
                self.job_id,
                {"status": "success"}
            )
    
    async def next_stage(self, stage: ProgressStage, message: str, metadata: Optional[Dict[str, Any]] = None):
        """Move to next processing stage."""
        self.current_stage += 1
        await streaming_service.update_progress(
            self.job_id,
            stage,
            message,
            metadata
        )

# WebSocket route handlers
async def websocket_endpoint(websocket: WebSocket, job_id: Optional[str] = None):
    """WebSocket endpoint for progress updates."""
    await streaming_service.manager.connect(websocket, job_id)
    
    try:
        # Send initial status
        if job_id:
            status = streaming_service.get_job_status(job_id)
            if status:
                await websocket.send_text(json.dumps({
                    "type": "initial_status",
                    "data": status
                }))
        else:
            # Send all jobs status
            all_jobs = streaming_service.get_all_jobs()
            await websocket.send_text(json.dumps({
                "type": "all_jobs_status",
                "data": all_jobs
            }))
        
        # Keep connection alive
        while True:
            try:
                # Wait for ping or other messages from client
                data = await websocket.receive_text()
                message = json.loads(data)
                
                if message.get("type") == "ping":
                    await websocket.send_text(json.dumps({"type": "pong"}))
                elif message.get("type") == "get_status" and job_id:
                    status = streaming_service.get_job_status(job_id)
                    if status:
                        await websocket.send_text(json.dumps({
                            "type": "status_response",
                            "data": status
                        }))
                        
            except asyncio.TimeoutError:
                # Send keepalive ping
                await websocket.send_text(json.dumps({"type": "keepalive"}))
                
    except WebSocketDisconnect:
        streaming_service.manager.disconnect(websocket, job_id)
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        streaming_service.manager.disconnect(websocket, job_id)