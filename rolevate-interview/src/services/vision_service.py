"""
Vision Analysis Service - Monitor interview environment
"""

import logging
import asyncio
import base64
from datetime import datetime
from typing import Optional, Dict, Any
from pathlib import Path

import aiohttp
from livekit import rtc

from src.core.config import settings

logger = logging.getLogger(__name__)


class VisionAnalyzer:
    """Analyze video frames for interview environment compliance"""
    
    def __init__(self, room: rtc.Room, application_id: str):
        self.room = room
        self.application_id = application_id
        self.is_running = False
        self.analysis_task = None
        self.current_issues = set()
        
    async def start(self):
        """Start continuous monitoring"""
        if self.is_running:
            return
        
        self.is_running = True
        self.analysis_task = asyncio.create_task(self._monitor_loop())
        logger.info("🎥 Vision monitoring started")
    
    async def stop(self):
        """Stop monitoring"""
        self.is_running = False
        if self.analysis_task:
            self.analysis_task.cancel()
            try:
                await self.analysis_task
            except asyncio.CancelledError:
                pass
        logger.info("🎥 Vision monitoring stopped")
    
    async def _monitor_loop(self):
        """Main monitoring loop - analyze every 30 seconds"""
        await asyncio.sleep(5)  # Wait 5s for video to start
        
        while self.is_running:
            try:
                await self._analyze_frame()
                await asyncio.sleep(30)  # Check every 30 seconds
            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.error(f"Vision analysis error: {e}")
                await asyncio.sleep(30)
    
    async def _analyze_frame(self):
        """Capture and analyze current video frame"""
        # Get participant's video track
        participant = await self._get_remote_participant()
        if not participant:
            return
        
        video_track = self._get_video_track(participant)
        if not video_track:
            return
        
        # Capture frame
        frame_data = await self._capture_frame(video_track)
        if not frame_data:
            return
        
        # Analyze with GPT-4 Vision
        analysis = await self._analyze_with_vision(frame_data)
        if analysis:
            await self._handle_analysis_result(analysis)
    
    async def _get_remote_participant(self) -> Optional[rtc.RemoteParticipant]:
        """Get the interview participant"""
        for participant in self.room.remote_participants.values():
            return participant
        return None
    
    def _get_video_track(self, participant) -> Optional[rtc.RemoteVideoTrack]:
        """Get participant's video track"""
        for publication in participant.track_publications.values():
            if publication.kind == rtc.TrackKind.KIND_VIDEO and publication.track:
                return publication.track
        return None
    
    async def _capture_frame(self, video_track) -> Optional[str]:
        """Capture frame and convert to base64"""
        try:
            # Get video frame
            frame = await video_track.get_frame()
            if not frame:
                return None
            
            # Convert to JPEG and encode base64
            # Note: You may need to use frame.to_image() depending on LiveKit version
            # This is a simplified example - adjust based on actual LiveKit API
            image_data = frame.data  # Get raw frame data
            base64_image = base64.b64encode(image_data).decode('utf-8')
            
            return base64_image
            
        except Exception as e:
            logger.error(f"Frame capture failed: {e}")
            return None
    
    async def _analyze_with_vision(self, frame_data: str) -> Optional[Dict[str, Any]]:
        """Analyze frame using OpenAI GPT-4 Vision"""
        try:
            async with aiohttp.ClientSession() as session:
                response = await session.post(
                    "https://api.openai.com/v1/chat/completions",
                    headers={
                        "Authorization": f"Bearer {settings.openai.api_key}",
                        "Content-Type": "application/json"
                    },
                    json={
                        "model": "gpt-4o",
                        "messages": [
                            {
                                "role": "user",
                                "content": [
                                    {
                                        "type": "text",
                                        "text": """Analyze this interview environment image and check for:
1. Is the person smoking? (yes/no)
2. Is the person wearing professional/appropriate attire? (yes/no)
3. Are there other people visible in the background? (yes/no)
4. Overall environment rating (1-5, where 5 is excellent)

Respond in JSON format:
{
    "smoking": boolean,
    "professional_attire": boolean,
    "other_people": boolean,
    "environment_rating": number,
    "notes": "brief description"
}"""
                                    },
                                    {
                                        "type": "image_url",
                                        "image_url": {
                                            "url": f"data:image/jpeg;base64,{frame_data}"
                                        }
                                    }
                                ]
                            }
                        ],
                        "max_tokens": 300
                    },
                    timeout=aiohttp.ClientTimeout(total=10)
                )
                
                if response.status == 200:
                    result = await response.json()
                    content = result["choices"][0]["message"]["content"]
                    
                    # Parse JSON response
                    import json
                    analysis = json.loads(content)
                    logger.info(f"Vision analysis: {analysis}")
                    return analysis
                else:
                    logger.error(f"Vision API failed: {response.status}")
                    return None
                    
        except Exception as e:
            logger.error(f"Vision analysis failed: {e}")
            return None
    
    async def _handle_analysis_result(self, analysis: Dict[str, Any]):
        """Handle analysis results and trigger alerts"""
        issues = []
        
        # Check for violations
        if analysis.get("smoking"):
            issues.append("smoking_detected")
            logger.warning("⚠️ SMOKING DETECTED")
        
        if not analysis.get("professional_attire"):
            issues.append("inappropriate_attire")
            logger.warning("⚠️ Inappropriate attire detected")
        
        if analysis.get("other_people"):
            issues.append("other_people_present")
            logger.warning("⚠️ Other people detected in background")
        
        rating = analysis.get("environment_rating", 0)
        if rating < 3:
            issues.append("poor_environment")
            logger.warning(f"⚠️ Poor environment rating: {rating}/5")
        
        # Store new issues
        new_issues = set(issues) - self.current_issues
        if new_issues:
            await self._report_issues(analysis, list(new_issues))
        
        self.current_issues = set(issues)
    
    async def _report_issues(self, analysis: Dict[str, Any], issues: list):
        """Report issues to backend"""
        if not settings.backend_url:
            return
        
        try:
            async with aiohttp.ClientSession() as session:
                await session.post(
                    f"{settings.backend_url}/applications/{self.application_id}/environment-issues",
                    json={
                        "timestamp": datetime.now().isoformat(),
                        "issues": issues,
                        "analysis": analysis
                    },
                    timeout=aiohttp.ClientTimeout(total=5)
                )
                logger.info(f"📊 Issues reported: {', '.join(issues)}")
        except Exception as e:
            logger.error(f"Failed to report issues: {e}")
