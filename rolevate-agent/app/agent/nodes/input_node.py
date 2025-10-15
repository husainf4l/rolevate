"""
Input Node - Parse and understand CV input from various sources
Handles natural language, structured data, and file uploads
"""
import asyncio
import json
import re
from typing import Dict, Any, Optional, Union, List
from pydantic import BaseModel, Field
from loguru import logger
from pathlib import Path

from app.config import settings
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate


class CVInputProcessor:
    """Advanced CV input processing and understanding"""
    
    def __init__(self):
        self.llm = ChatOpenAI(
            model=settings.openai_model,
            temperature=0.3,
            openai_api_key=settings.openai_api_key
        )
    
    async def process_natural_language_input(self, text: str) -> Dict[str, Any]:
        """Process natural language CV information"""
        
        logger.info("🔍 Processing natural language input...")
        
        # Check if we have a valid OpenAI API key
        if not settings.openai_api_key or settings.openai_api_key == "fake-key":
            logger.info("No valid OpenAI API key found, returning empty CV data")
            return {}
        
        prompt = ChatPromptTemplate.from_template("""
        You are an expert CV data extractor. Extract structured CV information from the following text.
        
        Text: "{text}"
        
        Extract the information into this JSON structure:
        {{
            "personal_info": {{
                "full_name": "string",
                "email": "string", 
                "phone": "string",
                "location": "string",
                "linkedin": "string",
                "github": "string"
            }},
            "summary": "professional summary string",
            "experiences": [
                {{
                    "job_title": "string",
                    "company": "string", 
                    "location": "string",
                    "start_date": "YYYY-MM",
                    "end_date": "YYYY-MM or Present",
                    "description": "string",
                    "achievements": ["achievement1", "achievement2"]
                }}
            ],
            "education": [
                {{
                    "degree": "string",
                    "institution": "string",
                    "location": "string", 
                    "start_date": "YYYY-MM",
                    "end_date": "YYYY-MM",
                    "gpa": "string"
                }}
            ],
            "skills": {{
                "technical_skills": ["skill1", "skill2"],
                "programming_languages": ["lang1", "lang2"]
            }},
            "projects": [
                {{
                    "name": "string",
                    "description": "string",
                    "technologies": ["tech1", "tech2"]
                }}
            ]
        }}
        
        Only include fields that you can extract from the text. Leave out fields that aren't mentioned.
        Return only the JSON structure:
        """)
        
        try:
            messages = prompt.format_messages(text=text)
            response = await self.llm.ainvoke(messages)
            
            # Parse JSON from response
            if hasattr(response, 'content'):
                content = response.content.strip()
            elif isinstance(response, str):
                content = response.strip()
            else:
                # Handle FieldInfo or other object types
                logger.debug(f"Unexpected response type: {type(response)}, value: {response}")
                content = str(response).strip()
            
            # Try to find JSON in the response
            json_match = re.search(r'\{.*\}', content, re.DOTALL)
            if json_match:
                json_str = json_match.group(0)
                extracted_data = json.loads(json_str)
                return extracted_data
            else:
                logger.warning("No JSON found in LLM response")
                return {}
                
        except Exception as e:
            logger.error(f"Natural language processing failed: {e}")
            return {}
    
    async def process_structured_data(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Process and validate structured CV data"""
        
        logger.info("📋 Processing structured CV data...")
        
        # Validate and standardize the structure
        standardized_data = {}
        
        # Process personal info
        if data.get("personal_info"):
            standardized_data["personal_info"] = data["personal_info"]
        
        # Process other sections
        for section in ["summary", "experiences", "education", "skills", "projects", "certifications"]:
            if section in data and data[section]:
                standardized_data[section] = data[section]
        
        return standardized_data
    
    async def process_file_upload(self, file_content: bytes, filename: str, file_type: str) -> Dict[str, Any]:
        """Process uploaded file and extract CV data"""
        
        logger.info(f"📁 Processing file upload: {filename}")
        
        try:
            if file_type.lower() == '.txt':
                # Process text file
                text_content = file_content.decode('utf-8')
                return await self.process_natural_language_input(text_content)
            
            elif file_type.lower() == '.json':
                # Process JSON file
                json_data = json.loads(file_content.decode('utf-8'))
                return await self.process_structured_data(json_data)
            
            elif file_type.lower() in ['.pdf', '.doc', '.docx']:
                # For now, return placeholder - would integrate with PDF/DOC parser
                logger.info(f"PDF/DOC parsing not fully implemented yet for {filename}")
                return {
                    "personal_info": {
                        "full_name": f"Extracted from {filename}",
                        "email": "example@email.com"
                    },
                    "summary": f"CV data extracted from uploaded file: {filename}",
                    "file_processed": True,
                    "original_filename": filename
                }
            
            else:
                logger.warning(f"Unsupported file type: {file_type}")
                return {}
                
        except Exception as e:
            logger.error(f"File processing failed: {e}")
            return {}


async def input_node(state: Dict[str, Any]) -> Dict[str, Any]:
    """
    LangGraph node for CV input processing
    
    Input: state with 'raw_input' containing user data
    Output: state with parsed 'cv_memory' and 'parsed_data'
    """
    logger.info("🔍 Starting CV input processing...")
    
    try:
        processor = CVInputProcessor()
        
        # Get input data from state
        raw_input = state.get("raw_input", {})
        user_message = state.get("user_message", "")
        
        parsed_data = {}
        
        # Process based on input type
        if raw_input.get("cv_data"):
            # Structured data input
            parsed_data = await processor.process_structured_data(raw_input["cv_data"])
            
        elif raw_input.get("file_content"):
            # File upload input
            parsed_data = await processor.process_file_upload(
                raw_input["file_content"],
                raw_input.get("file_name", "unknown"),
                raw_input.get("file_type", ".txt")
            )
            
        elif user_message and len(user_message) > 10:
            # Natural language input
            parsed_data = await processor.process_natural_language_input(user_message)
        
        else:
            logger.warning("No valid input found for processing")
            parsed_data = {}
        
        # Update state
        state["cv_memory"] = parsed_data
        state["parsed_data"] = parsed_data
        state["processing_step"] = "input_complete"
        
        logger.success("✅ CV input processing completed successfully")
        
        return state
        
    except Exception as e:
        logger.error(f"❌ CV input processing failed: {e}")
        state["processing_step"] = f"input_error: {str(e)}"
        return state


# Input/Output Schemas for LangGraph
class InputNodeInput(BaseModel):
    """Input schema for input node"""
    raw_input: Dict[str, Any] = Field(..., description="Raw input data to process")
    user_message: str = Field(default="", description="User's natural language message")
    interaction_type: str = Field(default="text", description="Type of interaction")


class InputNodeOutput(BaseModel):
    """Output schema for input node"""
    cv_memory: Dict[str, Any] = Field(..., description="Processed CV data")
    parsed_data: Dict[str, Any] = Field(..., description="Raw parsed data")
    processing_step: str = Field(..., description="Processing status")
    extraction_confidence: float = Field(default=0.0, description="Confidence in extraction quality")


# Node metadata for LangGraph
INPUT_NODE_METADATA = {
    "name": "input_node",
    "description": "Parse and understand CV input from various sources",
    "input_schema": InputNodeInput,
    "output_schema": InputNodeOutput,
    "dependencies": ["openai", "langchain"],
    "timeout": 30,
    "retry_count": 2
}