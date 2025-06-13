"""
WhatsApp Notification Node for LangGraph Agent

This module contains the WhatsApp notification node for the CV analysis workflow.
It sends WhatsApp notifications to candidates with their interview links after CV analysis.
"""

import re
from typing import Dict, Any
from dotenv import load_dotenv
from langchain_core.messages import AIMessage

# Import the tools from the tools directory
from ..tools.whatsapp_sender import send_whatsapp_message

def send_whatsapp_notification_node(state: Dict[str, Any]) -> Dict[str, Any]:
    """Send a WhatsApp notification to the candidate with their interview link.
    
    This node:
    1. Takes the candidate phone number and WhatsApp link from the context
    2. Gets the WhatsApp API token from environment variables
    3. Sends a WhatsApp message using a template
    4. Reports the result of the WhatsApp API call
    
    Args:
        state: The current state of the workflow with messages and context
        
    Returns:
        Updated state with the WhatsApp API response
    """
    # Load environment variables to access WhatsApp API token
    load_dotenv()
    
    # Extract relevant data from context
    context = state.get("context", {})
    candidate_phone = context.get("candidate_phone", None) # Phone is in context
    application_id = context.get("candidate_id", None) # Using candidate_id as application_id for now
    job_post_id = context.get("job_post_id", None) # Get job_post_id from context
    cv_analysis = context.get("cv_analysis", "") # Get CV analysis to extract name
    
    # Extract candidate name from CV analysis
    candidate_name = None
    if cv_analysis:
        # Look for name in the CV analysis using regex
        name_match = re.search(r"- \*\*Name:\*\* (.*?)(?:\n|$)", cv_analysis)
        if not name_match:
            # Try alternative format
            name_match = re.search(r"Name:\*\* (.*?)(?:\n|$)", cv_analysis)
        if name_match:
            candidate_name = name_match.group(1).strip()

    print(f"DEBUG: whatsapp_notification_node - Context received: {context}")
    print(f"DEBUG: whatsapp_notification_node - Candidate Phone: {candidate_phone}, Name: {candidate_name}, App ID: {application_id}, Job ID: {job_post_id}")

    # Validate required data
    if not candidate_phone:
        return {
            "messages": [AIMessage(content="Unable to send WhatsApp message: No phone number found.")],
            "next": "END",
            "context": context
        }
    
    try:
        # Clean the phone number - remove any non-digit characters except the + at the beginning
        clean_phone = re.sub(r'[^\d+]', '', candidate_phone)
        
        # If the number doesn't start with +, add it
        if not clean_phone.startswith('+'):
            clean_phone = f"+{clean_phone}"
            
        # Prepare template parameters for cv_received_notification
        clean_phone_digits = re.sub(r'\D', '', clean_phone)
        
        # Create template parameters as a dictionary
        template_params = {
            "name": candidate_name or "Candidate",
            "phone": clean_phone_digits, # This is for the {{1}} in the body if needed, or other body params
            "job_post_id": job_post_id or "" # Parameter for the button URL
        }
        
        print(f"DEBUG: whatsapp_notification_node - Template Params: {template_params}")

        # Send the WhatsApp message using the template
        whatsapp_response = send_whatsapp_message(
            phone_number=clean_phone,
            template_name="cv_received_notification",
            template_params=template_params,
            application_id=application_id
        )
        
        # Generate the response message
        if whatsapp_response.get("success", False):
            print(f"DEBUG: whatsapp_notification_node - WhatsApp call successful: {whatsapp_response}")
            response_message = (
                f"✓ Successfully sent WhatsApp message to candidate\n"
                f"- Phone: {candidate_phone}\n"
                f"- Name: {candidate_name or 'Not specified'}\n"
                f"- Message ID: {whatsapp_response.get('data', {}).get('messageId', 'Unknown')}\n"
                f"- Application ID: {application_id}"
            )
        else:
            error_details = whatsapp_response.get("error", "Unknown error")
            status_code = whatsapp_response.get("status_code", "N/A")
            print(f"ERROR: whatsapp_notification_node - WhatsApp call failed. Status: {status_code}, Error: {error_details}")
            response_message = (
                f"❌ Failed to send WhatsApp message to candidate\n"
                f"- Phone: {candidate_phone}\n"
                f"- Error: {error_details}"
            )
        
        # Add WhatsApp response to context
        context["whatsapp_response"] = whatsapp_response
        
        return {
            "messages": [AIMessage(content=response_message)],
            "next": "END",
            "context": context
        }
        
    except Exception as e:
        # Catch any unexpected errors during the process
        print(f"ERROR: whatsapp_notification_node - Unexpected error: {str(e)}")
        return {
            "messages": [AIMessage(content=f"Error in WhatsApp notification node: {str(e)}")],
            "next": "END",
            "context": context
        }
