"""
Draft Generation Layer - Expands short text into professional, ATS-friendly CV content
Uses GPT-4 to enhance descriptions, achievements, and summaries
"""
from typing import Dict, Any, List, Optional
from loguru import logger
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, SystemMessage
from app.config import settings
import re


class DraftGenerator:
    """Generate professional CV content using AI"""
    
    def __init__(self):
        import os
        os.environ["OPENAI_API_KEY"] = settings.openai_api_key
        self.llm = ChatOpenAI(
            model=settings.openai_model,
            temperature=0.7  # Slightly higher for more creative content
        )
        
        # ATS-friendly keywords by industry/role
        self.ats_keywords = {
            "software_engineer": [
                "developed", "implemented", "designed", "architected", "optimized",
                "collaborated", "delivered", "maintained", "scaled", "automated",
                "debugged", "tested", "deployed", "integrated", "enhanced"
            ],
            "data_scientist": [
                "analyzed", "modeled", "predicted", "visualized", "extracted",
                "processed", "cleaned", "interpreted", "identified", "forecasted",
                "segmented", "clustered", "classified", "validated", "measured"
            ],
            "project_manager": [
                "managed", "coordinated", "led", "planned", "executed", "delivered",
                "facilitated", "communicated", "organized", "tracked", "monitored",
                "prioritized", "negotiated", "resolved", "improved"
            ],
            "marketing": [
                "created", "launched", "promoted", "increased", "generated",
                "engaged", "converted", "optimized", "analyzed", "targeted",
                "branded", "positioned", "campaigned", "measured", "grew"
            ]
        }
    
    def detect_role_category(self, position: str) -> str:
        """Detect role category for appropriate keyword selection"""
        position_lower = position.lower()
        
        if any(word in position_lower for word in ["engineer", "developer", "programmer"]):
            return "software_engineer"
        elif any(word in position_lower for word in ["data", "analyst", "scientist"]):
            return "data_scientist"
        elif any(word in position_lower for word in ["manager", "lead", "director"]):
            return "project_manager"
        elif any(word in position_lower for word in ["marketing", "sales", "growth"]):
            return "marketing"
        else:
            return "software_engineer"  # Default
    
    async def enhance_experience_description(self, experience: Dict[str, Any]) -> Dict[str, Any]:
        """Enhance work experience descriptions"""
        
        company = experience.get("company", "")
        position = experience.get("position", "")
        raw_description = experience.get("description", "")
        
        # Detect role category for ATS keywords
        role_category = self.detect_role_category(position)
        relevant_keywords = self.ats_keywords.get(role_category, self.ats_keywords["software_engineer"])
        
        system_prompt = f"""You are an expert CV writer specializing in creating ATS-friendly, professional job descriptions.

Transform the user's input into 3-5 professional bullet points that:
1. Start with strong action verbs: {', '.join(relevant_keywords[:10])}
2. Include quantifiable achievements where possible
3. Use ATS-friendly keywords for {role_category.replace('_', ' ')} roles
4. Focus on impact and results, not just duties
5. Keep each bullet point to 1-2 lines maximum

Format as a JSON array of strings:
["• Enhanced system performance by implementing optimization strategies, resulting in 40% faster response times",
 "• Collaborated with cross-functional teams to deliver 5 major features ahead of schedule",
 "• Mentored 3 junior developers and conducted code reviews to maintain high code quality standards"]

Input context:
- Position: {position}
- Company: {company}
- Role Category: {role_category.replace('_', ' ').title()}

Make it professional, specific, and impactful. Avoid generic statements."""

        try:
            response = await self.llm.ainvoke([
                SystemMessage(content=system_prompt),
                HumanMessage(content=f"Raw description: {raw_description}")
            ])
            
            import json
            enhanced_bullets = json.loads(response.content)
            
            # Update the experience with enhanced description
            enhanced_experience = experience.copy()
            enhanced_experience["description"] = "\n".join(enhanced_bullets)
            enhanced_experience["achievements"] = enhanced_bullets
            
            return enhanced_experience
            
        except Exception as e:
            logger.warning(f"Failed to enhance experience description: {e}")
            return experience
    
    async def enhance_education_description(self, education: Dict[str, Any]) -> Dict[str, Any]:
        """Enhance education descriptions"""
        
        institution = education.get("institution", "")
        degree = education.get("degree", "")
        field_of_study = education.get("field_of_study", "")
        
        system_prompt = """You are an expert CV writer. Create a professional education description that includes:
1. Relevant coursework (2-4 courses)
2. Academic achievements or projects
3. Skills developed
4. Any notable accomplishments (honors, GPA if 3.5+, etc.)

Format as a JSON object:
{
  "description": "Comprehensive curriculum covering data structures, algorithms, and software engineering principles. Completed capstone project developing a machine learning application.",
  "relevant_courses": ["Data Structures & Algorithms", "Machine Learning", "Database Systems", "Software Engineering"],
  "achievements": ["Dean's List (2018-2020)", "Computer Science Society Vice President"]
}

Keep it professional and relevant to the field of study."""

        try:
            response = await self.llm.ainvoke([
                SystemMessage(content=system_prompt),
                HumanMessage(content=f"Institution: {institution}, Degree: {degree}, Field: {field_of_study}")
            ])
            
            import json
            enhanced_data = json.loads(response.content)
            
            # Update education with enhanced content
            enhanced_education = education.copy()
            enhanced_education.update(enhanced_data)
            
            return enhanced_education
            
        except Exception as e:
            logger.warning(f"Failed to enhance education description: {e}")
            return education
    
    async def generate_professional_summary(self, cv_memory: Dict[str, Any]) -> str:
        """Generate a professional summary based on CV data"""
        
        personal_info = cv_memory.get("personal_info", {})
        experiences = cv_memory.get("experiences", [])
        education = cv_memory.get("education", [])
        skills = cv_memory.get("skills", [])
        
        # Calculate years of experience
        years_experience = len(experiences) * 2  # Rough estimate
        
        # Extract key skills
        skill_names = [skill.get("name", "") for skill in skills if isinstance(skill, dict)]
        skill_names = skill_names[:8]  # Top 8 skills
        
        # Extract positions
        positions = [exp.get("position", "") for exp in experiences if isinstance(exp, dict)]
        
        system_prompt = f"""Create a professional CV summary (2-3 sentences, ~80-120 words) that:
1. Highlights the candidate's experience level and key roles
2. Mentions core technical skills and expertise areas
3. Emphasizes value proposition and career achievements
4. Uses strong, confident language
5. Is ATS-optimized with relevant keywords

Format guidelines:
- Start with years of experience or professional title
- Include 3-5 most relevant technical skills
- End with a value statement about impact/goals

Return only the summary text, no additional formatting."""

        context = f"""
Years of Experience: ~{years_experience} years
Key Positions: {', '.join(positions[:3])}
Technical Skills: {', '.join(skill_names)}
Education Level: {education[0].get('degree', 'Bachelor') if education else 'Bachelor'} degree
"""

        try:
            response = await self.llm.ainvoke([
                SystemMessage(content=system_prompt),
                HumanMessage(content=f"Context: {context}")
            ])
            
            return response.content.strip()
            
        except Exception as e:
            logger.warning(f"Failed to generate summary: {e}")
            return "Experienced professional with strong technical skills and a track record of delivering results in fast-paced environments."
    
    async def enhance_skills_descriptions(self, skills: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Enhance skill descriptions with proficiency levels and categories"""
        
        enhanced_skills = []
        
        # Group skills by category
        skill_categories = {}
        for skill in skills:
            if isinstance(skill, dict):
                category = skill.get("category", "Technical")
                name = skill.get("name", "")
                
                if category not in skill_categories:
                    skill_categories[category] = []
                skill_categories[category].append(skill)
        
        # Enhance each category
        for category, category_skills in skill_categories.items():
            for skill in category_skills:
                enhanced_skill = skill.copy()
                
                # Add proficiency if missing
                if not enhanced_skill.get("proficiency"):
                    skill_name = enhanced_skill.get("name", "").lower()
                    
                    # Simple proficiency assignment based on common patterns
                    if any(advanced in skill_name for advanced in ["python", "javascript", "react", "aws", "sql"]):
                        enhanced_skill["proficiency"] = "Advanced"
                    elif any(intermediate in skill_name for intermediate in ["html", "css", "git", "linux"]):
                        enhanced_skill["proficiency"] = "Intermediate"
                    else:
                        enhanced_skill["proficiency"] = "Proficient"
                
                enhanced_skills.append(enhanced_skill)
        
        return enhanced_skills


async def draft_generation_node(state: Dict[str, Any]) -> Dict[str, Any]:
    """
    Draft Generation Layer - Expands content into professional, ATS-friendly text
    
    Args:
        state: Current agent state with structured CV data
        
    Returns:
        Updated state with enhanced CV content
    """
    logger.info("Draft Generation Layer: Enhancing CV content")
    
    try:
        cv_memory = state.get("cv_memory", {})
        intent = state.get("intent", "")
        
        if not cv_memory:
            return {
                **state,
                "error": "No CV memory provided for content enhancement"
            }
        
        generator = DraftGenerator()
        enhanced_memory = cv_memory.copy()
        
        # Enhance based on what was just added or requested
        if intent == "add_experience" and enhanced_memory.get("experiences"):
            logger.info("Enhancing experience descriptions")
            enhanced_experiences = []
            for exp in enhanced_memory["experiences"]:
                if isinstance(exp, dict):
                    enhanced_exp = await generator.enhance_experience_description(exp)
                    enhanced_experiences.append(enhanced_exp)
                else:
                    enhanced_experiences.append(exp)
            enhanced_memory["experiences"] = enhanced_experiences
        
        elif intent == "add_education" and enhanced_memory.get("education"):
            logger.info("Enhancing education descriptions")
            enhanced_education = []
            for edu in enhanced_memory["education"]:
                if isinstance(edu, dict):
                    enhanced_edu = await generator.enhance_education_description(edu)
                    enhanced_education.append(enhanced_edu)
                else:
                    enhanced_education.append(edu)
            enhanced_memory["education"] = enhanced_education
        
        elif intent == "add_skills" and enhanced_memory.get("skills"):
            logger.info("Enhancing skills descriptions")
            enhanced_skills = await generator.enhance_skills_descriptions(enhanced_memory["skills"])
            enhanced_memory["skills"] = enhanced_skills
        
        elif intent == "add_summary" or (intent == "generate_cv" and not enhanced_memory.get("summary")):
            logger.info("Generating professional summary")
            professional_summary = await generator.generate_professional_summary(enhanced_memory)
            enhanced_memory["summary"] = professional_summary
        
        elif intent == "generate_cv":
            logger.info("Performing comprehensive content enhancement")
            
            # Enhance all sections for final generation
            if enhanced_memory.get("experiences"):
                enhanced_experiences = []
                for exp in enhanced_memory["experiences"]:
                    if isinstance(exp, dict):
                        enhanced_exp = await generator.enhance_experience_description(exp)
                        enhanced_experiences.append(enhanced_exp)
                    else:
                        enhanced_experiences.append(exp)
                enhanced_memory["experiences"] = enhanced_experiences
            
            if enhanced_memory.get("skills"):
                enhanced_skills = await generator.enhance_skills_descriptions(enhanced_memory["skills"])
                enhanced_memory["skills"] = enhanced_skills
            
            if not enhanced_memory.get("summary"):
                professional_summary = await generator.generate_professional_summary(enhanced_memory)
                enhanced_memory["summary"] = professional_summary
        
        logger.success("CV content enhancement completed")
        
        # Generate appropriate response
        enhancement_messages = {
            "add_experience": "Great! I've enhanced your work experience with professional descriptions and quantifiable achievements.",
            "add_education": "Perfect! Your education section now includes relevant coursework and achievements.",
            "add_skills": "Excellent! I've organized your skills by category with proficiency levels.",
            "add_summary": "Your professional summary is now crafted to highlight your key strengths and experience.",
            "generate_cv": "Your CV content has been professionally enhanced and is ready for export!"
        }
        
        assistant_message = enhancement_messages.get(intent, "Content has been enhanced successfully!")
        
        return {
            **state,
            "cv_memory": enhanced_memory,
            "enhanced": True,
            "messages": state.get("messages", []) + [
                {"role": "assistant", "content": assistant_message}
            ]
        }
        
    except Exception as e:
        logger.error(f"Draft generation failed: {e}")
        return {
            **state,
            "error": f"Draft generation failed: {str(e)}"
        }