"""
Input Understanding Layer - Node for intent detection and message classification
Detects user intent and extracts structured data from natural language input
"""
import re
from typing import Dict, Any, Optional
from loguru import logger
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, SystemMessage
from app.config import settings


class IntentClassifier:
    """Classify user intents and extract relevant data"""
    
    def __init__(self):
        import os
        os.environ["OPENAI_API_KEY"] = settings.openai_api_key
        self.llm = ChatOpenAI(
            model=settings.openai_model,
            temperature=0
        )
        
        # Intent patterns for quick regex-based detection
        self.intent_patterns = {
            "add_experience": [
                r"(?i)(work|job|position|role|experience|employed|company)",
                r"(?i)(at|for|in|with)\s+\w+",
                r"(?i)(software engineer|developer|manager|analyst|director)",
            ],
            "add_education": [
                r"(?i)(education|school|university|college|degree|graduated|studied)",
                r"(?i)(bachelor|master|phd|diploma|certificate)",
                r"(?i)(computer science|engineering|business|marketing)",
            ],
            "add_skills": [
                r"(?i)(skill|technology|programming|language|framework)",
                r"(?i)(python|javascript|react|node|sql|aws)",
                r"(?i)(good at|experienced in|know|familiar with)",
            ],
            "add_personal_info": [
                r"(?i)(name|email|phone|address|location|linkedin)",
                r"(?i)(my name is|i am|call me)",
                r"(?i)(@|\+\d+|linkedin\.com|github\.com)",
            ],
            "add_summary": [
                r"(?i)(summary|about|profile|bio|description)",
                r"(?i)(passionate|experienced|professional|dedicated)",
                r"(?i)(years of experience|expertise in)",
            ],
            "select_template": [
                r"(?i)(template|design|style|layout)",
                r"(?i)(modern|classic|executive|professional)",
            ],
            "generate_cv": [
                r"(?i)(generate|create|build|export|download)",
                r"(?i)(cv|resume|pdf|document)",
            ],
            "greeting": [
                r"(?i)(hello|hi|hey|good morning|good afternoon)",
            ],
            "help": [
                r"(?i)(help|how|what can|instructions)",
            ]
        }
    
    def detect_intent_regex(self, message: str) -> Optional[str]:
        """Quick regex-based intent detection"""
        for intent, patterns in self.intent_patterns.items():
            matches = 0
            for pattern in patterns:
                if re.search(pattern, message):
                    matches += 1
            
            # If at least 2 patterns match, we're confident about the intent
            if matches >= 2:
                return intent
                
            # For single pattern matches with high confidence patterns
            if matches == 1 and intent in ["greeting", "help", "generate_cv"]:
                return intent
        
        return None
    
    async def classify_intent_llm(self, message: str, context: Dict) -> Dict[str, Any]:
        """Use LLM for complex intent classification and data extraction"""
        
        system_prompt = """You are an intelligent CV builder assistant. Analyze user messages and classify their intent.

Available intents:
- add_experience: User wants to add work experience
- add_education: User wants to add education details  
- add_skills: User wants to add skills/technologies
- add_personal_info: User wants to add personal contact info
- add_summary: User wants to add a professional summary
- select_template: User wants to choose a CV template
- generate_cv: User wants to generate/export their CV
- modify_existing: User wants to modify existing information
- greeting: General greeting or conversation starter
- help: User needs help or instructions
- unclear: Message intent is unclear

Extract any structured data from the message and return as JSON:
{
  "intent": "detected_intent",
  "confidence": 0.95,
  "data": {
    "extracted_field": "extracted_value"
  },
  "requires_clarification": false,
  "clarification_question": "What would you like to know?"
}

For experience: extract company, role, duration, description
For education: extract institution, degree, field, year
For skills: extract skill names, proficiency levels
For personal info: extract name, email, phone, location, etc.
"""

        try:
            response = await self.llm.ainvoke([
                SystemMessage(content=system_prompt),
                HumanMessage(content=f"User message: '{message}'\n\nCurrent CV context: {context}")
            ])
            
            import json
            result = json.loads(response.content)
            return result
            
        except Exception as e:
            logger.warning(f"LLM intent classification failed: {e}")
            return {
                "intent": "unclear", 
                "confidence": 0.5,
                "data": {},
                "requires_clarification": True,
                "clarification_question": "Could you please rephrase that? I'd like to help you build your CV."
            }


async def input_understanding_node(state: Dict[str, Any]) -> Dict[str, Any]:
    """
    Input Understanding Layer - Detects intent and extracts structured data
    
    Args:
        state: Current agent state with user message
        
    Returns:
        Updated state with intent and extracted data
    """
    logger.info("Input Understanding Layer: Analyzing user input")
    
    try:
        message = state.get("user_message", "")
        cv_memory = state.get("cv_memory", {})
        
        if not message:
            return {
                **state,
                "error": "No user message provided"
            }
        
        classifier = IntentClassifier()
        
        # First try quick regex detection
        intent = classifier.detect_intent_regex(message)
        
        if intent:
            logger.info(f"Intent detected via regex: {intent}")
            result = {
                "intent": intent,
                "confidence": 0.8,
                "data": {"raw_message": message},
                "requires_clarification": False
            }
        else:
            # Use LLM for complex classification
            logger.info("Using LLM for intent classification")
            result = await classifier.classify_intent_llm(message, cv_memory)
        
        logger.success(f"Intent classified: {result['intent']} (confidence: {result.get('confidence', 0.5)})")
        
        return {
            **state,
            "intent": result["intent"],
            "intent_confidence": result.get("confidence", 0.5),
            "extracted_data": result.get("data", {}),
            "requires_clarification": result.get("requires_clarification", False),
            "clarification_question": result.get("clarification_question", ""),
            "messages": state.get("messages", []) + [
                {"role": "user", "content": message},
                {"role": "assistant", "content": f"I understand you want to {result['intent'].replace('_', ' ')}. Let me help with that."}
            ]
        }
        
    except Exception as e:
        logger.error(f"Input understanding failed: {e}")
        return {
            **state,
            "error": f"Input understanding failed: {str(e)}",
            "intent": "unclear"
        }