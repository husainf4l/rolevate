#!/usr/bin/env python3
"""
Test the improved interactive console that should avoid looping
"""

def test_non_looping_conversation():
    print("🧪 TESTING NON-LOOPING CONVERSATION")
    print("=" * 50)
    
    from interactive_job_console import ConversationalJobAgent
    
    # Create agent
    agent = ConversationalJobAgent(
        company_id="eeb88919-5a2d-4393-b14b-8a3bfbb51c7e", 
        company_name="papaya trading"
    )
    
    # Simulate the conversation that was looping
    conversation_flow = [
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
        "18K",
        "finalize the job post"  # This should trigger completion
    ]
    
    for i, user_input in enumerate(conversation_flow):
        print(f"\n📝 Turn {i+1}: '{user_input}'")
        
        # Show what data we have before processing
        collected_data = [k for k, v in agent.job_data.items() if v]
        print(f"📊 Data before: {collected_data}")
        
        try:
            response = agent.process_user_input(user_input)
            print(f"🤖 Response: {response[:150]}...")
            
            # Show what data we have after processing
            collected_data_after = [k for k, v in agent.job_data.items() if v]
            print(f"📊 Data after: {collected_data_after}")
            
            if agent.is_complete:
                print("🎉 JOB POST COMPLETED!")
                break
                
        except Exception as e:
            print(f"❌ Error: {e}")
            break
    
    print(f"\n✅ Final job data:")
    for key, value in agent.job_data.items():
        if value:
            print(f"  {key}: {value}")

if __name__ == "__main__":
    test_non_looping_conversation()
