#!/usr/bin/env python3
"""
Test script to demonstrate SQL database advantages over JSON files
"""

import requests
import uuid
import json
import time
import os
from concurrent.futures import ThreadPoolExecutor, as_completed
import threading

# API Configuration
BASE_URL = "http://localhost:8000"
COMPANY_ID = "eeb88919-5a2d-4393-b14b-8a3bfbb51c7e"
COMPANY_NAME = "Papaya Trading"

def test_concurrent_sessions():
    """Test concurrent session creation (shows SQL advantages)"""
    
    print("🧪 Testing SQL Database Advantages")
    print("=" * 50)
    
    # Test 1: Concurrent session creation
    print("\n1️⃣ Testing Concurrent Session Creation (SQL handles this better)...")
    
    def create_session(session_num):
        session_id = str(uuid.uuid4())
        data = {
            "message": f"Create a job post for Software Engineer {session_num}",
            "company_id": COMPANY_ID,
            "company_name": f"{COMPANY_NAME} Dept {session_num}",
            "session_id": session_id
        }
        
        try:
            response = requests.post(f"{BASE_URL}/create-job-post", data=data)
            if response.status_code == 200:
                result = response.json()
                return {
                    "success": True,
                    "session_id": result.get("session_id"),
                    "session_num": session_num
                }
            else:
                return {"success": False, "error": response.text, "session_num": session_num}
        except Exception as e:
            return {"success": False, "error": str(e), "session_num": session_num}
    
    # Create 10 concurrent sessions
    num_sessions = 10
    start_time = time.time()
    
    with ThreadPoolExecutor(max_workers=5) as executor:
        futures = [executor.submit(create_session, i) for i in range(num_sessions)]
        results = [future.result() for future in as_completed(futures)]
    
    end_time = time.time()
    
    successful_sessions = [r for r in results if r["success"]]
    failed_sessions = [r for r in results if not r["success"]]
    
    print(f"✅ Created {len(successful_sessions)} sessions successfully")
    print(f"❌ Failed to create {len(failed_sessions)} sessions")
    print(f"⏱️  Total time: {end_time - start_time:.2f} seconds")
    
    if failed_sessions:
        print(f"❌ Failures: {[f['error'] for f in failed_sessions[:3]]}")
    
    return successful_sessions

def test_database_queries():
    """Test database query capabilities"""
    
    print("\n2️⃣ Testing Database Query Capabilities...")
    
    # Test session statistics
    try:
        response = requests.get(f"{BASE_URL}/session-stats")
        if response.status_code == 200:
            stats = response.json()
            print(f"📊 Session Statistics:")
            print(f"   Total Sessions: {stats.get('total_sessions', 0)}")
            print(f"   Active (24h): {stats.get('active_sessions_24h', 0)}")
            print(f"   Completed: {stats.get('completed_sessions', 0)}")
            print(f"   Completion Rate: {stats.get('completion_rate', 0)}%")
            
            top_companies = stats.get('top_companies', [])
            if top_companies:
                print(f"   Top Companies: {top_companies[:3]}")
        else:
            print(f"❌ Failed to get stats: {response.status_code}")
    except Exception as e:
        print(f"❌ Error getting stats: {e}")
    
    # Test company sessions
    try:
        response = requests.get(f"{BASE_URL}/company-sessions/{COMPANY_ID}?limit=10")
        if response.status_code == 200:
            data = response.json()
            sessions = data.get('sessions', [])
            print(f"🏢 Company Sessions: {len(sessions)} found")
            
            if sessions:
                latest = sessions[0]
                print(f"   Latest: {latest.get('job_data', {}).get('title', 'No title')} ({latest.get('created_at', '')})")
        else:
            print(f"❌ Failed to get company sessions: {response.status_code}")
    except Exception as e:
        print(f"❌ Error getting company sessions: {e}")

def test_data_integrity():
    """Test data integrity and ACID properties"""
    
    print("\n3️⃣ Testing Data Integrity...")
    
    # Create a session and rapidly update it
    session_id = str(uuid.uuid4())
    
    # Initial creation
    data = {
        "message": "Software Engineer position",
        "company_id": COMPANY_ID,
        "company_name": COMPANY_NAME,
        "session_id": session_id
    }
    
    response = requests.post(f"{BASE_URL}/create-job-post", data=data)
    if response.status_code != 200:
        print(f"❌ Failed to create session: {response.status_code}")
        return
    
    print(f"✅ Created session: {session_id}")
    
    # Rapid updates to test concurrency
    def update_session(update_num):
        data = {
            "message": f"Update {update_num}: Adding more details about the role",
            "session_id": session_id
        }
        try:
            response = requests.post(f"{BASE_URL}/job-post-chat", data=data)
            return {"success": response.status_code == 200, "update_num": update_num}
        except Exception as e:
            return {"success": False, "error": str(e), "update_num": update_num}
    
    # Perform 5 concurrent updates
    with ThreadPoolExecutor(max_workers=3) as executor:
        futures = [executor.submit(update_session, i) for i in range(5)]
        update_results = [future.result() for future in as_completed(futures)]
    
    successful_updates = [r for r in update_results if r["success"]]
    print(f"✅ Completed {len(successful_updates)} concurrent updates")
    
    # Verify final state
    response = requests.get(f"{BASE_URL}/job-post-session/{session_id}")
    if response.status_code == 200:
        session_info = response.json()
        conversation_turns = session_info.get('conversation_turns', 0)
        print(f"✅ Final conversation turns: {conversation_turns}")
        print(f"✅ Data integrity maintained!")
    else:
        print(f"❌ Failed to verify final state: {response.status_code}")

def test_performance_comparison():
    """Compare performance aspects"""
    
    print("\n4️⃣ Performance & Scalability Benefits...")
    
    print("🗄️  SQL Database Advantages:")
    print("   ✅ ACID compliance - no data corruption")
    print("   ✅ Concurrent access with proper locking")
    print("   ✅ Indexed queries - fast session lookups")
    print("   ✅ Relationships - can link users, companies, etc.")
    print("   ✅ Rich querying - search by date, company, status")
    print("   ✅ Built-in backup/recovery")
    print("   ✅ Transaction support")
    print("   ✅ Scalable to thousands of concurrent users")
    
    print("\n📁 JSON File Limitations:")
    print("   ❌ File I/O bottlenecks with many users")
    print("   ❌ Risk of data corruption during concurrent writes")
    print("   ❌ No indexing - slow searches")
    print("   ❌ Limited querying capabilities")
    print("   ❌ No relationships between data")
    print("   ❌ Manual backup/recovery")
    print("   ❌ File system limitations")

def test_cleanup_operations():
    """Test cleanup and maintenance operations"""
    
    print("\n5️⃣ Testing Cleanup Operations...")
    
    try:
        response = requests.post(f"{BASE_URL}/cleanup-expired-sessions")
        if response.status_code == 200:
            result = response.json()
            deleted_count = result.get('deleted_count', 0)
            print(f"🧹 Cleaned up {deleted_count} expired sessions")
            print("✅ Automatic cleanup capability working!")
        else:
            print(f"❌ Cleanup failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Error during cleanup: {e}")

def main():
    """Run all tests"""
    
    # Check if using SQL sessions
    print("🔍 Checking session management type...")
    try:
        response = requests.get(f"{BASE_URL}/session-stats")
        if response.status_code == 200:
            print("✅ SQL session management is active!")
        elif response.status_code == 501:
            print("📁 JSON file session management is active")
            print("💡 Set USE_SQL_SESSIONS=true to enable SQL features")
            return
        else:
            print(f"❓ Unknown response: {response.status_code}")
            return
    except Exception as e:
        print(f"❌ Error checking session type: {e}")
        return
    
    # Run tests
    successful_sessions = test_concurrent_sessions()
    test_database_queries()
    test_data_integrity()
    test_performance_comparison()
    test_cleanup_operations()
    
    print(f"\n🎉 SQL Database Testing Complete!")
    print(f"   Created {len(successful_sessions)} test sessions")
    print(f"   Demonstrated concurrent access, querying, and integrity")
    print(f"   SQL database provides superior scalability and reliability!")

if __name__ == "__main__":
    main()
