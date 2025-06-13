"""
Test script to fetch WhatsApp templates and send a template message.

This script tests the WhatsApp template fetching and sending functionality.
"""
import os
import sys
from pathlib import Path

# Add the parent directory to sys.path
sys.path.insert(0, str(Path(__file__).parent))

from dotenv import load_dotenv
from agent.tools.whatsapp_sender import fetch_whatsapp_templates, send_whatsapp_message

def test_whatsapp_templates():
    """Test fetching WhatsApp templates and sending a template message."""
    print("\n----- TESTING WHATSAPP TEMPLATES -----\n")
    
    # Load environment variables
    load_dotenv()
    
    # Fetch available templates
    print("Fetching available WhatsApp templates...")
    templates = fetch_whatsapp_templates()
    
    # Display templates
    print(f"\nFound {len(templates)} templates:")
    for i, template in enumerate(templates):
        print(f"\nTemplate {i+1}:")
        print(f"Name: {template.get('name')}")
        print(f"Status: {template.get('status')}")
        print(f"Language: {template.get('language')}")
        
        # Display components
        components = template.get('components', [])
        print(f"Components ({len(components)}):")
        for comp in components:
            print(f"  - Type: {comp.get('type')}")
            if comp.get('format'):
                print(f"    Format: {comp.get('format')}")
            if comp.get('text'):
                print(f"    Text: {comp.get('text')}")
    
    # Send a test message using a template
    print("\nSending a test message using the template...")
    
    # Default phone number for testing
    phone_number = "+962796026659"  # Al-Hussein's phone number
    
    # Test parameters for the template
    template_params = [
        "Al-Hussein",  # Candidate name
        "AI Engineer", # Job title
        "http://rolevate.com/room?phoneNumber=962796026659&jobId=306bfccd-5030-46bb-b468-e5027a073b4a"  # Interview link
    ]
    
    # Send the message
    response = send_whatsapp_message(
        phone_number=phone_number,
        template_name="interview_invitation",
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
    test_whatsapp_templates()
