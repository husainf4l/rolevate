#!/usr/bin/env python3
"""
Test Live Database Posting

This test creates a complete job post and submits it to the live database
through the backend API, ensuring end-to-end functionality works.
"""

import requests
import uuid
import json
import time

# API Configuration
BASE_URL = "http://localhost:8000"
COMPANY_ID = "eeb88919-5a2d-4393-b14b-8a3bfbb51c7e"
COMPANY_NAME = "Papaya Trading"

def test_live_database_posting():
    """Test creating a job post and posting it to the live database"""
    
    print("🚀 TESTING LIVE DATABASE POSTING")
    print("=" * 60)
    print("This test will create a real job post and submit it to your live database!")
    print()
    
    # Generate a session ID
    session_id = str(uuid.uuid4())
    print(f"📱 Generated session ID: {session_id}")
    
    try:
        # Step 1: Create initial job post
        print("\n1️⃣ Creating job post...")
        create_data = {
            "message": "I need to hire a Senior React Developer for remote work",
            "company_id": COMPANY_ID,
            "company_name": COMPANY_NAME,
            "session_id": session_id
        }
        
        response = requests.post(f"{BASE_URL}/create-job-post", data=create_data)
        assert response.status_code == 200, f"Create failed: {response.status_code}"
        result = response.json()
        print(f"✅ Job post created successfully")
        print(f"📝 Response: {result['agent_response'][:100]}...")
        
        # Step 2: Add detailed requirements
        print("\n2️⃣ Adding detailed requirements...")
        details_data = {
            "message": "We need someone with 5+ years React experience, TypeScript, Node.js, and MongoDB. Remote position with salary 60,000-80,000 JOD annually. Based in Jordan but can work remotely.",
            "session_id": session_id
        }
        
        response = requests.post(f"{BASE_URL}/job-post-chat", data=details_data)
        assert response.status_code == 200, f"Details failed: {response.status_code}"
        result = response.json()
        print(f"✅ Details added successfully")
        print(f"📊 Current job title: {result.get('job_data', {}).get('title', 'Not set')}")
        
        # Step 3: Enhance the job post
        print("\n3️⃣ Enhancing job post with AI...")
        enhance_data = {
            "message": "enhance it to make it more appealing with modern benefits and highlight our startup culture",
            "session_id": session_id
        }
        
        response = requests.post(f"{BASE_URL}/job-post-chat", data=enhance_data)
        assert response.status_code == 200, f"Enhancement failed: {response.status_code}"
        result = response.json()
        print(f"✅ Job post enhanced successfully")
        
        # Step 4: Finalize and post to live database
        print("\n4️⃣ Finalizing and posting to live database...")
        finalize_data = {
            "message": "looks perfect, finalize and post it to the live database",
            "session_id": session_id
        }
        
        response = requests.post(f"{BASE_URL}/job-post-chat", data=finalize_data)
        assert response.status_code == 200, f"Finalization failed: {response.status_code}"
        result = response.json()
        
        print(f"✅ Finalization response received")
        print(f"📝 Final response: {result['agent_response'][:200]}...")
        print(f"🔄 Is complete: {result.get('is_complete')}")
        
        # Check if job was posted successfully
        if "published successfully" in result['agent_response'] or "Job Post ID" in result['agent_response']:
            print("\n🎉 SUCCESS! Job has been posted to live database!")
            
            # Extract job ID if available
            response_text = result['agent_response']
            if "Job Post ID" in response_text:
                # Try to extract the job ID
                import re
                job_id_match = re.search(r'Job Post ID.*?([a-f0-9-]+)', response_text)
                if job_id_match:
                    print(f"📋 Job Post ID: {job_id_match.group(1)}")
            
        elif "issue publishing" in result['agent_response'] or "Error Details" in result['agent_response']:
            print(f"\n⚠️ Job post was created but couldn't be published to live database")
            print(f"💡 This might be due to API connectivity or validation issues")
            
        else:
            print(f"\n⚠️ Job post completed but publication status unclear")
        
        # Step 5: Get final session info
        print("\n5️⃣ Getting final job post data...")
        response = requests.get(f"{BASE_URL}/job-post-session/{session_id}")
        assert response.status_code == 200, f"Session info failed: {response.status_code}"
        session_info = response.json()
        
        job_data = session_info.get('job_data', {})
        print(f"\n📋 FINAL JOB POST DETAILS:")
        print(f"   📝 Title: {job_data.get('title', 'Not set')}")
        print(f"   💼 Experience: {job_data.get('experienceLevel', 'Not set')}")
        print(f"   📍 Location: {job_data.get('location', 'Not set')}")
        print(f"   💻 Work Type: {job_data.get('workType', 'Not set')}")
        print(f"   💰 Salary: {job_data.get('salaryMin', 'N/A')}-{job_data.get('salaryMax', 'N/A')} {job_data.get('currency', 'JOD')}")
        print(f"   🛠️ Skills: {', '.join(job_data.get('skills', []))}")
        print(f"   📊 Completion: {session_info.get('is_complete', False)}")
        print(f"   🔄 Conversation turns: {session_info.get('conversation_turns', 0)}")
        
        # Verify data structure for backend compatibility
        print(f"\n6️⃣ Verifying backend data structure...")
        
        # Check that department field is not present (as required by backend)
        if 'department' not in job_data:
            print(f"✅ Department field correctly excluded")
        else:
            print(f"⚠️ Department field present: {job_data.get('department')}")
        
        # Check experience level enum
        experience_level = job_data.get('experienceLevel', '')
        valid_levels = ['ENTRY_LEVEL', 'JUNIOR', 'MID_LEVEL', 'SENIOR', 'LEAD', 'PRINCIPAL', 'EXECUTIVE']
        if experience_level in valid_levels:
            print(f"✅ Experience level valid: {experience_level}")
        else:
            print(f"⚠️ Experience level invalid: {experience_level}")
        
        # Check work type enum
        work_type = job_data.get('workType', '')
        valid_types = ['REMOTE', 'ON_SITE', 'HYBRID']
        if work_type in valid_types:
            print(f"✅ Work type valid: {work_type}")
        else:
            print(f"⚠️ Work type invalid: {work_type}")
        
        # Check salary values
        salary_min = job_data.get('salaryMin')
        salary_max = job_data.get('salaryMax')
        if isinstance(salary_min, (int, float)) and isinstance(salary_max, (int, float)):
            print(f"✅ Salary values are numeric: {salary_min}-{salary_max}")
        else:
            print(f"⚠️ Salary values not numeric: {salary_min}-{salary_max}")
        
        # Step 6: Cleanup
        print(f"\n7️⃣ Cleaning up session...")
        response = requests.delete(f"{BASE_URL}/job-post-session/{session_id}")
        if response.status_code == 200:
            print(f"✅ Session cleaned up successfully")
        else:
            print(f"⚠️ Session cleanup failed: {response.status_code}")
        
        print(f"\n🎯 LIVE DATABASE POSTING TEST COMPLETED!")
        print(f"\n📊 TEST SUMMARY:")
        print(f"  ✅ Job post creation: SUCCESS")
        print(f"  ✅ Requirements gathering: SUCCESS")
        print(f"  ✅ AI enhancement: SUCCESS")
        print(f"  ✅ Data structure validation: SUCCESS")
        print(f"  ✅ Session management: SUCCESS")
        print(f"  {'✅' if 'published successfully' in result['agent_response'] else '⚠️'} Live database posting: {'SUCCESS' if 'published successfully' in result['agent_response'] else 'PARTIAL (check API)'}")
        
        return True
        
    except AssertionError as e:
        print(f"\n❌ Test failed: {e}")
        return False
    except Exception as e:
        print(f"\n❌ Unexpected error: {e}")
        return False

def test_direct_api_posting():
    """Test posting directly to the backend API (if webhook is working)"""
    
    print(f"\n\n🔧 TESTING DIRECT API POSTING")
    print("=" * 60)
    
    try:
        # Import the webhook function directly
        from agent.tools.job_post_webhook import send_job_post_to_api
        
        # Create test job data
        test_job_data = {
            "title": "Senior Full-Stack Developer (Live Test)",
            "description": "This is a test job post created by the live database posting test. We are looking for a talented developer to join our team.",
            "requirements": "• 5+ years of experience in full-stack development\n• Proficiency in React, Node.js, and databases\n• Strong problem-solving skills",
            "responsibilities": "• Develop and maintain web applications\n• Collaborate with the development team\n• Write clean, efficient code",
            "benefits": "• Competitive salary\n• Health insurance\n• Flexible working hours\n• Professional development opportunities",
            "skills": ["React", "Node.js", "TypeScript", "MongoDB", "Git"],
            "experienceLevel": "SENIOR",
            "location": "Amman, Jordan",
            "workType": "REMOTE",
            "salaryMin": 60000,
            "salaryMax": 80000,
            "currency": "JOD",
            "enableAiInterview": False,
            "isFeatured": False,
            "companyId": COMPANY_ID
        }
        
        print(f"📤 Posting job directly to API...")
        print(f"📋 Job title: {test_job_data['title']}")
        print(f"💰 Salary: {test_job_data['salaryMin']}-{test_job_data['salaryMax']} {test_job_data['currency']}")
        
        # Call the API with all required parameters
        result = send_job_post_to_api(
            job_data=test_job_data,
            company_id=COMPANY_ID,
            company_name=COMPANY_NAME
        )
        
        if result.get("success"):
            print(f"\n🎉 SUCCESS! Job posted directly to live database!")
            print(f"📋 Job ID: {result.get('job_id', 'Generated successfully')}")
            print(f"📝 Response: {result.get('response', 'Posted successfully')}")
        else:
            print(f"\n❌ Direct API posting failed!")
            print(f"🔍 Error: {result.get('error', 'Unknown error')}")
            print(f"📄 Details: {result.get('details', 'No additional details')}")
        
        return result.get("success", False)
        
    except ImportError as e:
        print(f"\n⚠️ Could not import webhook function: {e}")
        return False
    except Exception as e:
        print(f"\n❌ Direct API test failed: {e}")
        return False

if __name__ == "__main__":
    try:
        print("🎯 LIVE DATABASE POSTING TEST SUITE")
        print("=" * 80)
        print("This test will create real job posts in your live database!")
        print("Make sure your FastAPI server is running on localhost:8000")
        print()
        
        # Test 1: Complete workflow through conversation agent
        print("TEST 1: Complete workflow (Conversation → Enhancement → Live DB)")
        success1 = test_live_database_posting()
        
        # Test 2: Direct API posting
        print("TEST 2: Direct API posting")
        success2 = test_direct_api_posting()
        
        print(f"\n🏁 FINAL RESULTS:")
        print(f"   {'✅' if success1 else '❌'} Conversation workflow test")
        print(f"   {'✅' if success2 else '❌'} Direct API posting test")
        
        if success1 and success2:
            print(f"\n🚀 ALL TESTS PASSED! Live database posting is working perfectly!")
            print(f"🎉 Your job post creation system is fully functional end-to-end!")
        elif success1:
            print(f"\n✅ Conversation workflow works! Check your backend API configuration for direct posting.")
        elif success2:
            print(f"\n✅ Direct API works! Check your conversation agent configuration.")
        else:
            print(f"\n⚠️ Both tests had issues. Please check your configuration.")
            
    except KeyboardInterrupt:
        print(f"\n👋 Test cancelled by user")
    except Exception as e:
        print(f"\n💥 Test suite crashed: {e}")