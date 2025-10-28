"""
AWS S3 Service - Simplified
"""

import logging
import boto3
from pathlib import Path
from datetime import datetime
from ..core.config import settings

logger = logging.getLogger(__name__)


def upload_video_to_s3(file_path: str, application_id: str) -> str:
    """Upload video to S3 and return URL"""
    if not settings.aws_bucket_name:
        logger.warning("S3 not configured")
        return None
    
    if not Path(file_path).exists():
        logger.error(f"File not found: {file_path}")
        return None
    
    try:
        # Initialize S3 client
        s3 = boto3.client(
            's3',
            aws_access_key_id=settings.aws_access_key_id,
            aws_secret_access_key=settings.aws_secret_access_key,
            region_name=settings.aws_region
        )
        
        # Generate S3 key
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = Path(file_path).name
        s3_key = f"interviews/{application_id}/{timestamp}_{filename}"
        
        # Upload
        logger.info(f"Uploading to S3: {s3_key}")
        s3.upload_file(file_path, settings.aws_bucket_name, s3_key)
        
        # Return URL
        url = f"https://{settings.aws_bucket_name}.s3.{settings.aws_region}.amazonaws.com/{s3_key}"
        logger.info(f"✅ Uploaded: {url}")
        return url
        
    except Exception as e:
        logger.error(f"❌ S3 upload failed: {e}")
        return None

