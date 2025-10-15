"""
Memory Migration Utility
Updates existing chat memory and workflow components to use the standardized CV memory structure
"""
import json
import os
from pathlib import Path
from typing import Dict, Any
from loguru import logger

from app.agent.shared_memory import CVMemoryManager
from app.agent.chat_memory import CVChatMemory


class MemoryMigrator:
    """Migrate existing memory structures to standardized format"""
    
    def __init__(self):
        self.cv_memory_manager = CVMemoryManager()
        self.chat_memory = CVChatMemory()
    
    def migrate_all_sessions(self) -> Dict[str, Any]:
        """
        Migrate all existing chat sessions to standardized memory format
        
        Returns:
            Migration report with success/failure counts
        """
        memory_dir = self.chat_memory.memory_dir
        
        if not memory_dir.exists():
            logger.info("No existing memory directory found")
            return {"migrated": 0, "failed": 0, "total": 0}
        
        session_files = list(memory_dir.glob("session_*.json"))
        
        migration_report = {
            "total": len(session_files),
            "migrated": 0,
            "failed": 0,
            "errors": []
        }
        
        logger.info(f"Found {len(session_files)} session files to migrate")
        
        for session_file in session_files:
            try:
                session_id = session_file.stem.replace("session_", "")
                
                if self.migrate_session(session_id):
                    migration_report["migrated"] += 1
                    logger.info(f"✅ Migrated session: {session_id}")
                else:
                    migration_report["failed"] += 1
                    logger.warning(f"❌ Failed to migrate session: {session_id}")
                
            except Exception as e:
                migration_report["failed"] += 1
                migration_report["errors"].append(f"Session {session_file}: {str(e)}")
                logger.error(f"❌ Error migrating {session_file}: {e}")
        
        logger.info(f"Migration complete: {migration_report['migrated']}/{migration_report['total']} sessions migrated")
        return migration_report
    
    def migrate_session(self, session_id: str) -> bool:
        """
        Migrate a specific session to standardized format
        
        Args:
            session_id: Session identifier to migrate
            
        Returns:
            Success status
        """
        try:
            # Load existing session data
            session_data = self.chat_memory.load_session_memory(session_id)
            old_cv_memory = session_data.get("cv_memory", {})
            
            # Skip if already in new format
            if self.cv_memory_manager.validate_memory_structure(old_cv_memory):
                logger.info(f"Session {session_id} already in standardized format")
                return True
            
            # Migrate to standardized structure
            new_cv_memory = self.cv_memory_manager.migrate_memory_structure(old_cv_memory)
            
            # Update session data
            session_data["cv_memory"] = new_cv_memory
            session_data["migrated_to_standard"] = True
            session_data["migration_timestamp"] = time.time()
            
            # Save migrated session
            return self.chat_memory.save_session_memory(session_id, session_data)
            
        except Exception as e:
            logger.error(f"Failed to migrate session {session_id}: {e}")
            return False
    
    def validate_migration(self, session_id: str) -> Dict[str, Any]:
        """
        Validate that a session has been properly migrated
        
        Args:
            session_id: Session to validate
            
        Returns:
            Validation report
        """
        try:
            session_data = self.chat_memory.load_session_memory(session_id)
            cv_memory = session_data.get("cv_memory", {})
            
            is_valid = self.cv_memory_manager.validate_memory_structure(cv_memory)
            completion_percentage = self.cv_memory_manager.get_completion_percentage(cv_memory)
            
            return {
                "session_id": session_id,
                "is_valid": is_valid,
                "completion_percentage": completion_percentage,
                "has_migration_flag": session_data.get("migrated_to_standard", False),
                "structure_keys": list(cv_memory.keys()),
                "missing_keys": [
                    key for key in [
                        "personal_info", "education", "experience", 
                        "skills", "languages", "selected_template", "generated_pdf_url"
                    ]
                    if key not in cv_memory
                ]
            }
            
        except Exception as e:
            return {
                "session_id": session_id,
                "is_valid": False,
                "error": str(e)
            }
    
    def create_backup(self) -> str:
        """
        Create backup of existing memory before migration
        
        Returns:
            Backup directory path
        """
        import shutil
        from datetime import datetime
        
        memory_dir = self.chat_memory.memory_dir
        
        if not memory_dir.exists():
            logger.info("No memory directory to backup")
            return ""
        
        # Create backup directory
        backup_name = f"memory_backup_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        backup_dir = memory_dir.parent / backup_name
        
        # Copy entire memory directory
        shutil.copytree(memory_dir, backup_dir)
        
        logger.info(f"Memory backup created: {backup_dir}")
        return str(backup_dir)


def run_migration():
    """
    Run the complete migration process with backup and validation
    """
    logger.info("🔄 Starting CV Memory Migration Process")
    
    migrator = MemoryMigrator()
    
    # Create backup first
    backup_path = migrator.create_backup()
    if backup_path:
        logger.info(f"📦 Backup created: {backup_path}")
    
    # Run migration
    migration_report = migrator.migrate_all_sessions()
    
    logger.info("📊 Migration Report:")
    logger.info(f"  Total sessions: {migration_report['total']}")
    logger.info(f"  Successfully migrated: {migration_report['migrated']}")
    logger.info(f"  Failed migrations: {migration_report['failed']}")
    
    if migration_report['errors']:
        logger.error("❌ Migration errors:")
        for error in migration_report['errors']:
            logger.error(f"  - {error}")
    
    # Validate a few migrated sessions
    if migration_report['migrated'] > 0:
        logger.info("🔍 Validating migrated sessions...")
        
        # Get list of session files
        memory_dir = migrator.chat_memory.memory_dir
        session_files = list(memory_dir.glob("session_*.json"))
        
        # Validate first 3 sessions
        for session_file in session_files[:3]:
            session_id = session_file.stem.replace("session_", "")
            validation = migrator.validate_migration(session_id)
            
            if validation.get('is_valid'):
                logger.info(f"✅ Session {session_id}: Valid ({validation['completion_percentage']}% complete)")
            else:
                logger.warning(f"❌ Session {session_id}: Invalid - {validation.get('error', 'Structure issues')}")
    
    logger.info("🎉 Migration process completed!")
    return migration_report


if __name__ == "__main__":
    # Add necessary imports for standalone execution
    import time
    
    # Run the migration
    report = run_migration()
    
    print(f"\n📋 Final Migration Summary:")
    print(f"Total sessions processed: {report['total']}")
    print(f"Successfully migrated: {report['migrated']}")
    print(f"Failed migrations: {report['failed']}")
    print(f"Success rate: {(report['migrated'] / report['total'] * 100):.1f}%" if report['total'] > 0 else "N/A")