"""
Services for the LiveKit Interview Agent.
==========================================

This module provides decoupled services for handling metadata extraction
and recording management, promoting clean architecture and separation of concerns.
"""

import json
import logging
import os
from typing import Optional, Dict
from datetime import datetime

from livekit import api
from livekit.agents import JobContext, AgentSession
import boto3
from botocore.exceptions import NoCredentialsError

from config import AppConfig

logger = logging.getLogger(__name__)


class MetadataExtractor:
    """Utility class for extracting and validating room metadata."""

    @staticmethod
    def extract_from_room(room_metadata: Optional[str]) -> Dict[str, str]:
        """
        Extracts and validates metadata from the room's metadata string.

        Args:
            room_metadata: JSON string from the room.

        Returns:
            A dictionary with extracted values or defaults.
        """
        defaults = {
            "candidateName": "the candidate",
            "jobName": "this position",
            "companyName": "our company",
            "interviewPrompt": "",
        }

        if not room_metadata:
            logger.warning("No room metadata found, using default values.")
            return defaults

        try:
            metadata = json.loads(room_metadata)
            extracted = {key: metadata.get(key, defaults[key]) for key in defaults}
            logger.info(f"Successfully extracted metadata for: {extracted['candidateName']}")
            return extracted
        except json.JSONDecodeError:
            logger.error("Failed to parse room metadata JSON. Using default values.", exc_info=True)
            return defaults


class RecordingManager:
    """Manages interview recording, S3 storage, and transcript saving."""

    def __init__(self, ctx: JobContext, config: AppConfig):
        self.ctx = ctx
        self.config = config
        self.recordings_dir = "recordings"
        os.makedirs(self.recordings_dir, exist_ok=True)
        self.lkapi = api.LiveKitAPI()

    async def start_recording(self) -> Optional[str]:
        """
        Starts a room composite egress for recording.

        Returns:
            A presigned URL for the recording, or None if an error occurs.
        """
        logger.info("Attempting to start room recording.")
        try:
            req = api.RoomCompositeEgressRequest(
                room_name=self.ctx.room.name,
                audio_only=False,
                file_outputs=[
                    api.EncodedFileOutput(
                        file_type=api.EncodedFileType.MP4,
                        filepath=self._get_s3_filepath(),
                        s3=api.S3Upload(
                            bucket=self.config.aws_bucket_name,
                            region=self.config.aws_region,
                            access_key=self.config.aws_access_key_id,
                            secret=self.config.aws_secret_access_key,
                        ),
                    )
                ],
            )
            res = await self.lkapi.egress.start_room_composite_egress(req)
            logger.info(f"Recording started with egress_id: {res.egress_id}")
            return self._generate_presigned_url()
        except Exception:
            logger.error("Failed to start recording.", exc_info=True)
            return None

    def setup_transcript_saving(self, session: AgentSession, recording_url: Optional[str]):
        """
        Adds a shutdown callback to save the session transcript.
        """
        async def save_transcript():
            logger.info("Saving transcript...")
            filename = f"{self.recordings_dir}/transcript_{self.ctx.room.name}_{self.ctx.job.id}.json"
            try:
                transcript_data = {
                    "room_name": self.ctx.room.name,
                    "job_id": self.ctx.job.id,
                    "timestamp": datetime.now().isoformat(),
                    "recording_url": recording_url or "N/A",
                    "session_history": session.history.to_dict() if hasattr(session.history, "to_dict") else str(session.history),
                }
                with open(filename, "w", encoding="utf-8") as f:
                    json.dump(transcript_data, f, indent=2, ensure_ascii=False)
                logger.info(f"Transcript successfully saved to {filename}")
            except Exception:
                logger.error(f"Failed to save transcript to {filename}.", exc_info=True)

        self.ctx.add_shutdown_callback(save_transcript)
        logger.info("Transcript saving is configured.")

    async def close(self):
        """Closes the LiveKit API client."""
        await self.lkapi.aclose()

    def _get_s3_filepath(self) -> str:
        return f"recordings/{self.ctx.room.name}_{self.ctx.job.id}.mp4"

    def _generate_presigned_url(self) -> Optional[str]:
        """Generates a presigned URL for the S3 recording."""
        if not all([self.config.aws_access_key_id, self.config.aws_secret_access_key]):
            logger.warning("AWS credentials not provided. Cannot generate presigned URL.")
            return None
        try:
            s3_client = boto3.client(
                "s3",
                aws_access_key_id=self.config.aws_access_key_id,
                aws_secret_access_key=self.config.aws_secret_access_key,
                region_name=self.config.aws_region,
            )
            url = s3_client.generate_presigned_url(
                "get_object",
                Params={"Bucket": self.config.aws_bucket_name, "Key": self._get_s3_filepath()},
                ExpiresIn=86400,  # 24 hours
            )
            logger.info("Successfully generated presigned URL for recording.")
            return url
        except NoCredentialsError:
            logger.error("AWS credentials not found by boto3. Cannot generate presigned URL.")
            return None
        except Exception:
            logger.error("Failed to generate presigned URL.", exc_info=True)
            return None
