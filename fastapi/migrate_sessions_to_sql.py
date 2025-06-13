#!/usr/bin/env python3
"""
Session Migration Script: JSON to SQL

This script migrates existing JSON session files to the new SQL database format.
It preserves all session data, conversation history, and metadata while converting
to the new database schema.

Usage:
    python migrate_sessions_to_sql.py [--dry-run] [--backup]

Options:
    --dry-run    Show what would be migrated without actually performing migration
    --backup     Create backup of existing sessions before migration
"""

import os
import json
import shutil
import argparse
from pathlib import Path
from datetime import datetime
from typing import Dict, Any, List
from agent.sql_session_manager import SQLSessionManager, SQLSessionState


class SessionMigrator:
    """Handles migration from JSON files to SQL database."""
    
    def __init__(self, sessions_dir: str = "sessions", db_path: str = "sessions.db"):
        self.sessions_dir = Path(sessions_dir)
        self.db_path = db_path
        self.sql_manager = SQLSessionManager(db_path)
        
    def find_json_sessions(self) -> List[Path]:
        """Find all JSON session files."""
        if not self.sessions_dir.exists():
            print(f"⚠️  Sessions directory {self.sessions_dir} does not exist")
            return []
        
        json_files = list(self.sessions_dir.glob("*.json"))
        print(f"📁 Found {len(json_files)} JSON session files")
        return json_files
    
    def load_json_session(self, file_path: Path) -> Dict[str, Any]:
        """Load and parse a JSON session file."""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception as e:
            print(f"❌ Error loading {file_path}: {e}")
            return None
    
    def convert_json_to_sql_session(self, json_data: Dict[str, Any]) -> SQLSessionState:
        """Convert JSON session data to SQL session format."""
        # Extract basic information
        session_id = json_data.get('session_id')
        company_id = json_data.get('company_id')
        company_name = json_data.get('company_name', 'Unknown Company')
        
        # Create SQL session
        session = SQLSessionState(session_id, company_id, company_name)
        
        # Set timestamps
        if 'created_at' in json_data:
            try:
                session.created_at = datetime.fromisoformat(json_data['created_at'])
            except:
                session.created_at = datetime.now()
        
        if 'last_updated' in json_data:
            try:
                session.last_updated = datetime.fromisoformat(json_data['last_updated'])
            except:
                session.last_updated = datetime.now()
        
        # Set conversation history
        session.conversation_history = json_data.get('conversation_history', [])
        
        # Convert job data with field mapping
        old_job_data = json_data.get('job_data', {})
        session.job_data = self.convert_job_data(old_job_data)
        
        # Set other fields
        session.current_step = json_data.get('current_step', 'getting_basic_info')
        session.is_complete = json_data.get('is_complete', False)
        
        return session
    
    def convert_job_data(self, old_job_data: Dict[str, Any]) -> Dict[str, Any]:
        """Convert and clean job data to match new schema."""
        # Start with default job data structure
        new_job_data = {
            "title": "",
            "description": "",
            "requirements": "",
            "responsibilities": "",
            "benefits": "",
            "skills": [],
            "experienceLevel": "",
            "location": "",
            "workType": "",
            "salaryMin": 0,
            "salaryMax": 0,
            "currency": "JOD",
            "enableAiInterview": False,
            "isFeatured": False
        }
        
        # Map fields from old to new
        field_mappings = {
            'title': 'title',
            'description': 'description',
            'requirements': 'requirements',
            'responsibilities': 'responsibilities',
            'benefits': 'benefits',
            'skills': 'skills',
            'experienceLevel': 'experienceLevel',
            'location': 'location',
            'workType': 'workType',
            'salaryMin': 'salaryMin',
            'salaryMax': 'salaryMax',
            'currency': 'currency',
            'enableAiInterview': 'enableAiInterview',
            'isFeatured': 'isFeatured'
        }
        
        # Apply mappings
        for old_field, new_field in field_mappings.items():
            if old_field in old_job_data:
                value = old_job_data[old_field]
                
                # Handle specific field conversions
                if old_field in ['salaryMin', 'salaryMax']:
                    # Convert to int, default to 0 if None or invalid
                    try:
                        new_job_data[new_field] = int(value) if value is not None else 0
                    except (ValueError, TypeError):
                        new_job_data[new_field] = 0
                
                elif old_field == 'experienceLevel':
                    # Convert experience level to proper enum format
                    if isinstance(value, str):
                        value = value.upper()
                        if value in ['SENIOR', 'MID_LEVEL', 'JUNIOR', 'ENTRY_LEVEL', 'EXECUTIVE']:
                            new_job_data[new_field] = value
                        elif value in ['SENIOR', 'MIDDLE', 'JUNIOR', 'ENTRY']:
                            # Map common variations
                            mapping = {
                                'SENIOR': 'SENIOR',
                                'MIDDLE': 'MID_LEVEL',
                                'JUNIOR': 'JUNIOR',
                                'ENTRY': 'ENTRY_LEVEL'
                            }
                            new_job_data[new_field] = mapping.get(value, 'MID_LEVEL')
                        else:
                            new_job_data[new_field] = 'MID_LEVEL'  # Default
                
                elif old_field == 'workType':
                    # Convert work type to proper enum format
                    if isinstance(value, str):
                        value = value.upper().replace(' ', '_')
                        if value in ['HYBRID', 'REMOTE', 'ON_SITE']:
                            new_job_data[new_field] = value
                        elif value in ['ONSITE', 'OFFICE']:
                            new_job_data[new_field] = 'ON_SITE'
                        else:
                            new_job_data[new_field] = 'HYBRID'  # Default
                
                elif old_field == 'skills':
                    # Ensure skills is a list
                    if isinstance(value, list):
                        new_job_data[new_field] = value
                    elif isinstance(value, str):
                        new_job_data[new_field] = [value] if value else []
                    else:
                        new_job_data[new_field] = []
                
                else:
                    # Direct copy for other fields
                    new_job_data[new_field] = value
        
        return new_job_data
    
    def create_backup(self) -> str:
        """Create backup of sessions directory."""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        backup_dir = f"sessions_backup_{timestamp}"
        
        if self.sessions_dir.exists():
            shutil.copytree(self.sessions_dir, backup_dir)
            print(f"💾 Created backup: {backup_dir}")
            return backup_dir
        else:
            print("⚠️  No sessions directory to backup")
            return ""
    
    def migrate_session(self, json_file: Path, dry_run: bool = False) -> bool:
        """Migrate a single JSON session to SQL."""
        print(f"🔄 Processing: {json_file.name}")
        
        # Load JSON data
        json_data = self.load_json_session(json_file)
        if not json_data:
            return False
        
        # Convert to SQL format
        try:
            sql_session = self.convert_json_to_sql_session(json_data)
        except Exception as e:
            print(f"❌ Error converting {json_file.name}: {e}")
            return False
        
        if dry_run:
            print(f"   📋 Would migrate session: {sql_session.session_id}")
            print(f"      Company: {sql_session.company_name}")
            print(f"      Step: {sql_session.current_step}")
            print(f"      Complete: {sql_session.is_complete}")
            print(f"      Messages: {len(sql_session.conversation_history)}")
            return True
        
        # Check if session already exists in SQL
        existing_session = self.sql_manager.get_session(sql_session.session_id)
        if existing_session:
            print(f"   ⚠️  Session {sql_session.session_id} already exists in SQL database")
            return False
        
        # Save to SQL database
        try:
            # Use the create_session method with specific session_id
            self.sql_manager.create_session(
                company_id=sql_session.company_id,
                company_name=sql_session.company_name,
                session_id=sql_session.session_id
            )
            
            # Update with full data
            sql_session.created_at = sql_session.created_at  # Preserve original timestamp
            self.sql_manager.update_session(sql_session)
            
            print(f"   ✅ Successfully migrated: {sql_session.session_id}")
            return True
            
        except Exception as e:
            print(f"   ❌ Error saving to SQL: {e}")
            return False
    
    def migrate_all(self, dry_run: bool = False, create_backup: bool = False) -> Dict[str, int]:
        """Migrate all JSON sessions to SQL."""
        print("🚀 Starting session migration from JSON to SQL")
        print("=" * 50)
        
        # Create backup if requested
        backup_dir = ""
        if create_backup and not dry_run:
            backup_dir = self.create_backup()
        
        # Find all JSON files
        json_files = self.find_json_sessions()
        if not json_files:
            print("📭 No JSON sessions found to migrate")
            return {"total": 0, "successful": 0, "failed": 0, "skipped": 0}
        
        # Migration stats
        stats = {"total": len(json_files), "successful": 0, "failed": 0, "skipped": 0}
        
        # Process each file
        for json_file in json_files:
            try:
                success = self.migrate_session(json_file, dry_run)
                if success:
                    stats["successful"] += 1
                else:
                    stats["failed"] += 1
            except Exception as e:
                print(f"❌ Unexpected error with {json_file.name}: {e}")
                stats["failed"] += 1
        
        # Print summary
        print("\n" + "=" * 50)
        print("📊 Migration Summary:")
        print(f"   Total sessions: {stats['total']}")
        print(f"   ✅ Successful: {stats['successful']}")
        print(f"   ❌ Failed: {stats['failed']}")
        print(f"   ⏭️  Skipped: {stats['skipped']}")
        
        if backup_dir:
            print(f"   💾 Backup created: {backup_dir}")
        
        if not dry_run and stats['successful'] > 0:
            print(f"\n🎉 Migration completed! {stats['successful']} sessions now available in SQL database.")
            print("   You can now use the SQL-based session management system.")
        
        return stats


def main():
    """Main function with command line interface."""
    parser = argparse.ArgumentParser(
        description="Migrate JSON session files to SQL database",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
    python migrate_sessions_to_sql.py                    # Normal migration
    python migrate_sessions_to_sql.py --dry-run          # Preview migration
    python migrate_sessions_to_sql.py --backup           # Create backup before migration
    python migrate_sessions_to_sql.py --dry-run --backup # Preview with backup simulation
        """
    )
    
    parser.add_argument(
        '--dry-run',
        action='store_true',
        help='Show what would be migrated without actually performing migration'
    )
    
    parser.add_argument(
        '--backup',
        action='store_true',
        help='Create backup of existing sessions before migration'
    )
    
    parser.add_argument(
        '--sessions-dir',
        default='sessions',
        help='Directory containing JSON session files (default: sessions)'
    )
    
    parser.add_argument(
        '--db-path',
        default='sessions.db',
        help='Path to SQL database file (default: sessions.db)'
    )
    
    args = parser.parse_args()
    
    # Create migrator
    migrator = SessionMigrator(args.sessions_dir, args.db_path)
    
    # Perform migration
    stats = migrator.migrate_all(dry_run=args.dry_run, create_backup=args.backup)
    
    # Exit with appropriate code
    if stats['failed'] > 0:
        exit(1)
    else:
        exit(0)


if __name__ == "__main__":
    main()
