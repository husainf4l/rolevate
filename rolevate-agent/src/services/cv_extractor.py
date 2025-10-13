"""CV extraction service using LangChain and OpenAI."""
import json
from typing import Union
from pathlib import Path
from loguru import logger

from langchain_openai import ChatOpenAI
from langchain.prompts import ChatPromptTemplate
from langchain.output_parsers import PydanticOutputParser
from langchain_core.output_parsers import StrOutputParser

from ..models.cv_schema import CVData
from ..core.config import settings
from ..utils.file_parser import FileParser


class CVExtractor:
    """Extracts structured CV data from raw text using LLM."""
    
    def __init__(self):
        """Initialize the CV extractor with OpenAI."""
        self.llm = ChatOpenAI(
            model=settings.openai_model,
            temperature=0,
            api_key=settings.openai_api_key
        )
        self.parser = PydanticOutputParser(pydantic_object=CVData)
        self.file_parser = FileParser()
    
    def _create_extraction_prompt(self) -> ChatPromptTemplate:
        """Create the prompt template for CV extraction."""
        format_instructions = self.parser.get_format_instructions()
        
        template = """You are an expert CV parser. Extract all relevant information from the following CV text and structure it according to the schema.

**INSTRUCTIONS:**
- Extract ALL information present in the CV
- For dates, use "YYYY-MM" format when possible, or "YYYY" if only year is available
- If employment is current, set end_date to "Present" and is_current to true
- Separate achievements and responsibilities into bullet points
- Identify technologies/skills mentioned in job descriptions
- Parse education details including degrees, institutions, and dates
- Extract certifications, projects, languages, and any other sections
- If a field is not present in the CV, use null or empty array as appropriate
- Be thorough and accurate

**CV TEXT:**
{cv_text}

**OUTPUT FORMAT:**
{format_instructions}

Return only valid JSON matching the schema above."""
        
        return ChatPromptTemplate.from_template(template)
    
    async def extract_from_text(self, cv_text: str) -> CVData:
        """
        Extract structured CV data from raw text.
        
        Args:
            cv_text: Raw CV text content
            
        Returns:
            CVData: Structured CV data
        """
        logger.info("Starting CV extraction from text")
        
        prompt = self._create_extraction_prompt()
        chain = prompt | self.llm | self.parser
        
        try:
            result = await chain.ainvoke({
                "cv_text": cv_text,
                "format_instructions": self.parser.get_format_instructions()
            })
            
            logger.success("CV extraction completed successfully")
            return result
            
        except Exception as e:
            logger.error(f"Error during CV extraction: {e}")
            # Fallback: try to get JSON from raw output
            try:
                chain_str = prompt | self.llm | StrOutputParser()
                raw_output = await chain_str.ainvoke({
                    "cv_text": cv_text,
                    "format_instructions": self.parser.get_format_instructions()
                })
                
                # Try to parse JSON from output
                json_start = raw_output.find('{')
                json_end = raw_output.rfind('}') + 1
                if json_start >= 0 and json_end > json_start:
                    json_str = raw_output[json_start:json_end]
                    data = json.loads(json_str)
                    return CVData(**data)
            except Exception as fallback_error:
                logger.error(f"Fallback extraction also failed: {fallback_error}")
            
            raise Exception(f"Failed to extract CV data: {e}")
    
    async def extract_from_file(self, file_path: Union[str, Path]) -> CVData:
        """
        Extract structured CV data from a file.
        
        Args:
            file_path: Path to CV file (PDF, DOCX, TXT, or JSON)
            
        Returns:
            CVData: Structured CV data
        """
        file_path = Path(file_path)
        logger.info(f"Extracting CV data from file: {file_path}")
        
        # Parse file to text
        cv_text = await self.file_parser.parse_file(file_path)
        
        # If it's already JSON, try to parse directly
        if file_path.suffix.lower() == '.json':
            try:
                data = json.loads(cv_text)
                return CVData(**data)
            except Exception as e:
                logger.warning(f"Failed to parse as direct JSON: {e}")
                # Fall through to LLM extraction
        
        # Extract using LLM
        return await self.extract_from_text(cv_text)
    
    async def enhance_cv_data(self, cv_data: CVData) -> CVData:
        """
        Enhance CV data with better formatting and suggestions.
        
        Args:
            cv_data: Raw extracted CV data
            
        Returns:
            CVData: Enhanced CV data
        """
        logger.info("Enhancing CV data")
        
        enhancement_prompt = ChatPromptTemplate.from_template("""
You are a professional CV writer. Review the following CV data and enhance it by:
- Improving job descriptions and achievements with action verbs
- Ensuring consistency in date formats
- Categorizing skills if not already done
- Adding professional tone to summary
- Ensuring all bullet points are clear and impactful

Original CV Data:
{cv_data_json}

Return the enhanced CV data in the same JSON format.
{format_instructions}
""")
        
        chain = enhancement_prompt | self.llm | self.parser
        
        try:
            enhanced = await chain.ainvoke({
                "cv_data_json": cv_data.model_dump_json(indent=2),
                "format_instructions": self.parser.get_format_instructions()
            })
            
            logger.success("CV data enhanced successfully")
            return enhanced
            
        except Exception as e:
            logger.warning(f"Enhancement failed, returning original data: {e}")
            return cv_data
