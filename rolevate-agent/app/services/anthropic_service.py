"""
Anthropic AI Service - Claude integration for CV processing
Provides alternative LLM service alongside OpenAI with automatic fallback
"""
from typing import Dict, Any, List, Optional, Union
from pydantic import BaseModel, Field
from loguru import logger
import asyncio

from langchain_anthropic import ChatAnthropic
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.messages import BaseMessage

from app.config import settings


class AnthropicService:
    """
    Anthropic Claude service for CV optimization and text processing
    Provides alternative to OpenAI with similar interface
    """
    
    def __init__(self):
        self.claude_client = None
        self.available = False
        self._initialize_client()
    
    def _initialize_client(self):
        """Initialize Anthropic Claude client if API key is available"""
        try:
            if settings.anthropic_api_key and settings.anthropic_api_key.strip():
                self.claude_client = ChatAnthropic(
                    anthropic_api_key=settings.anthropic_api_key,
                    model=settings.anthropic_model,
                    temperature=0.2,  # Low temperature for consistent optimization
                    max_tokens=4096
                )
                
                # Test the connection with a simple request
                asyncio.create_task(self._test_connection())
                
            else:
                logger.warning("⚠️ Anthropic API key not configured")
                
        except Exception as e:
            logger.warning(f"⚠️ Anthropic initialization failed: {e}")
            self.available = False
    
    async def _test_connection(self):
        """Test Anthropic API connection"""
        try:
            test_prompt = ChatPromptTemplate.from_template("Say 'OK' if you can process text.")
            messages = test_prompt.format_messages()
            response = await self.claude_client.ainvoke(messages)
            
            if response and hasattr(response, 'content'):
                self.available = True
                logger.success("✅ Anthropic Claude API connected successfully")
            else:
                logger.warning("⚠️ Anthropic API test failed - unexpected response")
                
        except Exception as e:
            logger.warning(f"⚠️ Anthropic API test failed: {e}")
            self.available = False
    
    async def optimize_cv_text(self, text: str, context: Dict[str, Any] = None) -> str:
        """
        Optimize CV text using Claude
        
        Args:
            text: Text to optimize
            context: Additional context including industry, text_type, etc.
        
        Returns:
            Optimized text or original if service unavailable
        """
        
        if not self.available or not self.claude_client:
            logger.debug("Anthropic service unavailable, returning original text")
            return text
        
        if not text or len(text.strip()) < 10:
            return text
        
        context = context or {}
        industry = context.get("industry", "general")
        text_type = context.get("text_type", "general")
        
        prompt = ChatPromptTemplate.from_template("""
        You are an expert CV editor with extensive experience in professional resume writing and career coaching. 
        Optimize the following CV text for maximum professional impact and ATS compatibility.
        
        Original Text:
        "{text}"
        
        Context:
        - Industry: {industry}  
        - Text Type: {text_type}
        
        Optimization Guidelines:
        
        1. **Professional Language:**
           - Use strong, action-oriented verbs (engineered, spearheaded, orchestrated, architected)
           - Replace weak phrases: "responsible for" → "managed", "worked on" → "developed"
           - Eliminate redundant words and filler phrases
           - Ensure concise, impactful language that quantifies achievements
        
        2. **Industry Optimization:**
           - Use industry-appropriate terminology and keywords
           - Include relevant technical terms for ATS systems
           - Maintain professional tone suitable for the field
           - Focus on skills and achievements relevant to the industry
        
        3. **Structure & Flow:**
           - Ensure parallel structure in bullet points
           - Use consistent verb tenses (past for previous roles, present for current)
           - Maintain logical flow and readability
           - Keep sentences concise but informative
        
        4. **Achievement Focus:**
           - Preserve all numbers, metrics, and quantifiable results exactly
           - Highlight measurable achievements and outcomes
           - Add context to make metrics meaningful and impressive
           - Focus on impact and results rather than just duties
        
        5. **ATS Compatibility:**
           - Use standard section headings and formatting
           - Include relevant keywords naturally
           - Avoid graphics, tables, or unusual formatting
           - Ensure clean, scannable text structure
        
        Important: Return ONLY the optimized text with no explanations, commentary, or additional formatting.
        Preserve the original meaning while enhancing professional impact.
        """)
        
        try:
            messages = prompt.format_messages(
                text=text,
                industry=industry,
                text_type=text_type
            )
            
            response = await self.claude_client.ainvoke(messages)
            
            if hasattr(response, 'content'):
                optimized_text = response.content.strip()
            elif isinstance(response, str):
                optimized_text = response.strip()
            else:
                optimized_text = str(response).strip()
            
            # Validate the response
            if len(optimized_text) < len(text) * 0.5:
                logger.warning("Anthropic returned suspiciously short response, using original")
                return text
            
            logger.debug(f"Anthropic optimization completed: {len(text)} → {len(optimized_text)} chars")
            return optimized_text
            
        except Exception as e:
            logger.error(f"❌ Anthropic optimization failed: {e}")
            return text
    
    async def analyze_cv_section(self, section_name: str, section_data: Any, 
                                cv_context: Dict[str, Any] = None) -> Dict[str, Any]:
        """
        Analyze a CV section and provide improvement suggestions
        
        Args:
            section_name: Name of the CV section (summary, experiences, etc.)
            section_data: The section content
            cv_context: Full CV context for better analysis
            
        Returns:
            Analysis with suggestions, score, and optimized content
        """
        
        if not self.available or not self.claude_client:
            return {
                "available": False,
                "message": "Anthropic service unavailable"
            }
        
        cv_context = cv_context or {}
        industry = self._detect_industry_from_context(cv_context)
        
        # Convert section data to text for analysis
        if isinstance(section_data, str):
            section_text = section_data
        elif isinstance(section_data, list):
            section_text = "\n".join([str(item) for item in section_data])
        elif isinstance(section_data, dict):
            section_text = "\n".join([f"{k}: {v}" for k, v in section_data.items()])
        else:
            section_text = str(section_data)
        
        prompt = ChatPromptTemplate.from_template("""
        Analyze this CV section for professional quality and provide specific improvement recommendations.
        
        Section: {section_name}
        Industry Context: {industry}
        
        Content:
        {section_text}
        
        Provide a structured analysis with:
        
        1. **Quality Score (1-10):** Rate the professional quality of this section
        
        2. **Strengths:** What works well in this section
        
        3. **Improvement Areas:** Specific issues to address:
           - Weak language or passive voice
           - Missing quantifiable achievements  
           - Industry-specific terminology gaps
           - ATS compatibility issues
           - Structure or formatting concerns
        
        4. **Specific Recommendations:** Concrete suggestions with examples:
           - Word replacements (e.g., "responsible for" → "managed")
           - Missing metrics or quantification opportunities
           - Industry keywords to include
           - Structure improvements
        
        5. **Optimized Version:** Provide an improved version of the content
        
        Format your response as JSON with keys: score, strengths, improvement_areas, recommendations, optimized_content
        """)
        
        try:
            messages = prompt.format_messages(
                section_name=section_name,
                industry=industry,
                section_text=section_text
            )
            
            response = await self.claude_client.ainvoke(messages)
            
            if hasattr(response, 'content'):
                analysis_text = response.content.strip()
            else:
                analysis_text = str(response).strip()
            
            # Try to parse as JSON, fallback to structured text
            try:
                import json
                analysis_data = json.loads(analysis_text)
            except json.JSONDecodeError:
                # Fallback to basic analysis
                analysis_data = {
                    "available": True,
                    "score": 7,  # Default score
                    "analysis": analysis_text,
                    "optimized_content": section_text  # Return original if parsing fails
                }
            
            analysis_data["available"] = True
            analysis_data["service"] = "Anthropic Claude"
            return analysis_data
            
        except Exception as e:
            logger.error(f"❌ Anthropic section analysis failed: {e}")
            return {
                "available": False,
                "error": str(e),
                "message": "Analysis failed"
            }
    
    def _detect_industry_from_context(self, cv_context: Dict[str, Any]) -> str:
        """Detect industry from CV context for better optimization"""
        
        industry_keywords = {
            "technology": ["software", "developer", "engineer", "programming", "tech", "IT", "data", "cloud"],
            "finance": ["finance", "banking", "investment", "accounting", "analyst", "audit", "financial"],
            "healthcare": ["healthcare", "medical", "clinical", "patient", "hospital", "nurse", "doctor"],
            "sales": ["sales", "business development", "account", "revenue", "client", "customer"],
            "marketing": ["marketing", "brand", "campaign", "digital", "content", "social", "advertising"],
            "consulting": ["consultant", "advisory", "strategy", "management consulting", "consulting"]
        }
        
        # Analyze job titles and descriptions
        text_content = []
        for exp in cv_context.get("experiences", []):
            text_content.extend([
                exp.get("job_title", ""),
                exp.get("description", ""),
                exp.get("company", "")
            ])
        
        combined_text = " ".join(text_content).lower()
        
        # Count keyword matches
        industry_scores = {}
        for industry, keywords in industry_keywords.items():
            score = sum(1 for keyword in keywords if keyword in combined_text)
            if score > 0:
                industry_scores[industry] = score
        
        if industry_scores:
            return max(industry_scores.items(), key=lambda x: x[1])[0]
        return "general"
    
    async def compare_with_openai(self, text: str, context: Dict[str, Any] = None) -> Dict[str, Any]:
        """
        Compare Anthropic optimization with OpenAI (if available)
        
        Returns:
            Dictionary with both optimizations and comparison
        """
        
        if not self.available:
            return {
                "anthropic_available": False,
                "comparison": "Anthropic service unavailable"
            }
        
        # Get Anthropic optimization
        claude_result = await self.optimize_cv_text(text, context)
        
        result = {
            "anthropic_available": True,
            "original_text": text,
            "anthropic_optimized": claude_result,
            "anthropic_length": len(claude_result),
            "improvement_ratio": len(claude_result) / len(text) if text else 0
        }
        
        return result
    
    def get_service_status(self) -> Dict[str, Any]:
        """Get current service status and capabilities"""
        
        return {
            "service_name": "Anthropic Claude",
            "available": self.available,
            "model": settings.anthropic_model,
            "api_key_configured": bool(settings.anthropic_api_key and settings.anthropic_api_key.strip()),
            "capabilities": {
                "text_optimization": self.available,
                "section_analysis": self.available,
                "industry_detection": True,
                "cv_comparison": self.available
            },
            "features": [
                "Professional CV text optimization",
                "Industry-specific terminology",
                "ATS compatibility enhancement", 
                "Achievement quantification",
                "Detailed section analysis"
            ]
        }


# Singleton instance for global use
_anthropic_service_instance = None

def get_anthropic_service() -> AnthropicService:
    """Get singleton instance of AnthropicService"""
    global _anthropic_service_instance
    if _anthropic_service_instance is None:
        _anthropic_service_instance = AnthropicService()
    return _anthropic_service_instance