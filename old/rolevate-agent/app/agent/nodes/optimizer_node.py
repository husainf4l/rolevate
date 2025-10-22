"""
Optimizer Node - Refine wording, grammar, and consistency in CV content
Applies final polish using AI-powered grammar checking and style enhancement
"""
import asyncio
from typing import Dict, Any, List, Optional, Tuple
from pydantic import BaseModel, Field
from loguru import logger
import json
import re
from pathlib import Path

from app.config import settings
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from app.services.language_tool_service import LanguageToolService
# Note: Anthropic service archived - using OpenAI only


class CVOptimizer:
    """Advanced CV content optimization and refinement service"""
    
    def __init__(self):
        self.llm = ChatOpenAI(
            model=settings.openai_model,
            temperature=0.2,  # Low temperature for consistent optimization
            openai_api_key=settings.openai_api_key
        )
        
        # Initialize LanguageTool service for grammar checking
        self.language_tool = LanguageToolService()
        
        # Using OpenAI only (Anthropic service archived)
        self.anthropic_service = None
        
        # Track optimization statistics
        self.optimization_stats = {
            "grammar_corrections": 0,
            "style_improvements": 0,
            "sections_optimized": 0,
            "consistency_issues_fixed": 0,
            "anthropic_optimizations": 0,
            "openai_optimizations": 0
        }
        
        # Common CV improvement patterns
        self.improvement_patterns = {
            "weak_verbs": {
                "responsible for": ["managed", "supervised", "oversaw", "coordinated"],
                "worked on": ["developed", "implemented", "executed", "delivered"],
                "helped": ["supported", "assisted", "facilitated", "enabled"],
                "did": ["completed", "executed", "performed", "accomplished"],
                "made": ["created", "developed", "generated", "produced"],
                "used": ["utilized", "leveraged", "applied", "implemented"]
            },
            "vague_terms": {
                "many": "numerous",
                "various": "diverse",
                "several": "multiple",
                "lots of": "extensive",
                "a lot": "significant"
            },
            "redundant_phrases": [
                "in order to", "due to the fact that", "at this point in time",
                "it should be noted that", "please be aware that"
            ]
        }
        
        # Industry-specific optimization rules
        self.industry_optimizations = {
            "technology": {
                "preferred_terms": ["architected", "engineered", "deployed", "optimized", "scaled"],
                "avoid_terms": ["coded", "programmed", "worked with"],
                "metrics_focus": ["performance", "scalability", "efficiency", "uptime"]
            },
            "finance": {
                "preferred_terms": ["analyzed", "forecasted", "modeled", "assessed", "evaluated"],
                "avoid_terms": ["looked at", "checked", "reviewed"],
                "metrics_focus": ["ROI", "cost reduction", "revenue", "accuracy"]
            },
            "sales": {
                "preferred_terms": ["achieved", "exceeded", "generated", "cultivated", "closed"],
                "avoid_terms": ["sold", "talked to", "contacted"],
                "metrics_focus": ["quota", "revenue", "conversion", "growth"]
            }
        }
    
    def detect_industry_context(self, cv_data: Dict[str, Any]) -> str:
        """Detect primary industry for context-aware optimization"""
        
        industry_keywords = {
            "technology": ["software", "developer", "engineer", "programming", "tech", "IT", "data"],
            "finance": ["finance", "banking", "investment", "accounting", "analyst", "audit"],
            "sales": ["sales", "business development", "account", "revenue", "client"],
            "marketing": ["marketing", "brand", "campaign", "digital", "content", "social"],
            "healthcare": ["healthcare", "medical", "clinical", "patient", "hospital"],
            "consulting": ["consultant", "advisory", "strategy", "management consulting"]
        }
        
        # Analyze job titles and descriptions
        text_content = []
        for exp in cv_data.get("experiences", []):
            text_content.extend([
                exp.get("job_title", ""),
                exp.get("description", ""),
                exp.get("company", "")
            ])
        
        combined_text = " ".join(text_content).lower()
        
        industry_scores = {}
        for industry, keywords in industry_keywords.items():
            score = sum(1 for keyword in keywords if keyword in combined_text)
            if score > 0:
                industry_scores[industry] = score
        
        return max(industry_scores.items(), key=lambda x: x[1])[0] if industry_scores else "general"
    
    async def optimize_grammar_and_style(self, text: str, context: Dict[str, Any] = None) -> str:
        """Apply comprehensive grammar and style optimization using LanguageTool + AI services"""
        
        if not text or len(text.strip()) < 10:
            return text
        
        context = context or {}
        industry = context.get("industry", "general")
        text_type = context.get("text_type", "general")
        
        # Step 1: Apply LanguageTool grammar checking first
        try:
            grammar_result = self.language_tool.check_cv_section(text, text_type)
            if grammar_result.get("corrected_text"):
                text = grammar_result["corrected_text"]
                corrections_count = len(grammar_result.get('corrections', []))
                self.optimization_stats["grammar_corrections"] += corrections_count
                logger.info(f"LanguageTool applied {corrections_count} grammar corrections")
        except Exception as e:
            logger.warning(f"LanguageTool grammar check failed, continuing with AI optimization: {e}")
        
        # Step 2: Choose AI service for style optimization
        optimized_text = await self._optimize_with_ai_services(text, context)
        
        # Step 3: Apply final pattern improvements
        optimized_text = self._apply_pattern_improvements(optimized_text, industry)
        
        return optimized_text
    
    async def _optimize_with_ai_services(self, text: str, context: Dict[str, Any]) -> str:
        """Optimize text using available AI services with intelligent fallback"""
        
        industry = context.get("industry", "general")
        text_type = context.get("text_type", "general")
        
        # Check if OpenAI is available
        openai_available = settings.openai_api_key and settings.openai_api_key != "fake-key"
        
        # Use OpenAI for optimization (primary and only LLM service)
        if openai_available:
            try:
                optimized_text = await self._optimize_with_openai(text, context)
                self.optimization_stats["openai_optimizations"] += 1
                logger.debug(f"Used OpenAI for {text_type} optimization")
                return optimized_text
            except Exception as e:
                logger.warning(f"OpenAI optimization failed: {e}")
                # Fall through to pattern-based optimization
        
        # Fallback: No AI services available, return pattern-improved text
        logger.warning("No AI services available, using pattern improvements only")
        return self._apply_pattern_improvements(text, industry)
    
    async def _optimize_with_openai(self, text: str, context: Dict[str, Any]) -> str:
        """Optimize text using OpenAI"""
        
        industry = context.get("industry", "general")
        text_type = context.get("text_type", "general")
        
        prompt = ChatPromptTemplate.from_template("""
        You are an expert CV editor and professional writing specialist. Optimize this CV text for style and professional impact.
        Note: Grammar has already been checked, focus on style, impact, and professional language.
        
        Original Text:
        "{text}"
        
        Context:
        - Industry: {industry}
        - Text Type: {text_type}
        
        Optimization Guidelines:
        1. **Professional Style:**
           - Use strong action verbs (engineered, spearheaded, orchestrated)
           - Replace weak phrases ("responsible for" → "managed")
           - Eliminate redundant words and phrases
           - Ensure concise, impactful language
        
        2. **Industry Optimization:**
           - Use industry-appropriate terminology
           - Include relevant keywords for ATS systems
           - Maintain professional tone appropriate for the field
        
        3. **Quantification:**
           - Preserve all numbers and metrics exactly as given
           - Ensure quantifiable achievements are clearly highlighted
           - Add context to make numbers meaningful
        
        4. **Consistency:**
           - Maintain consistent formatting and style
           - Use parallel structure throughout
           - Ensure professional tone throughout
        
        Return ONLY the optimized text (no explanations or commentary):
        """)
        
        messages = prompt.format_messages(
            text=text,
            industry=industry,
            text_type=text_type
        )
        response = await self.llm.ainvoke(messages)
        
        if hasattr(response, 'content'):
            return response.content.strip()
        elif isinstance(response, str):
            return response.strip()
        else:
            return str(response).strip()
    
    def _apply_pattern_improvements(self, text: str, industry: str) -> str:
        """Apply pattern-based text improvements"""
        
        improved_text = text
        
        # Replace weak verbs with stronger alternatives
        for weak_verb, strong_alternatives in self.improvement_patterns["weak_verbs"].items():
            if weak_verb in improved_text.lower():
                # Use the first strong alternative for consistency
                pattern = re.compile(re.escape(weak_verb), re.IGNORECASE)
                improved_text = pattern.sub(strong_alternatives[0], improved_text)
        
        # Replace vague terms
        for vague_term, specific_term in self.improvement_patterns["vague_terms"].items():
            pattern = re.compile(r'\b' + re.escape(vague_term) + r'\b', re.IGNORECASE)
            improved_text = pattern.sub(specific_term, improved_text)
        
        # Remove redundant phrases
        for redundant_phrase in self.improvement_patterns["redundant_phrases"]:
            improved_text = improved_text.replace(redundant_phrase, "")
        
        # Clean up extra whitespace
        improved_text = re.sub(r'\s+', ' ', improved_text).strip()
        
        return improved_text
    
    async def optimize_cv_section(self, section_name: str, section_data: Any, 
                                 cv_context: Dict[str, Any]) -> Any:
        """Optimize a specific CV section"""
        
        industry = self.detect_industry_context(cv_context)
        self.optimization_stats["sections_optimized"] += 1
        
        if section_name == "summary" and isinstance(section_data, str):
            return await self.optimize_grammar_and_style(
                section_data, 
                {"industry": industry, "text_type": "professional_summary"}
            )
        
        elif section_name == "experiences" and isinstance(section_data, list):
            optimized_experiences = []
            for exp in section_data:
                optimized_exp = exp.copy()
                
                # Optimize job description
                if exp.get("description"):
                    optimized_exp["description"] = await self.optimize_grammar_and_style(
                        exp["description"],
                        {"industry": industry, "text_type": "job_description"}
                    )
                
                # Optimize achievements
                if exp.get("achievements") and isinstance(exp["achievements"], list):
                    optimized_achievements = []
                    for achievement in exp["achievements"]:
                        if isinstance(achievement, str):
                            optimized_achievement = await self.optimize_grammar_and_style(
                                achievement,
                                {"industry": industry, "text_type": "achievement"}
                            )
                            optimized_achievements.append(optimized_achievement)
                        else:
                            optimized_achievements.append(achievement)
                    optimized_exp["achievements"] = optimized_achievements
                
                optimized_experiences.append(optimized_exp)
            
            return optimized_experiences
        
        elif section_name == "projects" and isinstance(section_data, list):
            optimized_projects = []
            for project in section_data:
                optimized_project = project.copy()
                if project.get("description"):
                    optimized_project["description"] = await self.optimize_grammar_and_style(
                        project["description"],
                        {"industry": industry, "text_type": "project_description"}
                    )
                optimized_projects.append(optimized_project)
            
            return optimized_projects
        
        # Return unchanged for other sections
        return section_data
    
    async def perform_consistency_check(self, cv_data: Dict[str, Any]) -> Tuple[Dict[str, Any], List[str]]:
        """Perform consistency checks across the CV"""
        
        issues_found = []
        
        # Check date consistency
        experiences = cv_data.get("experiences", [])
        for i, exp in enumerate(experiences):
            start_date = exp.get("start_date", "")
            end_date = exp.get("end_date", "")
            
            # Check date format consistency
            if start_date and not re.match(r'\d{4}-\d{2}', start_date):
                issues_found.append(f"Experience {i+1}: Inconsistent start date format")
            
            if end_date and end_date.lower() not in ["present", "current"] and not re.match(r'\d{4}-\d{2}', end_date):
                issues_found.append(f"Experience {i+1}: Inconsistent end date format")
        
        # Check for missing critical information
        personal_info = cv_data.get("personal_info", {})
        if not personal_info.get("full_name"):
            issues_found.append("Missing full name in personal information")
        if not personal_info.get("email"):
            issues_found.append("Missing email in personal information")
        
        # Check verb tense consistency in current vs past roles
        for i, exp in enumerate(experiences):
            description = exp.get("description", "")
            end_date = exp.get("end_date", "").lower()
            
            if end_date in ["present", "current"] and description:
                # Current role should use present tense
                if not self._check_present_tense(description):
                    issues_found.append(f"Experience {i+1}: Current role should use present tense")
        
        return cv_data, issues_found
    
    def _check_present_tense(self, text: str) -> bool:
        """Basic check for present tense usage"""
        present_indicators = ["manages", "leads", "develops", "creates", "oversees", "coordinates"]
        past_indicators = ["managed", "led", "developed", "created", "oversaw", "coordinated"]
        
        text_lower = text.lower()
        present_count = sum(1 for verb in present_indicators if verb in text_lower)
        past_count = sum(1 for verb in past_indicators if verb in text_lower)
        
        return present_count > past_count
    
    async def optimize_for_ats(self, cv_data: Dict[str, Any]) -> Dict[str, Any]:
        """Optimize CV for ATS (Applicant Tracking System) compatibility"""
        
        logger.info("🤖 Optimizing for ATS compatibility...")
        
        optimized_cv = cv_data.copy()
        
        # Ensure skills are properly formatted and categorized
        if optimized_cv.get("skills"):
            skills = optimized_cv["skills"]
            
            # Standardize skill categories
            standard_categories = {
                "technical_skills": ["technical_skills", "technical", "tech_skills"],
                "programming_languages": ["programming_languages", "languages", "coding_languages"],
                "frameworks": ["frameworks", "libraries", "tools_and_frameworks"],
                "databases": ["databases", "database", "db"],
                "tools": ["tools", "software", "applications"]
            }
            
            standardized_skills = {}
            for standard_cat, variations in standard_categories.items():
                for variation in variations:
                    if variation in skills:
                        if standard_cat not in standardized_skills:
                            standardized_skills[standard_cat] = []
                        standardized_skills[standard_cat].extend(skills[variation])
                        break
            
            # Add remaining categories
            for cat, skill_list in skills.items():
                if not any(cat in variations for variations in standard_categories.values()):
                    standardized_skills[cat] = skill_list
            
            optimized_cv["skills"] = standardized_skills
        
        # Ensure consistent date formats
        for exp in optimized_cv.get("experiences", []):
            if exp.get("start_date"):
                exp["start_date"] = self._standardize_date_format(exp["start_date"])
            if exp.get("end_date") and exp["end_date"].lower() not in ["present", "current"]:
                exp["end_date"] = self._standardize_date_format(exp["end_date"])
        
        for edu in optimized_cv.get("education", []):
            if edu.get("start_date"):
                edu["start_date"] = self._standardize_date_format(edu["start_date"])
            if edu.get("end_date"):
                edu["end_date"] = self._standardize_date_format(edu["end_date"])
        
        return optimized_cv
    
    def _standardize_date_format(self, date_str: str) -> str:
        """Standardize date format to YYYY-MM"""
        if not date_str:
            return date_str
        
        # Already in correct format
        if re.match(r'\d{4}-\d{2}$', date_str):
            return date_str
        
        # Try to parse various formats
        patterns = [
            (r'(\d{4})-(\d{1,2})$', r'\1-{:02d}'.format),  # 2023-5 → 2023-05
            (r'(\d{1,2})/(\d{4})$', r'\2-{:02d}'.format),  # 5/2023 → 2023-05
            (r'(\w+)\s+(\d{4})$', None)  # March 2023 → 2023-03
        ]
        
        for pattern, formatter in patterns:
            match = re.match(pattern, date_str)
            if match:
                if formatter:
                    return formatter(int(match.group(2))).format(match.group(1), int(match.group(2)))
                else:
                    # Handle month name conversion
                    month_map = {
                        "january": "01", "february": "02", "march": "03", "april": "04",
                        "may": "05", "june": "06", "july": "07", "august": "08",
                        "september": "09", "october": "10", "november": "11", "december": "12"
                    }
                    month_name = match.group(1).lower()
                    if month_name in month_map:
                        return f"{match.group(2)}-{month_map[month_name]}"
        
        return date_str  # Return original if parsing fails
    
    async def optimize_complete_cv(self, cv_data: Dict[str, Any]) -> Tuple[Dict[str, Any], Dict[str, Any]]:
        """Perform comprehensive CV optimization"""
        
        logger.info("✨ Starting comprehensive CV optimization...")
        
        try:
            # Start with ATS optimization
            optimized_cv = await self.optimize_for_ats(cv_data)
            
            # Optimize each section
            for section_name in ["summary", "experiences", "projects"]:
                if section_name in optimized_cv and optimized_cv[section_name]:
                    optimized_cv[section_name] = await self.optimize_cv_section(
                        section_name, optimized_cv[section_name], optimized_cv
                    )
            
            # Perform consistency check
            final_cv, issues = await self.perform_consistency_check(optimized_cv)
            
            # Create comprehensive optimization report
            tools_used = ["LanguageTool (grammar & spelling)", "Pattern matching (weak verbs & redundancy)"]
            optimizations_applied = [
                "LanguageTool grammar checking",
                "ATS compatibility improvements", 
                "Verb tense consistency",
                "Professional terminology upgrade",
                "Date format standardization"
            ]
            
            # Add AI service information
            if self.optimization_stats["openai_optimizations"] > 0:
                tools_used.append("OpenAI GPT (style & professional language)")
                optimizations_applied.append("OpenAI style enhancement")
            
            if self.optimization_stats["anthropic_optimizations"] > 0:
                tools_used.append("Anthropic Claude (professional writing)")
                optimizations_applied.append("Anthropic Claude optimization")
            
            optimization_report = {
                "optimizations_applied": optimizations_applied,
                "statistics": {
                    "grammar_corrections": self.optimization_stats["grammar_corrections"],
                    "sections_optimized": self.optimization_stats["sections_optimized"],
                    "consistency_issues": len(issues),
                    "openai_optimizations": self.optimization_stats["openai_optimizations"],
                    "anthropic_optimizations": self.optimization_stats["anthropic_optimizations"],
                    "total_improvements": (
                        self.optimization_stats["grammar_corrections"] + 
                        self.optimization_stats["sections_optimized"] + 
                        self.optimization_stats["openai_optimizations"] +
                        self.optimization_stats["anthropic_optimizations"] +
                        len(issues)
                    )
                },
                "issues_found": issues,
                "industry_detected": self.detect_industry_context(cv_data),
                "ai_services": {
                    "openai_available": bool(settings.openai_api_key and settings.openai_api_key != "fake-key"),
                    "service_usage": {
                        "openai_count": self.optimization_stats["openai_optimizations"]
                    }
                },
                "tools_used": tools_used,
                "optimization_timestamp": "completed"
            }
            
            logger.success(f"✅ CV optimization completed successfully")
            
            return final_cv, optimization_report
            
        except Exception as e:
            logger.error(f"❌ CV optimization failed: {e}")
            return cv_data, {"error": str(e)}


async def optimizer_node(state: Dict[str, Any]) -> Dict[str, Any]:
    """
    LangGraph node for CV content optimization
    
    Input: state with 'cv_memory' containing CV data to optimize
    Output: state with optimized 'cv_memory' and 'optimization_report'
    """
    logger.info("✨ Starting CV content optimization...")
    
    try:
        optimizer = CVOptimizer()
        
        # Get data from state
        cv_memory = state.get("cv_memory", {})
        
        if not cv_memory:
            logger.warning("No CV data found for optimization")
            state["processing_step"] = "optimization_skipped"
            return state
        
        # Perform comprehensive optimization
        optimized_cv, optimization_report = await optimizer.optimize_complete_cv(cv_memory)
        
        # Update state
        state["cv_memory"] = optimized_cv
        state["optimization_report"] = optimization_report
        state["processing_step"] = "optimization_complete"
        
        logger.success("✅ CV optimization completed successfully")
        
        return state
        
    except Exception as e:
        logger.error(f"❌ CV optimization failed: {e}")
        state["processing_step"] = f"optimization_error: {str(e)}"
        return state


# Input/Output Schemas for LangGraph
class OptimizerInput(BaseModel):
    """Input schema for optimizer node"""
    cv_memory: Dict[str, Any] = Field(..., description="CV data to optimize")
    optimization_level: str = Field(default="comprehensive", description="Level of optimization")
    target_ats: bool = Field(default=True, description="Optimize for ATS compatibility")


class OptimizerOutput(BaseModel):
    """Output schema for optimizer node"""
    cv_memory: Dict[str, Any] = Field(..., description="Optimized CV data")
    optimization_report: Dict[str, Any] = Field(..., description="Report of optimizations applied")
    processing_step: str = Field(..., description="Processing status")
    issues_count: int = Field(default=0, description="Number of issues found and fixed")


# Node metadata for LangGraph
OPTIMIZER_NODE_METADATA = {
    "name": "optimizer_node",
    "description": "Refine wording, grammar, and consistency in CV content",
    "input_schema": OptimizerInput,
    "output_schema": OptimizerOutput,
    "dependencies": ["openai", "langchain"],
    "timeout": 45,
    "retry_count": 2
}