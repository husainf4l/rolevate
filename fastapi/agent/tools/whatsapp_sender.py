"""
WhatsApp Invitation Sender

Simple utility to send WhatsApp invitations via Rolevate API.
"""

import requests
from typing import Dict, Any


def send_whatsapp_invitation(phone_number: str, name: str, job_id: str) -> Dict[str, Any]:
    """
    Send a WhatsApp invitation via Rolevate API.
    
    Args:
        phone_number (str): Phone number to send invitation to (e.g., "962796026659")
        name (str): Name of the recipient (e.g., "Ibrahim Diab")
        job_id (str): Job ID for the invitation link (e.g., "86fd7d3a-f0f1-4fd2-b479-3dfc5f30ca13")
    
    Returns:
        Dict[str, Any]: API response
    """
    url = "https://rolevate.com/api/whatsapp/invitation"
    
    # Construct the link in the required format
    link = f"?phoneNumber={phone_number}&jobId={job_id}"
    
    payload = {
        "to": phone_number,
        "name": name,
        "link": link
    }
    
    try:
        # Log the exact request being made
        print(f"DEBUG: WhatsApp API Request to {url}")
        print(f"DEBUG: Payload: {payload}")
        
        response = requests.post(url, json=payload)
        
        # Log the response
        print(f"DEBUG: WhatsApp API Response Status: {response.status_code}")
        print(f"DEBUG: WhatsApp API Response Body: {response.text}")
        
        response.raise_for_status()
        
        return {
            "success": True,
            "status_code": response.status_code,
            "data": response.json()
        }
    
    except requests.exceptions.RequestException as e:
        # Log the error details
        print(f"DEBUG: WhatsApp API Request Failed: {str(e)}")
        if hasattr(e, 'response') and e.response is not None:
            print(f"DEBUG: Error Response Status: {e.response.status_code}")
            print(f"DEBUG: Error Response Body: {e.response.text}")
        
        return {
            "success": False,
            "error": str(e),
            "status_code": getattr(e.response, 'status_code', None) if hasattr(e, 'response') else None
        }


def send_whatsapp_message(phone_number: str, template_name: str = None, template_params: Dict[str, Any] = None, **kwargs) -> Dict[str, Any]:
    """
    Send a WhatsApp message using the Rolevate API.
    This is a wrapper function for compatibility with the notification node.
    
    Args:
        phone_number (str): Phone number to send message to
        template_name (str): Template name (ignored, for compatibility)
        template_params (Dict): Template parameters containing name and job_post_id
        **kwargs: Additional parameters
    
    Returns:
        Dict[str, Any]: API response
    """
    # Extract parameters
    if template_params:
        name = template_params.get("name", "Candidate")
        job_id = template_params.get("job_post_id", "")
    else:
        name = "Candidate"
        job_id = ""
    
    # Clean phone number (remove + if present)
    clean_phone = phone_number.replace("+", "") if phone_number else ""
    
    # Use the main invitation function
    return send_whatsapp_invitation(clean_phone, name, job_id)


