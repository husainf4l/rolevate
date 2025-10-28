import os
import logging
import asyncio
from datetime import datetime
from typing import Optional
import boto3
from botocore.exceptions import ClientError
from livekit import api

logger = logging.getLogger("recording-service")


class RecordingService:
    """Service to handle LiveKit recording and AWS S3 upload"""
    
    def __init__(self):
        self.livekit_url = os.getenv("LIVEKIT_URL")
        self.livekit_api_key = os.getenv("LIVEKIT_API_KEY")
        self.livekit_api_secret = os.getenv("LIVEKIT_API_SECRET")
        
        self.aws_access_key = os.getenv("AWS_ACCESS_KEY_ID")
        self.aws_secret_key = os.getenv("AWS_SECRET_ACCESS_KEY")
        self.aws_region = os.getenv("AWS_REGION", "me-central-1")
        self.aws_bucket = os.getenv("AWS_BUCKET_NAME")
        
        self.recording_id: Optional[str] = None
        self.room_name: Optional[str] = None
        
        # Initialize S3 client
        self.s3_client = boto3.client(
            's3',
            aws_access_key_id=self.aws_access_key,
            aws_secret_access_key=self.aws_secret_key,
            region_name=self.aws_region
        )
        
        # Initialize LiveKit API client
        self.livekit_api = api.LiveKitAPI(
            url=self.livekit_url,
            api_key=self.livekit_api_key,
            api_secret=self.livekit_api_secret
        )
    
    async def start_recording(self, room_name: str, application_id: str) -> Optional[str]:
        """
        Start recording the LiveKit room
        
        Args:
            room_name: Name of the LiveKit room
            application_id: Application ID for file naming
            
        Returns:
            Recording ID if successful, None otherwise
        """
        try:
            self.room_name = room_name
            
            # Generate S3 output path
            timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
            s3_output_path = f"interviews/{application_id}/{timestamp}"
            
            # Configure egress to record composite (combined audio + video)
            egress_request = api.RoomCompositeEgressRequest(
                room_name=room_name,
                layout="grid",  # Grid layout for all participants
                audio_only=False,
                video_only=False,
                file_outputs=[
                    api.EncodedFileOutput(
                        file_type=api.EncodedFileType.MP4,
                        filepath=f"{s3_output_path}/recording.mp4",
                        s3=api.S3Upload(
                            access_key=self.aws_access_key,
                            secret=self.aws_secret_key,
                            region=self.aws_region,
                            bucket=self.aws_bucket
                        )
                    )
                ]
            )
            
            # Start the egress (recording)
            egress = await self.livekit_api.egress.start_room_composite_egress(egress_request)
            self.recording_id = egress.egress_id
            
            logger.info(f"Recording started: {self.recording_id} for room {room_name}")
            logger.info(f"Output path: s3://{self.aws_bucket}/{s3_output_path}/recording.mp4")
            
            return self.recording_id
            
        except Exception as e:
            error_msg = str(e)
            if "concurrent egress sessions limit exceeded" in error_msg or "resource_exhausted" in error_msg:
                logger.error(f"Failed to start recording: Concurrent recording limit reached. Please stop existing recordings or upgrade your LiveKit plan.")
            else:
                logger.error(f"Failed to start recording: {e}")
            return None
    
    async def stop_recording(self) -> Optional[str]:
        """
        Stop the current recording
        
        Returns:
            S3 URL of the recorded video if successful, None otherwise
        """
        if not self.recording_id:
            logger.warning("No active recording to stop")
            return None
        
        try:
            # Stop the egress using StopEgressRequest
            stop_request = api.StopEgressRequest(egress_id=self.recording_id)
            egress = await self.livekit_api.egress.stop_egress(stop_request)
            
            logger.info(f"Recording stopped: {self.recording_id}")
            
            # Wait a moment for the file to be uploaded
            await asyncio.sleep(5)
            
            # Get the egress info to retrieve file location
            egress_list_response = await self.livekit_api.egress.list_egress(
                api.ListEgressRequest(room_name=self.room_name)
            )
            
            # Access the items property of the response
            if hasattr(egress_list_response, 'items'):
                for e in egress_list_response.items:
                    if e.egress_id == self.recording_id:
                        if hasattr(e, 'file') and e.file and hasattr(e.file, 'location'):
                            s3_path = e.file.location
                            # Check if it's already a full URL or just a path
                            if s3_path.startswith('http'):
                                logger.info(f"Recording uploaded to: {s3_path}")
                                return s3_path
                            else:
                                # It's just the S3 key, construct the path
                                full_path = f"s3://{self.aws_bucket}/{s3_path}"
                                logger.info(f"Recording uploaded to: {full_path}")
                                return full_path
            
            # If we can't find the path, log what we have
            logger.warning(f"Could not retrieve S3 path from egress response. Recording ID: {self.recording_id}")
            return None
            
        except Exception as e:
            logger.error(f"Failed to stop recording: {e}", exc_info=True)
            return None
    
    async def get_recording_status(self) -> Optional[dict]:
        """
        Get the status of the current recording
        
        Returns:
            Dictionary with recording status information
        """
        if not self.recording_id:
            return None
        
        try:
            egress_list_response = await self.livekit_api.egress.list_egress(
                api.ListEgressRequest(room_name=self.room_name)
            )
            
            # Access the items property of the response
            if hasattr(egress_list_response, 'items'):
                for e in egress_list_response.items:
                    if e.egress_id == self.recording_id:
                        return {
                            "egress_id": e.egress_id,
                            "status": e.status,
                            "started_at": e.started_at,
                            "ended_at": e.ended_at if hasattr(e, 'ended_at') else None
                        }
            
            return None
            
        except Exception as e:
            logger.error(f"Failed to get recording status: {e}")
            return None
    
    def generate_presigned_url(self, s3_path: str, expiration: int = 3600) -> Optional[str]:
        """
        Generate a presigned URL for the recorded video
        
        Args:
            s3_path: S3 path to the video file (can be s3:// URL or just the key)
            expiration: URL expiration time in seconds (default 1 hour)
            
        Returns:
            Presigned URL if successful, None otherwise
        """
        try:
            # If it's already an HTTP URL, return it as-is
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
            
            return url
            
        except ClientError as e:
            logger.error(f"Failed to generate presigned URL: {e}")
            return None
