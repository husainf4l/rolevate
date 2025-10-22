"""CV extraction service using LangChain and OpenAI."""
import json
from typing import Union
from pathlib import Path
from loguru import logger

from langchain_openai import ChatOpenAI
from langchain.prompts import ChatPromptTemplate
from langchain.output_parsers import PydanticOutputParser
from langchain_core.output_parsers import StrOutputParser

from app.models.schemas import CVData
from app.config import settings
from app.utils.file_parser import FileParser


class CVExtractor:
    """Extracts structured CV data from raw text using LLM."""
    
    def __init__(self):
        """Initialize the CV extractor with OpenAI."""
        import os
        os.environ["OPENAI_API_KEY"] = settings.openai_api_key
        self.llm = ChatOpenAI(
            model=settings.openai_model,
            temperature=0
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
    
    async def enhance_cv_data(self, cv_data: CVData, enhancement_type: str = "complete") -> CVData:
        """
        Enhance CV data with different types of improvements.
        
        Args:
            cv_data: Raw extracted CV data
            enhancement_type: Type of enhancement (content, design, keywords, complete)
            
        Returns:
            CVData: Enhanced CV data
        """
        logger.info(f"Enhancing CV data with type: {enhancement_type}")
        
        if enhancement_type == "content":
            return await self._enhance_content(cv_data)
        elif enhancement_type == "keywords":
            return await self._enhance_keywords(cv_data)
        elif enhancement_type == "design":
            return await self._enhance_design(cv_data)
        elif enhancement_type == "complete":
            # Apply all enhancements
            cv_data = await self._enhance_content(cv_data)
            cv_data = await self._enhance_keywords(cv_data)
            cv_data = await self._enhance_design(cv_data)
            return cv_data
        else:
            logger.warning(f"Unknown enhancement type: {enhancement_type}, using complete")
            return await self.enhance_cv_data(cv_data, "complete")
    
    async def _enhance_content(self, cv_data: CVData) -> CVData:
        """Enhance content with better wording and structure."""
        enhancement_prompt = ChatPromptTemplate.from_template("""
You are a professional CV writer. Enhance the content of this CV by:
- Improving job descriptions with strong action verbs
- Making achievements more impactful and quantifiable
- Ensuring professional tone throughout
- Improving the summary to be more compelling
- Making bullet points clear and results-oriented

Original CV Data:
{cv_data_json}

Return the enhanced CV data in the same JSON format.
{format_instructions}
""")
        
        chain = enhancement_prompt | self.llm | self.parser
        return await chain.ainvoke({
            "cv_data_json": cv_data.model_dump_json(indent=2),
            "format_instructions": self.parser.get_format_instructions()
        })
    
    async def _enhance_keywords(self, cv_data: CVData) -> CVData:
        """Add relevant keywords for ATS optimization."""
        enhancement_prompt = ChatPromptTemplate.from_template("""
You are an ATS optimization expert. Enhance this CV by adding relevant keywords and phrases that are commonly searched by recruiters and ATS systems. Focus on:
- Adding industry-specific keywords
- Including technical skills and tools
- Adding relevant certifications and qualifications
- Incorporating job-specific terminology
- Ensuring keywords appear naturally in context

Original CV Data:
{cv_data_json}

Return the enhanced CV data in the same JSON format.
{format_instructions}
""")
        
        chain = enhancement_prompt | self.llm | self.parser
        return await chain.ainvoke({
            "cv_data_json": cv_data.model_dump_json(indent=2),
            "format_instructions": self.parser.get_format_instructions()
        })
    
    async def _enhance_design(self, cv_data: CVData) -> CVData:
        """Optimize structure and formatting for better visual appeal."""
        enhancement_prompt = ChatPromptTemplate.from_template("""
You are a CV design expert. Optimize this CV for better visual structure and readability by:
- Organizing information in a logical flow
- Ensuring consistent formatting
- Improving section organization
- Making the CV more scannable
- Optimizing length and density of information

Original CV Data:
{cv_data_json}

Return the enhanced CV data in the same JSON format.
{format_instructions}
""")
        
        chain = enhancement_prompt | self.llm | self.parser
        return await chain.ainvoke({
            "cv_data_json": cv_data.model_dump_json(indent=2),
            "format_instructions": self.parser.get_format_instructions()
        })
