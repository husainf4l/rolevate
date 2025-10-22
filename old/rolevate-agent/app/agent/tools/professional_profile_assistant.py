"""
Professional Profile Assistant Tool - OpenAI GPT-4 Enhanced Version
Specialized tool for banking and finance professionals with GPT-4 integration
"""
import re
import json
from typing import Dict, Any, List, Optional
from datetime import datetime

try:
    from loguru import logger
except ImportError:
    import logging
    logger = logging.getLogger(__name__)

try:
    from langchain_openai import ChatOpenAI
    from langchain_core.prompts import ChatPromptTemplate
    from langchain_core.output_parsers import JsonOutputParser
    from app.config import settings
    LLM_AVAILABLE = True
except ImportError:
    LLM_AVAILABLE = False
    logger.warning("LLM dependencies not available")


class LLMProfileExtractor:
    """OpenAI GPT-4 powered intelligent profile extraction"""
    
    def __init__(self, llm):
        self.llm = llm
        
    async def extract_structured_data(self, text: str) -> Dict[str, Any]:
        """Use GPT-4 to extract structured data from professional text"""
        
        extraction_prompt = ChatPromptTemplate.from_messages([
            ("system", """You are an expert HR professional specialized in extracting structured data from professional descriptions in banking and finance.

Extract ALL available information from the ENTIRE text in a SINGLE extraction. Read the complete text carefully and capture every detail mentioned about:
- Personal information (name, email, phone, location, LinkedIn, GitHub, website)
- Work experience (all positions, companies, dates, responsibilities)
- Education (all degrees, institutions, years)
- Skills (all technical and soft skills)
- Languages (all languages with proficiency)
- Projects (all project names, descriptions, technologies)
- Certifications (all certifications and their status)

Be comprehensive and thorough - extract everything in ONE response, not piece by piece.

Return a JSON object with this exact structure:
{{
  "personal_info": {{
    "full_name": "string or null",
    "email": "string or null",
    "phone": "string or null",
    "location": "string or null",
    "linkedin": "string or null",
    "github": "string or null",
    "website": "string or null"
  }},
  "current_position": {{
    "job_title": "string or null",
    "organization": "string or null",
    "start_year": "string or null",
    "industry": "string or null"
  }},
  "experience": {{
    "years_experience": number or null,
    "previous_positions": [
      {{
        "position": "string",
        "company": "string",
        "start_year": "string",
        "end_year": "string",
        "duration": "string",
        "key_responsibilities": ["string"]
      }}
    ],
    "current_responsibilities": ["string"]
  }},
  "education": [
    {{
      "degree": "string or null",
      "field_of_study": "string or null",
      "institution": "string or null",
      "graduation_year": number or null,
      "start_year": number or null,
      "end_year": number or null
    }}
  ],
  "certifications": [
    {{
      "certification_name": "string",
      "status": "Completed or In Progress",
      "issuing_body": "string or null"
    }}
  ],
  "projects": [
    {{
      "project_name": "string",
      "description": "string or null",
      "role": "string or null",
      "technologies": ["string"] or null
    }}
  ],
  "skills": ["string"],
  "languages": [
    {{
      "language": "string",
      "proficiency": "string"
    }}
  ],
  "professional_philosophy": "string or null",
  "career_goals": "string or null"
}}

Rules:
- Extract ALL information from the ENTIRE text in ONE comprehensive extraction
- Process the complete message before responding - don't stop early
- For work experience: extract ALL positions mentioned (not just the most recent)
- For education: extract ALL degrees mentioned (bachelor's, master's, PhD, etc.)
- For skills: extract ALL skills mentioned throughout the text
- For languages: extract ALL languages mentioned with their proficiency levels
- For projects: extract ALL projects mentioned with full details
- For missing information, use null
- For dates, extract years (YYYY format)
- For LinkedIn: extract profile URL or username (e.g., "linkedin.com/in/username" or just "username")
- For GitHub: extract profile URL or username (e.g., "github.com/username" or just "username")
- For website: extract full URL or domain (e.g., "myportfolio.com" or "https://myportfolio.com")
- For phone: extract full phone number with country code if available
- Identify "In Progress" certifications (e.g., "preparing for", "studying for")
- Capture professional philosophy statements
- List all skills and competencies mentioned
- Include responsibilities as bullet-style list items
- Be comprehensive: if the user provides a lot of information, extract ALL of it in one response"""),
            ("user", "Extract structured data from this professional description:\n\n{text}")
        ])
        
        try:
            chain = extraction_prompt | self.llm
            response = await chain.ainvoke({"text": text})
            
            # Parse JSON from response
            content = response.content
            
            # Try to extract JSON from markdown code blocks if present
            if "```json" in content:
                json_start = content.find("```json") + 7
                json_end = content.find("```", json_start)
                content = content[json_start:json_end].strip()
            elif "```" in content:
                json_start = content.find("```") + 3
                json_end = content.find("```", json_start)
                content = content[json_start:json_end].strip()
            
            extracted = json.loads(content)
            logger.info("✅ LLM extraction successful")
            return extracted
            
        except Exception as e:
            logger.error(f"❌ LLM extraction failed: {e}")
            return None
    
    async def enhance_content(self, text: str, context: Dict[str, Any]) -> str:
        """Use GPT-4 to enhance and professionalize content"""
        
        enhancement_prompt = ChatPromptTemplate.from_messages([
            ("system", """You are an expert career consultant for banking and finance professionals.

Your task: Enhance the professional description while maintaining accuracy and realism.

Enhancement guidelines:
1. Improve grammar and professional tone
2. Strengthen weak descriptions with industry-appropriate terminology
3. Add depth to responsibilities using action verbs
4. Ensure ATS-friendly formatting
5. DO NOT invent specific numbers, dates, or companies
6. Keep all factual information accurate
7. Enhance professional philosophy to be more impactful
8. Improve skill descriptions to be more specific

Return the enhanced data in the same JSON structure provided."""),
            ("user", """Original text: {original_text}

Extracted data: {extracted_data}

Enhance this profile for maximum professional impact while maintaining accuracy.""")
        ])
        
        try:
            chain = enhancement_prompt | self.llm
            response = await chain.ainvoke({
                "original_text": original_text,
                "extracted_data": json.dumps(extracted_data, indent=2)
            })
            
            content = response.content
            
            # Extract JSON
            if "```json" in content:
                json_start = content.find("```json") + 7
                json_end = content.find("```", json_start)
                content = content[json_start:json_end].strip()
            elif "```" in content:
                json_start = content.find("```") + 3
                json_end = content.find("```", json_start)
                content = content[json_start:json_end].strip()
            
            enhanced = json.loads(content)
            logger.info("✅ Content enhancement successful")
            return enhanced
            
        except Exception as e:
            logger.error(f"❌ Content enhancement failed: {e}")
            return extracted_data  # Return original if enhancement fails
    
    async def generate_professional_summary(self, data: Dict[str, Any]) -> str:
        """Use GPT-4 to generate a professional CV summary"""
        
        summary_prompt = ChatPromptTemplate.from_messages([
            ("system", """You are an expert CV writer for banking and finance executives.

Generate a complete, polished CV in this EXACT format:

## [FULL NAME IN UPPERCASE]

**[Job Title] – [Industry]**
📞 [Phone] | ✉️ [Email] | 🌍 [City, Country]

---

### **PROFESSIONAL SUMMARY**

[Write 4 paragraphs:
1. Overview with years of experience and core expertise
2. Current role achievements and responsibilities
3. Previous experience highlights and key contributions
4. Recognition, professional approach, and future vision]

---

### **CORE COMPETENCIES**

- [Competency 1]
- [Competency 2]
- [Competency 3]
[... list all skills]

---

### **PROFESSIONAL EXPERIENCE**

**[Company Name] – [Location]**
**[Position Title]** | *[Start Year] – [Present/End Year]*

- [Achievement/Responsibility with action verb and impact]
- [Quantified result where realistic]
- [Strategic contribution]
- [Team collaboration or leadership]
- [Compliance or risk management]
- [Performance monitoring]

[Repeat for each position]

---

### **EDUCATION**

**[Full Degree Name]**
*[Institution Name] – [Location] ([Graduation Year])*

---

### **CERTIFICATIONS**

- [Certification Name] ([Status])
- [Certification Name]

---

### **PROFESSIONAL PHILOSOPHY**

[2-3 sentences capturing professional values, approach, and vision]

---

### **LANGUAGES**

- [Language] – [Proficiency Level]
- [Language] – [Proficiency Level]

---

### **CONTACT**

📞 [Phone]
✉️ [Email]
🌍 [City, Country]

Requirements:
- Use professional banking/finance terminology
- Write in executive tone
- Use action verbs (Managed, Structured, Analyzed, Developed, etc.)
- Make it ATS-friendly
- If information is missing, use appropriate placeholders
- Keep it realistic and credible"""),
            ("user", "Generate a professional CV from this profile data:\n\n{profile_data}")
        ])
        
        try:
            chain = summary_prompt | self.llm
            response = await chain.ainvoke({
                "profile_data": json.dumps(data, indent=2)
            })
            
            cv_text = response.content
            logger.info("✅ CV generation successful")
            return cv_text
            
        except Exception as e:
            logger.error(f"❌ CV generation failed: {e}")
            return None
    
    async def generate_follow_up_questions(self, missing_fields: List[str], context: Dict[str, Any]) -> List[str]:
        """Use GPT-4 to generate contextual follow-up questions"""
        
        question_prompt = ChatPromptTemplate.from_messages([
            ("system", """You are an expert career consultant conducting a professional interview.

Generate SHORT, DIRECT follow-up questions for missing information.

Rules:
1. Keep questions brief and specific
2. Ask only for essential missing information
3. Be professional and respectful
4. Consider the context of what's already known
5. Prioritize: name, contact info, education, certifications, languages
6. Maximum 1 sentence per question"""),
            ("user", """Missing fields: {missing_fields}

Known information context: {context}

Generate 3-5 follow-up questions.""")
        ])
        
        try:
            chain = question_prompt | self.llm
            response = await chain.ainvoke({
                "missing_fields": ", ".join(missing_fields),
                "context": json.dumps(context, indent=2)
            })
            
            questions_text = response.content
            # Parse questions (assume they're in a list or numbered)
            questions = [q.strip() for q in questions_text.split('\n') if q.strip() and (q.strip()[0].isdigit() or q.strip().startswith('-'))]
            questions = [re.sub(r'^\d+[\.)]\s*', '', q).replace('- ', '') for q in questions]
            
            logger.info(f"✅ Generated {len(questions)} follow-up questions")
            return questions[:5]  # Return max 5
            
        except Exception as e:
            logger.error(f"❌ Question generation failed: {e}")
            return []
    
    async def generate_summary_paragraph(self, cv_data: Dict[str, Any]) -> str:
        """Generate a concise professional summary paragraph from CV data"""
        
        summary_prompt = ChatPromptTemplate.from_messages([
            ("system", """You are an expert CV writer for banking and finance professionals.

Generate a compelling professional summary paragraph (3-5 sentences) that:
1. Opens with years of experience and current/most recent role
2. Highlights key areas of expertise and core competencies
3. Mentions notable achievements or specializations
4. Conveys professional value proposition

Write in third person, past/present tense. Be concise, impactful, and ATS-friendly.
Use executive-level language appropriate for banking and finance sector."""),
            ("user", """Generate a professional summary paragraph based on this CV data:

Personal Info: {personal_info}
Current Position: {current_position}
Work Experience: {experience}
Education: {education}
Skills: {skills}
Languages: {languages}
Certifications: {certifications}

Write ONLY the summary paragraph, no headings or formatting.""")
        ])
        
        try:
            # Prepare data for prompt
            personal_info = cv_data.get('personal_info', {})
            current_position = cv_data.get('current_position', {})
            
            # Handle both work_experience (list) and experience (dict) formats
            work_experience = cv_data.get('work_experience', [])
            experience_obj = cv_data.get('experience', {})
            if not work_experience and experience_obj:
                # Convert experience dict format to work_experience list
                previous_positions = experience_obj.get('previous_positions', []) if isinstance(experience_obj, dict) else []
                work_experience = previous_positions
            
            # Handle both education list and dict formats
            education = cv_data.get('education', [])
            if isinstance(education, dict):
                # Convert single dict to list
                education = [education] if any(education.values()) else []
            
            skills = cv_data.get('skills', [])
            languages = cv_data.get('languages', [])
            certifications = cv_data.get('certifications', [])
            
            chain = summary_prompt | self.llm
            response = await chain.ainvoke({
                "personal_info": json.dumps(personal_info, indent=2),
                "current_position": json.dumps(current_position, indent=2),
                "experience": json.dumps(work_experience[:3], indent=2) if work_experience else "[]",  # Top 3 positions
                "education": json.dumps(education, indent=2),
                "skills": ", ".join(skills[:10]) if skills else "N/A",  # Top 10 skills
                "languages": json.dumps(languages, indent=2),
                "certifications": json.dumps(certifications, indent=2)
            })
            
            summary = response.content.strip()
            logger.info(f"✅ Generated professional summary ({len(summary)} chars)")
            return summary
            
        except Exception as e:
            logger.error(f"❌ Summary generation failed: {e}")
            return ""


class ProfessionalProfileAssistant:
    """
    LLM-Enhanced Professional Profile Assistant for Banking & Finance
    Uses OpenAI GPT-4 for intelligent extraction, enhancement, and generation
    """
    
    def __init__(self, use_llm: bool = True):
        """Initialize with optional LLM integration"""
        self.use_llm = use_llm and LLM_AVAILABLE
        self.llm = None
        self.llm_extractor = None
        
        if self.use_llm:
            try:
                # Use gpt-4o for higher token limits (supports up to 16,384 completion tokens)
                model_name = settings.openai_model
                max_completion_tokens = 10000  # Set to 10000 as requested
                
                # Adjust max_tokens based on model
                if "gpt-4-turbo-preview" in model_name or "gpt-4-0125-preview" in model_name:
                    max_completion_tokens = 4096  # Legacy models max limit
                    logger.warning(f"⚠️ Model {model_name} only supports 4096 tokens. Consider using gpt-4o for higher limits.")
                
                self.llm = ChatOpenAI(
                    openai_api_key=settings.openai_api_key,
                    model=model_name,
                    temperature=0.3,
                    max_tokens=max_completion_tokens
                )
                self.llm_extractor = LLMProfileExtractor(self.llm)
                logger.info(f"✅ OpenAI {model_name} initialized with max_tokens={max_completion_tokens}")
            except Exception as e:
                logger.warning(f"⚠️ LLM initialization failed: {e}")
                self.use_llm = False
    
    async def analyze_profile_text_async(self, text: str, use_llm: bool = None) -> Dict[str, Any]:
        """
        Async version: Analyze professional text and extract structured data
        
        Args:
            text: Professional description text
            use_llm: Override default LLM usage
            
        Returns:
            Dictionary with extracted_data, missing_information, completeness_score
        """
        should_use_llm = use_llm if use_llm is not None else self.use_llm
        
        if should_use_llm and self.llm_extractor:
            try:
                # Use async LLM extraction directly
                extracted = await self.llm_extractor.extract_structured_data(text)
                logger.debug(f"🔍 Raw LLM output: {extracted}")
                
                if extracted:
                    # Transform LLM output to expected format
                    extracted_data = self._transform_llm_output(extracted, text)
                    logger.debug(f"🔄 Transformed data - personal_info: {extracted_data.get('personal_info')}")
                else:
                    # Fallback to regex
                    logger.warning("⚠️ LLM returned empty/null, using regex fallback")
                    extracted_data = self._regex_extraction(text)
            except Exception as e:
                logger.error(f"❌ LLM extraction failed: {e}. Using regex fallback.")
                extracted_data = self._regex_extraction(text)
        else:
            extracted_data = self._regex_extraction(text)
        
        # Calculate completeness
        missing_info = self._identify_missing_information(extracted_data)
        completeness = self._calculate_completeness(extracted_data)
        
        return {
            'extracted_data': extracted_data,
            'missing_information': missing_info,
            'completeness_score': completeness
        }
    
    async def generate_professional_summary_async(self, cv_data: Dict[str, Any]) -> str:
        """
        Async version: Generate professional summary paragraph from CV data
        
        Args:
            cv_data: Complete CV data dictionary
            
        Returns:
            Professional summary paragraph string
        """
        if self.use_llm and self.llm_extractor:
            try:
                summary = await self.llm_extractor.generate_summary_paragraph(cv_data)
                return summary
            except Exception as e:
                logger.error(f"❌ Summary generation failed: {e}")
                return ""
        return ""
    
    def analyze_profile_text(self, text: str, use_llm: bool = None) -> Dict[str, Any]:
        """
        Analyze professional text and extract structured data
        
        Args:
            text: Professional description text
            use_llm: Override default LLM usage
            
        Returns:
            Dictionary with extracted_data, missing_information, completeness_score
        """
        should_use_llm = use_llm if use_llm is not None else self.use_llm
        
        if should_use_llm and self.llm_extractor:
            try:
                # Use async LLM extraction
                import asyncio
                loop = asyncio.new_event_loop()
                asyncio.set_event_loop(loop)
                extracted = loop.run_until_complete(self.llm_extractor.extract_structured_data(text))
                loop.close()
                
                if extracted:
                    # Transform LLM output to expected format
                    extracted_data = self._transform_llm_output(extracted, text)
                else:
                    # Fallback to regex
                    extracted_data = self._regex_extraction(text)
            except Exception as e:
                logger.error(f"❌ LLM extraction failed: {e}. Using regex fallback.")
                extracted_data = self._regex_extraction(text)
        else:
            extracted_data = self._regex_extraction(text)
        
        # Calculate completeness
        missing_info = self._identify_missing_information(extracted_data)
        completeness = self._calculate_completeness(extracted_data)
        
        return {
            'extracted_data': extracted_data,
            'missing_information': missing_info,
            'completeness_score': completeness
        }
    
    def generate_professional_summary(self, profile_data: Dict[str, Any], use_llm: bool = None) -> str:
        """
        Generate professional CV summary
        
        Args:
            profile_data: Extracted profile data
            use_llm: Override default LLM usage
            
        Returns:
            Formatted CV text
        """
        should_use_llm = use_llm if use_llm is not None else self.use_llm
        
        if should_use_llm and self.llm_extractor:
            try:
                import asyncio
                loop = asyncio.new_event_loop()
                asyncio.set_event_loop(loop)
                cv_text = loop.run_until_complete(self.llm_extractor.generate_professional_summary(profile_data))
                loop.close()
                
                if cv_text:
                    return cv_text
            except Exception as e:
                logger.error(f"❌ LLM CV generation failed: {e}. Using template.")
        
        # Fallback to template-based generation
        return self._template_based_summary(profile_data)
    
    def enhance_profile_data(self, extracted_data: Dict[str, Any], original_text: str) -> Dict[str, Any]:
        """
        Enhance extracted data using LLM
        
        Args:
            extracted_data: Raw extracted data
            original_text: Original professional description
            
        Returns:
            Enhanced profile data
        """
        if self.use_llm and self.llm_extractor:
            try:
                import asyncio
                loop = asyncio.new_event_loop()
                asyncio.set_event_loop(loop)
                enhanced = loop.run_until_complete(
                    self.llm_extractor.enhance_content(extracted_data, original_text)
                )
                loop.close()
                return enhanced
            except Exception as e:
                logger.error(f"❌ Enhancement failed: {e}")
        
        return extracted_data
    
    def generate_follow_up_question(self, missing_fields: List[str], context: Dict[str, Any] = None) -> str:
        """Generate a smart follow-up question"""
        
        if self.use_llm and self.llm_extractor and missing_fields:
            try:
                import asyncio
                loop = asyncio.new_event_loop()
                asyncio.set_event_loop(loop)
                questions = loop.run_until_complete(
                    self.llm_extractor.generate_follow_up_questions(missing_fields, context or {})
                )
                loop.close()
                
                if questions:
                    return questions[0]
            except Exception as e:
                logger.error(f"❌ Question generation failed: {e}")
        
        # Fallback to simple questions
        return self._get_question_for_field(missing_fields[0] if missing_fields else 'full_name')
    
    # Helper methods (minimal regex extraction as ultimate fallback)
    def _regex_extraction(self, text: str) -> Dict[str, Any]:
        """
        Minimal extraction fallback (only when LLM completely fails)
        Uses simple patterns for basic structure - LLM is primary method
        """
        logger.warning("⚠️ Using minimal regex fallback - LLM extraction failed")
        
        # Return minimal structure with raw text
        # The LLM should handle all real extraction
        return {
            'personal_info': {},
            'current_position': {
                'title': 'Professional',  # Generic placeholder
                'employer': '',
                'start_date': ''
            },
            'experience': {
                'years_of_experience': 0,
                'previous_positions': []
            },
            'skills': [],
            'education': {},
            'certifications': [],
            'languages': [],
            'summary': text[:500] if text else '',
            'raw_text': text
        }
    
    def _transform_llm_output(self, llm_data: Dict[str, Any], original_text: str) -> Dict[str, Any]:
        """Transform LLM output to expected format"""
        return {
            'personal_info': llm_data.get('personal_info', {}),
            'current_position': llm_data.get('current_position', {}),
            'experience': llm_data.get('experience', {}),
            'education': llm_data.get('education', {}),
            'certifications': llm_data.get('certifications', []),
            'projects': llm_data.get('projects', []),
            'skills': llm_data.get('skills', []),
            'languages': llm_data.get('languages', []),
            'goals': {
                'professional_philosophy': llm_data.get('professional_philosophy'),
                'career_objectives': llm_data.get('career_goals')
            },
            'raw_text': original_text
        }
    
    def _template_based_summary(self, profile_data: Dict[str, Any]) -> str:
        """Template-based CV generation (fallback)"""
        # Use existing template generation
        sections = []
        
        # Header
        personal = profile_data.get('personal_info') or {}
        current_pos = profile_data.get('current_position') or {}
        
        name = personal.get('full_name') or personal.get('name') or 'PROFESSIONAL NAME'
        sections.append(f"## {name.upper()}\n")
        
        job_title = current_pos.get('job_title') or current_pos.get('title') or 'Professional'
        sections.append(f"**{job_title} – Corporate Banking**")
        
        phone = personal.get('phone') or '+XXX-XX-XXX-XXXX'
        email = personal.get('email') or 'email@example.com'
        location = personal.get('location') or 'City, Country'
        sections.append(f"📞 {phone} | ✉️ {email} | 🌍 {location}\n")
        sections.append("---\n")
        
        return '\n'.join(sections)
    
    def _identify_missing_information(self, data: Dict[str, Any]) -> List[str]:
        """Identify missing fields"""
        missing = []
        
        personal = data.get('personal_info', {})
        if not personal.get('full_name'): missing.append('full_name')
        if not personal.get('email'): missing.append('email')
        if not personal.get('phone'): missing.append('phone')
        if not personal.get('location'): missing.append('location')
        
        current = data.get('current_position', {})
        if not current.get('job_title'): missing.append('current_job_title')
        if not current.get('organization'): missing.append('current_organization')
        
        exp = data.get('experience', {})
        if not exp.get('years_experience'): missing.append('years_of_experience')
        if not exp.get('previous_positions'): missing.append('previous_positions')
        
        # Handle education as either list or dict
        edu = data.get('education', [])
        if isinstance(edu, list):
            if not edu or len(edu) == 0:
                missing.append('education_degree')
                missing.append('education_institution')
            else:
                # Check if any education entry has degree and institution
                has_degree = any(e.get('degree') for e in edu if isinstance(e, dict))
                has_institution = any(e.get('institution') for e in edu if isinstance(e, dict))
                if not has_degree: missing.append('education_degree')
                if not has_institution: missing.append('education_institution')
        elif isinstance(edu, dict):
            if not edu.get('degree'): missing.append('education_degree')
            if not edu.get('institution'): missing.append('education_institution')
        else:
            missing.append('education_degree')
            missing.append('education_institution')
        
        if not data.get('certifications'): missing.append('certifications')
        if not data.get('skills'): missing.append('key_skills')
        if not data.get('languages'): missing.append('languages')
        
        return missing
    
    def _calculate_completeness(self, data: Dict[str, Any]) -> float:
        """Calculate profile completeness percentage"""
        total_fields = 14
        filled_fields = 0
        
        personal = data.get('personal_info', {})
        for field in ['full_name', 'email', 'phone', 'location']:
            if personal.get(field): filled_fields += 1
        
        current = data.get('current_position', {})
        for field in ['job_title', 'organization']:
            if current.get(field): filled_fields += 1
        
        exp = data.get('experience', {})
        if exp.get('years_experience'): filled_fields += 1
        if exp.get('previous_positions'): filled_fields += 1
        
        edu = data.get('education', {})
        for field in ['degree', 'institution']:
            if edu.get(field): filled_fields += 1
        
        if data.get('certifications'): filled_fields += 1
        if data.get('skills'): filled_fields += 1
        if data.get('languages'): filled_fields += 1
        if data.get('goals', {}).get('professional_philosophy'): filled_fields += 1
        
        return round((filled_fields / total_fields) * 100, 1)
    
    def _get_question_for_field(self, field: str) -> str:
        """Get default question for a field"""
        questions = {
            'full_name': 'What is your full name?',
            'email': 'What is your professional email address?',
            'phone': 'What is your contact phone number?',
            'location': 'What is your current location? (City, Country)',
            'languages': 'What languages do you speak and at what proficiency level?',
            'certifications': 'Do you have any professional certifications?',
            'education_degree': 'What degree did you earn?',
            'education_institution': 'Which university or institution did you attend?'
        }
        return questions.get(field, f'Please provide information about: {field}')
    
    def generate_cv_json(self, profile_data: Dict[str, Any]) -> Dict[str, Any]:
        """Generate JSON output for ATS/database"""
        personal = profile_data.get('personal_info', {})
        current_pos = profile_data.get('current_position', {})
        exp = profile_data.get('experience', {})
        education = profile_data.get('education', {})
        
        return {
            "name": personal.get('full_name', ''),
            "title": current_pos.get('job_title', ''),
            "employer": current_pos.get('organization', ''),
            "years_of_experience": exp.get('years_experience', 0),
            "previous_positions": exp.get('previous_positions', []),
            "skills": profile_data.get('skills', []),
            "education": {
                "degree": education.get('degree', ''),
                "field_of_study": education.get('field_of_study', ''),
                "institution": education.get('institution', ''),
                "year": education.get('graduation_year', '')
            },
            "certifications": profile_data.get('certifications', []),
            "languages": profile_data.get('languages', []),
            "contact": {
                "phone": personal.get('phone', ''),
                "email": personal.get('email', ''),
                "location": personal.get('location', '')
            },
            "summary": profile_data.get('goals', {}).get('career_objectives', ''),
            "philosophy": profile_data.get('goals', {}).get('professional_philosophy', '')
        }


# Create global instance for easy import
profile_assistant = ProfessionalProfileAssistant()
