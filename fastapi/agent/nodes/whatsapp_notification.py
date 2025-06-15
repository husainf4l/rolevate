"""
WhatsApp Notification Node for LangGraph

This module provides functionality to send WhatsApp notifications
after CV analysis is complete.
"""

from typing import Dict, Any
from langchain_core.messages import AIMessage
from langgraph.graph import END
from ..tools.whatsapp_sender import send_whatsapp_message


def send_whatsapp_notification_node(state: Dict[str, Any]) -> Dict[str, Any]:
    """Send WhatsApp notification after successful CV analysis.
    
    This node:
    1. Checks if candidate phone number is available
    2. Sends a WhatsApp notification about the application status
    3. Reports the result of the notification
    
    Args:
        state: The current state of the workflow with messages and context
        
    Returns:
        Updated state with the notification result
    """
    context = state.get("context", {})
    candidate_phone = context.get("candidate_phone", "")
    candidate_id = context.get("candidate_id", "")
    job_post_id = context.get("job_post_id", "")
    api_response = context.get("api_response", {})
    
    print(f"DEBUG: send_whatsapp_notification_node - Phone: {candidate_phone}, Candidate ID: {candidate_id}")
    
    # Check if we have a phone number
    if not candidate_phone:
        response_message = "⚠ No phone number provided. Skipping WhatsApp notification."
        print("DEBUG: send_whatsapp_notification_node - No phone number, skipping")
        return {
            "messages": [AIMessage(content=response_message)],
            "next": END,
            "context": context
        }
    
    # Log API status but don't skip WhatsApp notification
    api_success = api_response.get("success", False)
    print(f"DEBUG: send_whatsapp_notification_node - API status: {api_success}, proceeding with WhatsApp notification anyway")
    
    try:
        # Extract candidate name from CV analysis if available
        cv_analysis = context.get("cv_analysis", "")
        candidate_name = "Candidate"  # Default fallback
        
        # Try to extract name from CV analysis
        if cv_analysis and "name" in cv_analysis.lower():
            lines = cv_analysis.split('\n')
            for line in lines:
                if 'name' in line.lower() and ':' in line:
                    name_part = line.split(':')[-1].strip()
                    if name_part and len(name_part) < 50:  # Reasonable name length
                        candidate_name = name_part
                        break
        
        # Prepare template parameters for cv_received_notification template
        template_params = {
            "name": candidate_name,
            "phone": candidate_phone,
            "job_post_id": job_post_id  # Include job_post_id for the dynamic URL
        }
        
        print(f"DEBUG: send_whatsapp_notification_node - Template params: {template_params}")
        
        # Send the WhatsApp message using the cv_received_notification template
        whatsapp_result = send_whatsapp_message(
            phone_number=candidate_phone,
            template_name="cv_received_notification",
            template_params=template_params,
            application_id=job_post_id  # Use job_post_id as application_id
        )
        
        if whatsapp_result.get("success", False):
            response_message = (
                f"✓ WhatsApp notification sent successfully!\n"
                f"- Phone: {candidate_phone}\n"
                f"- Template: cv_received_notification\n"
                f"- Candidate: {candidate_name}\n"
                f"- Status: {whatsapp_result.get('status_code', 'Sent')}"
            )
            print(f"DEBUG: send_whatsapp_notification_node - WhatsApp template sent successfully to {candidate_phone}")
        else:
            error_detail = whatsapp_result.get('error', 'Unknown error')
            response_message = (
                f"⚠ Failed to send WhatsApp notification\n"
                f"- Phone: {candidate_phone}\n"
                f"- Template: cv_received_notification\n"
                f"- Error: {error_detail}"
            )
            print(f"DEBUG: send_whatsapp_notification_node - WhatsApp failed: {error_detail}")
        
        return {
            "messages": [AIMessage(content=response_message)],
            "next": END,
            "context": context
        }
        
    except Exception as e:
        error_message = f"Error sending WhatsApp notification: {str(e)}"
        print(f"ERROR: send_whatsapp_notification_node - {error_message}")
        return {
            "messages": [AIMessage(content=error_message)],
            "next": END,
            "context": context
        }
