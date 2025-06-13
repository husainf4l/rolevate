#!/usr/bin/env python3
"""
Test the exact conversation flow that should trigger completion
"""

def test_your_conversation():
    print("🧪 TESTING YOUR EXACT CONVERSATION")
    print("=" * 50)
    
    from interactive_job_console import ConversationalJobAgent
    
    # Create agent
    agent = ConversationalJobAgent(
        company_id="eeb88919-5a2d-4393-b14b-8a3bfbb51c7e", 
        company_name="papaya trading"
    )
    
    # Your exact conversation flow
    inputs = [
        ".net developer full stack",
        "mid-level", 
        "suggest",
        "yes",
        "as you see the best",
        "what is the range in jordan",
        "yes but make it in JOD",
        "add them",
        "okay as you see",
        "Jordan amman mecca street",
        "confirm"  # This should trigger completion
    ]
    
    for i, user_input in enumerate(inputs):
        print(f"\n📝 Turn {i+1}: User says '{user_input}'")
        
        # Show current data
        collected = [k for k, v in agent.job_data.items() if v]
        print(f"📊 Data: {collected}")
        
        # Check completion before processing
        will_complete = agent._check_completion_keywords(user_input)
        print(f"🔍 Will trigger completion: {will_complete}")
        
        try:
            response = agent.process_user_input(user_input)
            
            print(f"🤖 Agent says: {response[:100]}...")
            print(f"✅ Is Complete: {agent.is_complete}")
            
            if agent.is_complete:
                print("🎉 JOB POST WAS ACTUALLY COMPLETED AND SENT TO API!")
                break
            
        except Exception as e:
            print(f"❌ Error: {e}")
            break
    
    # Final check
    if not agent.is_complete:
        print("\n❌ THE JOB POST WAS NOT ACTUALLY SENT TO API")
        print("🔧 Manual completion test:")
        
        # Try manual completion
        agent.is_complete = True
        result = agent._finalize_job_post()
        print(f"📤 Manual completion result: {result[:200]}...")

if __name__ == "__main__":
    test_your_conversation()
