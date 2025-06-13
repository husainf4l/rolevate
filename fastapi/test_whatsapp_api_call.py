"""
Test script to make a direct API call to the Meta WhatsApp API.

This script temporarily sets ENVIRONMENT=production to test the actual API call.
"""
import os
import sys
from pathlib import Path

# Add the parent directory to sys.path
sys.path.insert(0, str(Path(__file__).parent))

from dotenv import load_dotenv
from agent.tools.whatsapp_sender import send_whatsapp_message, fetch_whatsapp_templates

def test_whatsapp_api_call():
    """Test sending a WhatsApp message via the Meta WhatsApp API."""
    print("\n----- TESTING DIRECT WHATSAPP API CALL -----\n")
    
    # Load environment variables
    load_dotenv()
    
    # Temporarily set environment to production
    original_env = os.environ.get("ENVIRONMENT", "development")
    os.environ["ENVIRONMENT"] = "production"
    
    try:
        # Print API credentials (masked)
        phone_number_id = os.getenv("WHATSAPP_PHONE_NUMBER_ID", "")
        api_token = os.getenv("WHATSAPP_API_TOKEN", "")
        api_version = os.getenv("WHATSAPP_API_VERSION", "v18.0")
        
        print(f"Phone Number ID: {'*' * (len(phone_number_id) - 4) + phone_number_id[-4:] if phone_number_id else 'Not set'}")
        print(f"API Token: {'*' * (len(api_token) - 4) + api_token[-4:] if api_token else 'Not set'}")
        print(f"API Version: {api_version}")
        
        # Fetch available templates first
        print("\nFetching available templates...")
        templates = fetch_whatsapp_templates()
        
        # Use the first template if available
        template_name = templates[0]["name"] if templates else "interview_invitation"
        print(f"Using template: {template_name}")
        
        # Default phone number for testing
        phone_number = "+962796026659"  # Al-Hussein's phone number
        
        # Test parameters for the template
        template_params = [
            "Al-Hussein",  # Candidate name
            "AI Engineer", # Job title
            "http://rolevate.com/room?phoneNumber=962796026659&jobId=306bfccd-5030-46bb-b468-e5027a073b4a"  # Interview link
        ]
        
        print(f"\nSending test message to {phone_number}...")
        
        # Send the message
        response = send_whatsapp_message(
            phone_number=phone_number,
            template_name=template_name,
            template_params=template_params,
            application_id="37b613ca-941b-4135-b081-f3523cf0ce8a"
        )
        
        # Display the result
        print("\nWhatsApp API Response:")
        print(f"Success: {response.get('success')}")
        print(f"Status Code: {response.get('status_code')}")
        
        if response.get('success'):
            print("\nMessage Data:")
            for key, value in response.get('data', {}).items():
                print(f"  {key}: {value}")
            print("\n✅ WhatsApp message sent successfully!")
        else:
            print(f"\nError: {response.get('error')}")
            print("\n❌ Failed to send WhatsApp message")
    
    finally:
        # Restore original environment
        os.environ["ENVIRONMENT"] = original_env

if __name__ == "__main__":
    test_whatsapp_api_call()
