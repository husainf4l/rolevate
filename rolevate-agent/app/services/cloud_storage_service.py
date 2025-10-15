"""
Cloud Storage Service - S3/Azure integration for CV file storage
Provides cloud storage capabilities with fallback to local storage
"""
import asyncio
from typing import Dict, Any, List, Optional, Union, BinaryIO
from pathlib import Path
import json
import hashlib
from datetime import datetime, timezone
from loguru import logger
import aiofiles
import boto3
from botocore.exceptions import ClientError, NoCredentialsError
from botocore.config import Config
import uuid

from app.config import settings


class CloudStorageService:
    """
    Cloud storage service with S3 primary and local fallback
    Handles CV files, PDFs, and associated metadata
    """
    
    def __init__(self):
        self.s3_client = None
        self.bucket_name = getattr(settings, 's3_bucket_name', None)
        self.use_cloud = False
        
        # Local fallback paths
        self.local_storage_path = Path(getattr(settings, 'cv_storage_path', './storage'))
        self.local_storage_path.mkdir(parents=True, exist_ok=True)
        
        # Initialize cloud storage if configured
        self._initialize_cloud_storage()
    
    def _initialize_cloud_storage(self):
        """Initialize S3 client if credentials are available"""
        try:
            # Check for AWS credentials
            aws_access_key = getattr(settings, 'aws_access_key_id', None)
            aws_secret_key = getattr(settings, 'aws_secret_access_key', None)
            aws_region = getattr(settings, 'aws_region', 'us-east-1')
            
            if aws_access_key and aws_secret_key and self.bucket_name:
                self.s3_client = boto3.client(
                    's3',
                    aws_access_key_id=aws_access_key,
                    aws_secret_access_key=aws_secret_key,
                    region_name=aws_region,
                    config=Config(
                        retries={'max_attempts': 3},
                        max_pool_connections=10
                    )
                )
                
                # Test connection
                self.s3_client.head_bucket(Bucket=self.bucket_name)
                self.use_cloud = True
                logger.success(f"✅ S3 storage initialized: {self.bucket_name}")
                
            else:
                logger.warning("⚠️ AWS S3 credentials not configured, using local storage")
                
        except (ClientError, NoCredentialsError, Exception) as e:
            logger.warning(f"⚠️ S3 initialization failed, using local storage: {e}")
            self.use_cloud = False
    
    async def store_cv_file(self, cv_id: str, cv_data: Dict[str, Any], 
                           user_id: Optional[str] = None) -> Dict[str, Any]:
        """Store CV data file with automatic cloud/local fallback"""
        
        timestamp = datetime.now(timezone.utc)
        file_key = f"cv_data/{user_id or 'anonymous'}/{cv_id}/cv_data_{timestamp.strftime('%Y%m%d_%H%M%S')}.json"
        
        try:
            # Convert to JSON string
            cv_json = json.dumps(cv_data, indent=2, ensure_ascii=False)
            cv_bytes = cv_json.encode('utf-8')
            
            if self.use_cloud:
                return await self._store_to_s3(file_key, cv_bytes, cv_id, user_id)
            else:
                return await self._store_to_local(file_key, cv_bytes, cv_id, user_id)
                
        except Exception as e:
            logger.error(f"❌ Failed to store CV file: {e}")
            # Fallback to local storage
            if self.use_cloud:
                logger.info("🔄 Falling back to local storage")
                return await self._store_to_local(file_key, cv_bytes, cv_id, user_id)
            raise
    
    async def store_pdf_file(self, cv_id: str, pdf_content: bytes, 
                            filename: str, user_id: Optional[str] = None) -> Dict[str, Any]:
        """Store generated PDF file"""
        
        timestamp = datetime.now(timezone.utc)
        file_key = f"pdfs/{user_id or 'anonymous'}/{cv_id}/{filename}_{timestamp.strftime('%Y%m%d_%H%M%S')}.pdf"
        
        try:
            if self.use_cloud:
                return await self._store_to_s3(file_key, pdf_content, cv_id, user_id, content_type='application/pdf')
            else:
                return await self._store_to_local(file_key, pdf_content, cv_id, user_id)
                
        except Exception as e:
            logger.error(f"❌ Failed to store PDF file: {e}")
            if self.use_cloud:
                logger.info("🔄 Falling back to local storage")
                return await self._store_to_local(file_key, pdf_content, cv_id, user_id)
            raise
    
    async def _store_to_s3(self, file_key: str, content: bytes, cv_id: str, 
                          user_id: Optional[str], content_type: str = 'application/json') -> Dict[str, Any]:
        """Store file to S3"""
        
        try:
            # Add metadata
            metadata = {
                'cv-id': cv_id,
                'user-id': user_id or 'anonymous',
                'upload-timestamp': datetime.now(timezone.utc).isoformat(),
                'content-hash': hashlib.sha256(content).hexdigest()
            }
            
            # Upload to S3
            await asyncio.get_event_loop().run_in_executor(
                None,
                lambda: self.s3_client.put_object(
                    Bucket=self.bucket_name,
                    Key=file_key,
                    Body=content,
                    ContentType=content_type,
                    Metadata=metadata,
                    ServerSideEncryption='AES256'
                )
            )
            
            # Generate presigned URL for access (expires in 1 hour)
            presigned_url = self.s3_client.generate_presigned_url(
                'get_object',
                Params={'Bucket': self.bucket_name, 'Key': file_key},
                ExpiresIn=3600
            )
            
            logger.success(f"✅ File stored to S3: {file_key}")
            
            return {
                'storage_type': 'S3',
                'bucket': self.bucket_name,
                'key': file_key,
                'url': presigned_url,
                'metadata': metadata,
                'size_bytes': len(content),
                'stored_at': datetime.now(timezone.utc).isoformat()
            }
            
        except Exception as e:
            logger.error(f"❌ S3 storage failed: {e}")
            raise
    
    async def _store_to_local(self, file_key: str, content: bytes, cv_id: str, 
                             user_id: Optional[str]) -> Dict[str, Any]:
        """Store file to local filesystem"""
        
        try:
            # Create directory structure
            local_path = self.local_storage_path / file_key
            local_path.parent.mkdir(parents=True, exist_ok=True)
            
            # Write file
            async with aiofiles.open(local_path, 'wb') as f:
                await f.write(content)
            
            # Create metadata file
            metadata = {
                'cv_id': cv_id,
                'user_id': user_id or 'anonymous',
                'upload_timestamp': datetime.now(timezone.utc).isoformat(),
                'content_hash': hashlib.sha256(content).hexdigest(),
                'file_path': str(local_path)
            }
            
            metadata_path = local_path.with_suffix(local_path.suffix + '.meta.json')
            async with aiofiles.open(metadata_path, 'w') as f:
                await f.write(json.dumps(metadata, indent=2))
            
            logger.success(f"✅ File stored locally: {local_path}")
            
            return {
                'storage_type': 'Local',
                'file_path': str(local_path),
                'metadata': metadata,
                'size_bytes': len(content),
                'stored_at': datetime.now(timezone.utc).isoformat()
            }
            
        except Exception as e:
            logger.error(f"❌ Local storage failed: {e}")
            raise
    
    async def retrieve_cv_file(self, cv_id: str, user_id: Optional[str] = None, 
                              version: Optional[str] = None) -> Optional[Dict[str, Any]]:
        """Retrieve CV file from storage"""
        
        try:
            if self.use_cloud:
                return await self._retrieve_from_s3(cv_id, user_id, version)
            else:
                return await self._retrieve_from_local(cv_id, user_id, version)
                
        except Exception as e:
            logger.error(f"❌ Failed to retrieve CV file: {e}")
            return None
    
    async def _retrieve_from_s3(self, cv_id: str, user_id: Optional[str], 
                               version: Optional[str]) -> Optional[Dict[str, Any]]:
        """Retrieve file from S3"""
        
        try:
            # List objects with the CV ID prefix
            prefix = f"cv_data/{user_id or 'anonymous'}/{cv_id}/"
            
            response = await asyncio.get_event_loop().run_in_executor(
                None,
                lambda: self.s3_client.list_objects_v2(
                    Bucket=self.bucket_name,
                    Prefix=prefix
                )
            )
            
            if 'Contents' not in response:
                return None
            
            # Get the most recent file (or specific version)
            objects = sorted(response['Contents'], key=lambda x: x['LastModified'], reverse=True)
            if not objects:
                return None
            
            # Download the file
            key = objects[0]['Key']
            obj_response = await asyncio.get_event_loop().run_in_executor(
                None,
                lambda: self.s3_client.get_object(Bucket=self.bucket_name, Key=key)
            )
            
            content = obj_response['Body'].read()
            cv_data = json.loads(content.decode('utf-8'))
            
            return {
                'cv_data': cv_data,
                'metadata': obj_response.get('Metadata', {}),
                'last_modified': obj_response['LastModified'].isoformat(),
                'storage_type': 'S3',
                'key': key
            }
            
        except Exception as e:
            logger.error(f"❌ S3 retrieval failed: {e}")
            return None
    
    async def _retrieve_from_local(self, cv_id: str, user_id: Optional[str], 
                                  version: Optional[str]) -> Optional[Dict[str, Any]]:
        """Retrieve file from local storage"""
        
        try:
            # Find CV files
            cv_dir = self.local_storage_path / "cv_data" / (user_id or 'anonymous') / cv_id
            
            if not cv_dir.exists():
                return None
            
            # Get the most recent CV file
            json_files = list(cv_dir.glob("cv_data_*.json"))
            if not json_files:
                return None
            
            # Sort by timestamp and get the latest
            json_files.sort(key=lambda x: x.stat().st_mtime, reverse=True)
            latest_file = json_files[0]
            
            # Read the file
            async with aiofiles.open(latest_file, 'r', encoding='utf-8') as f:
                content = await f.read()
                cv_data = json.loads(content)
            
            # Read metadata if available
            metadata_file = latest_file.with_suffix('.json.meta.json')
            metadata = {}
            if metadata_file.exists():
                async with aiofiles.open(metadata_file, 'r') as f:
                    metadata = json.loads(await f.read())
            
            return {
                'cv_data': cv_data,
                'metadata': metadata,
                'last_modified': datetime.fromtimestamp(latest_file.stat().st_mtime).isoformat(),
                'storage_type': 'Local',
                'file_path': str(latest_file)
            }
            
        except Exception as e:
            logger.error(f"❌ Local retrieval failed: {e}")
            return None
    
    async def delete_cv_files(self, cv_id: str, user_id: Optional[str] = None) -> bool:
        """Delete all files associated with a CV"""
        
        try:
            if self.use_cloud:
                success = await self._delete_from_s3(cv_id, user_id)
            else:
                success = await self._delete_from_local(cv_id, user_id)
            
            if success:
                logger.success(f"✅ CV files deleted: {cv_id}")
            else:
                logger.warning(f"⚠️ Some CV files may not have been deleted: {cv_id}")
            
            return success
            
        except Exception as e:
            logger.error(f"❌ Failed to delete CV files: {e}")
            return False
    
    async def _delete_from_s3(self, cv_id: str, user_id: Optional[str]) -> bool:
        """Delete files from S3"""
        
        try:
            prefix = f"cv_data/{user_id or 'anonymous'}/{cv_id}/"
            
            # List all objects with the prefix
            response = await asyncio.get_event_loop().run_in_executor(
                None,
                lambda: self.s3_client.list_objects_v2(
                    Bucket=self.bucket_name,
                    Prefix=prefix
                )
            )
            
            if 'Contents' not in response:
                return True  # Nothing to delete
            
            # Delete all objects
            objects_to_delete = [{'Key': obj['Key']} for obj in response['Contents']]
            
            await asyncio.get_event_loop().run_in_executor(
                None,
                lambda: self.s3_client.delete_objects(
                    Bucket=self.bucket_name,
                    Delete={'Objects': objects_to_delete}
                )
            )
            
            return True
            
        except Exception as e:
            logger.error(f"❌ S3 deletion failed: {e}")
            return False
    
    async def _delete_from_local(self, cv_id: str, user_id: Optional[str]) -> bool:
        """Delete files from local storage"""
        
        try:
            cv_dir = self.local_storage_path / "cv_data" / (user_id or 'anonymous') / cv_id
            
            if cv_dir.exists():
                # Remove all files in the directory
                import shutil
                await asyncio.get_event_loop().run_in_executor(
                    None, shutil.rmtree, str(cv_dir)
                )
            
            return True
            
        except Exception as e:
            logger.error(f"❌ Local deletion failed: {e}")
            return False
    
    def get_storage_info(self) -> Dict[str, Any]:
        """Get current storage configuration info"""
        
        return {
            'storage_type': 'S3' if self.use_cloud else 'Local',
            'bucket': self.bucket_name if self.use_cloud else None,
            'local_path': str(self.local_storage_path),
            'cloud_available': self.use_cloud,
            'features': {
                'versioning': True,
                'metadata': True,
                'encryption': self.use_cloud,  # S3 server-side encryption
                'presigned_urls': self.use_cloud
            }
        }


# Convenience function for getting storage service instance
def get_cloud_storage() -> CloudStorageService:
    """Get a singleton instance of CloudStorageService"""
    if not hasattr(get_cloud_storage, '_instance'):
        get_cloud_storage._instance = CloudStorageService()
    return get_cloud_storage._instance