#!/usr/bin/env python3
"""
Quick test of the improved conversational job agent
"""

from conversational_job_console import ConversationalJobAgent

def test_conversation():
    print("🧪 TESTING CONVERSATIONAL JOB AGENT")
    print("=" * 50)
    
    # Create agent
    agent = ConversationalJobAgent(
        company_id="eeb88919-5a2d-4393-b14b-8a3bfbb51c7e",
        company_name="papaya trading"
    )
    
    # Test conversation
    user_inputs = [
        "senior .net developer",
        "We need someone with 5+ years experience in C# and financial systems",
        "This role will be remote and requires expertise in microservices"
    ]
    
    for i, user_input in enumerate(user_inputs):
        print(f"\n📝 Test {i+1}: User says '{user_input}'")
        print("🔍 Processing...")
        
        response = agent.process_user_input(user_input)
        
        print("✅ AI Response:")
        print(f"  {response[:150]}...")
        print(f"📊 Job data collected: {agent.job_data}")

if __name__ == "__main__":
    test_conversation()
