"""
Test script for WhatsApp notification functionality.

This script tests the WhatsApp notification feature by running the CV analysis agent with a sample CV
and verifying that a WhatsApp message is sent to the candidate.
"""
import os
import sys
from pathlib import Path

# Add the parent directory to sys.path
sys.path.insert(0, str(Path(__file__).parent.parent))

from agent.agent import run_agent
from dotenv import load_dotenv

def test_whatsapp_notification():
    """
    Test the WhatsApp notification functionality.
    """
    print("\n----- TESTING WHATSAPP NOTIFICATION FUNCTIONALITY -----\n")
    
    # Load environment variables
    load_dotenv()
    
    # Test CV file path - make sure this file exists
    cv_file_path = "test/upload/1.pdf"
    
    # UUIDs for testing
    candidate_id = "29c313d7-04dc-4a08-bc93-95efe273511e"
    job_post_id = "0c679bbe-daf5-49fc-a74d-908eae108c48"
    
    # Create the input message for the agent
    input_message = f"""
    Please analyze this CV:
    
    Candidate ID: {candidate_id}
    Job Post ID: {job_post_id}
    CV: {cv_file_path}
    """
    
    print(f"Running agent with input:\n{input_message}")
    
    # Run the agent
    messages = run_agent(input_message)
    
    # Print the results
    print("\n----- AGENT OUTPUT -----\n")
    for i, msg in enumerate(messages):
        print(f"[Message {i+1}]")
        print(f"Role: {msg.type}")
        print(f"Content: {msg.content}")
        print()
    
    # Check for WhatsApp notification success
    whatsapp_success = False
    for msg in messages:
        if "Successfully sent WhatsApp message" in msg.content:
            whatsapp_success = True
            break
    
    # Print the final result
    if whatsapp_success:
        print("✅ WhatsApp notification test passed - message was sent successfully")
    else:
        print("❌ WhatsApp notification test failed - message was not sent")
    
if __name__ == "__main__":
    test_whatsapp_notification()
