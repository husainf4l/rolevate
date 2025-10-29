"""
Recording Service - Improved version with better error handling and resource management.
Handles LiveKit recording and AWS S3 upload with proper cleanup.
"""

import logging
import asyncio
from datetime import datetime
from typing import Optional
import boto3
from botocore.exceptions import ClientError, BotoCoreError
from livekit import api
from tenacity import (
    retry,
    stop_after_attempt,
    wait_exponential,
    retry_if_exception_type,
    before_sleep_log
)

from config import settings
from exceptions import LiveKitError, AWSError, RecordingError
from models import RecordingInfo

logger = logging.getLogger(__name__)


class RecordingService:
    """Service to handle LiveKit recording and AWS S3 upload."""
    
    def __init__(self):
        """Initialize LiveKit and S3 clients."""
        self.livekit_url = settings.livekit_url
        self.livekit_api_key = settings.livekit_api_key
        self.livekit_api_secret = settings.livekit_api_secret
        
        self.aws_region = settings.aws_region
        self.aws_bucket = settings.aws_bucket_name
        
        self.recording_id: Optional[str] = None
        self.room_name: Optional[str] = None
        
        # Initialize S3 client
        try:
            self.s3_client = boto3.client(
                's3',
                aws_access_key_id=settings.aws_access_key_id,
                aws_secret_access_key=settings.aws_secret_access_key,
                region_name=self.aws_region
            )
            logger.info("Initialized S3 client", extra={"region": self.aws_region})
        except Exception as e:
            logger.error(f"Failed to initialize S3 client: {e}")
            raise AWSError(
                f"Failed to initialize S3 client: {str(e)}",
                details={"region": self.aws_region}
            ) from e
        
        # Initialize LiveKit API client
        try:
            self.livekit_api = api.LiveKitAPI(
                url=self.livekit_url,
                api_key=self.livekit_api_key,
                api_secret=self.livekit_api_secret
            )
            logger.info("Initialized LiveKit API client")
        except Exception as e:
            logger.error(f"Failed to initialize LiveKit API: {e}")
            raise LiveKitError(
                f"Failed to initialize LiveKit API: {str(e)}"
            ) from e
    
    @retry(
        stop=stop_after_attempt(2),
        wait=wait_exponential(multiplier=1, min=2, max=5),
        retry=retry_if_exception_type(Exception),
        before_sleep=before_sleep_log(logger, logging.WARNING),
        reraise=True
    )
    async def start_recording(
        self,
        room_name: str,
        application_id: str
    ) -> Optional[str]:
        """
        Start recording the LiveKit room with retry logic.
        
        Args:
            room_name: Name of the LiveKit room
            application_id: Application ID for file naming
            
        Returns:
            Recording ID if successful, None otherwise
            
        Raises:
            RecordingError: If recording fails to start
        """
        if not room_name or not room_name.strip():
            raise ValueError("room_name cannot be empty")
        
        if not application_id or not application_id.strip():
            raise ValueError("application_id cannot be empty")
        
        try:
            self.room_name = room_name
            
            # Generate S3 output path with timestamp
            timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
            s3_output_path = f"interviews/{application_id}/{timestamp}"
            
            logger.info(
                "Starting recording",
                extra={
                    "room_name": room_name,
                    "application_id": application_id,
                    "s3_path": s3_output_path
                }
            )
            
            # Configure egress to record composite (combined audio + video)
            egress_request = api.RoomCompositeEgressRequest(
                room_name=room_name,
                layout="grid",
                audio_only=False,
                video_only=False,
                file_outputs=[
                    api.EncodedFileOutput(
                        file_type=api.EncodedFileType.MP4,
                        filepath=f"{s3_output_path}/recording.mp4",
                        s3=api.S3Upload(
                            access_key=settings.aws_access_key_id,
                            secret=settings.aws_secret_access_key,
                            region=self.aws_region,
                            bucket=self.aws_bucket
                        )
                    )
                ]
            )
            
            # Start the egress (recording)
            egress = await self.livekit_api.egress.start_room_composite_egress(
                egress_request
            )
            self.recording_id = egress.egress_id
            
            logger.info(
                "Recording started successfully",
                extra={
                    "recording_id": self.recording_id,
                    "room_name": room_name,
                    "s3_url": f"s3://{self.aws_bucket}/{s3_output_path}/recording.mp4"
                }
            )
            
            return self.recording_id
            
        except Exception as e:
            error_msg = str(e).lower()
            
            if "concurrent egress" in error_msg or "resource_exhausted" in error_msg:
                logger.error(
                    "Recording limit exceeded",
                    extra={"room_name": room_name}
                )
                raise RecordingError(
                    "Concurrent recording limit reached. Please stop existing recordings or upgrade your LiveKit plan.",
                    details={"room_name": room_name}
                ) from e
            else:
                logger.error(
                    "Failed to start recording",
                    extra={"room_name": room_name, "error": str(e)},
                    exc_info=True
                )
                raise RecordingError(
                    f"Failed to start recording: {str(e)}",
                    details={"room_name": room_name}
                ) from e
    
    async def stop_recording(self) -> Optional[str]:
        """
        Stop the current recording and retrieve S3 path.
        
        Returns:
            S3 URL of the recorded video if successful, None otherwise
            
        Raises:
            RecordingError: If recording fails to stop
        """
        if not self.recording_id:
            logger.warning("No active recording to stop")
            return None
        
        try:
            logger.info(
                "Stopping recording",
                extra={"recording_id": self.recording_id}
            )
            
            # Stop the egress
            stop_request = api.StopEgressRequest(egress_id=self.recording_id)
            await self.livekit_api.egress.stop_egress(stop_request)
            
            logger.info(
                "Recording stopped, waiting for upload",
                extra={"recording_id": self.recording_id}
            )
            
            # Wait for file to be uploaded to S3
            await asyncio.sleep(5)
            
            # Get the egress info to retrieve file location
            egress_list_response = await self.livekit_api.egress.list_egress(
                api.ListEgressRequest(room_name=self.room_name)
            )
            
            # Find our recording in the list
            if hasattr(egress_list_response, 'items'):
                for egress in egress_list_response.items:
                    if egress.egress_id == self.recording_id:
                        if hasattr(egress, 'file') and egress.file:
                            if hasattr(egress.file, 'location'):
                                s3_path = egress.file.location
                                
                                # Check if it's already a full URL
                                if s3_path.startswith('http'):
                                    logger.info(
                                        "Recording uploaded successfully",
                                        extra={"recording_url": s3_path}
                                    )
                                    return s3_path
                                else:
                                    # Construct full S3 path
                                    full_path = f"s3://{self.aws_bucket}/{s3_path}"
                                    logger.info(
                                        "Recording uploaded successfully",
                                        extra={"recording_url": full_path}
                                    )
                                    return full_path
            
            logger.warning(
                "Could not retrieve S3 path from egress response",
                extra={"recording_id": self.recording_id}
            )
            return None
            
        except Exception as e:
            logger.error(
                "Failed to stop recording",
                extra={"recording_id": self.recording_id, "error": str(e)},
                exc_info=True
            )
            raise RecordingError(
                f"Failed to stop recording: {str(e)}",
                details={"recording_id": self.recording_id}
            ) from e
    
    async def get_recording_status(self) -> Optional[RecordingInfo]:
        """
        Get the status of the current recording.
        
        Returns:
            RecordingInfo with status information or None
            
        Raises:
            RecordingError: If status check fails
        """
        if not self.recording_id:
            return None
        
        try:
            egress_list_response = await self.livekit_api.egress.list_egress(
                api.ListEgressRequest(room_name=self.room_name)
            )
            
            if hasattr(egress_list_response, 'items'):
                for egress in egress_list_response.items:
                    if egress.egress_id == self.recording_id:
                        recording_info = RecordingInfo(
                            egress_id=egress.egress_id,
                            status=str(egress.status),
                            started_at=egress.started_at if hasattr(egress, 'started_at') else None,
                            ended_at=egress.ended_at if hasattr(egress, 'ended_at') else None
                        )
                        return recording_info
            
            return None
            
        except Exception as e:
            logger.error(
                "Failed to get recording status",
                extra={"recording_id": self.recording_id, "error": str(e)}
            )
            raise RecordingError(
                f"Failed to get recording status: {str(e)}",
                details={"recording_id": self.recording_id}
            ) from e
    
    def generate_presigned_url(
        self,
        s3_path: str,
        expiration: int = 3600
    ) -> Optional[str]:
        """
        Generate a presigned URL for the recorded video.
        
        Args:
            s3_path: S3 path to the video file
            expiration: URL expiration time in seconds (default 1 hour)
            
        Returns:
            Presigned URL if successful, None otherwise
            
        Raises:
            AWSError: If presigned URL generation fails
        """
        try:
            # If it's already an HTTP URL, return as-is
            if s3_path.startswith('http'):
                return s3_path
            
            # Extract key from s3:// URL if needed
            if s3_path.startswith('s3://'):
                s3_path = s3_path.replace(f's3://{self.aws_bucket}/', '')
            
            # Validate the key is not empty
            if not s3_path or s3_path.strip() == '':
                logger.error("S3 key is empty, cannot generate presigned URL")
                return None
            
            url = self.s3_client.generate_presigned_url(
                'get_object',
                Params={
                    'Bucket': self.aws_bucket,
                    'Key': s3_path
                },
                ExpiresIn=expiration
            )
            
            logger.info(
                "Generated presigned URL",
                extra={"s3_key": s3_path, "expiration": expiration}
            )
            
            return url
            
        except (ClientError, BotoCoreError) as e:
            logger.error(
                "Failed to generate presigned URL",
                extra={"s3_path": s3_path, "error": str(e)}
            )
            raise AWSError(
                f"Failed to generate presigned URL: {str(e)}",
                details={"s3_path": s3_path}
            ) from e
    
    async def close(self) -> None:
        """Close and cleanup resources."""
        # LiveKit API client doesn't need explicit cleanup
        # S3 client is managed by boto3
        logger.info("RecordingService cleanup completed")
    
    async def __aenter__(self):
        """Context manager entry."""
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """Context manager exit."""
        await self.close()
