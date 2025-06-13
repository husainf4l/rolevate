"""
Test script for the Job Post Creation Agent
"""

from agent.job_post_agent import run_job_post_agent

def test_job_post_agent():
    """Test the job post creation agent with a sample conversation."""
    
    print("🧪 Testing Job Post Creation Agent\n")
    
    # Test initial interaction
    print("=" * 60)
    print("TEST 1: Initial Job Post Creation Request")
    print("=" * 60)
    
    messages = run_job_post_agent(
        user_input="I want to create a job post for a Senior Software Engineer position",
        company_id="test-company-123",
        company_name="TechCorp Solutions"
    )
    
    print(f"Number of messages: {len(messages)}")
    for i, msg in enumerate(messages):
        print(f"\nMessage {i+1} ({msg.__class__.__name__}):")
        print("-" * 40)
        print(msg.content)
    
    print("\n" + "=" * 60)
    print("TEST 2: Follow-up Response")
    print("=" * 60)
    
    # Test a follow-up response
    messages2 = run_job_post_agent(
        user_input="Senior Full-Stack Developer with React and Node.js expertise",
        company_id="test-company-123", 
        company_name="TechCorp Solutions"
    )
    
    print(f"Number of messages: {len(messages2)}")
    for i, msg in enumerate(messages2):
        print(f"\nMessage {i+1} ({msg.__class__.__name__}):")
        print("-" * 40)
        print(msg.content)

if __name__ == "__main__":
    test_job_post_agent()
