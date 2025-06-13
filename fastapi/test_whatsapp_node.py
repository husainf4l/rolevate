"""
Test script for the WhatsApp notification node.

This script tests the WhatsApp notification node directly with a simulated state.
"""
import os
import sys
from pathlib import Path

# Add the parent directory to sys.path
sys.path.insert(0, str(Path(__file__).parent))

from dotenv import load_dotenv
from langchain_core.messages import AIMessage
from agent.nodes.whatsapp_notification import send_whatsapp_notification_node

def test_whatsapp_notification_node():
    """
    Test the WhatsApp notification node directly.
    """
    print("\n----- TESTING WHATSAPP NOTIFICATION NODE -----\n")
    
    # Load environment variables
    load_dotenv()
    
    # Create a simulated state
    state = {
        "messages": [AIMessage(content="Test message")],
        "next": "",
        "context": {
            "candidate_id": "29c313d7-04dc-4a08-bc93-95efe273511e",
            "application_id": "37b613ca-941b-4135-b081-f3523cf0ce8a",
            "cv_analysis": """
                Name: Al-Hussein Q. Abdullah
                Phone: +962796026659
                Email: al-hussein@papayatrading.com
                
                Skills: AI, SaaS, Business Development
                Experience: 
                - Founder & CEO at Roxate Ltd (2025-present)
                - Founder & CEO at Papaya Trading (2013-present)
                
                Education:
                - BBA in Business Administration, University of Jordan (2009-2014)
            """,
            "api_response": {
                "success": True,
                "status_code": 201,
                "data": {
                    "candidateName": "Al-Hussein Q. Abdullah",
                    "candidatePhone": "+962796026659",
                    "whatsappLink": "http://rolevate.com/room?phoneNumber=962796026659&jobId=306bfccd-5030-46bb-b468-e5027a073b4a",
                    "jobId": "306bfccd-5030-46bb-b468-e5027a073b4a",
                    "jobPost": {"title": "AI Engineer"}
                }
            }
        }
    }
    
    # Call the WhatsApp notification node
    print("Calling the WhatsApp notification node...")
    result = send_whatsapp_notification_node(state)
    
    # Print the result
    print("\nNode Result:")
    print(f"Next node: {result.get('next', 'None')}")
    messages = result.get("messages", [])
    for i, msg in enumerate(messages):
        print(f"\nMessage {i+1}:")
        print(f"Content: {msg.content}")
    
    # Check if WhatsApp message was sent
    whatsapp_success = False
    for msg in messages:
        if "Successfully sent WhatsApp message" in msg.content:
            whatsapp_success = True
            break
    
    # Print the success status
    if whatsapp_success:
        print("\n✅ WhatsApp notification node test passed - message was sent successfully")
    else:
        print("\n❌ WhatsApp notification node test failed - message was not sent")
    
if __name__ == "__main__":
    test_whatsapp_notification_node()
