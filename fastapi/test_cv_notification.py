"""
Test script for sending a WhatsApp message using the cv_received_notification template.
"""
import os
import sys
from pathlib import Path

# Add the parent directory to sys.path
sys.path.insert(0, str(Path(__file__).parent))

from dotenv import load_dotenv
from agent.tools.whatsapp_sender import send_whatsapp_message

def test_cv_received_notification():
    """Test sending a WhatsApp message using the cv_received_notification template."""
    print("\n----- TESTING CV_RECEIVED_NOTIFICATION TEMPLATE -----\n")
    
    # Load environment variables
    load_dotenv()
    
    # Default phone number for testing
    phone_number = "+962796026659"  # Al-Hussein's phone number
    
    # Parameters for the cv_received_notification template
    template_params = {
        "name": "Al-Hussein",
        "phone": "962796026659"
    }
    
    print(f"Sending cv_received_notification template to {phone_number}...")
    print(f"Template parameters: {template_params}")
    
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
        for key, value in response.get('data', {}).items():
            print(f"  {key}: {value}")
        print("\n✅ WhatsApp template message sent successfully!")
    else:
        print(f"\nError: {response.get('error')}")
        print("\n❌ Failed to send WhatsApp template message")
    
if __name__ == "__main__":
    test_cv_received_notification()
