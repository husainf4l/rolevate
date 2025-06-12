from typing import Dict, Any, Optional, List
from langgraph.graph import StateGraph, END
from langchain_core.messages import HumanMessage, AIMessage
from langchain_openai import ChatOpenAI
from typing_extensions import TypedDict
import os
import urllib.parse
import httpx
import json
import time


class WhatsAppState(TypedDict):
    """State for WhatsApp Agent"""
    candidate_info: Dict[str, Any]
    template_name: str
    template_parameters: List[str]
    phone_number: str
    message_content: str
    whatsapp_link: str
    template_fetched: bool
    template_data: Dict[str, Any]
    message_sent: bool
    api_response: Dict[str, Any]
    error_message: str


class WhatsAppAgent:
    """LangGraph Agent for WhatsApp Business API with Template Management"""
    
    def __init__(self):
        self.llm = None
        self.graph = self._create_graph()
        self.whatsapp_auth_code = os.getenv("WHATSAPP_AUTH_CODE")
        self.whatsapp_phone_number_id = os.getenv("WHATSAPP_PHONE_NUMBER_ID")
        self.whatsapp_business_account_id = os.getenv("WHATSAPP_BUSINESS_ACCOUNT_ID")
        self.whatsapp_api_base = os.getenv("WHATSAPP_API_URL", "https://graph.facebook.com/v21.0")
        self.available_templates = {}  # Cache for templates
    
    def _initialize_llm(self):
        """Initialize LLM if API key is available"""
        if not self.llm:
            api_key = os.getenv("OPENAI_API_KEY")
            if api_key and api_key != "your_openai_api_key_here":
                self.llm = ChatOpenAI(model="gpt-4", api_key=api_key)
    
    def _initialize_llm(self):
        """Initialize LLM if API key is available"""
        if not self.llm:
            api_key = os.getenv("OPENAI_API_KEY")
            if api_key and api_key != "your_openai_api_key_here":
                self.llm = ChatOpenAI(model="gpt-4", api_key=api_key)
    
    def _load_templates(self) -> Dict[str, str]:
        """Load WhatsApp message templates"""
        return {
            "cv_received": """
Hello {candidate_name}! 👋

Thank you for applying for the {position} position at our company.

We have successfully received your CV and our team is currently reviewing it. Here's what happens next:

✅ CV Analysis Complete
📊 Your Profile Score: {score}/100

📋 Quick Summary:
{summary}

💡 Our Recommendations:
{recommendations}

We'll be in touch soon with the next steps in our hiring process.

Best regards,
HR Team
            """,
            
            "interview_invitation": """
Hello {candidate_name}! 🎉

Great news! We've reviewed your application for the {position} role and we're impressed with your background.

We'd like to invite you for an interview. Please reply with your availability for the following times:
- Monday to Friday, 9 AM - 5 PM
- Preferred date range: Next week

Looking forward to meeting you!

Best regards,
HR Team
            """,
            
            "follow_up": """
Hi {candidate_name},

Following up on your application for the {position} position.

Status Update: {status}

If you have any questions, please don't hesitate to reach out.

Best regards,
HR Team
            """
        }
    
    def _create_graph(self) -> StateGraph:
        """Create the LangGraph workflow"""
        workflow = StateGraph(WhatsAppState)
        
        # Add nodes
        workflow.add_node("validate_input", self._validate_input)
        workflow.add_node("generate_message", self._generate_message)
        workflow.add_node("create_whatsapp_link", self._create_whatsapp_link)
        workflow.add_node("send_whatsapp_message", self._send_whatsapp_message)
        workflow.add_node("finalize_response", self._finalize_response)
        
        # Define the flow
        workflow.set_entry_point("validate_input")
        workflow.add_edge("validate_input", "generate_message")
        workflow.add_edge("generate_message", "create_whatsapp_link")
        workflow.add_edge("create_whatsapp_link", "send_whatsapp_message")
        workflow.add_edge("send_whatsapp_message", "finalize_response")
        workflow.add_edge("finalize_response", END)
        
        return workflow.compile()
    
    def _validate_input(self, state: WhatsAppState) -> WhatsAppState:
        """Validate input data"""
        phone_number = state.get("phone_number", "")
        template_name = state.get("template_name", "")
        
        if not phone_number:
            return {**state, "error_message": "Phone number is required"}
        
        if not template_name or template_name not in self.templates:
            return {**state, "error_message": f"Invalid template name. Available: {list(self.templates.keys())}"}
        
        return state
    
    def _generate_message(self, state: WhatsAppState) -> WhatsAppState:
        """Generate WhatsApp message from template"""
        try:
            if state.get("error_message"):
                return state
            
            template_name = state.get("template_name", "")
            template_variables = state.get("template_variables", {})
            template = self.templates.get(template_name, "")
            
            # Format template with variables
            formatted_message = template.format(**template_variables)
            
            return {
                **state,
                "message_content": formatted_message.strip(),
                "message_generated": True
            }
            
        except KeyError as e:
            return {**state, "error_message": f"Missing template variable: {str(e)}"}
        except Exception as e:
            return {**state, "error_message": f"Message generation failed: {str(e)}"}
    
    def _create_whatsapp_link(self, state: WhatsAppState) -> WhatsAppState:
        """Create WhatsApp link"""
        try:
            if state.get("error_message") or not state.get("message_generated"):
                return state
            
            phone_number = state.get("phone_number", "")
            message_content = state.get("message_content", "")
            
            # Clean phone number (remove spaces, dashes, etc.)
            clean_phone = ''.join(filter(str.isdigit, phone_number))
            
            # Ensure phone number has country code
            if not clean_phone.startswith('966'):  # Saudi Arabia country code
                clean_phone = '966' + clean_phone.lstrip('0')
            
            # Encode message for URL
            encoded_message = urllib.parse.quote(message_content)
            
            # Create WhatsApp link
            whatsapp_base_url = "https://wa.me"
            whatsapp_link = f"{whatsapp_base_url}/{clean_phone}?text={encoded_message}"
            
            return {
                **state,
                "whatsapp_link": whatsapp_link,
                "link_created": True
            }
            
        except Exception as e:
            return {**state, "error_message": f"Link creation failed: {str(e)}"}
    
    def _send_whatsapp_message(self, state: WhatsAppState) -> WhatsAppState:
        """Send WhatsApp message via Business API"""
        try:
            if state.get("error_message") or not state.get("message_generated"):
                return state
            
            # Skip API call if credentials are not properly configured
            if not self.whatsapp_auth_code or not self.whatsapp_phone_number_id:
                print("WhatsApp API credentials not configured, skipping API call")
                return {**state, "message_sent": False}
            
            phone_number = state.get("phone_number", "")
            message_content = state.get("message_content", "")
            
            # Clean phone number for API
            clean_phone = ''.join(filter(str.isdigit, phone_number))
            
            # Ensure phone number has country code
            if not clean_phone.startswith('966'):  # Saudi Arabia country code
                clean_phone = '966' + clean_phone.lstrip('0')
            
            # Prepare API request
            url = f"{self.whatsapp_api_base}/{self.whatsapp_phone_number_id}/messages"
            headers = {
                "Authorization": f"Bearer {self.whatsapp_auth_code}",
                "Content-Type": "application/json"
            }
            
            payload = {
                "messaging_product": "whatsapp",
                "to": clean_phone,
                "type": "text",
                "text": {
                    "body": message_content
                }
            }
            
            # Make API call (commented out for now to avoid actual sends during development)
            # response = httpx.post(url, headers=headers, json=payload)
            # 
            # if response.status_code == 200:
            #     api_response = response.json()
            #     return {**state, "message_sent": True, "api_response": api_response}
            # else:
            #     return {**state, "error_message": f"WhatsApp API error: {response.status_code} - {response.text}"}
            
            # For now, just simulate successful send
            api_response = {
                "messaging_product": "whatsapp",
                "contacts": [{"input": clean_phone, "wa_id": clean_phone}],
                "messages": [{"id": "simulated_message_id"}]
            }
            
            return {
                **state,
                "message_sent": True,
                "api_response": api_response
            }
            
        except Exception as e:
            return {**state, "error_message": f"WhatsApp API call failed: {str(e)}"}
    
    def _finalize_response(self, state: WhatsAppState) -> WhatsAppState:
        """Finalize the response"""
        # Nothing to do here for now, just pass through
        return state
    
    async def create_whatsapp_message(
        self, 
        phone_number: str, 
        template_name: str, 
        template_variables: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Main method to create WhatsApp message and link"""
        try:
            # Initialize state
            initial_state: WhatsAppState = {
                "candidate_info": {},
                "template_name": template_name,
                "template_variables": template_variables,
                "phone_number": phone_number,
                "message_content": "",
                "whatsapp_link": "",
                "message_generated": False,
                "link_created": False,
                "message_sent": False,
                "api_response": {},
                "error_message": ""
            }
            
            # Run the graph
            result = self.graph.invoke(initial_state)
            
            # Return results
            if result.get("error_message"):
                return {
                    "success": False,
                    "message": result.get("error_message"),
                    "whatsapp_link": None,
                    "api_sent": False
                }
            else:
                return {
                    "success": True,
                    "message": "WhatsApp message processed successfully",
                    "whatsapp_link": result.get("whatsapp_link"),
                    "message_content": result.get("message_content"),
                    "api_sent": result.get("message_sent", False),
                    "api_response": result.get("api_response", {})
                }
        
        except Exception as e:
            return {
                "success": False,
                "message": f"WhatsApp agent failed: {str(e)}",
                "whatsapp_link": None,
                "api_sent": False
            }
    
    async def send_message(self, phone_number: str, message: str) -> Dict[str, Any]:
        """
        Simple method to send a WhatsApp message
        """
        try:
            # For now, return a mock success response
            # In production, this would integrate with WhatsApp Business API
            print(f"Sending WhatsApp message to {phone_number}: {message}")
            
            return {
                "success": True,
                "message_id": f"msg_{phone_number}_{int(time.time())}",
                "status": "sent",
                "phone_number": phone_number,
                "message": message
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "phone_number": phone_number,
                "message": message
            }
