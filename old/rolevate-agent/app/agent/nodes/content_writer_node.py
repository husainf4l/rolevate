"""
Content Writer Node - Convert short inputs into polished CV content
Transforms basic information into professional, ATS-friendly descriptions
"""
import asyncio
from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field
from loguru import logger
import json

from app.config import settings
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate


class ContentWriter:
    """Professional CV content enhancement service"""
    
    def __init__(self):
        self.llm = ChatOpenAI(
            model=settings.openai_model,
            temperature=0.7,  # Balanced creativity for professional writing
            openai_api_key=settings.openai_api_key
        )
        
        # Industry-specific keywords for ATS optimization
        self.industry_keywords = {
            "technology": ["engineered", "developed", "implemented", "optimized", "architected", 
                          "deployed", "automated", "scaled", "integrated", "delivered"],
            "management": ["led", "managed", "coordinated", "supervised", "directed", 
                          "strategized", "executed", "facilitated", "mentored", "delegated"],
            "sales": ["achieved", "exceeded", "generated", "negotiated", "cultivated", 
                     "converted", "prospected", "closed", "drove", "accelerated"],
            "marketing": ["launched", "promoted", "amplified", "engaged", "analyzed", 
                         "optimized", "created", "branded", "targeted", "measured"],
            "finance": ["analyzed", "forecasted", "budgeted", "audited", "reconciled", 
                       "modeled", "assessed", "reported", "managed", "optimized"],
            "healthcare": ["treated", "diagnosed", "administered", "monitored", "documented", 
                          "coordinated", "educated", "implemented", "ensured", "maintained"],
            "education": ["taught", "developed", "facilitated", "mentored", "assessed", 
                         "designed", "implemented", "guided", "inspired", "evaluated"]
        }
    
    def detect_industry(self, text: str) -> str:
        """Detect industry based on job description"""
        text_lower = text.lower()
        
        industry_indicators = {
            "technology": ["software", "developer", "engineer", "programming", "code", "api", 
                          "database", "system", "application", "tech", "IT"],
            "management": ["manager", "director", "supervisor", "team lead", "executive", 
                          "coordinator", "administrator", "head of"],
            "sales": ["sales", "account", "business development", "revenue", "client", 
                     "customer", "prospect", "deal", "quota"],
            "marketing": ["marketing", "brand", "campaign", "content", "social media", 
                         "advertising", "promotion", "digital"],
            "finance": ["finance", "accounting", "analyst", "budget", "financial", "audit", 
                       "investment", "treasury", "controller"],
            "healthcare": ["healthcare", "medical", "nurse", "doctor", "patient", "clinical", 
                          "hospital", "treatment", "therapy"],
            "education": ["teacher", "professor", "instructor", "education", "curriculum", 
                         "student", "academic", "training", "learning"]
        }
        
        for industry, keywords in industry_indicators.items():
            if any(keyword in text_lower for keyword in keywords):
                return industry
        
        return "general"
    
    async def enhance_job_description(self, raw_description: str, job_context: Dict[str, Any]) -> str:
        """Transform basic job description into professional content"""
        
        industry = self.detect_industry(f"{job_context.get('job_title', '')} {raw_description}")
        action_verbs = self.industry_keywords.get(industry, self.industry_keywords["general"])
        
        prompt = ChatPromptTemplate.from_template("""
        You are an expert CV writer specializing in creating ATS-friendly, professional job descriptions.
        
        Transform this basic job description into polished, professional content:
        
        Raw Input: "{raw_description}"
        
        Job Context:
        - Title: {job_title}
        - Company: {company}
        - Industry: {industry}
        
        Guidelines:
        1. Start with strong action verbs: {action_verbs}
        2. Include quantifiable achievements where possible
        3. Use industry-relevant keywords for ATS optimization
        4. Keep it concise but impactful (2-3 sentences max)
        5. Focus on results and value delivered
        6. Use professional, confident tone
        7. Avoid generic phrases like "responsible for"
        
        Examples of good transformations:
        - "Develop backend APIs" → "Engineered and deployed robust backend APIs serving 10M+ daily requests"
        - "Manage team" → "Led cross-functional team of 8 engineers, improving delivery velocity by 40%"
        - "Handle customer support" → "Resolved 95% of customer inquiries within 24 hours, achieving 4.8/5 satisfaction rating"
        
        Return only the enhanced description (no explanations):
        """)
        
        try:
            # Check if we have a valid OpenAI API key
            if not settings.openai_api_key or settings.openai_api_key == "fake-key":
                return raw_description
                
            messages = prompt.format_messages(
                raw_description=raw_description,
                job_title=job_context.get("job_title", ""),
                company=job_context.get("company", ""),
                industry=industry,
                action_verbs=", ".join(action_verbs[:5])
            )
            response = await self.llm.ainvoke(messages)
            
            if hasattr(response, 'content'):
                enhanced = response.content.strip()
            elif isinstance(response, str):
                enhanced = response.strip()
            else:
                # Handle FieldInfo or other object types
                enhanced = str(response).strip()
            logger.info(f"Enhanced description from '{raw_description[:30]}...' to '{enhanced[:50]}...'")
            return enhanced
            
        except Exception as e:
            logger.error(f"Enhancement failed: {e}")
            return raw_description
    
    async def enhance_professional_summary(self, raw_summary: str, cv_context: Dict[str, Any]) -> str:
        """Create compelling professional summary"""
        
        prompt = ChatPromptTemplate.from_template("""
        Create a compelling professional summary based on this input and CV context:
        
        Raw Summary: "{raw_summary}"
        
        CV Context:
        - Experience Count: {experience_count}
        - Key Skills: {key_skills}
        - Industries: {industries}
        
        Requirements:
        1. 2-3 sentences maximum
        2. Start with years of experience if clear
        3. Highlight unique value proposition
        4. Include 2-3 key skills or achievements
        5. End with career aspiration or strength
        6. Professional, confident tone
        7. No clichés or buzzwords
        
        Examples:
        - "Experienced software engineer with 5+ years building scalable web applications. Expertise in Python, React, and cloud architecture, with a track record of improving system performance by 50%+ and leading technical teams. Passionate about creating efficient solutions that drive business growth."
        
        Return only the enhanced summary:
        """)
        
        try:
            # Extract context from CV data
            experiences = cv_context.get("experiences", [])
            skills = cv_context.get("skills", {})
            
            all_skills = []
            for skill_list in skills.values():
                all_skills.extend(skill_list)
            
            industries = list(set([
                self.detect_industry(f"{exp.get('job_title', '')} {exp.get('description', '')}")
                for exp in experiences
            ]))
            
            # Check if we have a valid OpenAI API key
            if not settings.openai_api_key or settings.openai_api_key == "fake-key":
                return raw_summary
                
            messages = prompt.format_messages(
                experience_count=len(experiences),
                key_skills=", ".join(all_skills[:5]) if all_skills else "Various skills",
                industries=", ".join(industries) if industries else "Multiple industries"
            )
            response = await self.llm.ainvoke(messages)
            
            if hasattr(response, 'content'):
                return response.content.strip()
            elif isinstance(response, str):
                return response.strip()
            else:
                # Handle FieldInfo or other object types
                return str(response).strip()
            
        except Exception as e:
            logger.error(f"Summary enhancement failed: {e}")
            return raw_summary
    
    async def enhance_achievement_bullet(self, raw_achievement: str, context: Dict[str, Any]) -> str:
        """Transform basic achievement into quantified bullet point"""
        
        prompt = ChatPromptTemplate.from_template("""
        Transform this achievement into a quantified, professional bullet point:
        
        Raw: "{raw_achievement}"
        Context: {context}
        
        Guidelines:
        1. Start with strong action verb
        2. Add specific metrics if possible (%, $, numbers, timeframes)
        3. Show business impact
        4. Keep under 25 words
        5. Professional tone
        
        Examples:
        - "Improved system" → "Optimized database queries, reducing response time by 65% and improving user experience"
        - "Led project" → "Led 6-month project that delivered new feature used by 80% of active users"
        
        Return only the enhanced bullet point:
        """)
        
        try:
            # Check if we have a valid OpenAI API key
            if not settings.openai_api_key or settings.openai_api_key == "fake-key":
                return raw_achievement
                
            messages = prompt.format_messages(
                raw_achievement=raw_achievement,
                context=json.dumps(context, indent=2)
            )
            response = await self.llm.ainvoke(messages)
            
            if hasattr(response, 'content'):
                return response.content.strip()
            elif isinstance(response, str):
                return response.strip()
            else:
                # Handle FieldInfo or other object types
                return str(response).strip()
            
        except Exception as e:
            logger.error(f"Achievement enhancement failed: {e}")
            return raw_achievement
    
    async def enhance_cv_content(self, cv_data: Dict[str, Any]) -> Dict[str, Any]:
        """Main method to enhance all CV content"""
        
        logger.info("🖊️ Starting content enhancement process...")
        enhanced_cv = cv_data.copy()
        
        try:
            # Enhance professional summary
            if enhanced_cv.get("summary"):
                enhanced_cv["summary"] = await self.enhance_professional_summary(
                    enhanced_cv["summary"], enhanced_cv
                )
            
            # Enhance experience descriptions
            if enhanced_cv.get("experiences"):
                for i, experience in enumerate(enhanced_cv["experiences"]):
                    if experience.get("description"):
                        enhanced_cv["experiences"][i]["description"] = await self.enhance_job_description(
                            experience["description"], experience
                        )
                    
                    # Enhance achievements if they exist
                    if experience.get("achievements"):
                        enhanced_achievements = []
                        for achievement in experience["achievements"]:
                            if isinstance(achievement, str):
                                enhanced_achievement = await self.enhance_achievement_bullet(
                                    achievement, experience
                                )
                                enhanced_achievements.append(enhanced_achievement)
                            else:
                                enhanced_achievements.append(achievement)
                        enhanced_cv["experiences"][i]["achievements"] = enhanced_achievements
            
            # Enhance project descriptions
            if enhanced_cv.get("projects"):
                for i, project in enumerate(enhanced_cv["projects"]):
                    if project.get("description"):
                        enhanced_cv["projects"][i]["description"] = await self.enhance_job_description(
                            project["description"], {
                                "job_title": project.get("name", "Project"),
                                "company": "Project Work"
                            }
                        )
            
            logger.success("✅ Content enhancement completed")
            return enhanced_cv
            
        except Exception as e:
            logger.error(f"❌ Content enhancement failed: {e}")
            return cv_data


async def content_writer_node(state: Dict[str, Any]) -> Dict[str, Any]:
    """
    LangGraph node for professional content enhancement
    
    Input: state with 'cv_memory' containing raw CV data
    Output: state with enhanced 'cv_memory' containing polished content
    """
    logger.info("✍️ Starting professional content writing...")
    
    try:
        writer = ContentWriter()
        
        # Get CV data from state
        cv_memory = state.get("cv_memory", {})
        
        if not cv_memory:
            logger.warning("No CV data found for content enhancement")
            state["processing_step"] = "content_writing_skipped"
            return state
        
        # Enhance content
        enhanced_cv = await writer.enhance_cv_content(cv_memory)
        
        # Update state
        state["cv_memory"] = enhanced_cv
        state["processing_step"] = "content_writing_complete"
        
        # Track enhancement metrics
        state["enhancement_stats"] = {
            "experiences_enhanced": len(enhanced_cv.get("experiences", [])),
            "summary_enhanced": bool(enhanced_cv.get("summary")),
            "projects_enhanced": len(enhanced_cv.get("projects", [])),
        }
        
        logger.success("✅ Content writing completed successfully")
        
        return state
        
    except Exception as e:
        logger.error(f"❌ Content writing failed: {e}")
        state["processing_step"] = f"content_writing_error: {str(e)}"
        return state


# Input/Output Schemas for LangGraph
class ContentWriterInput(BaseModel):
    """Input schema for content writer node"""
    cv_memory: Dict[str, Any] = Field(..., description="CV data to enhance")
    enhancement_level: str = Field(default="professional", description="Level of enhancement (basic/professional/executive)")
    target_industry: Optional[str] = Field(None, description="Target industry for keyword optimization")


class ContentWriterOutput(BaseModel):
    """Output schema for content writer node"""
    cv_memory: Dict[str, Any] = Field(..., description="Enhanced CV data with professional content")
    processing_step: str = Field(..., description="Processing status")
    enhancement_stats: Dict[str, Any] = Field(default_factory=dict, description="Enhancement statistics")
    word_count: int = Field(default=0, description="Total word count after enhancement")


# Node metadata for LangGraph
CONTENT_WRITER_NODE_METADATA = {
    "name": "content_writer_node", 
    "description": "Transform basic CV content into professional, ATS-optimized descriptions",
    "input_schema": ContentWriterInput,
    "output_schema": ContentWriterOutput,
    "dependencies": ["openai", "langchain"],
    "timeout": 45,
    "retry_count": 2
}