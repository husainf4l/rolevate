#!/usr/bin/env python3
"""
Simple test to verify completion detection and finalization
"""

def simple_completion_test():
    print("🔧 SIMPLE COMPLETION TEST")
    print("=" * 40)
    
    from interactive_job_console import ConversationalJobAgent
    
    # Create agent with complete data
    agent = ConversationalJobAgent(
        company_id="eeb88919-5a2d-4393-b14b-8a3bfbb51c7e", 
        company_name="papaya trading"
    )
    
    # Set all required data
    agent.job_data["title"] = ".Net Developer Full Stack"
    agent.job_data["experienceLevel"] = "mid"
    agent.job_data["location"] = "Jordan, Amman, Mecca Street"
    agent.job_data["salaryMin"] = 12000
    agent.job_data["salaryMax"] = 18000
    agent.job_data["responsibilities"] = "- Design and build .Net applications"
    
    print("✅ Job data set:")
    print(f"  Title: {agent.job_data['title']}")
    print(f"  Experience: {agent.job_data['experienceLevel']}")
    print(f"  Location: {agent.job_data['location']}")
    print(f"  Salary: {agent.job_data['salaryMin']}-{agent.job_data['salaryMax']}")
    print(f"  Responsibilities: {agent.job_data['responsibilities']}")
    
    # Test completion detection
    test_words = ["confirm", "publish", "ready"]
    
    for word in test_words:
        result = agent._check_completion_keywords(word)
        print(f"\n🔍 Testing '{word}': {result}")
        
        if result:
            print("✅ This should trigger completion!")
            
            # Test finalization
            try:
                final_result = agent._finalize_job_post()
                print(f"📤 Finalization result: {final_result[:150]}...")
                return True
            except Exception as e:
                print(f"❌ Finalization error: {e}")
        
    print("\n❌ No completion detected")
    return False

if __name__ == "__main__":
    success = simple_completion_test()
    if success:
        print("\n🎉 COMPLETION TEST PASSED!")
    else:
        print("\n❌ COMPLETION TEST FAILED!")
