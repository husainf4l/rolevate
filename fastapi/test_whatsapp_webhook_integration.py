#!/usr/bin/env python3
"""
Test WhatsApp Webhook Integration

This script tests the WhatsApp webhook integration with job post creation.
"""

import requests
import json
import time

# Configuration
BASE_URL = "http://localhost:8000"
WEBHOOK_URL = f"{BASE_URL}/webhook"

def test_webhook_verification():
    """Test webhook verification endpoint."""
    
    print("🔍 Testing WhatsApp webhook verification...")
    
    # Test webhook verification
    params = {
        "hub.mode": "subscribe",
        "hub.challenge": "1234567890",
        "hub.verify_token": "rolevate_webhook_verify_token_2025"
    }
    
    try:
        response = requests.get(WEBHOOK_URL, params=params)
        
        if response.status_code == 200:
            print("✅ Webhook verification successful!")
            print(f"   Challenge returned: {response.text}")
            return True
        else:
            print(f"❌ Webhook verification failed: {response.status_code}")
            print(f"   Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Error testing webhook verification: {e}")
        return False

def test_sample_whatsapp_message():
    """Test sample WhatsApp message processing."""
    
    print("\n📱 Testing sample WhatsApp message...")
    
    # Sample WhatsApp webhook payload
    sample_payload = {
        "object": "whatsapp_business_account",
        "entry": [
            {
                "id": "108103188683526",
                "changes": [
                    {
                        "value": {
                            "messaging_product": "whatsapp",
                            "metadata": {
                                "display_phone_number": "15550199696",
                                "phone_number_id": "108103188683526"
                            },
                            "contacts": [
                                {
                                    "profile": {
                                        "name": "John Doe"
                                    },
                                    "wa_id": "16315551234"
                                }
                            ],
                            "messages": [
                                {
                                    "from": "16315551234",
                                    "id": "wamid.ABCDEFghijk1234567890",
                                    "timestamp": str(int(time.time())),
                                    "text": {
                                        "body": "I want to create a job post for a Senior Software Engineer"
                                    },
                                    "type": "text"
                                }
                            ]
                        },
                        "field": "messages"
                    }
                ]
            }
        ]
    }
    
    try:
        response = requests.post(
            WEBHOOK_URL, 
            json=sample_payload,
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 200:
            print("✅ WhatsApp message processed successfully!")
            print(f"   Response: {response.json()}")
            return True
        else:
            print(f"❌ WhatsApp message processing failed: {response.status_code}")
            print(f"   Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Error testing WhatsApp message: {e}")
        return False

def test_job_creation_flow():
    """Test complete job creation flow via WhatsApp."""
    
    print("\n🚀 Testing complete job creation flow...")
    
    messages = [
        "I want to create a job post for a Full-Stack Developer",
        "We need someone with React, Node.js, and 3+ years experience",
        "Remote position, salary 50000-70000 JOD",
        "enhance it to make it more attractive",
        "looks perfect, finalize it"
    ]
    
    phone_number = "16315551234"
    
    for i, message_text in enumerate(messages, 1):
        print(f"\n📨 Sending message {i}/{len(messages)}: {message_text}")
        
        payload = {
            "object": "whatsapp_business_account",
            "entry": [
                {
                    "id": "108103188683526",
                    "changes": [
                        {
                            "value": {
                                "messaging_product": "whatsapp",
                                "metadata": {
                                    "display_phone_number": "15550199696",
                                    "phone_number_id": "108103188683526"
                                },
                                "contacts": [
                                    {
                                        "profile": {
                                            "name": "Test User"
                                        },
                                        "wa_id": phone_number
                                    }
                                ],
                                "messages": [
                                    {
                                        "from": phone_number,
                                        "id": f"wamid.test{i}{int(time.time())}",
                                        "timestamp": str(int(time.time())),
                                        "text": {
                                            "body": message_text
                                        },
                                        "type": "text"
                                    }
                                ]
                            },
                            "field": "messages"
                        }
                    ]
                }
            ]
        }
        
        try:
            response = requests.post(
                WEBHOOK_URL,
                json=payload,
                headers={"Content-Type": "application/json"}
            )
            
            if response.status_code == 200:
                print(f"✅ Message {i} processed successfully")
                # Wait a bit before sending next message
                time.sleep(2)
            else:
                print(f"❌ Message {i} failed: {response.status_code}")
                return False
                
        except Exception as e:
            print(f"❌ Error in message {i}: {e}")
            return False
    
    print("\n🎉 Complete job creation flow test completed!")
    return True

def main():
    """Run all WhatsApp webhook tests."""
    
    print("🧪 WHATSAPP WEBHOOK INTEGRATION TESTS")
    print("=" * 60)
    print("Make sure your FastAPI server is running on localhost:8000")
    print()
    
    # Test 1: Webhook verification
    success1 = test_webhook_verification()
    
    # Test 2: Sample message
    success2 = test_sample_whatsapp_message()
    
    # Test 3: Complete flow
    success3 = test_job_creation_flow()
    
    print(f"\n📊 TEST RESULTS:")
    print(f"  {'✅' if success1 else '❌'} Webhook verification")
    print(f"  {'✅' if success2 else '❌'} Sample message processing")  
    print(f"  {'✅' if success3 else '❌'} Complete job creation flow")
    
    if success1 and success2 and success3:
        print(f"\n🎉 All tests passed! WhatsApp integration is working!")
    else:
        print(f"\n⚠️ Some tests failed. Check the server logs for details.")

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print(f"\n👋 Test cancelled by user")
    except Exception as e:
        print(f"\n💥 Test crashed: {e}")
