import os
import json
import logging
from datetime import datetime
from typing import Optional
import boto3
from botocore.exceptions import NoCredentialsError
from livekit import api
from livekit.agents import JobContext, AgentSession

logger = logging.getLogger(__name__)


class RecordingManager:
    """Manages interview recording and S3 storage."""

    def __init__(self, ctx: JobContext):
        self.ctx = ctx

    async def start_recording(self) -> Optional[str]:
        """
        Start room recording with S3 storage.

        Returns:
            Presigned URL for accessing the recording, or None if failed
        """
        try:
            # Configure recording request
            req = api.RoomCompositeEgressRequest(
                room_name=self.ctx.room.name,
                audio_only=False,
                file_outputs=[
                    api.EncodedFileOutput(
                        file_type=api.EncodedFileType.MP4,
                        filepath=f"recordings/{self.ctx.room.name}_{self.ctx.job.id}.mp4",
                        s3=api.S3Upload(
                            bucket=os.getenv("AWS_BUCKET_NAME", "4wk-garage-media"),
                            region=os.getenv("AWS_REGION", "me-central-1"),
                            access_key=os.getenv("AWS_ACCESS_KEY_ID"),
                            secret=os.getenv("AWS_SECRET_ACCESS_KEY"),
                        ),
                    )
                ],
            )

            # Start recording
            lkapi = api.LiveKitAPI()
            res = await lkapi.egress.start_room_composite_egress(req)
            await lkapi.aclose()

            logger.info(f"Recording started: {res.egress_id}")

            # Generate presigned URL
            return self._generate_presigned_url()

        except Exception as e:
            logger.error(f"Failed to start recording: {e}")
            return None

    def _generate_presigned_url(self) -> Optional[str]:
        """Generate presigned URL for S3 access."""
        try:
            s3_client = boto3.client(
                "s3",
                aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
                aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
                region_name=os.getenv("AWS_REGION"),
            )

            url = s3_client.generate_presigned_url(
                "get_object",
                Params={
                    "Bucket": os.getenv("AWS_BUCKET_NAME"),
                    "Key": f"recordings/{self.ctx.room.name}_{self.ctx.job.id}.mp4",
                },
                ExpiresIn=86400,  # 24 hours
            )

            logger.info("Generated presigned URL for recording access")
            return url

        except (NoCredentialsError, Exception) as e:
            logger.warning(f"Could not generate presigned URL: {e}")
            return None

    def setup_transcript_saving(
        self, session: AgentSession, recording_url: Optional[str] = None
    ):
        """Setup automatic transcript saving on session end (removed local file saving)."""

        async def log_session_end():
            try:
                logger.info(f"Session ended for room: {self.ctx.room.name}")
                logger.info(f"Job ID: {self.ctx.job.id}")
                logger.info(f"Recording URL: {recording_url or 'N/A'}")
                logger.info("Session history logged (no local file saving)")

            except Exception as e:
                logger.error(f"Failed to log session end: {e}")

        self.ctx.add_shutdown_callback(log_session_end)
