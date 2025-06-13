#!/usr/bin/env python3
"""
Quick test of the improved conversational agent
"""

def test_conversation():
    from interactive_job_console import ConversationalJobAgent
    
    print("🧪 TESTING IMPROVED CONVERSATIONAL AGENT")
    print("=" * 50)
    
    # Create agent instance
    agent = ConversationalJobAgent(
        company_id="eeb88919-5a2d-4393-b14b-8a3bfbb51c7e",
        company_name="papaya trading"
    )
    
    # Test conversation turns
    test_inputs = [
        ".net developer",
        "senior full stack engineer",
        "5+ years experience, financial systems, microservices architecture",
        "remote work, competitive salary 80k-120k"
    ]
    
    for i, user_input in enumerate(test_inputs):
        print(f"\n📝 Turn {i+1}: User says '{user_input}'")
        
        try:
            response = agent.process_user_input(user_input)
            print(f"\n✅ AI Response:")
            print(f"   {response[:200]}...")
            
            print(f"\n📊 Collected Data:")
            print(f"   Title: {agent.job_data.get('title', 'None')}")
            print(f"   Experience: {agent.job_data.get('experienceLevel', 'None')}")
            print(f"   Skills: {agent.job_data.get('skills', [])}")
            print(f"   Work Type: {agent.job_data.get('workType', 'None')}")
            
        except Exception as e:
            print(f"❌ Error: {e}")
            break
        
        if agent.is_complete:
            print("🎉 Job post completed!")
            break

if __name__ == "__main__":
    test_conversation()
