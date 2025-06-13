#!/usr/bin/env python3
"""
Test Session Management for Job Post Agent

This script tests the new session-aware job post agent functionality.
"""

def test_session_management():
    """Test the session management functionality."""
    print("🧪 TESTING SESSION MANAGEMENT")
    print("=" * 50)
    
    from agent.session_job_post_agent import get_session_job_post_agent
    
    # Create agent
    agent = get_session_job_post_agent()
    
    # Test 1: Start new conversation
    print("\n📝 Test 1: Starting new conversation")
    result1 = agent.start_conversation(
        company_id="eeb88919-5a2d-4393-b14b-8a3bfbb51c7e",
        company_name="papaya trading"
    )
    
    session_id = result1["session_id"]
    print(f"✅ Session ID: {session_id}")
    print(f"📄 Response: {result1['response'][:100]}...")
    
    # Test 2: Continue conversation
    print(f"\n📝 Test 2: Continue conversation with '.net developer'")
    result2 = agent.continue_conversation(session_id, ".net developer full stack")
    print(f"📄 Response: {result2['response'][:100]}...")
    print(f"📊 Job Data: {result2['job_data']['title']}")
    
    # Test 3: Continue with more details
    print(f"\n📝 Test 3: Continue with 'mid-level'")
    result3 = agent.continue_conversation(session_id, "mid-level")
    print(f"📄 Response: {result3['response'][:100]}...")
    print(f"📊 Experience Level: {result3['job_data']['experienceLevel']}")
    
    # Test 4: Get session info
    print(f"\n📝 Test 4: Get session info")
    session_info = agent.get_session_info(session_id)
    print(f"📊 Session Info:")
    print(f"   Company: {session_info['company_name']}")
    print(f"   Created: {session_info['created_at']}")
    print(f"   Step: {session_info['current_step']}")
    print(f"   Conversation turns: {session_info['conversation_turns']}")
    
    # Test 5: Resume existing session (simulate new request)
    print(f"\n📝 Test 5: Resume existing session")
    result5 = agent.start_conversation(
        company_id="eeb88919-5a2d-4393-b14b-8a3bfbb51c7e",
        company_name="papaya trading",
        session_id=session_id
    )
    print(f"📄 Resume Response: {result5['response'][:100]}...")
    
    # Test 6: Continue with completion
    print(f"\n📝 Test 6: Continue with completion keywords")
    result6 = agent.continue_conversation(session_id, "looks good, please finalize the job post")
    print(f"📄 Response: {result6['response'][:150]}...")
    print(f"📊 Is Complete: {result6['is_complete']}")
    
    # Test 7: Test invalid session
    print(f"\n📝 Test 7: Test invalid session")
    result7 = agent.continue_conversation("invalid-session-id", "test message")
    print(f"❌ Error (expected): {result7.get('error', 'No error')}")
    
    print(f"\n✅ Session management tests completed!")
    print(f"Final session ID: {session_id}")
    
    return session_id

def test_fastapi_endpoints():
    """Test the FastAPI endpoints with session management."""
    print("\n🌐 TESTING FASTAPI ENDPOINTS")
    print("=" * 50)
    
    import requests
    import json
    
    base_url = "http://localhost:8000"
    
    try:
        # Test 1: Create job post (new session)
        print("\n📝 Test 1: Create job post")
        response1 = requests.post(f"{base_url}/create-job-post", data={
            "message": ".net developer",
            "company_id": "eeb88919-5a2d-4393-b14b-8a3bfbb51c7e",
            "company_name": "papaya trading"
        })
        
        if response1.status_code == 200:
            result1 = response1.json()
            session_id = result1["session_id"]
            print(f"✅ Session ID: {session_id}")
            print(f"📄 Response: {result1['agent_response'][:100]}...")
            
            # Test 2: Continue chat
            print(f"\n📝 Test 2: Continue chat")
            response2 = requests.post(f"{base_url}/job-post-chat", data={
                "message": "senior full-stack developer",
                "session_id": session_id
            })
            
            if response2.status_code == 200:
                result2 = response2.json()
                print(f"📄 Response: {result2['agent_response'][:100]}...")
                print(f"📊 Job Title: {result2['job_data'].get('title', 'N/A')}")
                
                # Test 3: Get session info
                print(f"\n📝 Test 3: Get session info")
                response3 = requests.get(f"{base_url}/job-post-session/{session_id}")
                
                if response3.status_code == 200:
                    result3 = response3.json()
                    print(f"📊 Company: {result3['company_name']}")
                    print(f"📊 Step: {result3['current_step']}")
                else:
                    print(f"❌ Failed to get session info: {response3.status_code}")
            else:
                print(f"❌ Failed to continue chat: {response2.status_code}")
                print(f"Response: {response2.text}")
        else:
            print(f"❌ Failed to create job post: {response1.status_code}")
            print(f"Response: {response1.text}")
    
    except requests.exceptions.ConnectionError:
        print("❌ Could not connect to FastAPI server. Make sure it's running on localhost:8000")
    except Exception as e:
        print(f"❌ Error testing endpoints: {e}")

if __name__ == "__main__":
    # Test session management
    session_id = test_session_management()
    
    # Test FastAPI endpoints if server is running
    test_fastapi_endpoints()
    
    print("\n🎉 ALL TESTS COMPLETED!")
    print(f"Session ID for manual testing: {session_id}")
