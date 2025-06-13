"""
Test script to fetch the actual templates from the WhatsApp Business API.
"""
import os
import sys
import json
import requests
from pathlib import Path
from dotenv import load_dotenv

# Add the parent directory to sys.path
sys.path.insert(0, str(Path(__file__).parent))

def get_actual_templates():
    """Get the actual templates from the WhatsApp Business API."""
    print("\n----- FETCHING ACTUAL WHATSAPP TEMPLATES -----\n")
    
    # Load environment variables
    load_dotenv()
    
    # Get WhatsApp API credentials from environment
    business_account_id = os.getenv("WHATSAPP_BUSINESS_ACCOUNT_ID")
    api_token = os.getenv("WHATSAPP_API_TOKEN")
    api_version = os.getenv("WHATSAPP_API_VERSION", "v18.0")
    
    if not business_account_id or not api_token:
        print("Missing WhatsApp Business API credentials in environment")
        return []
        
    print(f"Business Account ID: {business_account_id}")
    print(f"API Token: {'*' * (len(api_token) - 4) + api_token[-4:] if api_token else 'Not set'}")
    
    # Construct the API URL
    url = f"https://graph.facebook.com/{api_version}/{business_account_id}/message_templates"
    
    # Set up headers
    headers = {
        "Authorization": f"Bearer {api_token}",
        "Content-Type": "application/json"
    }
    
    print(f"\nSending request to: {url}")
    
    try:
        # Make the API call
        print("\nMaking API call...")
        print(f"Headers: {json.dumps({'Authorization': f'Bearer ***TOKEN***', 'Content-Type': headers['Content-Type']})}")
        response = requests.get(url, headers=headers)
        
        # Print the raw response for debugging
        print(f"\nStatus Code: {response.status_code}")
        try:
            print(f"Response Body: {json.dumps(response.json(), indent=2)}")
        except:
            print(f"Response Body (non-JSON): {response.text}")
        
        # Process the response
        if response.status_code == 200:
            data = response.json()
            templates = data.get("data", [])
            
            print(f"\nFound {len(templates)} templates:")
            for i, template in enumerate(templates):
                print(f"\nTemplate {i+1}:")
                print(f"Name: {template.get('name')}")
                print(f"Status: {template.get('status')}")
                print(f"Language: {template.get('language')}")
                print(f"Category: {template.get('category')}")
                
                # Display components
                components = template.get('components', [])
                print(f"Components ({len(components)}):")
                for comp in components:
                    print(f"  - Type: {comp.get('type')}")
                    if comp.get('format'):
                        print(f"    Format: {comp.get('format')}")
                    if comp.get('text'):
                        print(f"    Text: {comp.get('text')}")
                
                # Save the first approved template as a JSON file
                if template.get('status') == 'APPROVED':
                    with open(f"template_{template.get('name')}.json", "w") as f:
                        json.dump(template, f, indent=2)
                        print(f"\nSaved template to template_{template.get('name')}.json")
            
            return templates
        else:
            print(f"Error fetching WhatsApp templates: {response.status_code} - {response.text}")
            return []
            
    except Exception as e:
        print(f"Error fetching WhatsApp templates: {str(e)}")
        return []

if __name__ == "__main__":
    get_actual_templates()
