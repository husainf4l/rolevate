#!/usr/bin/env python3
"""
Test script for the improved job post agent
"""

from agent.job_post_agent import run_job_post_agent

def test_conversation():
    print("🧪 TESTING IMPROVED JOB POST AGENT")
    print("=" * 50)
    
    # Test 1: Initial request
    print("\n📝 Test 1: User says 'a .net developer'")
    messages = run_job_post_agent(
        user_input="a .net developer",
        company_id="eeb88919-5a2d-4393-b14b-8a3bfbb51c7e",
        company_name="papaya trading"
    )
    
    if messages:
        print("✅ Agent Response:")
        print(messages[-1].content)
    else:
        print("❌ No response from agent")
    
    print("\n" + "="*50)
    
    # Test 2: Follow-up conversation
    print("\n📝 Test 2: More specific follow-up")
    messages2 = run_job_post_agent(
        user_input="Senior .NET Developer for our trading platform team, requires 5+ years experience with C# and financial systems",
        company_id="eeb88919-5a2d-4393-b14b-8a3bfbb51c7e",
        company_name="papaya trading"
    )
    
    if messages2:
        print("✅ Agent Response:")
        print(messages2[-1].content)
    else:
        print("❌ No response from agent")

if __name__ == "__main__":
    test_conversation()
