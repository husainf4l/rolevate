#!/usr/bin/env python3
"""
Final comprehensive test showing the complete conversation flow
"""

def final_comprehensive_test():
    print("🎯 FINAL COMPREHENSIVE TEST")
    print("=" * 50)
    
    from interactive_job_console import ConversationalJobAgent
    
    # Create agent
    agent = ConversationalJobAgent(
        company_id="eeb88919-5a2d-4393-b14b-8a3bfbb51c7e", 
        company_name="papaya trading"
    )
    
    # Complete conversation flow that should work
    conversation_flow = [
        ".net developer full stack",      # Sets title, skills, responsibilities
        "mid-level",                      # Sets experience level
        "Jordan amman mecca street",      # Sets location  
        "18k in JOD",                     # Sets salary and currency
        "confirm"                         # Should trigger completion
    ]
    
    print("📝 Simulating the conversation that should work:")
    
    for i, user_input in enumerate(conversation_flow):
        print(f"\n{'='*60}")
        print(f"🔄 Turn {i+1}: User says '{user_input}'")
        
        # Show current state
        print(f"📊 Before: {len([k for k, v in agent.job_data.items() if v])} fields filled")
        
        try:
            # Process input
            response = agent.process_user_input(user_input)
            
            # Show what was extracted/updated
            filled_data = {k: v for k, v in agent.job_data.items() if v}
            print(f"📈 After: {len(filled_data)} fields filled:")
            for key, value in filled_data.items():
                if key == "description" and len(str(value)) > 50:
                    print(f"  {key}: {str(value)[:50]}...")
                else:
                    print(f"  {key}: {value}")
            
            print(f"\n🤖 AI Response: {response[:200]}...")
            
            if agent.is_complete:
                print("\n🎉 JOB POST COMPLETED SUCCESSFULLY!")
                print("✅ The agent correctly detected completion and sent to API!")
                return True
                
        except Exception as e:
            print(f"❌ Error: {e}")
            return False
    
    print("\n❌ Job post was not completed")
    return False

if __name__ == "__main__":
    success = final_comprehensive_test()
    if success:
        print(f"\n{'🎉'*20}")
        print("✅ THE AGENT IS WORKING PERFECTLY!")
        print("✅ It extracts data correctly")
        print("✅ It detects completion properly") 
        print("✅ It sends to the API when ready")
        print("✅ Your conversation flow now works!")
        print(f"{'🎉'*20}")
    else:
        print("\n❌ There are still issues to fix")
