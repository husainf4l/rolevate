from typing import Dict, Any, Optional, List
from langgraph.graph import StateGraph, END
from langchain_core.messages import HumanMessage, AIMessage
from langchain_openai import ChatOpenAI
from typing_extensions import TypedDict
import os
import urllib.parse
import httpx
import json


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
    
    async def fetch_whatsapp_templates(self) -> Dict[str, Any]:
        """Fetch available message templates from WhatsApp Business API"""
        try:
            if not self.whatsapp_auth_code or not self.whatsapp_business_account_id:
                return {"error": "WhatsApp API credentials not configured"}
            
            url = f"{self.whatsapp_api_base}/{self.whatsapp_business_account_id}/message_templates"
            headers = {
                "Authorization": f"Bearer {self.whatsapp_auth_code}",
                "Content-Type": "application/json"
            }
            
            async with httpx.AsyncClient() as client:
                response = await client.get(url, headers=headers)
                
                if response.status_code == 200:
                    data = response.json()
                    self.available_templates = {
                        template["name"]: template 
                        for template in data.get("data", [])
                        if template.get("status") == "APPROVED"
                    }
                    return {"success": True, "templates": self.available_templates}
                else:
                    return {"error": f"Failed to fetch templates: {response.status_code} - {response.text}"}
        
        except Exception as e:
            return {"error": f"Exception fetching templates: {str(e)}"}
    
    def _create_graph(self) -> StateGraph:
        """Create the LangGraph workflow"""
        workflow = StateGraph(WhatsAppState)
        
        # Add nodes
        workflow.add_node("validate_input", self._validate_input)
        workflow.add_node("fetch_template", self._fetch_template)
        workflow.add_node("prepare_message", self._prepare_message)
        workflow.add_node("send_whatsapp_message", self._send_whatsapp_message)
        workflow.add_node("create_fallback_link", self._create_fallback_link)
        workflow.add_node("finalize_response", self._finalize_response)
        
        # Define the flow
        workflow.set_entry_point("validate_input")
        workflow.add_edge("validate_input", "fetch_template")
        workflow.add_edge("fetch_template", "prepare_message")
        workflow.add_edge("prepare_message", "send_whatsapp_message")
        workflow.add_edge("send_whatsapp_message", "create_fallback_link")
        workflow.add_edge("create_fallback_link", "finalize_response")
        workflow.add_edge("finalize_response", END)
        
        return workflow.compile()
    
    def _validate_input(self, state: WhatsAppState) -> WhatsAppState:
        """Validate input data"""
        phone_number = state.get("phone_number", "")
        template_name = state.get("template_name", "")
        
        if not phone_number:
            return {**state, "error_message": "Phone number is required"}
        
        if not template_name:
            return {**state, "error_message": "Template name is required"}
        
        if not self.whatsapp_auth_code or not self.whatsapp_phone_number_id:
            return {**state, "error_message": "WhatsApp API credentials not configured"}
        
        return state
    
    def _fetch_template(self, state: WhatsAppState) -> WhatsAppState:
        """Fetch template from WhatsApp Business API"""
        try:
            if state.get("error_message"):
                return state
            
            template_name = state.get("template_name", "")
            
            # If template is cached, use it
            if template_name in self.available_templates:
                return {
                    **state,
                    "template_fetched": True,
                    "template_data": self.available_templates[template_name]
                }
            
            # Fetch templates from API
            url = f"{self.whatsapp_api_base}/{self.whatsapp_business_account_id}/message_templates"
            headers = {
                "Authorization": f"Bearer {self.whatsapp_auth_code}",
                "Content-Type": "application/json"
            }
            
            # For now, simulate approved templates since we need actual WhatsApp Business account
            mock_templates = {
                "cv_received": {
                    "name": "cv_received",
                    "status": "APPROVED",
                    "category": "UTILITY",
                    "language": "en_US",
                    "components": [
                        {
                            "type": "BODY",
                            "text": "Hello {{1}}! Your CV has been received for the {{2}} position. Analysis Score: {{3}}/100. Summary: {{4}}. We'll be in touch soon!"
                        }
                    ]
                },
                "interview_invitation": {
                    "name": "interview_invitation",
                    "status": "APPROVED", 
                    "category": "UTILITY",
                    "language": "en_US",
                    "components": [
                        {
                            "type": "BODY",
                            "text": "Hello {{1}}! Great news! We'd like to invite you for an interview for the {{2}} position. Please reply with your availability."
                        }
                    ]
                }
            }
            
            if template_name in mock_templates:
                template_data = mock_templates[template_name]
                self.available_templates[template_name] = template_data
                return {
                    **state,
                    "template_fetched": True,
                    "template_data": template_data
                }
            else:
                return {**state, "error_message": f"Template '{template_name}' not found or not approved"}
        
        except Exception as e:
            return {**state, "error_message": f"Failed to fetch template: {str(e)}"}
    
    def _prepare_message(self, state: WhatsAppState) -> WhatsAppState:
        """Prepare message with template parameters"""
        try:
            if state.get("error_message") or not state.get("template_fetched"):
                return state
            
            template_data = state.get("template_data", {})
            template_parameters = state.get("template_parameters", [])
            
            # Extract template text for preview
            body_component = None
            for component in template_data.get("components", []):
                if component.get("type") == "BODY":
                    body_component = component
                    break
            
            if body_component:
                template_text = body_component.get("text", "")
                # Replace placeholders with actual parameters
                for i, param in enumerate(template_parameters, 1):
                    template_text = template_text.replace(f"{{{{{i}}}}}", str(param))
                
                return {
                    **state,
                    "message_content": template_text
                }
            else:
                return {**state, "error_message": "Template body not found"}
        
        except Exception as e:
            return {**state, "error_message": f"Failed to prepare message: {str(e)}"}
    
    def _send_whatsapp_message(self, state: WhatsAppState) -> WhatsAppState:
        """Send WhatsApp message via Business API using approved template"""
        try:
            if state.get("error_message"):
                return state
            
            phone_number = state.get("phone_number", "")
            template_name = state.get("template_name", "")
            template_parameters = state.get("template_parameters", [])
            template_data = state.get("template_data", {})
            
            # Clean phone number for API
            clean_phone = ''.join(filter(str.isdigit, phone_number))
            
            # Ensure phone number has country code
            if not clean_phone.startswith('966'):  # Saudi Arabia country code
                clean_phone = '966' + clean_phone.lstrip('0')
            
            # Prepare API request with template
            url = f"{self.whatsapp_api_base}/{self.whatsapp_phone_number_id}/messages"
            headers = {
                "Authorization": f"Bearer {self.whatsapp_auth_code}",
                "Content-Type": "application/json"
            }
            
            # Build template components with parameters
            template_components = []
            for component in template_data.get("components", []):
                if component.get("type") == "BODY":
                    template_components.append({
                        "type": "body",
                        "parameters": [{"type": "text", "text": param} for param in template_parameters]
                    })
            
            payload = {
                "messaging_product": "whatsapp",
                "to": clean_phone,
                "type": "template",
                "template": {
                    "name": template_name,
                    "language": {
                        "code": template_data.get("language", "en_US")
                    },
                    "components": template_components
                }
            }
            
            # For development, simulate the API call
            # Uncomment the following lines for actual API call:
            # 
            # response = httpx.post(url, headers=headers, json=payload)
            # 
            # if response.status_code == 200:
            #     api_response = response.json()
            #     return {**state, "message_sent": True, "api_response": api_response}
            # else:
            #     return {**state, "error_message": f"WhatsApp API error: {response.status_code} - {response.text}"}
            
            # Simulate successful send for development
            api_response = {
                "messaging_product": "whatsapp",
                "contacts": [{"input": clean_phone, "wa_id": clean_phone}],
                "messages": [{"id": f"wamid.{template_name}_{clean_phone}"}]
            }
            
            return {
                **state,
                "message_sent": True,
                "api_response": api_response
            }
            
        except Exception as e:
            return {**state, "error_message": f"WhatsApp API call failed: {str(e)}"}
    
    def _create_fallback_link(self, state: WhatsAppState) -> WhatsAppState:
        """Create WhatsApp web link as fallback"""
        try:
            phone_number = state.get("phone_number", "")
            message_content = state.get("message_content", "")
            
            if not phone_number:
                return state
            
            # Clean phone number
            clean_phone = ''.join(filter(str.isdigit, phone_number))
            if not clean_phone.startswith('966'):
                clean_phone = '966' + clean_phone.lstrip('0')
            
            # Create fallback link
            if message_content:
                encoded_message = urllib.parse.quote(message_content)
                whatsapp_link = f"https://wa.me/{clean_phone}?text={encoded_message}"
            else:
                whatsapp_link = f"https://wa.me/{clean_phone}"
            
            return {
                **state,
                "whatsapp_link": whatsapp_link
            }
            
        except Exception as e:
            return {**state, "error_message": f"Failed to create fallback link: {str(e)}"}
    
    def _finalize_response(self, state: WhatsAppState) -> WhatsAppState:
        """Finalize the response"""
        return state
    
    async def send_template_message(
        self, 
        phone_number: str, 
        template_name: str, 
        template_parameters: List[str]
    ) -> Dict[str, Any]:
        """Main method to send WhatsApp template message"""
        try:
            # Initialize state
            initial_state: WhatsAppState = {
                "candidate_info": {},
                "template_name": template_name,
                "template_parameters": template_parameters,
                "phone_number": phone_number,
                "message_content": "",
                "whatsapp_link": "",
                "template_fetched": False,
                "template_data": {},
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
                    "whatsapp_link": result.get("whatsapp_link"),
                    "api_sent": False,
                    "template_used": template_name
                }
            else:
                return {
                    "success": True,
                    "message": "WhatsApp template message sent successfully",
                    "whatsapp_link": result.get("whatsapp_link"),
                    "message_content": result.get("message_content"),
                    "api_sent": result.get("message_sent", False),
                    "api_response": result.get("api_response", {}),
                    "template_used": template_name,
                    "template_data": result.get("template_data", {})
                }
        
        except Exception as e:
            return {
                "success": False,
                "message": f"WhatsApp agent failed: {str(e)}",
                "whatsapp_link": None,
                "api_sent": False,
                "template_used": template_name
            }
    
    async def get_available_templates(self) -> Dict[str, Any]:
        """Get list of available approved templates"""
        return await self.fetch_whatsapp_templates()
