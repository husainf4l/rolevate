"""
Test script for WhatsApp sender functionality.

This script tests the WhatsApp sender module directly without running the full agent.
"""
import os
import sys
from pathlib import Path

# Add the parent directory to sys.path
sys.path.insert(0, str(Path(__file__).parent))

from dotenv import load_dotenv
from agent.tools.whatsapp_sender import send_whatsapp_message, create_interview_link, create_message_from_template

def test_whatsapp_sender():
    """
    Test the WhatsApp sender functionality directly.
    """
    print("\n----- TESTING WHATSAPP SENDER FUNCTIONALITY -----\n")
    
    # Load environment variables
    load_dotenv()
    
    # Test data
    candidate_name = "Al-Hussein Q. Abdullah"
    candidate_phone = "+962796026659"
    job_title = "AI Engineer"
    job_id = "306bfccd-5030-46bb-b468-e5027a073b4a"
    application_id = "37b613ca-941b-4135-b081-f3523cf0ce8a"
    
    # Create an interview link
    interview_link = create_interview_link(candidate_phone, job_id)
    print(f"Generated interview link: {interview_link}")
    
    # Create a message from template
    message = create_message_from_template(
        template_name="interview_invitation",
        candidate_name=candidate_name,
        job_title=job_title,
        interview_link=interview_link
    )
    print(f"Generated message: {message}")
    
    # Send a WhatsApp message
    print(f"Sending WhatsApp message to {candidate_phone}...")
    response = send_whatsapp_message(
        phone_number=candidate_phone,
        message_text=message,
        application_id=application_id
    )
    
    # Print the response
    print("\nWhatsApp API Response:")
    if response.get("success", False):
        print(f"✅ Success - Message ID: {response.get('data', {}).get('messageId', 'Unknown')}")
    else:
        print(f"❌ Failed - Error: {response.get('error', 'Unknown error')}")
    
    print("\nFull Response:")
    print(response)
    
if __name__ == "__main__":
    test_whatsapp_sender()
