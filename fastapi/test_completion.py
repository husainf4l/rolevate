#!/usr/bin/env python3
"""
Test completion detection to verify job post actually gets sent to API
"""

def test_completion():
    print("🧪 TESTING COMPLETION DETECTION")
    print("=" * 50)
    
    from interactive_job_console import ConversationalJobAgent
    
    # Create agent with data that should trigger completion
    agent = ConversationalJobAgent(
        company_id="eeb88919-5a2d-4393-b14b-8a3bfbb51c7e", 
        company_name="papaya trading"
    )
    
    # Pre-populate with essential data
    agent.job_data = {
        "title": ".Net Developer Full Stack",
        "description": "Full stack developer position",
        "requirements": "",
        "responsibilities": "- Design, build, and maintain efficient, reusable, and reliable .Net code\n- Ensure the best possible performance, quality, and responsiveness of applications",
        "benefits": "",
        "skills": [".net", "c#"],
        "experienceLevel": "mid",
        "location": "Jordan, Amman, Mecca Street",
        "workType": "remote",
        "salaryMin": 12000,
        "salaryMax": 18000,
        "currency": "JOD",
        "department": "",
        "enableAiInterview": False,
        "isFeatured": False
    }
    
    print("📊 Pre-populated job data:")
    for key, value in agent.job_data.items():
        if value:
            print(f"  {key}: {value}")
    
    # Test completion keywords
    completion_tests = [
        "confirm",
        "publish",
        "ready to post",
        "finalize the job post"
    ]
    
    for test_input in completion_tests:
        print(f"\n🔍 Testing: '{test_input}'")
        
        # Check if completion is detected
        should_complete = agent._check_completion_keywords(test_input)
        print(f"  Should complete: {should_complete}")
        
        if should_complete:
            print("  ✅ This should trigger actual job posting!")
            
            # Test the actual finalization process
            try:
                result = agent._finalize_job_post()
                print(f"  📤 Finalization result: {result[:200]}...")
                agent.is_complete = True
                break
            except Exception as e:
                print(f"  ❌ Finalization error: {e}")
        else:
            print("  ❌ This won't trigger job posting")

if __name__ == "__main__":
    test_completion()
