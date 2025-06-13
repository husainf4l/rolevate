#!/usr/bin/env python3
"""
Demo Script for the Job Post Creation Agent

This script demonstrates the job post agent with pre-defined inputs
to show how the conversation flow works.
"""

import sys
import os

# Add the current directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from agent.job_post_agent import run_job_post_agent

def demo_job_post_agent():
    """Demonstrate the job post agent with sample interactions."""
    
    print("=" * 80)
    print("🤖 AI HR EXPERT - JOB POST CREATION AGENT DEMO")
    print("=" * 80)
    print("This demo shows how the AI HR Expert helps create job posts.")
    print("=" * 80)
    
    # Demo company information
    company_id = "demo-company-123"
    company_name = "TechCorp Solutions"
    
    print(f"\n🏢 DEMO COMPANY:")
    print(f"   ID: {company_id}")
    print(f"   Name: {company_name}")
    
    # Demo conversation flows
    demo_conversations = [
        {
            "title": "Initial Job Post Request",
            "input": "I want to create a job post for a Senior Software Engineer position"
        },
        {
            "title": "Job Title Response",
            "input": "Senior Full-Stack Developer with React and Node.js expertise"
        },
        {
            "title": "Department and Location",
            "input": "Engineering department, San Francisco office with hybrid remote work option"
        },
        {
            "title": "Employment Details",
            "input": "Full-time position, looking for senior level candidates, hybrid work policy"
        }
    ]
    
    for i, demo in enumerate(demo_conversations, 1):
        print(f"\n" + "=" * 60)
        print(f"DEMO {i}: {demo['title']}")
        print("=" * 60)
        
        print(f"\n👤 USER INPUT:")
        print(f"   {demo['input']}")
        
        try:
            print(f"\n🤖 AI HR EXPERT PROCESSING...")
            
            # Call the job post agent
            messages = run_job_post_agent(
                user_input=demo['input'],
                company_id=company_id,
                company_name=company_name
            )
            
            print(f"\n📝 RESPONSE (Messages: {len(messages)}):")
            print("-" * 50)
            
            # Show the AI response
            if messages:
                ai_response = messages[-1].content
                # Truncate very long responses for demo
                if len(ai_response) > 800:
                    ai_response = ai_response[:800] + "\n\n... [Response truncated for demo] ..."
                print(ai_response)
            else:
                print("❌ No response from agent")
                
            print("-" * 50)
            
        except Exception as e:
            print(f"❌ ERROR: {str(e)}")
            
        # Pause between demos
        if i < len(demo_conversations):
            input(f"\n⏸️  Press Enter to continue to Demo {i+1}...")
    
    print(f"\n" + "=" * 80)
    print("🎉 DEMO COMPLETE!")
    print("=" * 80)
    print("This shows how the AI HR Expert guides users through job post creation.")
    print("To use the full interactive version, run: python job_post_console.py")
    print("To test via API, use the FastAPI endpoints:")
    print("  POST /create-job-post")
    print("  POST /job-post-chat")
    print("=" * 80)

if __name__ == "__main__":
    demo_job_post_agent()
