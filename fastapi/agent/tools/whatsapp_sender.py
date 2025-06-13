"""Tool for sending WhatsApp notifications to candidates."""
import os
import re
import requests
import json
from typing import Dict, Any, Optional, List
from dotenv import load_dotenv

def send_whatsapp_message(
    phone_number: str,
    message_text: str = None,
    application_id: Optional[str] = None,
    template_name: str = "cv_received_notification",
    template_params: Optional[Dict[str, str]] = None
) -> Dict[str, Any]:
    """
    Send a WhatsApp message to a candidate using a template.
    
    Args:
        phone_number: The recipient's phone number (international format with +)
        message_text: Legacy text message content (will be ignored if using templates)
        application_id: Optional application ID to associate with the message
        template_name: Name of the WhatsApp template to use (default: cv_received_notification)
        template_params: Dictionary of parameters to populate the template:
                       - For cv_received_notification: {"name": "", "phone": ""}
        
    Returns:
        Dictionary with the result of the WhatsApp API call
    """
    try:
        # Load environment variables
        load_dotenv()
        
        # Get WhatsApp API credentials from environment
        phone_number_id = os.getenv("WHATSAPP_PHONE_NUMBER_ID")
        api_token = os.getenv("WHATSAPP_API_TOKEN")
        api_version = os.getenv("WHATSAPP_API_VERSION", "v18.0")
        
        # Clean the phone number - remove any non-digit characters except the + at the beginning
        clean_phone = re.sub(r'[^\d+]', '', phone_number)
        
        # If the number doesn't start with +, add it
        if not clean_phone.startswith('+'):
            clean_phone = f"+{clean_phone}"
        
        # Convert any list template_params to dict format if needed
        if isinstance(template_params, list):
            if template_name == "cv_received_notification":
                candidate_name = template_params[0] if len(template_params) > 0 else ""
                phone_digits = re.sub(r'\D', '', clean_phone)
                template_params = {"name": candidate_name, "phone": phone_digits}
                
        # If template_params is not provided or is empty, initialize it
        if not template_params:
            template_params = {}
            
        # For cv_received_notification template, ensure we have name and phone
        if template_name == "cv_received_notification":
            if "name" not in template_params or not template_params["name"]:
                template_params["name"] = "Candidate"
            if "phone" not in template_params:
                template_params["phone"] = re.sub(r'\D', '', clean_phone)
            
        # Force production mode - always send real WhatsApp messages
        is_development = False  # Always use production mode
        
        if is_development:
            # Simulated successful response for testing/development
            template_msg = f"Would send template '{template_name}' with params {json.dumps(template_params)}"
            print(f"[DEV MODE] Would send WhatsApp message to {clean_phone}: {template_msg}")
            return {
                "success": True,
                "status_code": 201,
                "data": {
                    "messageId": "wamid.SIM123XYZ",
                    "message": "WhatsApp template message sent successfully (SIMULATION)",
                    "phone": clean_phone,
                    "applicationId": application_id,
                    "template": template_name,
                    "parameters": template_params
                }
            }
        
        # Construct API URL - this is based on Meta WhatsApp Business API
        url = f"https://graph.facebook.com/{api_version}/{phone_number_id}/messages"
        
        # Set up headers
        headers = {
            "Authorization": f"Bearer {api_token}",
            "Content-Type": "application/json"
        }
        
        # Create the message payload with template
        if not template_params:
            # If no template params provided, extract from message_text
            if message_text and "Hello" in message_text and "application" in message_text:
                # Try to extract parameters from legacy message
                parts = message_text.split(",")
                name_part = parts[0].replace("Hello", "").strip() if len(parts) > 0 else ""
                job_part = parts[1].replace("thank you for your application regarding", "").strip() if len(parts) > 1 else ""
                link_part = message_text.split("interview:")[-1].strip() if "interview:" in message_text else ""
                template_params = [name_part, job_part, link_part]
            else:
                # Fallback to empty parameters
                template_params = ["", "", ""]
        
        # Ensure we have at least 3 parameters for the template, if it's a list
        if isinstance(template_params, list):
            while len(template_params) < 3:
                template_params.append("")
        
        # Build the template components based on the template name
        components = []
        
        # Handle specific templates
        if template_name == "cv_received_notification":
            # The cv_received_notification template has body and button parameters
            name_param = template_params.get("name", "Candidate")
            phone_param = template_params.get("phone", "")
            # Get job_post_id from template_params for the URL
            job_post_id_param = template_params.get("job_post_id", "")  # Ensure this is passed in template_params
            
            # Construct the dynamic part of the URL for the button
            # This will replace {{1}} in the template URL: https://rolevate.com/room{{1}}
            # Example for {{1}} is: ?phoneNumber=962796026659&jobId=306bfccd-5030-46bb-b468-e5027a073b4a
            url_dynamic_part = f"?phoneNumber={phone_param.replace('+', '')}&jobId={job_post_id_param}"

            # Create components array - use the exact format that worked in the direct test
            components = [
                {
                    "type": "body",
                    "parameters": [
                        {
                            "type": "text",
                            "text": name_param
                        }
                    ]
                },
                {
                    "type": "button",
                    "sub_type": "url",
                    "index": "0", # Assuming this is the first button
                    "parameters": [
                        {
                            "type": "text",
                            # The text for the button URL parameter is the dynamic part of the URL
                            "text": url_dynamic_part
                        }
                    ]
                }
            ]
            
        elif template_name == "hello_world":
            # Hello world template doesn't need parameters
            pass
            
        else:
            # For any other template, try to get the structure from the API
            templates = fetch_whatsapp_templates()
            template_data = next((t for t in templates if t["name"] == template_name), None)
            
            if template_data:
                # Build components based on template structure
                for component in template_data.get("components", []):
                    if component["type"] == "BODY" and "{{" in component.get("text", ""):
                        # Add body parameters if there are placeholders
                        body_params = []
                        
                        # Try to match parameters with placeholders
                        if isinstance(template_params, dict):
                            # Extract parameters by name if possible
                            for key, value in template_params.items():
                                body_params.append({
                                    "type": "text",
                                    "text": value
                                })
                        elif isinstance(template_params, list):
                            # Use list parameters in order
                            for param in template_params:
                                body_params.append({
                                    "type": "text",
                                    "text": param
                                })
                                
                        # Add body component if we have parameters
                        if body_params:
                            components.append({
                                "type": "body",
                                "parameters": body_params
                            })
                            
            # If we couldn't build specific components, create a generic one
            if not components and isinstance(template_params, list) and len(template_params) > 0:
                components.append({
                    "type": "body",
                    "parameters": [{"type": "text", "text": param} for param in template_params if param]
                })
        
        # Determine the language code based on template name
        language_code = "en"
        if template_name == "hello_world":
            language_code = "en_US"
        
        # Create the payload
        payload = {
            "messaging_product": "whatsapp",
            "recipient_type": "individual",
            "to": clean_phone,
            "type": "template",
            "template": {
                "name": template_name,
                "language": {
                    "code": language_code
                }
            }
        }
        
        # Add components only if there are any
        if components:
            payload["template"]["components"] = components
        
        # Log the payload for debugging
        print(f"WhatsApp API Payload: {json.dumps(payload, indent=2)}")
        
        # Include application ID as custom metadata if provided
        if application_id:
            if "metadata" not in payload:
                payload["metadata"] = {}
            payload["metadata"]["applicationId"] = application_id
        
        # Make the API call
        response = requests.post(url, json=payload, headers=headers)
        
        # Process the API response
        if response.status_code in (200, 201):
            try:
                response_data = response.json()
                return {
                    "success": True,
                    "status_code": response.status_code,
                    "data": response_data
                }
            except Exception as e:
                return {
                    "success": True,
                    "status_code": response.status_code,
                    "data": {"message": "Message sent but invalid JSON response", "error": str(e)}
                }
        else:
            return {
                "success": False,
                "status_code": response.status_code,
                "error": response.text
            }
    
    except requests.RequestException as e:
        return {
            "success": False,
            "error": f"WhatsApp API request failed: {str(e)}"
        }
    except Exception as e:
        return {
            "success": False,
            "error": f"Error sending WhatsApp message: {str(e)}"
        }

def create_interview_link(phone_number: str, job_id: str) -> str:
    """
    Create a WhatsApp interview link for a candidate.
    
    Args:
        phone_number: The candidate's phone number
        job_id: The job post ID for the application
        
    Returns:
        A formatted interview link URL
    """
    # Remove any non-digit characters from the phone number
    clean_phone = re.sub(r'\D', '', phone_number) if phone_number else ''
    
    # Create the interview link
    return f"http://rolevate.com/room?phoneNumber={clean_phone}&jobId={job_id}"

def fetch_whatsapp_templates() -> List[Dict[str, Any]]:
    """
    Fetch available WhatsApp templates from the Meta WhatsApp Business API.
    
    Returns:
        List of available templates or empty list if unable to fetch
    """
    try:
        # Load environment variables
        load_dotenv()
        
        # Get WhatsApp API credentials from environment
        business_account_id = os.getenv("WHATSAPP_BUSINESS_ACCOUNT_ID")
        api_token = os.getenv("WHATSAPP_API_TOKEN")
        api_version = os.getenv("WHATSAPP_API_VERSION", "v18.0")
        
        if not business_account_id or not api_token:
            print("Missing WhatsApp Business API credentials in environment")
            return []
            
        # Check if we're in development/testing mode
        is_development = os.getenv("ENVIRONMENT", "development").lower() == "development"
        
        if is_development:
            # Return mock templates for development
            print("[DEV MODE] Returning mock WhatsApp templates")
            return [
                {
                    "name": "interview_invitation",
                    "status": "APPROVED",
                    "category": "MARKETING",
                    "language": "en_US",
                    "components": [
                        {
                            "type": "HEADER",
                            "format": "TEXT",
                            "text": "Interview Invitation"
                        },
                        {
                            "type": "BODY",
                            "text": "Hello {{1}}, thank you for your application regarding {{2}}. Please click on the following link to continue with your interview: {{3}}"
                        }
                    ]
                },
                {
                    "name": "application_update",
                    "status": "APPROVED",
                    "category": "MARKETING",
                    "language": "en_US",
                    "components": [
                        {
                            "type": "BODY",
                            "text": "Hello {{1}}, we have an update on your application for {{2}}. Please check your profile for more details."
                        }
                    ]
                }
            ]
        
        # Construct the API URL
        url = f"https://graph.facebook.com/{api_version}/{business_account_id}/message_templates"
        
        # Set up headers
        headers = {
            "Authorization": f"Bearer {api_token}",
            "Content-Type": "application/json"
        }
        
        # Make the API call
        response = requests.get(url, headers=headers)
        
        # Process the response
        if response.status_code == 200:
            data = response.json()
            return data.get("data", [])
        else:
            print(f"Error fetching WhatsApp templates: {response.status_code} - {response.text}")
            return []
            
    except Exception as e:
        print(f"Error fetching WhatsApp templates: {str(e)}")
        return []

def create_message_from_template(
    template_name: str, 
    candidate_name: Optional[str] = None,
    job_title: Optional[str] = None,
    interview_link: Optional[str] = None
) -> str:
    """
    Create a WhatsApp message from a template.
    
    Args:
        template_name: The name of the template to use
        candidate_name: The candidate's name
        job_title: The job title
        interview_link: The interview link URL
        
    Returns:
        The formatted message text
    """
    # Define templates
    templates = {
        "interview_invitation": (
            "Hello{candidate}, thank you for your application regarding{job}. "
            "Please click on the following link to continue with your interview: {link}"
        )
    }
    
    # Get the template
    template = templates.get(template_name, templates["interview_invitation"])
    
    # Format candidate name
    candidate_part = f" {candidate_name}" if candidate_name else ""
    
    # Format job title
    job_part = f" {job_title}" if job_title else " a job opportunity"
    
    # Format link
    link_part = interview_link or "No link available"
    
    # Format the template
    return template.format(
        candidate=candidate_part,
        job=job_part,
        link=link_part
    )
