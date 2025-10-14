"""
Cloud Storage Service for CV Files
Supports Azure Blob Storage and AWS S3 for storing generated CV files.
"""

import os
import asyncio
from pathlib import Path
from typing import Optional, Dict, Any, Union
from datetime import datetime, timedelta
from urllib.parse import urlparse
import logging
import time
from functools import wraps

# Cloud storage imports
try:
    import boto3
    from botocore.exceptions import ClientError, NoCredentialsError
    AWS_AVAILABLE = True
except ImportError:
    AWS_AVAILABLE = False
    boto3 = None

try:
    from azure.storage.blob import BlobServiceClient, BlobClient
    from azure.core.exceptions import AzureError
    AZURE_AVAILABLE = True
except ImportError:
    AZURE_AVAILABLE = False
    BlobServiceClient = None

logger = logging.getLogger(__name__)

def retry_with_backoff(max_retries: int = 3, backoff_factor: float = 1.0, exceptions: tuple = (Exception,)):
    """
    Decorator for retrying operations with exponential backoff.
    
    Args:
        max_retries: Maximum number of retry attempts
        backoff_factor: Multiplier for delay between retries
        exceptions: Tuple of exceptions to catch and retry
    """
    def decorator(func):
        @wraps(func)
        async def async_wrapper(*args, **kwargs):
            last_exception = None
            for attempt in range(max_retries + 1):
                try:
                    return await func(*args, **kwargs)
                except exceptions as e:
                    last_exception = e
                    if attempt == max_retries:
                        logger.error(f"Function {func.__name__} failed after {max_retries} retries: {e}")
                        raise e
                    
                    delay = backoff_factor * (2 ** attempt)
                    logger.warning(f"Attempt {attempt + 1} failed for {func.__name__}: {e}. Retrying in {delay:.2f}s...")
                    await asyncio.sleep(delay)
            
            raise last_exception
        
        @wraps(func)
        def sync_wrapper(*args, **kwargs):
            last_exception = None
            for attempt in range(max_retries + 1):
                try:
                    return func(*args, **kwargs)
                except exceptions as e:
                    last_exception = e
                    if attempt == max_retries:
                        logger.error(f"Function {func.__name__} failed after {max_retries} retries: {e}")
                        raise e
                    
                    delay = backoff_factor * (2 ** attempt)
                    logger.warning(f"Attempt {attempt + 1} failed for {func.__name__}: {e}. Retrying in {delay:.2f}s...")
                    time.sleep(delay)
            
            raise last_exception
        
        if asyncio.iscoroutinefunction(func):
            return async_wrapper
        else:
            return sync_wrapper
    
    return decorator

class CloudStorageConfig:
    """Configuration for cloud storage services."""
    
    def __init__(self):
        self.provider = os.getenv("CLOUD_STORAGE", "local").lower()
        
        # AWS Configuration
        self.aws_access_key = os.getenv("AWS_ACCESS_KEY_ID")
        self.aws_secret_key = os.getenv("AWS_SECRET_ACCESS_KEY")
        self.aws_region = os.getenv("AWS_REGION", "us-east-1")
        self.aws_bucket = os.getenv("AWS_S3_BUCKET", "rolevate-cv-outputs")
        
        # Azure Configuration
        self.azure_connection_string = os.getenv("AZURE_STORAGE_CONNECTION_STRING")
        self.azure_account_name = os.getenv("AZURE_STORAGE_ACCOUNT_NAME")
        self.azure_account_key = os.getenv("AZURE_STORAGE_ACCOUNT_KEY")
        self.azure_container = os.getenv("AZURE_CONTAINER_NAME", "rolevate-cv-outputs")
        
        # General Configuration
        self.base_path = os.getenv("CLOUD_STORAGE_BASE_PATH", "cv-files")
        self.public_read = os.getenv("CLOUD_STORAGE_PUBLIC_READ", "false").lower() == "true"
        self.expiry_days = int(os.getenv("CLOUD_STORAGE_EXPIRY_DAYS", "30"))

class AWSStorageProvider:
    """AWS S3 storage provider."""
    
    def __init__(self, config: CloudStorageConfig):
        if not AWS_AVAILABLE:
            raise ImportError("boto3 package required for AWS storage")
        
        self.config = config
        self.s3_client = None
        self._initialize_client()
    
    def _initialize_client(self):
        """Initialize AWS S3 client."""
        try:
            if self.config.aws_access_key and self.config.aws_secret_key:
                self.s3_client = boto3.client(
                    's3',
                    aws_access_key_id=self.config.aws_access_key,
                    aws_secret_access_key=self.config.aws_secret_key,
                    region_name=self.config.aws_region
                )
            else:
                # Use default credential chain
                self.s3_client = boto3.client('s3', region_name=self.config.aws_region)
            
            logger.info(f"AWS S3 client initialized for region: {self.config.aws_region}")
            
        except Exception as e:
            logger.error(f"Failed to initialize AWS S3 client: {e}")
            raise
    
    @retry_with_backoff(max_retries=3, backoff_factor=1.0, exceptions=(ClientError, Exception))
    async def upload_file(self, file_path: Union[str, Path], remote_key: str) -> str:
        """
        Upload file to AWS S3 with retry logic.
        
        Args:
            file_path: Local file path
            remote_key: S3 object key
            
        Returns:
            Public URL of uploaded file
        """
        try:
            file_path = Path(file_path)
            
            # Upload file
            extra_args = {}
            if self.config.public_read:
                extra_args['ACL'] = 'public-read'
            
            # Run in thread pool since boto3 is synchronous
            loop = asyncio.get_event_loop()
            await loop.run_in_executor(
                None,
                lambda: self.s3_client.upload_file(
                    str(file_path),
                    self.config.aws_bucket,
                    remote_key,
                    ExtraArgs=extra_args
                )
            )
            
            # Generate URL
            if self.config.public_read:
                url = f"https://{self.config.aws_bucket}.s3.{self.config.aws_region}.amazonaws.com/{remote_key}"
            else:
                # Generate presigned URL
                url = self.s3_client.generate_presigned_url(
                    'get_object',
                    Params={'Bucket': self.config.aws_bucket, 'Key': remote_key},
                    ExpiresIn=3600 * 24 * self.config.expiry_days  # Expires in configured days
                )
            
            logger.info(f"File uploaded to S3: {remote_key}")
            return url
            
        except ClientError as e:
            logger.error(f"AWS S3 upload failed: {e}")
            raise
        except Exception as e:
            logger.error(f"File upload failed: {e}")
            raise
    
    async def delete_file(self, remote_key: str) -> bool:
        """
        Delete file from AWS S3.
        
        Args:
            remote_key: S3 object key
            
        Returns:
            True if successful
        """
        try:
            loop = asyncio.get_event_loop()
            await loop.run_in_executor(
                None,
                lambda: self.s3_client.delete_object(
                    Bucket=self.config.aws_bucket,
                    Key=remote_key
                )
            )
            
            logger.info(f"File deleted from S3: {remote_key}")
            return True
            
        except ClientError as e:
            logger.error(f"AWS S3 delete failed: {e}")
            return False
    
    def get_bucket_info(self) -> Dict[str, Any]:
        """Get bucket information."""
        return {
            "provider": "aws_s3",
            "bucket": self.config.aws_bucket,
            "region": self.config.aws_region,
            "public_read": self.config.public_read
        }

class AzureStorageProvider:
    """Azure Blob Storage provider."""
    
    def __init__(self, config: CloudStorageConfig):
        if not AZURE_AVAILABLE:
            raise ImportError("azure-storage-blob package required for Azure storage")
        
        self.config = config
        self.blob_service_client = None
        self._initialize_client()
    
    def _initialize_client(self):
        """Initialize Azure Blob Storage client."""
        try:
            if self.config.azure_connection_string:
                self.blob_service_client = BlobServiceClient.from_connection_string(
                    self.config.azure_connection_string
                )
            elif self.config.azure_account_name and self.config.azure_account_key:
                account_url = f"https://{self.config.azure_account_name}.blob.core.windows.net"
                self.blob_service_client = BlobServiceClient(
                    account_url=account_url,
                    credential=self.config.azure_account_key
                )
            else:
                raise ValueError("Azure storage credentials not provided")
            
            logger.info("Azure Blob Storage client initialized")
            
        except Exception as e:
            logger.error(f"Failed to initialize Azure client: {e}")
            raise
    
    @retry_with_backoff(max_retries=3, backoff_factor=1.0, exceptions=(AzureError, Exception))
    async def upload_file(self, file_path: Union[str, Path], remote_key: str) -> str:
        """
        Upload file to Azure Blob Storage with retry logic.
        
        Args:
            file_path: Local file path
            remote_key: Blob name
            
        Returns:
            Public URL of uploaded file
        """
        try:
            file_path = Path(file_path)
            
            # Get blob client
            blob_client = self.blob_service_client.get_blob_client(
                container=self.config.azure_container,
                blob=remote_key
            )
            
            # Upload file
            with open(file_path, 'rb') as data:
                await asyncio.get_event_loop().run_in_executor(
                    None,
                    lambda: blob_client.upload_blob(data, overwrite=True)
                )
            
            # Generate URL
            if self.config.public_read:
                url = blob_client.url
            else:
                # Generate SAS URL for private access
                from azure.storage.blob import generate_blob_sas, BlobSasPermissions
                from datetime import timezone
                
                sas_token = generate_blob_sas(
                    account_name=self.config.azure_account_name,
                    container_name=self.config.azure_container,
                    blob_name=remote_key,
                    account_key=self.config.azure_account_key,
                    permission=BlobSasPermissions(read=True),
                    expiry=datetime.now(timezone.utc) + timedelta(days=self.config.expiry_days)
                )
                url = f"{blob_client.url}?{sas_token}"
            
            logger.info(f"File uploaded to Azure Blob: {remote_key}")
            return url
            
        except AzureError as e:
            logger.error(f"Azure Blob upload failed: {e}")
            raise
        except Exception as e:
            logger.error(f"File upload failed: {e}")
            raise
    
    async def delete_file(self, remote_key: str) -> bool:
        """
        Delete file from Azure Blob Storage.
        
        Args:
            remote_key: Blob name
            
        Returns:
            True if successful
        """
        try:
            blob_client = self.blob_service_client.get_blob_client(
                container=self.config.azure_container,
                blob=remote_key
            )
            
            await asyncio.get_event_loop().run_in_executor(
                None,
                blob_client.delete_blob
            )
            
            logger.info(f"File deleted from Azure Blob: {remote_key}")
            return True
            
        except AzureError as e:
            logger.error(f"Azure Blob delete failed: {e}")
            return False
    
    def get_bucket_info(self) -> Dict[str, Any]:
        """Get container information."""
        return {
            "provider": "azure_blob",
            "container": self.config.azure_container,
            "account": self.config.azure_account_name,
            "public_read": self.config.public_read
        }

class LocalStorageProvider:
    """Local filesystem storage provider (fallback)."""
    
    def __init__(self, config: CloudStorageConfig):
        self.config = config
        self.base_path = Path(os.getenv("LOCAL_STORAGE_PATH", "./outputs"))
        self.base_path.mkdir(exist_ok=True)
    
    async def upload_file(self, file_path: Union[str, Path], remote_key: str) -> str:
        """
        Copy file to local storage directory.
        
        Args:
            file_path: Source file path
            remote_key: Destination relative path
            
        Returns:
            Local file URL/path
        """
        try:
            source = Path(file_path)
            destination = self.base_path / remote_key
            
            # Create directory if it doesn't exist
            destination.parent.mkdir(parents=True, exist_ok=True)
            
            # Copy file
            import shutil
            shutil.copy2(source, destination)
            
            # Return local path (or could be a local server URL)
            url = f"file://{destination.absolute()}"
            logger.info(f"File copied to local storage: {destination}")
            
            return url
            
        except Exception as e:
            logger.error(f"Local file copy failed: {e}")
            raise
    
    async def delete_file(self, remote_key: str) -> bool:
        """Delete file from local storage."""
        try:
            file_path = self.base_path / remote_key
            if file_path.exists():
                file_path.unlink()
                logger.info(f"File deleted from local storage: {file_path}")
                return True
            return False
            
        except Exception as e:
            logger.error(f"Local file delete failed: {e}")
            return False
    
    def get_bucket_info(self) -> Dict[str, Any]:
        """Get local storage information."""
        return {
            "provider": "local_filesystem",
            "base_path": str(self.base_path),
            "public_read": True
        }

class CloudStorageService:
    """
    Unified cloud storage service supporting multiple providers.
    """
    
    def __init__(self):
        """Initialize cloud storage service."""
        self.config = CloudStorageConfig()
        self.provider = self._initialize_provider()
    
    def _initialize_provider(self):
        """Initialize the appropriate storage provider."""
        provider_name = self.config.provider
        
        if provider_name == "aws" and AWS_AVAILABLE:
            try:
                return AWSStorageProvider(self.config)
            except Exception as e:
                logger.warning(f"AWS provider initialization failed: {e}, falling back to local")
                return LocalStorageProvider(self.config)
        
        elif provider_name == "azure" and AZURE_AVAILABLE:
            try:
                return AzureStorageProvider(self.config)
            except Exception as e:
                logger.warning(f"Azure provider initialization failed: {e}, falling back to local")
                return LocalStorageProvider(self.config)
        
        else:
            logger.info(f"Using local storage provider (requested: {provider_name})")
            return LocalStorageProvider(self.config)
    
    def _generate_remote_key(self, filename: str, job_id: Optional[str] = None) -> str:
        """Generate remote storage key for a file."""
        timestamp = datetime.now().strftime("%Y%m%d")
        
        if job_id:
            return f"{self.config.base_path}/{timestamp}/{job_id}/{filename}"
        else:
            return f"{self.config.base_path}/{timestamp}/{filename}"
    
    async def upload_cv_file(
        self, 
        file_path: Union[str, Path], 
        filename: Optional[str] = None,
        job_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Upload CV file to cloud storage.
        
        Args:
            file_path: Local file path
            filename: Override filename
            job_id: Optional job ID for organization
            
        Returns:
            Upload result with URL and metadata
        """
        try:
            file_path = Path(file_path)
            
            if not file_path.exists():
                raise FileNotFoundError(f"File not found: {file_path}")
            
            # Generate filename and remote key
            if not filename:
                filename = file_path.name
            
            remote_key = self._generate_remote_key(filename, job_id)
            
            # Upload file
            cloud_url = await self.provider.upload_file(file_path, remote_key)
            
            return {
                "success": True,
                "cloud_url": cloud_url,
                "remote_key": remote_key,
                "filename": filename,
                "file_size": file_path.stat().st_size,
                "upload_timestamp": datetime.now().isoformat(),
                "provider_info": self.provider.get_bucket_info()
            }
            
        except Exception as e:
            logger.error(f"CV file upload failed: {e}")
            return {
                "success": False,
                "error": str(e),
                "filename": filename
            }
    
    async def delete_cv_file(self, remote_key: str) -> bool:
        """
        Delete CV file from cloud storage.
        
        Args:
            remote_key: Remote storage key
            
        Returns:
            True if successful
        """
        return await self.provider.delete_file(remote_key)
    
    def get_storage_info(self) -> Dict[str, Any]:
        """Get storage service information."""
        return {
            "provider": self.config.provider,
            "available_providers": {
                "aws": AWS_AVAILABLE,
                "azure": AZURE_AVAILABLE,
                "local": True
            },
            "config": self.provider.get_bucket_info()
        }

# Global service instance
_cloud_storage_service = None

def get_cloud_storage_service() -> CloudStorageService:
    """Get the global cloud storage service instance."""
    global _cloud_storage_service
    if _cloud_storage_service is None:
        _cloud_storage_service = CloudStorageService()
    return _cloud_storage_service

async def upload_cv_to_cloud(
    file_path: Union[str, Path],
    filename: Optional[str] = None,
    job_id: Optional[str] = None
) -> Dict[str, Any]:
    """
    Convenience function to upload CV file to cloud storage.
    
    Args:
        file_path: Local file path
        filename: Override filename
        job_id: Optional job ID
        
    Returns:
        Upload result
    """
    service = get_cloud_storage_service()
    return await service.upload_cv_file(file_path, filename, job_id)