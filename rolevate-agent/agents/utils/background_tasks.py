"""
Background Task Manager for CV Agent
Handles cleanup of temporary files, cache management, and scheduled tasks
"""

import os
import asyncio
import logging
from datetime import datetime, timedelta
from pathlib import Path
from typing import Dict, Any, List
import json
import time
from concurrent.futures import ThreadPoolExecutor
import threading

logger = logging.getLogger(__name__)

class TaskQueue:
    """Simple in-memory task queue for background processing"""
    
    def __init__(self):
        self.tasks: List[Dict[str, Any]] = []
        self.running_tasks: Dict[str, Any] = {}
        self.completed_tasks: List[Dict[str, Any]] = []
        self.max_completed_history = 100
        self._lock = threading.Lock()
        self._executor = ThreadPoolExecutor(max_workers=2)
        self._running = False
    
    def add_task(self, task_type: str, task_data: Dict[str, Any], delay_seconds: int = 0) -> str:
        """Add a task to the queue"""
        task_id = f"{task_type}_{int(time.time() * 1000)}"
        
        task = {
            "id": task_id,
            "type": task_type,
            "data": task_data,
            "created_at": datetime.utcnow().isoformat(),
            "scheduled_for": (datetime.utcnow() + timedelta(seconds=delay_seconds)).isoformat(),
            "status": "pending",
            "retries": 0,
            "max_retries": 3
        }
        
        with self._lock:
            self.tasks.append(task)
        
        logger.info(f"Added task {task_id} of type {task_type}")
        return task_id
    
    def get_task_status(self, task_id: str) -> Dict[str, Any]:
        """Get status of a specific task"""
        with self._lock:
            # Check running tasks
            if task_id in self.running_tasks:
                return self.running_tasks[task_id]
            
            # Check pending tasks
            for task in self.tasks:
                if task["id"] == task_id:
                    return task
            
            # Check completed tasks
            for task in self.completed_tasks:
                if task["id"] == task_id:
                    return task
        
        return {"status": "not_found"}
    
    async def start_worker(self):
        """Start the background worker"""
        self._running = True
        logger.info("Background task worker started")
        
        while self._running:
            try:
                await self._process_pending_tasks()
                await asyncio.sleep(10)  # Check every 10 seconds
            except Exception as e:
                logger.error(f"Task worker error: {e}")
                await asyncio.sleep(30)  # Wait longer on error
    
    async def _process_pending_tasks(self):
        """Process pending tasks"""
        now = datetime.utcnow()
        tasks_to_process = []
        
        with self._lock:
            # Find tasks ready to run
            for i, task in enumerate(self.tasks):
                scheduled_time = datetime.fromisoformat(task["scheduled_for"])
                if scheduled_time <= now:
                    tasks_to_process.append(self.tasks.pop(i))
                    break  # Process one at a time
        
        for task in tasks_to_process:
            await self._execute_task(task)
    
    async def _execute_task(self, task: Dict[str, Any]):
        """Execute a specific task"""
        task_id = task["id"]
        task_type = task["type"]
        
        try:
            with self._lock:
                task["status"] = "running"
                task["started_at"] = datetime.utcnow().isoformat()
                self.running_tasks[task_id] = task
            
            logger.info(f"Executing task {task_id} of type {task_type}")
            
            # Execute based on task type
            if task_type == "cleanup_temp_files":
                await self._cleanup_temp_files(task["data"])
            elif task_type == "cleanup_cache":
                await self._cleanup_cache(task["data"])
            elif task_type == "cleanup_outputs":
                await self._cleanup_outputs(task["data"])
            else:
                raise ValueError(f"Unknown task type: {task_type}")
            
            # Mark as completed
            with self._lock:
                task["status"] = "completed"
                task["completed_at"] = datetime.utcnow().isoformat()
                if task_id in self.running_tasks:
                    del self.running_tasks[task_id]
                
                self.completed_tasks.append(task)
                # Keep history limited
                if len(self.completed_tasks) > self.max_completed_history:
                    self.completed_tasks = self.completed_tasks[-self.max_completed_history:]
            
            logger.info(f"Task {task_id} completed successfully")
            
        except Exception as e:
            logger.error(f"Task {task_id} failed: {e}")
            
            with self._lock:
                task["status"] = "failed"
                task["error"] = str(e)
                task["retries"] += 1
                task["failed_at"] = datetime.utcnow().isoformat()
                
                if task_id in self.running_tasks:
                    del self.running_tasks[task_id]
                
                # Retry if under limit
                if task["retries"] < task["max_retries"]:
                    task["status"] = "pending"
                    task["scheduled_for"] = (datetime.utcnow() + timedelta(minutes=5)).isoformat()
                    self.tasks.append(task)
                    logger.info(f"Task {task_id} rescheduled for retry {task['retries']}")
                else:
                    self.completed_tasks.append(task)
    
    async def _cleanup_temp_files(self, data: Dict[str, Any]):
        """Clean up temporary files"""
        temp_dir = data.get("temp_dir", "temp")
        max_age_hours = data.get("max_age_hours", 24)
        
        if not os.path.exists(temp_dir):
            return
        
        cutoff_time = datetime.now() - timedelta(hours=max_age_hours)
        deleted_count = 0
        
        for root, dirs, files in os.walk(temp_dir):
            for file in files:
                filepath = Path(root) / file
                try:
                    # Check file age
                    file_time = datetime.fromtimestamp(filepath.stat().st_mtime)
                    if file_time < cutoff_time:
                        filepath.unlink()
                        deleted_count += 1
                except Exception as e:
                    logger.warning(f"Could not delete temp file {filepath}: {e}")
        
        logger.info(f"Cleaned up {deleted_count} temporary files older than {max_age_hours} hours")
    
    async def _cleanup_cache(self, data: Dict[str, Any]):
        """Clean up cache files"""
        cache_dir = data.get("cache_dir", "cache")
        max_size_mb = data.get("max_size_mb", 100)
        
        if not os.path.exists(cache_dir):
            return
        
        # Calculate total cache size
        total_size = 0
        files_info = []
        
        for root, dirs, files in os.walk(cache_dir):
            for file in files:
                filepath = Path(root) / file
                try:
                    size = filepath.stat().st_size
                    mtime = filepath.stat().st_mtime
                    files_info.append({
                        'path': filepath,
                        'size': size,
                        'mtime': mtime
                    })
                    total_size += size
                except Exception:
                    continue
        
        # If cache is too large, remove oldest files
        if total_size > max_size_mb * 1024 * 1024:
            # Sort by modification time (oldest first)
            files_info.sort(key=lambda x: x['mtime'])
            
            deleted_count = 0
            freed_size = 0
            
            for file_info in files_info:
                try:
                    file_info['path'].unlink()
                    deleted_count += 1
                    freed_size += file_info['size']
                    total_size -= file_info['size']
                    
                    # Stop when under limit
                    if total_size <= max_size_mb * 1024 * 1024 * 0.8:  # 80% of limit
                        break
                        
                except Exception as e:
                    logger.warning(f"Could not delete cache file {file_info['path']}: {e}")
            
            logger.info(f"Cache cleanup: deleted {deleted_count} files, freed {freed_size / 1024 / 1024:.2f} MB")
    
    async def _cleanup_outputs(self, data: Dict[str, Any]):
        """Clean up old output files"""
        output_dir = data.get("output_dir", "outputs")
        max_age_days = data.get("max_age_days", 7)
        
        if not os.path.exists(output_dir):
            return
        
        cutoff_time = datetime.now() - timedelta(days=max_age_days)
        deleted_count = 0
        
        for root, dirs, files in os.walk(output_dir):
            for file in files:
                filepath = Path(root) / file
                try:
                    # Check file age
                    file_time = datetime.fromtimestamp(filepath.stat().st_mtime)
                    if file_time < cutoff_time:
                        filepath.unlink()
                        deleted_count += 1
                except Exception as e:
                    logger.warning(f"Could not delete output file {filepath}: {e}")
        
        logger.info(f"Cleaned up {deleted_count} output files older than {max_age_days} days")
    
    def stop(self):
        """Stop the background worker"""
        self._running = False
        self._executor.shutdown(wait=True)
        logger.info("Background task worker stopped")


class BackgroundTaskManager:
    """Manager for scheduling and running background tasks"""
    
    def __init__(self):
        self.task_queue = TaskQueue()
        self.scheduled_tasks = {}
        self._worker_task = None
    
    async def start(self):
        """Start the background task manager"""
        if not self._worker_task:
            self._worker_task = asyncio.create_task(self.task_queue.start_worker())
            
            # Schedule regular cleanup tasks
            self.schedule_regular_cleanup()
            logger.info("Background task manager started")
    
    def schedule_regular_cleanup(self):
        """Schedule regular cleanup tasks"""
        # Schedule temp file cleanup every 6 hours
        self.task_queue.add_task(
            "cleanup_temp_files",
            {"temp_dir": "temp", "max_age_hours": 24},
            delay_seconds=0  # Run immediately
        )
        
        # Schedule cache cleanup every 12 hours  
        self.task_queue.add_task(
            "cleanup_cache",
            {"cache_dir": "cache", "max_size_mb": 100},
            delay_seconds=60  # Run in 1 minute
        )
        
        # Schedule output cleanup daily
        self.task_queue.add_task(
            "cleanup_outputs", 
            {"output_dir": "outputs", "max_age_days": 7},
            delay_seconds=120  # Run in 2 minutes
        )
        
        logger.info("Scheduled regular cleanup tasks")
    
    def schedule_cleanup(self, cleanup_type: str, delay_seconds: int = 0, **kwargs) -> str:
        """Schedule a cleanup task"""
        return self.task_queue.add_task(cleanup_type, kwargs, delay_seconds)
    
    def get_task_status(self, task_id: str) -> Dict[str, Any]:
        """Get status of a task"""
        return self.task_queue.get_task_status(task_id)
    
    def get_queue_status(self) -> Dict[str, Any]:
        """Get overall queue status"""
        with self.task_queue._lock:
            return {
                "pending_tasks": len(self.task_queue.tasks),
                "running_tasks": len(self.task_queue.running_tasks),
                "completed_tasks": len(self.task_queue.completed_tasks),
                "total_tasks_processed": len(self.task_queue.completed_tasks),
                "last_updated": datetime.utcnow().isoformat()
            }
    
    async def stop(self):
        """Stop the background task manager"""
        if self._worker_task:
            self.task_queue.stop()
            self._worker_task.cancel()
            try:
                await self._worker_task
            except asyncio.CancelledError:
                pass
            self._worker_task = None


# Global background task manager
background_task_manager = BackgroundTaskManager()