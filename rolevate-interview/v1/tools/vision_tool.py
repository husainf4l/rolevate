"""
Vision Analysis Tool - LLM-accessible function for environment monitoring
"""

import logging
import base64
from typing import Optional, Dict, Any
import json

import aiohttp
from livekit import rtc
from livekit.agents import llm

from ..core.config import settings

logger = logging.getLogger(__name__)


class EnvironmentAnalysisTool(llm.ToolContext):
    """Tool for analyzing interview environment via video"""
    
    def __init__(self, room: rtc.Room):
        self.room = room
        super().__init__(tools=[])
    
    @llm.function_tool(
        name="analyze_environment",
        description="""Analyze the candidate's interview environment using their video feed.
        This tool checks:
        - If the candidate is smoking
        - If the candidate is wearing professional/appropriate attire
        - If there are other people visible in the background
        - Overall environment quality rating
        
        Use this tool when:
        - Starting the interview (initial check)
        - You notice something concerning in the video
        - The candidate mentions their environment
        - You want to verify professional setup
        """
    )
    async def analyze_environment(self) -> str:
        """
        Analyze the current video frame to check interview environment compliance.
        
        Returns a detailed analysis of the environment including any issues detected.
        """
        try:
            # Capture current frame
            frame_data = await self._capture_current_frame()
            if not frame_data:
                return "Unable to capture video frame. Video may not be available yet."
            
            # Analyze with Vision API
            analysis = await self._analyze_with_vision(frame_data)
            if not analysis:
                return "Vision analysis failed. Please try again."
            
            # Format results for LLM
            return self._format_analysis_result(analysis)
            
        except Exception as e:
            logger.error(f"Environment analysis failed: {e}")
            return f"Analysis error: {str(e)}"
    
    async def _capture_current_frame(self) -> Optional[str]:
        """Capture current video frame from participant"""
        try:
            # Get remote participant
            participant = None
            for p in self.room.remote_participants.values():
                participant = p
                break
            
            if not participant:
                logger.warning("No remote participant found")
                return None
            
            # Get video track
            video_track = None
            for publication in participant.track_publications.values():
                if publication.kind == rtc.TrackKind.KIND_VIDEO and publication.track:
                    video_track = publication.track
                    break
            
            if not video_track:
                logger.warning("No video track found")
                return None
            
            # Create video stream and get frame
            video_stream = rtc.VideoStream(video_track)
            
            # Get one frame with timeout
            import asyncio
            try:
                frame_event = await asyncio.wait_for(video_stream.__anext__(), timeout=5.0)
                frame = frame_event.frame
            except asyncio.TimeoutError:
                logger.warning("Timeout waiting for video frame")
                await video_stream.aclose()
                return None
            finally:
                await video_stream.aclose()
            
            if not frame:
                return None
            
            # Convert frame to RGB format for PIL
            from PIL import Image
            import io
            
            # Convert to ARGB format which PIL can handle
            # VideoBufferType.RGBA = 1
            rgb_frame = frame.convert(1)  # Convert to RGBA
            
            # Get dimensions
            width = rgb_frame.width
            height = rgb_frame.height
            
            # Get the raw bytes
            # The data is in RGBA format now
            img_data = bytes(rgb_frame.data)
            
            # Create PIL Image from RGBA data
            img = Image.frombytes('RGBA', (width, height), img_data)
            
            # Convert to RGB (remove alpha channel)
            img = img.convert('RGB')
            
            # Convert to JPEG bytes
            buffer = io.BytesIO()
            img.save(buffer, format='JPEG', quality=85)
            jpeg_bytes = buffer.getvalue()
            
            # Encode as base64
            base64_image = base64.b64encode(jpeg_bytes).decode('utf-8')
            
            logger.info(f"✅ Frame captured: {width}x{height}, {len(base64_image)} base64 chars")
            return base64_image
            
        except Exception as e:
            logger.error(f"Frame capture error: {e}", exc_info=True)
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
                                        "text": """Analyze this interview environment and provide:
1. smoking: Is the person smoking or are there cigarettes/vaping devices visible? (true/false)
2. professional_attire: Is the person wearing professional interview-appropriate clothing? (true/false)
3. other_people: Are there other people visible in frame or background? (true/false)
4. environment_rating: Rate the overall environment quality (1-5, where 5 is excellent)
5. lighting: Is the lighting adequate? (good/poor)
6. background: Is the background professional and distraction-free? (good/poor)
7. notes: Brief specific observations

Respond ONLY with valid JSON in this exact format:
{
    "smoking": false,
    "professional_attire": true,
    "other_people": false,
    "environment_rating": 4,
    "lighting": "good",
    "background": "good",
    "notes": "Clean professional setup with good lighting"
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
                    timeout=aiohttp.ClientTimeout(total=15)
                )
                
                response_text = await response.text()
                logger.info(f"Vision API response status: {response.status}")
                
                if response.status == 200:
                    try:
                        result = json.loads(response_text)
                        content = result["choices"][0]["message"]["content"]
                        
                        # Strip markdown code blocks if present
                        content = content.strip()
                        if content.startswith("```json"):
                            content = content[7:]  # Remove ```json
                        if content.startswith("```"):
                            content = content[3:]  # Remove ```
                        if content.endswith("```"):
                            content = content[:-3]  # Remove ```
                        content = content.strip()
                        
                        # Parse JSON from content
                        analysis = json.loads(content)
                        logger.info(f"✅ Vision analysis complete: {analysis}")
                        return analysis
                    except json.JSONDecodeError as e:
                        logger.error(f"Failed to parse Vision API response: {e}")
                        logger.error(f"Response text: {response_text[:500]}")
                        return None
                else:
                    logger.error(f"Vision API error {response.status}: {response_text[:500]}")
                    return None
                    
        except Exception as e:
            logger.error(f"Vision API call failed: {e}", exc_info=True)
            return None
    
    def _format_analysis_result(self, analysis: Dict[str, Any]) -> str:
        """Format analysis results for LLM consumption"""
        
        issues = []
        positives = []
        
        # Check smoking
        if analysis.get("smoking"):
            issues.append("🚬 SMOKING DETECTED - This is not appropriate for an interview")
        else:
            positives.append("✓ No smoking detected")
        
        # Check attire
        if not analysis.get("professional_attire"):
            issues.append("👔 UNPROFESSIONAL ATTIRE - Candidate should wear professional clothing")
        else:
            positives.append("✓ Professional attire")
        
        # Check other people
        if analysis.get("other_people"):
            issues.append("👥 OTHER PEOPLE PRESENT - Others are visible in the background")
        else:
            positives.append("✓ No other people visible")
        
        # Check lighting
        if analysis.get("lighting") == "poor":
            issues.append("💡 POOR LIGHTING - Video quality is compromised")
        else:
            positives.append("✓ Good lighting")
        
        # Check background
        if analysis.get("background") == "poor":
            issues.append("🖼️ DISTRACTING BACKGROUND - Background is not professional")
        else:
            positives.append("✓ Professional background")
        
        # Environment rating
        rating = analysis.get("environment_rating", 0)
        notes = analysis.get("notes", "")
        
        # Build response
        result = f"ENVIRONMENT ANALYSIS:\n\n"
        result += f"Overall Rating: {rating}/5\n\n"
        
        if issues:
            result += "⚠️ ISSUES DETECTED:\n"
            for issue in issues:
                result += f"  • {issue}\n"
            result += "\n"
        
        if positives:
            result += "✓ POSITIVE ASPECTS:\n"
            for pos in positives:
                result += f"  • {pos}\n"
            result += "\n"
        
        if notes:
            result += f"Additional Notes: {notes}\n"
        
        # Add guidance for LLM
        if issues:
            result += "\n💡 GUIDANCE: You should politely address these issues with the candidate. "
            result += "Explain that maintaining a professional environment is important for the interview process."
        else:
            result += "\n✅ Environment is suitable for the interview."
        
        return result
