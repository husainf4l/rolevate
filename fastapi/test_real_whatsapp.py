"""
Test script for sending a real WhatsApp message using the cv_received_notification template.

This script temporarily sets the environment to 'production' to send an actual API request.
"""
import os
import sys
import json
from pathlib import Path

# Add the parent directory to sys.path
sys.path.insert(0, str(Path(__file__).parent))

from dotenv import load_dotenv
from agent.tools.whatsapp_sender import send_whatsapp_message

def test_real_whatsapp():
    """Test sending an actual WhatsApp message using the cv_received_notification template."""
    print("\n----- TESTING REAL WHATSAPP API CALL -----\n")
    
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
        
        # Default phone number for testing
        phone_number = "+962796026659"  # Al-Hussein's phone number
        
        # Parameters for the cv_received_notification template
        template_params = {
            "name": "Al-Hussein",
            "phone": "962796026659"
        }
        
        print(f"\nSending REAL WhatsApp message to {phone_number}...")
        print(f"Template: cv_received_notification")
        print(f"Parameters: {json.dumps(template_params, indent=2)}")
        
        # Confirm before sending
        confirm = input("\nThis will send an actual WhatsApp message. Type 'yes' to confirm: ")
        if confirm.lower() != 'yes':
            print("Operation cancelled by user.")
            return
        
        # Print the template parameters that will be used
        print("\nTemplate parameters that will be used:")
        print(f"Name: {template_params.get('name')}")
        print(f"Phone: {template_params.get('phone')}")
        
        # Send the message
        response = send_whatsapp_message(
            phone_number=phone_number,
            template_name="cv_received_notification",
            template_params=template_params,
            application_id="37b613ca-941b-4135-b081-f3523cf0ce8a"
        )
        
        # Display the result
        print("\nWhatsApp API Response:")
        print(f"Success: {response.get('success')}")
        print(f"Status Code: {response.get('status_code')}")
        
        if response.get('success'):
            print("\nMessage Data:")
            print(json.dumps(response.get('data', {}), indent=2))
            print("\n✅ WhatsApp message sent successfully!")
        else:
            print(f"\nError: {response.get('error')}")
            print("\n❌ Failed to send WhatsApp message")
    
    finally:
        # Restore original environment
        os.environ["ENVIRONMENT"] = original_env

if __name__ == "__main__":
    test_real_whatsapp()
