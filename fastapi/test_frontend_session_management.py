#!/usr/bin/env python3
"""
Test script to verify frontend-provided session ID functionality
"""

import requests
import uuid
import json

# API Configuration
BASE_URL = "http://localhost:8000"
COMPANY_ID = "eeb88919-5a2d-4393-b14b-8a3bfbb51c7e"
COMPANY_NAME = "Papaya Trading"

def test_frontend_session_management():
    """Test the new frontend-provided session ID functionality"""
    
    print("🧪 Testing Frontend Session ID Management")
    print("=" * 50)
    
    # Generate a session ID like the frontend would
    frontend_session_id = str(uuid.uuid4())
    print(f"📱 Frontend generated session ID: {frontend_session_id}")
    
    # Test 1: Create job post with frontend-provided session ID
    print("\n1️⃣ Testing job post creation with frontend session ID...")
    
    create_data = {
        "message": "I want to create a job post for a Senior Full-Stack Developer position",
        "company_id": COMPANY_ID,
        "company_name": COMPANY_NAME,
        "session_id": frontend_session_id
    }
    
    try:
        response = requests.post(f"{BASE_URL}/create-job-post", data=create_data)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Success! Response session ID: {result.get('session_id')}")
            print(f"📝 Agent Response: {result.get('agent_response', '')[:100]}...")
            print(f"🏗️ Current Step: {result.get('current_step')}")
            print(f"✔️ Is Complete: {result.get('is_complete')}")
            
            # Verify session ID matches what we sent
            if result.get('session_id') == frontend_session_id:
                print("✅ Session ID matches frontend-provided ID")
            else:
                print("❌ Session ID mismatch!")
                return False
                
        else:
            print(f"❌ Error: {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Exception during create: {e}")
        return False
    
    # Test 2: Continue conversation with same session ID
    print("\n2️⃣ Testing conversation continuation...")
    
    continue_data = {
        "message": "The position requires expertise in .NET Core, React, and Azure cloud services. We offer competitive salary and remote work options.",
        "session_id": frontend_session_id
    }
    
    try:
        response = requests.post(f"{BASE_URL}/job-post-chat", data=continue_data)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Success! Session ID: {result.get('session_id')}")
            print(f"📝 Agent Response: {result.get('agent_response', '')[:100]}...")
            print(f"🏗️ Current Step: {result.get('current_step')}")
            print(f"✔️ Is Complete: {result.get('is_complete')}")
        else:
            print(f"❌ Error: {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Exception during continue: {e}")
        return False
    
    # Test 3: Get session info
    print("\n3️⃣ Testing session info retrieval...")
    
    try:
        response = requests.get(f"{BASE_URL}/job-post-session/{frontend_session_id}")
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Success! Session Info:")
            print(f"   📝 Company: {result.get('company_name')}")
            print(f"   🕐 Created: {result.get('created_at')}")
            print(f"   🔄 Turns: {result.get('conversation_turns')}")
            print(f"   📊 Job Title: {result.get('job_data', {}).get('title', 'Not set')}")
        else:
            print(f"❌ Error: {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Exception during info retrieval: {e}")
        return False
    
    # Test 4: Test invalid session ID format
    print("\n4️⃣ Testing invalid session ID format...")
    
    invalid_data = {
        "message": "Test message",
        "company_id": COMPANY_ID,
        "session_id": "not-a-valid-uuid"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/create-job-post", data=invalid_data)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 400:
            print("✅ Correctly rejected invalid UUID format")
        else:
            print(f"❌ Unexpected response for invalid UUID: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Exception during invalid UUID test: {e}")
        return False
    
    # Test 5: Test session deletion
    print("\n5️⃣ Testing session deletion...")
    
    try:
        response = requests.delete(f"{BASE_URL}/job-post-session/{frontend_session_id}")
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            print("✅ Session deleted successfully")
            
            # Verify session is gone
            response = requests.get(f"{BASE_URL}/job-post-session/{frontend_session_id}")
            if response.status_code == 404:
                print("✅ Confirmed session no longer exists")
            else:
                print(f"❌ Session still exists after deletion: {response.status_code}")
                return False
        else:
            print(f"❌ Error deleting session: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Exception during deletion: {e}")
        return False
    
    print("\n🎉 All tests passed! Frontend session management is working correctly.")
    return True

if __name__ == "__main__":
    success = test_frontend_session_management()
    if success:
        print("\n✅ Frontend session management implementation successful!")
    else:
        print("\n❌ Some tests failed. Please check the implementation.")
