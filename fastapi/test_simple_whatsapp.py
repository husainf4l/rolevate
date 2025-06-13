"""
Simple WhatsApp sender test with the new template format.
"""
import os
import sys
import json
import requests
import re
from pathlib import Path
from dotenv import load_dotenv

# Function to send WhatsApp message
def send_simple_whatsapp_template(
    phone_number: str,
    candidate_name: str,
    phone_digit: str = None
):
    """Send a WhatsApp message with the cv_received_notification template."""
    # Load environment variables
    load_dotenv()
    
    # Get WhatsApp API credentials
    phone_number_id = os.getenv("WHATSAPP_PHONE_NUMBER_ID")
    api_token = os.getenv("WHATSAPP_API_TOKEN")
    api_version = os.getenv("WHATSAPP_API_VERSION", "v18.0")
    
    # Clean the phone number
    clean_phone = re.sub(r'[^\d+]', '', phone_number)
    if not clean_phone.startswith('+'):
        clean_phone = f"+{clean_phone}"
    
    # Use phone digits without + for button parameter
    if not phone_digit:
        phone_digit = re.sub(r'\D', '', clean_phone)
    
    # Construct the API URL
    url = f"https://graph.facebook.com/{api_version}/{phone_number_id}/messages"
    
    # Set up headers
    headers = {
        "Authorization": f"Bearer {api_token}",
        "Content-Type": "application/json"
    }
    
    # Create the payload
    payload = {
        "messaging_product": "whatsapp",
        "recipient_type": "individual",
        "to": clean_phone,
        "type": "template",
        "template": {
            "name": "cv_received_notification",
            "language": {
                "code": "en"
            },
            "components": [
                {
                    "type": "body",
                    "parameters": [
                        {
                            "type": "text",
                            "text": candidate_name
                        }
                    ]
                },
                {
                    "type": "button",
                    "sub_type": "url",
                    "index": "0",
                    "parameters": [
                        {
                            "type": "text",
                            "text": phone_digit
                        }
                    ]
                }
            ]
        }
    }
    
    print(f"API URL: {url}")
    print(f"Headers: {json.dumps({'Authorization': 'Bearer ****', 'Content-Type': 'application/json'})}")
    print(f"Payload: {json.dumps(payload, indent=2)}")
    
    try:
        # Make the API call
        response = requests.post(url, json=payload, headers=headers)
        
        # Print the response
        print(f"Status Code: {response.status_code}")
        try:
            print(f"Response: {json.dumps(response.json(), indent=2)}")
        except:
            print(f"Response (non-JSON): {response.text}")
            
        # Return the success status
        return response.status_code in (200, 201)
    except Exception as e:
        print(f"Error: {str(e)}")
        return False

# Main test
if __name__ == "__main__":
    print("\n----- SIMPLE WHATSAPP TEMPLATE TEST -----\n")
    
    # Test parameters
    phone = "+962796026659"  # Al-Hussein's phone number
    name = "Al-Hussein"
    phone_digits = "962796026659"
    
    print(f"Sending WhatsApp template message to {phone}...")
    print(f"Name parameter: {name}")
    print(f"Phone digits parameter: {phone_digits}")
    
    confirm = input("\nThis will send an actual WhatsApp message. Type 'yes' to confirm: ")
    if confirm.lower() == 'yes':
        success = send_simple_whatsapp_template(
            phone_number=phone,
            candidate_name=name,
            phone_digit=phone_digits
        )
        
        if success:
            print("\n✅ WhatsApp message sent successfully!")
        else:
            print("\n❌ Failed to send WhatsApp message")
    else:
        print("Operation cancelled.")
