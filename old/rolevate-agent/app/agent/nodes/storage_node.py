"""
Storage Node - Handle final storage, versioning, and retrieval of CV data
Manages database operations, file storage, and version control for generated CVs
"""
import asyncio
from typing import Dict, Any, List, Optional, Tuple
from pydantic import BaseModel, Field
from loguru import logger
import json
import uuid
from datetime import datetime, timezone, timedelta
from pathlib import Path
import aiofiles
import hashlib
# from sqlalchemy.ext.asyncio import AsyncSession  # Temporarily disabled
# from sqlalchemy import select, update, insert  # Temporarily disabled

from app.config import settings
# from app.database import get_db_session  # Temporarily disabled
# from app.models.schemas import CVData, CVVersion, CVTemplate  # Temporarily disabled
from app.models.user import User
from app.services.cloud_storage_service import get_cloud_storage


class CVStorageManager:
    """Advanced CV storage and versioning system"""
    
    def __init__(self):
        self.base_storage_path = Path(settings.cv_storage_path)
        self.base_storage_path.mkdir(parents=True, exist_ok=True)
        
        # Storage subdirectories
        self.cv_data_path = self.base_storage_path / "cv_data"
        self.pdf_output_path = self.base_storage_path / "pdf_outputs"
        self.template_cache_path = self.base_storage_path / "template_cache"
        self.backup_path = self.base_storage_path / "backups"
        
        # Create all directories
        for path in [self.cv_data_path, self.pdf_output_path, 
                    self.template_cache_path, self.backup_path]:
            path.mkdir(parents=True, exist_ok=True)
        
        # Initialize cloud storage service
        self.cloud_storage = get_cloud_storage()
    
    def generate_cv_id(self) -> str:
        """Generate unique CV identifier"""
        return str(uuid.uuid4())
    
    def generate_version_hash(self, cv_data: Dict[str, Any]) -> str:
        """Generate hash for CV version tracking"""
        
        # Create a stable representation for hashing
        stable_data = self._create_stable_cv_representation(cv_data)
        cv_string = json.dumps(stable_data, sort_keys=True, ensure_ascii=False)
        
        return hashlib.sha256(cv_string.encode('utf-8')).hexdigest()[:16]
    
    def _create_stable_cv_representation(self, cv_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create stable representation of CV data for hashing"""
        
        stable_data = {}
        
        # Include key fields that affect CV content
        key_fields = [
            "personal_info", "summary", "experiences", "education", 
            "skills", "projects", "certifications", "languages"
        ]
        
        for field in key_fields:
            if field in cv_data:
                if field == "experiences":
                    # Sort experiences by start date for consistency
                    experiences = cv_data[field]
                    if isinstance(experiences, list):
                        sorted_exp = sorted(
                            experiences, 
                            key=lambda x: x.get("start_date", ""), 
                            reverse=True
                        )
                        stable_data[field] = sorted_exp
                    else:
                        stable_data[field] = experiences
                else:
                    stable_data[field] = cv_data[field]
        
        return stable_data
    
    async def store_cv_data(self, cv_id: str, cv_data: Dict[str, Any], 
                           user_id: Optional[str] = None) -> Dict[str, Any]:
        """Store CV data to cloud storage with local fallback"""
        
        logger.info(f"💾 Storing CV data for ID: {cv_id}")
        
        try:
            # Generate version information
            version_hash = self.generate_version_hash(cv_data)
            timestamp = datetime.now(timezone.utc)
            
            # Create storage metadata
            storage_metadata = {
                "cv_id": cv_id,
                "version_hash": version_hash,
                "created_at": timestamp.isoformat(),
                "user_id": user_id,
                "data_size": len(json.dumps(cv_data).encode('utf-8')),
                "sections_count": len([k for k in cv_data.keys() if cv_data.get(k)])
            }
            
            # Store to cloud storage (with local fallback)
            cloud_result = await self.cloud_storage.store_cv_file(cv_id, cv_data, user_id)
            storage_metadata.update(cloud_result)
            
            # Also store to local filesystem as backup
            local_path = await self._store_cv_to_filesystem(cv_id, cv_data, storage_metadata)
            storage_metadata["backup_path"] = str(local_path)
            
            # Store to database if user_id provided
            if user_id:
                db_record = await self._store_cv_to_database(cv_id, cv_data, user_id, version_hash)
                storage_metadata["database_id"] = db_record["id"]
            
            logger.success(f"✅ CV data stored successfully: {cv_id} ({storage_metadata.get('storage_type', 'Unknown')})")
            return storage_metadata
            
        except Exception as e:
            logger.error(f"❌ Failed to store CV data: {e}")
            raise
    
    async def _store_cv_to_filesystem(self, cv_id: str, cv_data: Dict[str, Any], 
                                     metadata: Dict[str, Any]) -> Path:
        """Store CV data to filesystem with metadata"""
        
        # Create CV-specific directory
        cv_dir = self.cv_data_path / cv_id
        cv_dir.mkdir(parents=True, exist_ok=True)
        
        # Store main CV data
        cv_file_path = cv_dir / "cv_data.json"
        async with aiofiles.open(cv_file_path, 'w', encoding='utf-8') as f:
            await f.write(json.dumps(cv_data, indent=2, ensure_ascii=False))
        
        # Store metadata
        metadata_file_path = cv_dir / "metadata.json"
        async with aiofiles.open(metadata_file_path, 'w', encoding='utf-8') as f:
            await f.write(json.dumps(metadata, indent=2, ensure_ascii=False))
        
        return cv_file_path
    
    async def _store_cv_to_database(self, cv_id: str, cv_data: Dict[str, Any], 
                                   user_id: str, version_hash: str) -> Dict[str, Any]:
        """Store CV data to database (temporarily disabled)"""
        
        # Temporarily return mock data instead of database operations
        logger.info("Database storage temporarily disabled, returning mock data")
        return {"id": f"mock_{cv_id}", "version_hash": version_hash}
    
    async def retrieve_cv_data(self, cv_id: str, version_hash: Optional[str] = None) -> Optional[Dict[str, Any]]:
        """Retrieve CV data by ID and optionally by version"""
        
        logger.info(f"📖 Retrieving CV data: {cv_id}")
        
        try:
            # Try filesystem first
            cv_dir = self.cv_data_path / cv_id
            if cv_dir.exists():
                cv_file_path = cv_dir / "cv_data.json"
                if cv_file_path.exists():
                    async with aiofiles.open(cv_file_path, 'r', encoding='utf-8') as f:
                        content = await f.read()
                        cv_data = json.loads(content)
                        
                        # Check version if specified
                        if version_hash:
                            current_hash = self.generate_version_hash(cv_data)
                            if current_hash != version_hash:
                                return await self._retrieve_cv_version_from_db(cv_id, version_hash)
                        
                        return cv_data
            
            # Fallback to database
            return await self._retrieve_cv_from_database(cv_id, version_hash)
            
        except Exception as e:
            logger.error(f"❌ Failed to retrieve CV data: {e}")
            return None
    
    async def _retrieve_cv_from_database(self, cv_id: str, version_hash: Optional[str] = None) -> Optional[Dict[str, Any]]:
        """Retrieve CV data from database (temporarily disabled)"""
        
        logger.info("Database retrieval temporarily disabled")
        return None
    
    async def _retrieve_cv_version_from_db(self, cv_id: str, version_hash: str) -> Optional[Dict[str, Any]]:
        """Retrieve specific version from database"""
        return await self._retrieve_cv_from_database(cv_id, version_hash)
    
    async def store_pdf_output(self, cv_id: str, pdf_content: bytes, 
                              template_name: str, metadata: Dict[str, Any] = None) -> str:
        """Store generated PDF output"""
        
        logger.info(f"📄 Storing PDF output for CV: {cv_id}")
        
        try:
            # Create filename with template and timestamp
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            pdf_filename = f"{cv_id}_{template_name}_{timestamp}.pdf"
            pdf_path = self.pdf_output_path / pdf_filename
            
            # Store PDF content
            async with aiofiles.open(pdf_path, 'wb') as f:
                await f.write(pdf_content)
            
            # Store PDF metadata
            pdf_metadata = {
                "cv_id": cv_id,
                "template_name": template_name,
                "filename": pdf_filename,
                "file_size": len(pdf_content),
                "created_at": datetime.now(timezone.utc).isoformat(),
                "file_path": str(pdf_path),
                **(metadata or {})
            }
            
            metadata_path = self.pdf_output_path / f"{pdf_filename}.meta.json"
            async with aiofiles.open(metadata_path, 'w', encoding='utf-8') as f:
                await f.write(json.dumps(pdf_metadata, indent=2))
            
            logger.success(f"✅ PDF stored: {pdf_filename}")
            return str(pdf_path)
            
        except Exception as e:
            logger.error(f"❌ Failed to store PDF: {e}")
            raise
    
    async def list_cv_versions(self, cv_id: str, user_id: Optional[str] = None) -> List[Dict[str, Any]]:
        """List all versions of a CV (temporarily disabled)"""
        
        logger.info("CV version listing temporarily disabled")
        return []
    
    async def create_backup(self, cv_id: str) -> Optional[str]:
        """Create backup of CV data"""
        
        logger.info(f"💾 Creating backup for CV: {cv_id}")
        
        try:
            # Get current CV data
            cv_data = await self.retrieve_cv_data(cv_id)
            if not cv_data:
                logger.warning(f"No CV data found for backup: {cv_id}")
                return None
            
            # Create backup filename
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            backup_filename = f"{cv_id}_backup_{timestamp}.json"
            backup_path = self.backup_path / backup_filename
            
            # Store backup with metadata
            backup_data = {
                "cv_id": cv_id,
                "backup_created_at": datetime.now(timezone.utc).isoformat(),
                "version_hash": self.generate_version_hash(cv_data),
                "cv_data": cv_data
            }
            
            async with aiofiles.open(backup_path, 'w', encoding='utf-8') as f:
                await f.write(json.dumps(backup_data, indent=2, ensure_ascii=False))
            
            logger.success(f"✅ Backup created: {backup_filename}")
            return str(backup_path)
            
        except Exception as e:
            logger.error(f"❌ Backup creation failed: {e}")
            return None
    
    async def cleanup_old_files(self, days_old: int = 30) -> Dict[str, int]:
        """Clean up old CV files and backups"""
        
        logger.info(f"🧹 Cleaning up files older than {days_old} days...")
        
        cleanup_stats = {"deleted_files": 0, "freed_space": 0}
        
        try:
            cutoff_time = datetime.now() - timedelta(days=days_old)
            
            for directory in [self.pdf_output_path, self.backup_path, self.template_cache_path]:
                for file_path in directory.iterdir():
                    if file_path.is_file():
                        file_age = datetime.fromtimestamp(file_path.stat().st_mtime)
                        
                        if file_age < cutoff_time:
                            file_size = file_path.stat().st_size
                            file_path.unlink()
                            cleanup_stats["deleted_files"] += 1
                            cleanup_stats["freed_space"] += file_size
            
            logger.success(f"✅ Cleanup completed: {cleanup_stats}")
            return cleanup_stats
            
        except Exception as e:
            logger.error(f"❌ Cleanup failed: {e}")
            return cleanup_stats


async def storage_node(state: Dict[str, Any]) -> Dict[str, Any]:
    """
    LangGraph node for CV data storage and management
    
    Input: state with 'cv_memory' and 'rendered_pdf' to store
    Output: state with storage information and file paths
    """
    logger.info("💾 Starting CV storage operations...")
    
    try:
        storage_manager = CVStorageManager()
        
        # Get data from state
        cv_memory = state.get("cv_memory", {})
        rendered_pdf = state.get("rendered_pdf", {})
        user_id = state.get("user_id")
        
        # Handle template name extraction safely
        selected_template = state.get("selected_template", {})
        if isinstance(selected_template, dict):
            template_name = selected_template.get("name", "default")
        elif isinstance(selected_template, str):
            template_name = selected_template
        else:
            template_name = "default"
        
        if not cv_memory:
            logger.warning("No CV data found for storage")
            state["processing_step"] = "storage_skipped"
            return state
        
        # Generate CV ID if not present
        cv_id = state.get("cv_id") or storage_manager.generate_cv_id()
        
        # Store CV data
        storage_metadata = await storage_manager.store_cv_data(cv_id, cv_memory, user_id)
        
        # Store PDF if available
        pdf_path = None
        if isinstance(rendered_pdf, dict) and rendered_pdf.get("content"):
            pdf_path = await storage_manager.store_pdf_output(
                cv_id, 
                rendered_pdf["content"], 
                template_name,
                {"optimization_report": state.get("optimization_report")}
            )
        elif isinstance(rendered_pdf, str) and rendered_pdf:
            # Handle case where rendered_pdf is a direct path string
            pdf_path = rendered_pdf
        
        # Create backup
        backup_path = await storage_manager.create_backup(cv_id)
        
        # Update state with storage information
        storage_info = {
            "cv_id": cv_id,
            "storage_metadata": storage_metadata,
            "pdf_path": pdf_path,
            "backup_path": backup_path,
            "stored_at": datetime.now(timezone.utc).isoformat()
        }
        
        state["cv_id"] = cv_id
        state["storage_info"] = storage_info
        state["processing_step"] = "storage_complete"
        
        logger.success(f"✅ CV storage completed successfully: {cv_id}")
        
        return state
        
    except Exception as e:
        logger.error(f"❌ CV storage failed: {e}")
        state["processing_step"] = f"storage_error: {str(e)}"
        return state


# Input/Output Schemas for LangGraph
class StorageInput(BaseModel):
    """Input schema for storage node"""
    cv_memory: Dict[str, Any] = Field(..., description="CV data to store")
    rendered_pdf: Dict[str, Any] = Field(default={}, description="Rendered PDF data")
    user_id: Optional[str] = Field(default=None, description="User ID for database storage")
    cv_id: Optional[str] = Field(default=None, description="CV ID (generated if not provided)")


class StorageOutput(BaseModel):
    """Output schema for storage node"""
    cv_id: str = Field(..., description="Unique CV identifier")
    storage_info: Dict[str, Any] = Field(..., description="Storage operation results")
    processing_step: str = Field(..., description="Processing status")
    pdf_path: Optional[str] = Field(default=None, description="Path to stored PDF file")
    backup_created: bool = Field(default=False, description="Whether backup was created")


# Node metadata for LangGraph
STORAGE_NODE_METADATA = {
    "name": "storage_node",
    "description": "Handle final storage, versioning, and retrieval of CV data",
    "input_schema": StorageInput,
    "output_schema": StorageOutput,
    "dependencies": ["aiofiles", "sqlalchemy"],
    "timeout": 30,
    "retry_count": 3
}