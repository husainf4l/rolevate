"""
CV Builder Workflow - Orchestrates the 5-layer AI architecture
Manages the complete conversational CV building flow using LangGraph
"""
import re
import json
from typing import Dict, Any, TypedDict, Annotated, Sequence, Optional, List
from enum import Enum
from pathlib import Path
from langchain_core.messages import BaseMessage, HumanMessage, AIMessage
from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI
from langgraph.graph import StateGraph, END
from loguru import logger

from app.config import settings
from app.models.schemas import CVData
from app.services.template_filler import TemplateFiller


class IntentType(str, Enum):
    """Intent types for CV building conversations"""
    ADD_PERSONAL_INFO = "add_personal_info"
    ADD_EXPERIENCE = "add_experience"
    ADD_EDUCATION = "add_education"
    ADD_SKILLS = "add_skills"
    ADD_LANGUAGES = "add_languages"
    ADD_SUMMARY = "add_summary"
    SELECT_TEMPLATE = "select_template"
    GENERATE_CV = "generate_cv"
    EDIT_SECTION = "edit_section"
    DELETE_SECTION = "delete_section"
    UNKNOWN = "unknown"


class IntentResult(TypedDict):
    """Result from intent classification"""
    intent: IntentType
    confidence: float
    extracted_data: Dict[str, Any]
    raw_text: str

from app.agent.nodes.input_understanding_node import input_understanding_node
from app.agent.nodes.data_structuring_node import data_structuring_node
from app.agent.nodes.draft_generation_node import draft_generation_node
from app.agent.nodes.template_rendering_node import template_rendering_node
from app.agent.nodes.output_optimization_node import output_optimization_node


class CVBuilderState(TypedDict):
    """State for the CV Builder workflow"""
    # User input
    user_message: str
    session_id: str
    
    # Processing results
    intent: str
    intent_confidence: float
    extracted_data: Dict[str, Any]
    requires_clarification: bool
    clarification_question: str
    
    # CV data
    cv_memory: Dict[str, Any]
    structured_data: Dict[str, Any]
    
    # Output
    html_content: str
    pdf_path: str
    download_url: str
    
    # Metadata
    messages: Annotated[Sequence[Dict[str, str]], "Conversation messages"]
    enhanced: bool
    optimized: bool
    quality_score: int
    validation_result: Dict[str, Any]
    error: str
    """Result from intent detection."""
    intent: IntentType
    confidence: float
    extracted_data: Dict[str, Any]
    raw_text: str


class CVBuilderWorkflow:
    """
    5-Layer CV Builder AI Architecture:
    1. Input Understanding Layer (input_node)
    2. Data Structuring Layer (data_structuring_node) 
    3. Draft Generation Layer (draft_generation_node)
    4. Template Rendering Layer (template_rendering_node)
    5. Output Optimization Layer (output_optimizer_node)
    """
    
    def __init__(self):
        """Initialize the CV Builder workflow with OpenAI."""
        import os
        os.environ["OPENAI_API_KEY"] = settings.openai_api_key
        
        self.llm = ChatOpenAI(
            model=settings.openai_model,
            temperature=0.3
        )
        
        self.template_filler = TemplateFiller()
        
        # Intent detection patterns
        self.intent_patterns = {
            IntentType.ADD_PERSONAL_INFO: [
                r"my name is|i am|call me|full name",
                r"email|phone|address|contact",
                r"personal (info|information|details)"
            ],
            IntentType.ADD_EXPERIENCE: [
                r"work|job|experience|employment|position",
                r"worked at|employed at|job at",
                r"software engineer|developer|analyst|manager"
            ],
            IntentType.ADD_EDUCATION: [
                r"education|school|university|college|degree",
                r"studied at|graduated from|bachelor|master|phd"
            ],
            IntentType.ADD_SKILLS: [
                r"skills|abilities|proficient|expert",
                r"programming|languages|tools|technologies"
            ],
            IntentType.ADD_LANGUAGES: [
                r"speak|language|fluent|native|bilingual"
            ],
            IntentType.ADD_SUMMARY: [
                r"summary|about me|bio|profile|overview"
            ],
            IntentType.SELECT_TEMPLATE: [
                r"template|design|style|format|layout"
            ],
            IntentType.GENERATE_CV: [
                r"generate|create|build|make cv|resume|download"
            ]
        }

    # 1️⃣ INPUT UNDERSTANDING LAYER
    async def input_node(self, state: CVBuilderState) -> CVBuilderState:
        """
        Layer 1: Input Understanding
        - Detect user intent (add_experience, education, skills, etc.)
        - Use regex + LLM for classification
        - Extract structured data from natural language
        """
        user_input = state["user_input"]
        
        # Pattern-based intent detection
        intent = self._detect_intent_patterns(user_input)
        
        # If pattern detection fails, use LLM
        if intent.intent == IntentType.UNKNOWN:
            intent = await self._detect_intent_llm(user_input)
        
        # Update state
        state["intent"] = intent.intent
        state["extracted_data"] = intent.extracted_data
        state["processing_step"] = "input_understanding_complete"
        
        # Add user message to conversation
        state["messages"].append(HumanMessage(content=user_input))
        
        return state
    
    def _detect_intent_patterns(self, text: str) -> IntentResult:
        """Detect intent using regex patterns."""
        text_lower = text.lower()
        
        for intent_type, patterns in self.intent_patterns.items():
            for pattern in patterns:
                if re.search(pattern, text_lower):
                    return IntentResult(
                        intent=intent_type,
                        confidence=0.8,
                        extracted_data={"raw_text": text},
                        raw_text=text
                    )
        
        return IntentResult(
            intent=IntentType.UNKNOWN,
            confidence=0.0,
            extracted_data={"raw_text": text},
            raw_text=text
        )
    
    async def _detect_intent_llm(self, text: str) -> IntentResult:
        """Use LLM for intent detection when patterns fail."""
        
        prompt = ChatPromptTemplate.from_template("""
        Analyze the following user input and classify the intent for CV building:

        User Input: "{input}"

        Available Intents:
        - add_personal_info: Adding name, email, phone, address
        - add_experience: Adding work experience, job history
        - add_education: Adding education, degrees, certifications
        - add_skills: Adding technical or soft skills
        - add_languages: Adding language proficiencies
        - add_summary: Adding professional summary/bio
        - select_template: Choosing CV template/design
        - generate_cv: Creating/downloading the final CV
        - edit_section: Modifying existing information
        - delete_section: Removing information
        - unknown: Unclear or unrelated input

        Respond with JSON format:
        {{
            "intent": "detected_intent",
            "confidence": 0.95,
            "extracted_data": {{
                "key": "value"
            }}
        }}
        """)
        
        try:
            response = await self.llm.ainvoke(prompt.format_messages(input=text))
            result_json = json.loads(response.content)
            
            return IntentResult(
                intent=IntentType(result_json.get("intent", "unknown")),
                confidence=result_json.get("confidence", 0.5),
                extracted_data=result_json.get("extracted_data", {}),
                raw_text=text
            )
        except Exception as e:
            return IntentResult(
                intent=IntentType.UNKNOWN,
                confidence=0.0,
                extracted_data={"error": str(e)},
                raw_text=text
            )

    # 2️⃣ DATA STRUCTURING LAYER
    async def data_structuring_node(self, state: CVBuilderState) -> CVBuilderState:
        """
        Layer 2: Data Structuring
        - Convert natural text into organized fields
        - Use Pydantic models for validation
        - Merge new inputs with existing user memory
        """
        intent = state["intent"]
        extracted_data = state["extracted_data"]
        current_cv_data = state.get("cv_data", {})
        
        # Structure data based on intent
        if intent == IntentType.ADD_PERSONAL_INFO:
            structured_data = await self._structure_personal_info(extracted_data)
            current_cv_data["personal_info"] = {**current_cv_data.get("personal_info", {}), **structured_data}
        
        elif intent == IntentType.ADD_EXPERIENCE:
            structured_data = await self._structure_experience(extracted_data)
            if "experience" not in current_cv_data:
                current_cv_data["experience"] = []
            current_cv_data["experience"].append(structured_data)
        
        elif intent == IntentType.ADD_EDUCATION:
            structured_data = await self._structure_education(extracted_data)
            if "education" not in current_cv_data:
                current_cv_data["education"] = []
            current_cv_data["education"].append(structured_data)
        
        elif intent == IntentType.ADD_SKILLS:
            structured_data = await self._structure_skills(extracted_data)
            current_cv_data["skills"] = structured_data
        
        elif intent == IntentType.ADD_LANGUAGES:
            structured_data = await self._structure_languages(extracted_data)
            current_cv_data["languages"] = structured_data
        
        elif intent == IntentType.ADD_SUMMARY:
            structured_data = await self._structure_summary(extracted_data)
            current_cv_data["summary"] = structured_data
        
        elif intent == IntentType.SELECT_TEMPLATE:
            template_name = extracted_data.get("raw_text", "modern")
            state["selected_template"] = self._validate_template(template_name)
        
        # Update state
        state["cv_data"] = current_cv_data
        state["processing_step"] = "data_structuring_complete"
        
        return state
    
    async def _structure_personal_info(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Structure personal information using LLM."""
        
        prompt = ChatPromptTemplate.from_template("""
        Extract personal information from the following text and structure it:

        Text: "{text}"

        Extract and return JSON with these fields (only include fields found in the text):
        {{
            "full_name": "Full Name",
            "email": "email@domain.com",
            "phone": "+1234567890",
            "address": "Full Address",
            "linkedin": "LinkedIn URL",
            "github": "GitHub URL",
            "website": "Website URL"
        }}
        """)
        
        try:
            response = await self.llm.ainvoke(prompt.format_messages(text=data.get("raw_text", "")))
            return json.loads(response.content)
        except:
            return {"raw_text": data.get("raw_text", "")}
    
    async def _structure_experience(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Structure work experience using LLM."""
        
        prompt = ChatPromptTemplate.from_template("""
        Extract work experience from the following text and structure it:

        Text: "{text}"

        Return JSON format:
        {{
            "job_title": "Position Title",
            "company": "Company Name",
            "start_date": "YYYY-MM",
            "end_date": "YYYY-MM or Present",
            "location": "City, Country",
            "description": "Brief description of role and responsibilities",
            "achievements": ["Achievement 1", "Achievement 2"]
        }}
        """)
        
        try:
            response = await self.llm.ainvoke(prompt.format_messages(text=data.get("raw_text", "")))
            return json.loads(response.content)
        except:
            return {"raw_text": data.get("raw_text", "")}
    
    async def _structure_education(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Structure education using LLM."""
        
        prompt = ChatPromptTemplate.from_template("""
        Extract education information from the following text:

        Text: "{text}"

        Return JSON format:
        {{
            "degree": "Degree Title",
            "institution": "University/School Name",
            "start_date": "YYYY",
            "end_date": "YYYY",
            "gpa": "GPA if mentioned",
            "location": "City, Country",
            "relevant_coursework": ["Course 1", "Course 2"]
        }}
        """)
        
        try:
            response = await self.llm.ainvoke(prompt.format_messages(text=data.get("raw_text", "")))
            return json.loads(response.content)
        except:
            return {"raw_text": data.get("raw_text", "")}
    
    async def _structure_skills(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Structure skills using LLM."""
        
        prompt = ChatPromptTemplate.from_template("""
        Extract and categorize skills from the following text:

        Text: "{text}"

        Return JSON format:
        {{
            "technical_skills": ["Skill 1", "Skill 2"],
            "soft_skills": ["Skill 1", "Skill 2"],
            "programming_languages": ["Language 1", "Language 2"],
            "frameworks": ["Framework 1", "Framework 2"],
            "tools": ["Tool 1", "Tool 2"]
        }}
        """)
        
        try:
            response = await self.llm.ainvoke(prompt.format_messages(text=data.get("raw_text", "")))
            return json.loads(response.content)
        except:
            return {"skills": data.get("raw_text", "").split(",")}
    
    async def _structure_languages(self, data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Structure language proficiencies."""
        
        prompt = ChatPromptTemplate.from_template("""
        Extract language proficiencies from the following text:

        Text: "{text}"

        Return JSON array format:
        [
            {{"language": "English", "proficiency": "Native"}},
            {{"language": "Spanish", "proficiency": "Fluent"}},
            {{"language": "French", "proficiency": "Intermediate"}}
        ]
        """)
        
        try:
            response = await self.llm.ainvoke(prompt.format_messages(text=data.get("raw_text", "")))
            return json.loads(response.content)
        except:
            return [{"language": data.get("raw_text", ""), "proficiency": "Unknown"}]
    
    async def _structure_summary(self, data: Dict[str, Any]) -> str:
        """Structure professional summary."""
        return data.get("raw_text", "")
    
    def _validate_template(self, template_name: str) -> str:
        """Validate and return available template name."""
        available_templates = ["modern", "classic", "minimal", "creative"]
        template_lower = template_name.lower()
        
        for template in available_templates:
            if template in template_lower:
                return template
        
        return "modern"  # Default template

    # 3️⃣ DRAFT GENERATION LAYER
    async def draft_generation_node(self, state: CVBuilderState) -> CVBuilderState:
        """
        Layer 3: Draft Generation
        - Expand short text into professional, ATS-friendly CV sentences
        - Enhance content quality using LLM
        - Generate compelling descriptions
        """
        cv_data = state["cv_data"]
        enhanced_data = {}
        
        # Enhance each section
        if "experience" in cv_data:
            enhanced_data["experience"] = await self._enhance_experience_descriptions(cv_data["experience"])
        
        if "education" in cv_data:
            enhanced_data["education"] = cv_data["education"]  # Usually doesn't need enhancement
        
        if "summary" in cv_data:
            enhanced_data["summary"] = await self._enhance_summary(cv_data["summary"])
        
        if "skills" in cv_data:
            enhanced_data["skills"] = cv_data["skills"]  # Skills are usually fine as-is
        
        # Copy other sections
        for key, value in cv_data.items():
            if key not in enhanced_data:
                enhanced_data[key] = value
        
        state["draft_content"] = enhanced_data
        state["processing_step"] = "draft_generation_complete"
        
        return state
    
    async def _enhance_experience_descriptions(self, experiences: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Enhance work experience descriptions to be more professional and ATS-friendly."""
        
        enhanced_experiences = []
        
        for exp in experiences:
            if "description" in exp and exp["description"]:
                enhanced_desc = await self._enhance_job_description(
                    exp["description"], 
                    exp.get("job_title", ""), 
                    exp.get("company", "")
                )
                exp["description"] = enhanced_desc
            
            enhanced_experiences.append(exp)
        
        return enhanced_experiences
    
    async def _enhance_job_description(self, description: str, job_title: str, company: str) -> str:
        """Enhance a single job description."""
        
        prompt = ChatPromptTemplate.from_template("""
        Enhance the following job description to be more professional, ATS-friendly, and impactful:

        Job Title: {job_title}
        Company: {company}
        Current Description: "{description}"

        Requirements:
        1. Use action verbs (Developed, Implemented, Managed, Led, etc.)
        2. Include quantifiable achievements where possible
        3. Make it ATS-friendly with relevant keywords
        4. Keep it concise but impactful
        5. Focus on results and value delivered

        Return only the enhanced description (2-3 sentences maximum):
        """)
        
        try:
            response = await self.llm.ainvoke(prompt.format_messages(
                job_title=job_title,
                company=company, 
                description=description
            ))
            return response.content.strip()
        except:
            return description
    
    async def _enhance_summary(self, summary: str) -> str:
        """Enhance professional summary."""
        
        prompt = ChatPromptTemplate.from_template("""
        Enhance the following professional summary to be more compelling and ATS-friendly:

        Current Summary: "{summary}"

        Requirements:
        1. Make it engaging and professional
        2. Include relevant keywords
        3. Highlight key strengths and value proposition
        4. Keep it concise (2-3 sentences)
        5. Focus on what the candidate brings to potential employers

        Return only the enhanced summary:
        """)
        
        try:
            response = await self.llm.ainvoke(prompt.format_messages(summary=summary))
            return response.content.strip()
        except:
            return summary

    # 4️⃣ TEMPLATE RENDERING LAYER  
    async def template_rendering_node(self, state: CVBuilderState) -> CVBuilderState:
        """
        Layer 4: Template Rendering
        - Use Jinja2 to fill predesigned HTML templates
        - Render to HTML, then use WeasyPrint to create PDF
        - Store final PDF and return download URL
        """
        draft_content = state["draft_content"]
        template_name = state.get("selected_template", "modern")
        
        try:
            # Generate PDF using existing template filler
            pdf_path = await self._render_pdf(draft_content, template_name)
            
            # Generate public URL (this would be actual file serving in production)
            pdf_url = f"/download/cv_{pdf_path.stem}.pdf"
            
            state["generated_pdf_url"] = pdf_url
            state["processing_step"] = "template_rendering_complete"
            
        except Exception as e:
            state["processing_step"] = f"template_rendering_error: {str(e)}"
        
        return state
    
    async def _render_pdf(self, cv_data: Dict[str, Any], template_name: str) -> Path:
        """Render CV data to PDF using template filler."""
        
        # Convert our format to CVData format expected by template filler
        cv_data_model = self._convert_to_cv_data_model(cv_data)
        
        # Use existing template filler
        pdf_path = await self.template_filler.fill_template(cv_data_model, template_name)
        
        return pdf_path
    
    def _convert_to_cv_data_model(self, data: Dict[str, Any]) -> CVData:
        """Convert our internal format to CVData model."""
        
        # This is a simplified conversion - you'd need to map all fields properly
        return CVData(
            personal_info=data.get("personal_info", {}),
            experience=data.get("experience", []),
            education=data.get("education", []),
            skills=data.get("skills", {}),
            languages=data.get("languages", []),
            summary=data.get("summary", "")
        )

    # 5️⃣ OUTPUT OPTIMIZATION LAYER
    async def output_optimizer_node(self, state: CVBuilderState) -> CVBuilderState:
        """
        Layer 5: Output Optimization
        - Apply final grammar correction and clarity improvements
        - Compress and finalize the PDF
        - Ensure proper section ordering
        - Return the final public file URL
        """
        
        # Grammar and clarity check on the generated content
        if state.get("draft_content"):
            optimized_content = await self._optimize_content_quality(state["draft_content"])
            state["draft_content"] = optimized_content
        
        # Ensure proper section ordering
        if state.get("cv_data"):
            state["cv_data"] = self._optimize_section_order(state["cv_data"])
        
        # Final PDF optimization (compression, etc.)
        if state.get("generated_pdf_url"):
            optimized_url = await self._optimize_pdf(state["generated_pdf_url"])
            state["generated_pdf_url"] = optimized_url
        
        state["processing_step"] = "output_optimization_complete"
        
        # Generate AI response message
        ai_response = self._generate_completion_message(state)
        state["messages"].append(AIMessage(content=ai_response))
        
        return state
    
    async def _optimize_content_quality(self, content: Dict[str, Any]) -> Dict[str, Any]:
        """Apply final grammar and clarity improvements."""
        
        # Focus on text fields that need optimization
        optimized = content.copy()
        
        if "summary" in content and isinstance(content["summary"], str):
            optimized["summary"] = await self._grammar_check(content["summary"])
        
        if "experience" in content:
            for exp in optimized["experience"]:
                if "description" in exp:
                    exp["description"] = await self._grammar_check(exp["description"])
        
        return optimized
    
    async def _grammar_check(self, text: str) -> str:
        """Apply grammar and clarity improvements."""
        
        prompt = ChatPromptTemplate.from_template("""
        Review and improve the grammar, clarity, and professional tone of the following text:

        Text: "{text}"

        Requirements:
        1. Fix any grammar or spelling errors
        2. Improve clarity and readability
        3. Maintain professional tone
        4. Keep the same length and meaning
        5. Ensure it sounds natural

        Return only the improved text:
        """)
        
        try:
            response = await self.llm.ainvoke(prompt.format_messages(text=text))
            return response.content.strip()
        except:
            return text
    
    def _optimize_section_order(self, cv_data: Dict[str, Any]) -> Dict[str, Any]:
        """Ensure optimal section ordering: Summary → Experience → Education → Skills → Languages."""
        
        ordered_sections = ["personal_info", "summary", "experience", "education", "skills", "languages"]
        optimized_data = {}
        
        # Add sections in optimal order
        for section in ordered_sections:
            if section in cv_data:
                optimized_data[section] = cv_data[section]
        
        # Add any remaining sections
        for key, value in cv_data.items():
            if key not in optimized_data:
                optimized_data[key] = value
        
        return optimized_data
    
    async def _optimize_pdf(self, pdf_url: str) -> str:
        """Optimize the final PDF (compression, etc.)."""
        # In a real implementation, you might:
        # 1. Compress the PDF using ghostscript
        # 2. Add metadata
        # 3. Optimize for web delivery
        # For now, return the original URL
        return pdf_url
    
    def _generate_completion_message(self, state: CVBuilderState) -> str:
        """Generate an appropriate AI response based on the processing result."""
        
        intent = state.get("intent")
        processing_step = state.get("processing_step", "")
        
        if "complete" in processing_step:
            if intent == IntentType.GENERATE_CV:
                return f"🎉 Your CV has been generated successfully! You can download it here: {state.get('generated_pdf_url', '')}"
            elif intent == IntentType.ADD_EXPERIENCE:
                return "✅ Great! I've added your work experience. Would you like to add more details or move on to another section?"
            elif intent == IntentType.ADD_EDUCATION:
                return "✅ Perfect! I've added your education information. What would you like to add next?"
            elif intent == IntentType.ADD_SKILLS:
                return "✅ Excellent! I've added your skills. Feel free to add more or continue with other sections."
            elif intent == IntentType.ADD_PERSONAL_INFO:
                return "✅ I've updated your personal information. What would you like to add next?"
            else:
                return "✅ Information updated successfully! What would you like to do next?"
        elif "error" in processing_step:
            return f"❌ I encountered an issue: {processing_step}. Could you please try again or rephrase your request?"
        else:
            return "🤔 I'm processing your request. Please hold on..."

    # WORKFLOW ORCHESTRATION
    async def process_user_input(self, user_input: str, conversation_state: Optional[Dict] = None) -> CVBuilderState:
        """
        Main workflow orchestration method.
        Processes user input through all 5 intelligence layers.
        """
        
        # Initialize or restore state
        if conversation_state:
            state = CVBuilderState(conversation_state)
        else:
            state = CVBuilderState(
                messages=[],
                intent=None,
                extracted_data={},
                cv_data={},
                draft_content={},
                selected_template="modern",
                generated_pdf_url=None,
                user_input=user_input,
                processing_step="initialized"
            )
        
        state["user_input"] = user_input
        
        # Execute the 5-layer pipeline
        try:
            # Layer 1: Input Understanding
            state = await self.input_node(state)
            
            # Layer 2: Data Structuring  
            state = await self.data_structuring_node(state)
            
            # Layer 3: Draft Generation (only if we have content to enhance)
            if state["cv_data"]:
                state = await self.draft_generation_node(state)
            
            # Layer 4: Template Rendering (only for generate CV intent)
            if state["intent"] == IntentType.GENERATE_CV and state.get("draft_content"):
                state = await self.template_rendering_node(state)
            
            # Layer 5: Output Optimization
            state = await self.output_optimizer_node(state)
            
        except Exception as e:
            state["processing_step"] = f"workflow_error: {str(e)}"
            state["messages"].append(AIMessage(content=f"❌ Sorry, I encountered an error: {str(e)}"))
        
        return state
    
    def get_available_templates(self) -> List[Dict[str, str]]:
        """Get list of available CV templates."""
        return [
            {"name": "modern", "description": "Clean and contemporary design"},
            {"name": "classic", "description": "Traditional professional format"},
            {"name": "minimal", "description": "Simple and elegant layout"},
            {"name": "creative", "description": "Unique and eye-catching design"}
        ]
    
    def get_conversation_summary(self, state: CVBuilderState) -> Dict[str, Any]:
        """Get a summary of the current conversation and CV building progress."""
        
        cv_data = state.get("cv_data", {})
        
        sections_completed = []
        if cv_data.get("personal_info"):
            sections_completed.append("Personal Information")
        if cv_data.get("experience"):
            sections_completed.append(f"Work Experience ({len(cv_data['experience'])} entries)")
        if cv_data.get("education"):
            sections_completed.append(f"Education ({len(cv_data['education'])} entries)")
        if cv_data.get("skills"):
            sections_completed.append("Skills")
        if cv_data.get("languages"):
            sections_completed.append("Languages")
        if cv_data.get("summary"):
            sections_completed.append("Professional Summary")
        
        return {
            "sections_completed": sections_completed,
            "selected_template": state.get("selected_template", "modern"),
            "ready_to_generate": len(sections_completed) >= 2,  # Minimum viable CV
            "pdf_generated": bool(state.get("generated_pdf_url")),
            "pdf_url": state.get("generated_pdf_url")
        }