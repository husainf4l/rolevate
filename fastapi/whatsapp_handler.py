"""
WhatsApp Business API Integration for Job Post Creation

This module handles WhatsApp webhook processing and integrates with the 
job post creation agent to enable job posting via WhatsApp messages.
"""

import os
import json
import httpx
from typing import Dict, Any, Optional
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class WhatsAppJobPostHandler:
    """Handle WhatsApp messages for job post creation."""
    
    def __init__(self):
        # Initialize session manager based on configuration
        use_sql_sessions = os.getenv("USE_SQL_SESSIONS", "true").lower() == "true"
        
        if use_sql_sessions:
            from agent.sql_session_job_post_agent import get_sql_session_job_post_agent
            self.agent = get_sql_session_job_post_agent()
            print("🗄️ WhatsApp handler using SQL session management")
        else:
            from agent.session_job_post_agent import get_session_job_post_agent
            self.agent = get_session_job_post_agent()
            print("📁 WhatsApp handler using JSON session management")
            
        self.api_token = os.getenv("WHATSAPP_API_TOKEN")
        self.phone_number_id = os.getenv("WHATSAPP_PHONE_NUMBER_ID")
        self.api_version = os.getenv("WHATSAPP_API_VERSION", "v18.0")
        
        print(f"📱 WhatsApp handler initialized")
        print(f"   Phone Number ID: {self.phone_number_id}")
        print(f"   API Version: {self.api_version}")
        
    async def process_webhook(self, webhook_data: Dict[str, Any]) -> bool:
        """Process incoming WhatsApp webhook."""
        
        try:
            print(f"📥 Processing WhatsApp webhook: {json.dumps(webhook_data, indent=2)}")
            
            if "entry" not in webhook_data:
                print("⚠️ No 'entry' field in webhook data")
                return False
                
            for entry in webhook_data["entry"]:
                if "changes" not in entry:
                    continue
                    
                for change in entry["changes"]:
                    if change.get("field") == "messages":
                        await self._handle_messages(change["value"])
                        
            return True
            
        except Exception as e:
            print(f"❌ Error processing WhatsApp webhook: {e}")
            return False
    
    async def _handle_messages(self, message_data: Dict[str, Any]):
        """Handle incoming messages."""
        
        if "messages" not in message_data:
            print("⚠️ No 'messages' field in message data")
            return
            
        for message in message_data["messages"]:
            await self._process_single_message(message, message_data)
    
    async def _process_single_message(self, message: Dict[str, Any], context: Dict[str, Any]):
        """Process a single WhatsApp message."""
        
        try:
            # Extract message details
            phone_number = message["from"]
            message_id = message["id"]
            timestamp = message["timestamp"]
            
            # Get message text
            message_text = ""
            if "text" in message:
                message_text = message["text"]["body"]
            elif "button" in message:
                message_text = message["button"]["text"]
            elif "interactive" in message:
                if "button_reply" in message["interactive"]:
                    message_text = message["interactive"]["button_reply"]["title"]
                elif "list_reply" in message["interactive"]:
                    message_text = message["interactive"]["list_reply"]["title"]
            
            if not message_text:
                await self._send_message(phone_number, "Sorry, I can only process text messages for job creation. Please send me a text message describing the job you'd like to create.")
                return
                
            print(f"📨 WhatsApp message from {phone_number}: {message_text}")
            
            # Create session ID from phone number
            session_id = f"whatsapp_{phone_number.replace('+', '')}"
            
            # Get company info from contact or use default
            company_info = self._get_company_info(phone_number, context)
            
            # Process message through job post agent
            result = await self._process_job_message(
                session_id=session_id,
                message_text=message_text,
                phone_number=phone_number,
                company_info=company_info
            )
            
            # Send response
            if result:
                # Format response for WhatsApp (limit length)
                response_text = self._format_whatsapp_response(result["response"])
                await self._send_message(phone_number, response_text)
                
                # Send completion notification if job is complete
                if result.get("is_complete"):
                    job_title = result.get("job_data", {}).get("title", "job post")
                    completion_msg = f"🎉 Congratulations! Your '{job_title}' job post has been successfully created and published!\n\nCandidates can now apply for this position. You'll receive notifications when applications come in."
                    await self._send_message(phone_number, completion_msg)
                    
        except Exception as e:
            print(f"❌ Error processing message: {e}")
            await self._send_message(phone_number, "Sorry, there was an error processing your message. Please try again or contact support.")
    
    async def _process_job_message(self, session_id: str, message_text: str, phone_number: str, company_info: Dict[str, str]) -> Optional[Dict[str, Any]]:
        """Process message through job post agent."""
        
        try:
            # Check if session exists first
            session_info = self.agent.get_session_info(session_id)
            
            if session_info.get("error"):
                # Session doesn't exist, start new conversation
                print(f"🆕 Starting new WhatsApp job post session for {phone_number}")
                result = self.agent.start_conversation_with_id(
                    session_id=session_id,
                    company_id=company_info["company_id"],
                    company_name=company_info["company_name"]
                )
                
                # Then process the first message
                if not result.get("error"):
                    result = self.agent.continue_conversation(session_id, message_text)
            else:
                # Session exists, continue conversation
                print(f"📱 Continuing WhatsApp job post session for {phone_number}")
                result = self.agent.continue_conversation(session_id, message_text)
            
            return result
            
        except Exception as e:
            print(f"❌ Error in job message processing: {e}")
            return {
                "response": "I encountered an error processing your job post request. Please try again or start with a simple message like 'I want to create a job post for a developer'.",
                "is_complete": False,
                "job_data": {}
            }
    
    def _get_company_info(self, phone_number: str, context: Dict[str, Any]) -> Dict[str, str]:
        """Get company information for the phone number."""
        
        # You can implement logic to map phone numbers to companies
        # For now, using default values from your configuration
        
        # Extract company info from WhatsApp contact if available
        contacts = context.get("contacts", [])
        company_name = "Rolevate"  # Default
        
        if contacts:
            contact = contacts[0]
            profile_name = contact.get("profile", {}).get("name", "")
            if profile_name:
                company_name = profile_name
        
        return {
            "company_id": "eeb88919-5a2d-4393-b14b-8a3bfbb51c7e",  # Your company ID
            "company_name": company_name
        }
    
    def _format_whatsapp_response(self, response: str) -> str:
        """Format response for WhatsApp (handle length limits and formatting)."""
        
        # WhatsApp has a 4096 character limit per message
        max_length = 4000  # Leave some buffer
        
        if len(response) <= max_length:
            return response
        
        # Split long responses
        # Try to split at natural breakpoints
        lines = response.split('\n')
        chunks = []
        current_chunk = ""
        
        for line in lines:
            if len(current_chunk + line + '\n') <= max_length:
                current_chunk += line + '\n'
            else:
                if current_chunk:
                    chunks.append(current_chunk.strip())
                current_chunk = line + '\n'
        
        if current_chunk:
            chunks.append(current_chunk.strip())
        
        # Return first chunk and indicate there's more
        if len(chunks) > 1:
            return chunks[0] + "\n\n📱 (Message continues... send any message to continue)"
        else:
            return chunks[0] if chunks else response[:max_length]
    
    async def _send_message(self, phone_number: str, message: str) -> bool:
        """Send message to WhatsApp."""
        
        try:
            url = f"https://graph.facebook.com/{self.api_version}/{self.phone_number_id}/messages"
            
            headers = {
                "Authorization": f"Bearer {self.api_token}",
                "Content-Type": "application/json"
            }
            
            # Handle long messages by splitting
            max_length = 4000
            if len(message) > max_length:
                chunks = [message[i:i+max_length] for i in range(0, len(message), max_length)]
                for i, chunk in enumerate(chunks):
                    if i > 0:
                        # Add delay between chunks
                        import asyncio
                        await asyncio.sleep(1)
                    await self._send_single_message(url, headers, phone_number, chunk)
            else:
                await self._send_single_message(url, headers, phone_number, message)
                
            return True
            
        except Exception as e:
            print(f"❌ Error sending WhatsApp message: {e}")
            return False
    
    async def _send_single_message(self, url: str, headers: Dict[str, str], phone_number: str, message: str):
        """Send a single message to WhatsApp."""
        
        data = {
            "messaging_product": "whatsapp",
            "to": phone_number,
            "type": "text",
            "text": {"body": message}
        }
        
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(url, headers=headers, json=data)
                
            if response.status_code == 200:
                print(f"✅ Message sent to {phone_number}")
            else:
                print(f"❌ Failed to send message: {response.status_code} - {response.text}")
                
        except Exception as e:
            print(f"❌ Error in _send_single_message: {e}")

# Global handler instance
whatsapp_handler = WhatsAppJobPostHandler()
