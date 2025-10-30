import boto3
from botocore.exceptions import BotoCoreError, ClientError
from typing import Optional

s3 = boto3.client("s3")

def download_s3_object(bucket: str, key: str, dest_path: str) -> Optional[str]:
    """Download S3 object to dest_path and return local path on success"""
    try:
        s3.download_file(bucket, key, dest_path)
        return dest_path
    except (BotoCoreError, ClientError) as e:
        print(f"Error downloading from S3: {e}")
        return None

def parse_s3_url(s3_url: str):
    """Parse s3://bucket/key into bucket and key"""
    assert s3_url.startswith("s3://"), "Not an S3 URL"
    parts = s3_url[5:].split("/", 1)
    bucket = parts[0]
    key = parts[1] if len(parts) > 1 else ""
    return bucket, key
