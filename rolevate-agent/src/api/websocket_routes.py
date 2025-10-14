from fastapi import APIRouter, WebSocket, WebSocketDisconnect, HTTPException
from typing import Dict, Any
import asyncio
import json
import logging
from datetime import datetime

# Import the streaming service
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))

try:
    from src.services.streaming_service import streaming_service, ProgressStage
except ImportError:
    # Create a mock if streaming service is not available
    class MockProgressStage:
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
    
    class MockStreamingService:
        def __init__(self):
            self.connection_manager = MockConnectionManager()
        def get_job_status(self, job_id):
            return None
        def update_progress(self, *args, **kwargs):
            pass
    
    class MockConnectionManager:
        def connect(self, job_id, websocket):
            pass
        def disconnect(self, job_id, websocket):
            pass
        def get_connection_summary(self):
            return []
    
    streaming_service = MockStreamingService()
    ProgressStage = MockProgressStage()

logger = logging.getLogger(__name__)

# Create WebSocket router
ws_router = APIRouter(prefix="/ws", tags=["websockets"])

@ws_router.websocket("/progress/{job_id}")
async def websocket_progress_endpoint(websocket: WebSocket, job_id: str):
    """
    WebSocket endpoint for real-time progress updates
    
    Connects clients to receive live progress updates for CV processing jobs.
    Implements heartbeat mechanism to maintain connection health.
    
    Args:
        websocket: WebSocket connection
        job_id: Unique job identifier to track progress for
    """
    await websocket.accept()
    logger.info(f"WebSocket connected for job: {job_id}")
    
    # Add client to connection manager
    streaming_service.connection_manager.connect(job_id, websocket)
    
    try:
        # Send initial status if job exists
        initial_status = streaming_service.get_job_status(job_id)
        if initial_status:
            await websocket.send_json({
                "type": "initial_status",
                "data": initial_status,
                "timestamp": datetime.utcnow().isoformat()
            })
        else:
            await websocket.send_json({
                "type": "initial_status",
                "data": {
                    "job_id": job_id,
                    "stage": ProgressStage.INITIALIZED.value,
                    "progress": 0,
                    "message": "Job initialized",
                    "percentage": 0
                },
                "timestamp": datetime.utcnow().isoformat()
            })
        
        # Start heartbeat task
        heartbeat_task = asyncio.create_task(heartbeat_loop(websocket))
        
        # Listen for client messages
        while True:
            try:
                # Wait for messages with timeout
                message = await asyncio.wait_for(websocket.receive_text(), timeout=60.0)
                data = json.loads(message)
                
                # Handle client messages
                if data.get("type") == "ping":
                    await websocket.send_json({
                        "type": "pong",
                        "timestamp": datetime.utcnow().isoformat()
                    })
                    
                elif data.get("type") == "pong":
                    # Client responded to our ping
                    logger.debug(f"Received pong from job: {job_id}")
                    
                elif data.get("type") == "get_status":
                    # Client requesting current status
                    current_status = streaming_service.get_job_status(job_id)
                    await websocket.send_json({
                        "type": "status_response",
                        "data": current_status,
                        "timestamp": datetime.utcnow().isoformat()
                    })
                    
            except asyncio.TimeoutError:
                # No message received, continue heartbeat
                continue
                
            except json.JSONDecodeError:
                logger.warning(f"Invalid JSON received from job: {job_id}")
                await websocket.send_json({
                    "type": "error",
                    "data": {"error": "Invalid JSON format"},
                    "timestamp": datetime.utcnow().isoformat()
                })
                
    except WebSocketDisconnect:
        logger.info(f"WebSocket disconnected for job: {job_id}")
        
    except Exception as e:
        logger.error(f"WebSocket error for job {job_id}: {str(e)}")
        try:
            await websocket.send_json({
                "type": "error",
                "data": {"error": f"Server error: {str(e)}"},
                "timestamp": datetime.utcnow().isoformat()
            })
        except:
            pass  # Connection might be closed
            
    finally:
        # Clean up heartbeat task
        if 'heartbeat_task' in locals():
            heartbeat_task.cancel()
            
        # Remove client from connection manager
        streaming_service.connection_manager.disconnect(job_id, websocket)
        logger.info(f"WebSocket cleanup completed for job: {job_id}")


async def heartbeat_loop(websocket: WebSocket):
    """
    Maintains WebSocket connection with periodic heartbeat messages
    
    Args:
        websocket: WebSocket connection to maintain
    """
    try:
        while True:
            await asyncio.sleep(30)  # Send heartbeat every 30 seconds
            
            try:
                await websocket.send_json({
                    "type": "keepalive",
                    "timestamp": datetime.utcnow().isoformat()
                })
                logger.debug("Sent keepalive message")
                
            except Exception as e:
                logger.warning(f"Failed to send heartbeat: {str(e)}")
                break
                
    except asyncio.CancelledError:
        logger.debug("Heartbeat loop cancelled")
        raise


# Additional WebSocket endpoints for batch operations
@ws_router.websocket("/batch_progress/{batch_id}")
async def websocket_batch_progress_endpoint(websocket: WebSocket, batch_id: str):
    """
    WebSocket endpoint for batch processing progress
    
    Tracks progress across multiple CV processing jobs in a batch operation.
    
    Args:
        websocket: WebSocket connection
        batch_id: Unique batch identifier
    """
    await websocket.accept()
    logger.info(f"Batch WebSocket connected for batch: {batch_id}")
    
    # Add to batch connection manager (if implemented)
    streaming_service.connection_manager.connect(f"batch_{batch_id}", websocket)
    
    try:
        # Send initial batch status
        await websocket.send_json({
            "type": "batch_initialized",
            "data": {
                "batch_id": batch_id,
                "status": "connected",
                "timestamp": datetime.utcnow().isoformat()
            }
        })
        
        # Listen for batch completion messages
        while True:
            try:
                message = await asyncio.wait_for(websocket.receive_text(), timeout=60.0)
                data = json.loads(message)
                
                if data.get("type") == "ping":
                    await websocket.send_json({
                        "type": "pong",
                        "timestamp": datetime.utcnow().isoformat()
                    })
                    
            except asyncio.TimeoutError:
                continue
                
            except json.JSONDecodeError:
                logger.warning(f"Invalid JSON received from batch: {batch_id}")
                
    except WebSocketDisconnect:
        logger.info(f"Batch WebSocket disconnected for batch: {batch_id}")
        
    except Exception as e:
        logger.error(f"Batch WebSocket error for batch {batch_id}: {str(e)}")
        
    finally:
        streaming_service.connection_manager.disconnect(f"batch_{batch_id}", websocket)
        logger.info(f"Batch WebSocket cleanup completed for batch: {batch_id}")


# WebSocket utility endpoints
@ws_router.websocket("/admin/monitor")
async def websocket_admin_monitor(websocket: WebSocket):
    """
    Administrative WebSocket for monitoring all active jobs
    
    Provides real-time overview of all processing jobs for admin dashboard.
    """
    await websocket.accept()
    logger.info("Admin monitor WebSocket connected")
    
    try:
        while True:
            # Send active connections summary
            summary = streaming_service.connection_manager.get_connection_summary()
            
            await websocket.send_json({
                "type": "admin_summary",
                "data": {
                    "active_jobs": len(summary),
                    "connections": summary,
                    "timestamp": datetime.utcnow().isoformat()
                }
            })
            
            await asyncio.sleep(10)  # Update every 10 seconds
            
    except WebSocketDisconnect:
        logger.info("Admin monitor WebSocket disconnected")
        
    except Exception as e:
        logger.error(f"Admin monitor WebSocket error: {str(e)}")


# Export router for main app inclusion
__all__ = ['ws_router']