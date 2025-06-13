"""
Test script for sending a real WhatsApp message using the cv_received_notification template.
"""
import os
import sys
import json
import requests
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Get WhatsApp API credentials from environment
phone_number_id = os.getenv("WHATSAPP_PHONE_NUMBER_ID")
api_token = os.getenv("WHATSAPP_API_TOKEN")
api_version = os.getenv("WHATSAPP_API_VERSION", "v18.0")
recipient = "+962796026659"  # Al-Hussein's phone number

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
    "to": recipient,
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
                        "text": "Al-Hussein"
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
                        "text": "962796026659"
                    }
                ]
            }
        ]
    }
}

print("\n----- SENDING DIRECT WHATSAPP API CALL -----\n")
print(f"Phone Number ID: {phone_number_id}")
print(f"API Token: {'*' * (len(api_token) - 4) + api_token[-4:] if api_token else 'Not set'}")
print(f"API Version: {api_version}")
print(f"Recipient: {recipient}")
print(f"\nPayload: {json.dumps(payload, indent=2)}")

confirm = input("\nThis will send an actual WhatsApp message. Type 'yes' to confirm: ")
if confirm.lower() == 'yes':
    try:
        print("\nSending request...")
        response = requests.post(url, json=payload, headers=headers)
        
        print(f"\nStatus Code: {response.status_code}")
        try:
            print(f"Response: {json.dumps(response.json(), indent=2)}")
        except:
            print(f"Response (non-JSON): {response.text}")
            
        if response.status_code in (200, 201):
            print("\n✅ WhatsApp message sent successfully!")
        else:
            print(f"\n❌ Failed to send WhatsApp message: {response.status_code}")
            
    except Exception as e:
        print(f"\n❌ Error: {str(e)}")
else:
    print("Operation cancelled by user.")
