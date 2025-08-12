"""
Transcript Saver Utility

Handles asynchronous saving of transcripts to the backend without blocking
the conversation flow. Uses fire-and-forget approach with retry logic.
"""

import asyncio
import logging
import time
from typing import Optional, Dict, Any
import aiohttp
import os

logger = logging.getLogger(__name__)


class TranscriptSaver:
    """
    Utility class for saving transcripts asynchronously to the backend.

    Features:
    - Fire-and-forget async saving
    - Automatic retry with exponential backoff
    - No blocking of conversation flow
    - Error logging without crashing
    """

    def __init__(self, room_id: str):
        """
        Initialize transcript saver for a specific room.

        Args:
            room_id: The interview room ID
        """
        self.room_id = room_id
        self.backend_url = os.getenv("BACKEND_URL", "http://localhost:4005")
        self.endpoint = f"{self.backend_url}/api/interviews/room/{room_id}/transcripts"
        self.bulk_endpoint = (
            f"{self.backend_url}/api/interviews/room/{room_id}/transcripts/bulk"
        )
        self.sequence_number = 0
        self.retry_queue = []

        logger.info(f"TranscriptSaver initialized for room: {room_id}")
        logger.info(f"Endpoint: {self.endpoint}")

    def save_user_speech(
        self,
        content: str,
        start_time: float,
        end_time: float,
        confidence: Optional[float] = None,
        language: Optional[str] = None,
        speaker_name: Optional[str] = None,
    ) -> None:
        """
        Save user/candidate speech transcript.

        Args:
            content: The transcribed speech content
            start_time: Speech start timestamp
            end_time: Speech end timestamp
            confidence: Speech recognition confidence (0-1)
            language: Detected language
            speaker_name: Optional speaker name
        """
        transcript_data = {
            "speakerType": "CANDIDATE",
            "speakerName": speaker_name or "Candidate",
            "content": content,
            "startTime": start_time,
            "endTime": end_time,
            "duration": end_time - start_time,
            "sequenceNumber": self._get_next_sequence(),
            "confidence": confidence,
            "language": language,
            "sentiment": None,  # Could be enhanced with sentiment analysis
            "keywords": [],  # Could be enhanced with keyword extraction
            "importance": 1,  # Default importance level
        }

        # Fire and forget - don't await
        asyncio.create_task(self._save_transcript_async(transcript_data))

    def save_agent_speech(
        self,
        content: str,
        start_time: float,
        end_time: float,
        language: Optional[str] = None,
    ) -> None:
        """
        Save agent/AI response transcript.

        Args:
            content: The agent's response content
            start_time: Response start timestamp
            end_time: Response end timestamp
            language: Response language
        """
        transcript_data = {
            "speakerType": "AI_ASSISTANT",
            "speakerName": "Laila",
            "content": content,
            "startTime": start_time,
            "endTime": end_time,
            "duration": end_time - start_time,
            "sequenceNumber": self._get_next_sequence(),
            "confidence": 1.0,  # AI responses have full confidence
            "language": language,
            "sentiment": "neutral",  # AI responses are neutral
            "keywords": [],
            "importance": 1,
        }

        # Fire and forget - don't await
        asyncio.create_task(self._save_transcript_async(transcript_data))

    def save_system_message(self, content: str, message_type: str = "SYSTEM") -> None:
        """
        Save system messages (welcome, errors, etc.).

        Args:
            content: The system message content
            message_type: Type of system message
        """
        current_time = time.time()
        transcript_data = {
            "speakerType": "SYSTEM",
            "speakerName": "System",
            "content": content,
            "startTime": current_time,
            "endTime": current_time,
            "duration": 0,
            "sequenceNumber": self._get_next_sequence(),
            "confidence": 1.0,
            "language": "en",
            "sentiment": "neutral",
            "keywords": [message_type.lower()],
            "importance": 0,  # System messages have lower importance
        }

        # Fire and forget - don't await
        asyncio.create_task(self._save_transcript_async(transcript_data))

    async def _save_transcript_async(self, transcript_data: Dict[str, Any]) -> None:
        """
        Async method to save transcript with retry logic.

        Args:
            transcript_data: The transcript data to save
        """
        max_retries = 3
        base_delay = 0.1  # Start with 100ms delay

        for attempt in range(max_retries):
            try:
                timeout = aiohttp.ClientTimeout(total=2)  # 2 second timeout

                async with aiohttp.ClientSession(timeout=timeout) as session:
                    async with session.post(
                        self.endpoint, json=transcript_data
                    ) as response:
                        if response.status in [200, 201]:
                            logger.debug(
                                f"Transcript saved successfully: seq {transcript_data['sequenceNumber']}"
                            )
                            return
                        else:
                            response_text = await response.text()
                            logger.warning(
                                f"Failed to save transcript (attempt {attempt + 1}): "
                                f"Status {response.status}, Response: {response_text[:100]}"
                            )

            except asyncio.TimeoutError:
                logger.warning(f"Transcript save timeout (attempt {attempt + 1})")
            except Exception as e:
                logger.warning(f"Transcript save error (attempt {attempt + 1}): {e}")

            # Exponential backoff for retries
            if attempt < max_retries - 1:
                delay = base_delay * (2**attempt)
                await asyncio.sleep(delay)

        # If all retries failed, add to retry queue for later
        logger.error(
            f"Failed to save transcript after {max_retries} attempts: {transcript_data['content'][:50]}..."
        )
        self.retry_queue.append(transcript_data)

    def save_bulk_transcripts(self, transcripts: list[Dict[str, Any]]) -> None:
        """
        Save multiple transcripts in a single API call.

        Args:
            transcripts: List of transcript data dictionaries
        """
        if not transcripts:
            return

        bulk_data = {"transcripts": transcripts}

        # Fire and forget - don't await
        asyncio.create_task(self._save_bulk_async(bulk_data))

    async def _save_bulk_async(self, bulk_data: Dict[str, Any]) -> None:
        """
        Async method to save bulk transcripts.

        Args:
            bulk_data: Bulk transcript data
        """
        try:
            timeout = aiohttp.ClientTimeout(total=5)  # Longer timeout for bulk

            async with aiohttp.ClientSession(timeout=timeout) as session:
                async with session.post(self.bulk_endpoint, json=bulk_data) as response:
                    if response.status in [200, 201]:
                        logger.info(
                            f"Bulk transcripts saved: {len(bulk_data['transcripts'])} items"
                        )
                    else:
                        response_text = await response.text()
                        logger.error(
                            f"Failed to save bulk transcripts: Status {response.status}"
                        )

        except Exception as e:
            logger.error(f"Bulk transcript save error: {e}")

    async def retry_failed_transcripts(self) -> None:
        """
        Retry saving any failed transcripts from the queue.
        """
        if not self.retry_queue:
            return

        logger.info(f"Retrying {len(self.retry_queue)} failed transcripts")

        failed_transcripts = self.retry_queue.copy()
        self.retry_queue.clear()

        # Try to save as bulk
        self.save_bulk_transcripts(failed_transcripts)

    def _get_next_sequence(self) -> int:
        """Get the next sequence number for transcript ordering."""
        self.sequence_number += 1
        return self.sequence_number

    async def cleanup(self) -> None:
        """
        Cleanup method to save any remaining transcripts.
        Call this when the interview session ends.
        """
        logger.info("TranscriptSaver cleanup - saving any remaining transcripts")

        # Retry any failed transcripts
        await self.retry_failed_transcripts()

        # Wait a moment for any pending saves to complete
        await asyncio.sleep(0.5)

        logger.info("TranscriptSaver cleanup completed")


# Convenience function for easy integration
def create_transcript_saver(room_id: str) -> TranscriptSaver:
    """
    Factory function to create a transcript saver.

    Args:
        room_id: The interview room ID

    Returns:
        TranscriptSaver instance
    """
    return TranscriptSaver(room_id)
