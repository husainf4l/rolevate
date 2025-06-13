#!/usr/bin/env python3
"""
Simple test for the Job Post Creation Agent
"""

from agent.job_post_agent import run_job_post_agent

def simple_test():
    print("🤖 Testing Job Post Creation Agent")
    print("=" * 50)
    
    # Test with simple input
    print("📝 Input: 'I want to create a job post for a Senior Developer'")
    
    try:
        messages = run_job_post_agent(
            user_input="I want to create a job post for a Senior Developer",
            company_id="test-company-123",
            company_name="Test Company"
        )
        
        print(f"\n✅ Success! Got {len(messages)} messages")
        
        if messages:
            print("\n🤖 AI Response:")
            print("-" * 40)
            print(messages[-1].content)
            print("-" * 40)
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    simple_test()
