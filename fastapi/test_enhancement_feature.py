#!/usr/bin/env python3
"""
Test the enhancement feature specifically to ensure it's working properly
"""

import requests
import uuid
import json

# API Configuration
BASE_URL = "http://localhost:8000"
COMPANY_ID = "eeb88919-5a2d-4393-b14b-8a3bfbb51c7e"
COMPANY_NAME = "Papaya Trading"

def test_enhancement_feature():
    """Test the enhancement feature specifically"""
    
    print("🧪 Testing Job Post Enhancement Feature")
    print("=" * 50)
    
    # Generate a session ID like the frontend would
    session_id = str(uuid.uuid4())
    print(f"📱 Generated session ID: {session_id}")
    
    # Step 1: Create a basic job post
    print("\n1️⃣ Creating basic job post...")
    
    create_data = {
        "message": "Software Engineer position, remote work, 3-5 years experience",
        "company_id": COMPANY_ID,
        "company_name": COMPANY_NAME,
        "session_id": session_id
    }
    
    try:
        response = requests.post(f"{BASE_URL}/create-job-post", data=create_data)
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Job post created successfully")
            print(f"📝 Response preview: {result.get('agent_response', '')[:100]}...")
            print(f"🏗️ Current Step: {result.get('current_step')}")
        else:
            print(f"❌ Error creating job post: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Exception during creation: {e}")
        return False
    
    # Step 2: Add more details
    print("\n2️⃣ Adding more details...")
    
    continue_data = {
        "message": "The role requires React, Node.js, and Python skills. We offer competitive salary and health benefits.",
        "session_id": session_id
    }
    
    try:
        response = requests.post(f"{BASE_URL}/job-post-chat", data=continue_data)
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Details added successfully")
            print(f"📝 Response preview: {result.get('agent_response', '')[:100]}...")
            print(f"🏗️ Current Step: {result.get('current_step')}")
        else:
            print(f"❌ Error adding details: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Exception during details: {e}")
        return False
    
    # Step 3: Test enhancement request
    print("\n3️⃣ Testing enhancement request...")
    
    enhance_data = {
        "message": "enhance it",  # This should trigger the AI enhancement
        "session_id": session_id
    }
    
    try:
        response = requests.post(f"{BASE_URL}/job-post-chat", data=enhance_data)
        if response.status_code == 200:
            result = response.json()
            agent_response = result.get('agent_response', '')
            
            print(f"✅ Enhancement request successful")
            print(f"📝 Enhanced response: {agent_response[:200]}...")
            
            # Check if this is a real AI response (not a template)
            if "auto-completion" in agent_response.lower() or "template" in agent_response.lower():
                print("❌ Still getting template responses instead of AI enhancement!")
                return False
            elif "enhanced" in agent_response.lower() or "improved" in agent_response.lower():
                print("✅ Received AI-generated enhancement!")
            else:
                print("⚠️  Enhancement response doesn't clearly indicate AI processing")
                
            print(f"🏗️ Current Step: {result.get('current_step')}")
            print(f"✔️ Is Complete: {result.get('is_complete')}")
            
        else:
            print(f"❌ Error during enhancement: {response.status_code}")
            print(f"Response: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Exception during enhancement: {e}")
        return False
    
    # Step 4: Test other enhancement keywords
    print("\n4️⃣ Testing 'improve it' keyword...")
    
    improve_data = {
        "message": "improve it please",
        "session_id": session_id
    }
    
    try:
        response = requests.post(f"{BASE_URL}/job-post-chat", data=improve_data)
        if response.status_code == 200:
            result = response.json()
            agent_response = result.get('agent_response', '')
            
            print(f"✅ Improvement request successful")
            print(f"📝 Improved response: {agent_response[:200]}...")
            
            if "auto-completion" in agent_response.lower() or "template" in agent_response.lower():
                print("❌ Still getting template responses for 'improve'!")
                return False
            else:
                print("✅ 'Improve' keyword working correctly!")
                
        else:
            print(f"❌ Error during improvement: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Exception during improvement: {e}")
        return False
    
    # Step 5: Clean up
    print("\n5️⃣ Cleaning up session...")
    
    try:
        response = requests.delete(f"{BASE_URL}/job-post-session/{session_id}")
        if response.status_code == 200:
            print("✅ Session cleaned up successfully")
        else:
            print(f"⚠️  Failed to clean up session: {response.status_code}")
    except Exception as e:
        print(f"⚠️  Exception during cleanup: {e}")
    
    print("\n🎉 Enhancement feature test completed successfully!")
    return True

if __name__ == "__main__":
    try:
        success = test_enhancement_feature()
        if success:
            print("\n✅ All enhancement tests passed!")
        else:
            print("\n❌ Some enhancement tests failed!")
    except Exception as e:
        print(f"\n❌ Test failed with exception: {e}")
