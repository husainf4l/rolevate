"""
Output Optimization Layer - Final grammar correction, section ordering, and PDF optimization
Applies final improvements and ensures professional quality output
"""
from typing import Dict, Any, List, Optional
from pathlib import Path
from loguru import logger
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, SystemMessage
from app.config import settings
import re
import subprocess


class OutputOptimizer:
    """Optimize final CV output for professional quality"""
    
    def __init__(self):
        import os
        os.environ["OPENAI_API_KEY"] = settings.openai_api_key
        self.llm = ChatOpenAI(
            model=settings.openai_model,
            temperature=0
        )
        
        # Define optimal section ordering
        self.section_order = [
            "personal_info",
            "summary", 
            "experiences",
            "education",
            "skills",
            "certifications",
            "languages"
        ]
        
        # Grammar and style patterns to fix
        self.grammar_fixes = [
            (r'\s+', ' '),  # Multiple spaces to single space
            (r'\n\s*\n', '\n'),  # Multiple newlines to single
            (r'([.!?])\s*([a-z])', r'\1 \2'),  # Space after punctuation
            (r'\s+([.!?,:;])', r'\1'),  # Remove space before punctuation
            (r'(\w)\s*-\s*(\w)', r'\1-\2'),  # Fix hyphenation
        ]
    
    async def optimize_grammar_and_style(self, text: str) -> str:
        """Use AI to improve grammar, clarity and professional tone"""
        
        if not text or len(text.strip()) < 10:
            return text
        
        system_prompt = """You are a professional CV editor. Improve the given text by:

1. Correcting any grammar, spelling, or punctuation errors
2. Enhancing clarity and readability
3. Ensuring professional, confident tone
4. Making it more ATS-friendly with action verbs
5. Keeping the same meaning and key information
6. Maintaining bullet point format if present

Rules:
- Keep the same structure (bullets, formatting)
- Don't add new information or achievements
- Use strong action verbs (developed, implemented, led, etc.)
- Ensure parallel structure in bullet points
- Keep it concise and impactful

Return only the improved text, no explanations."""

        try:
            response = await self.llm.ainvoke([
                SystemMessage(content=system_prompt),
                HumanMessage(content=f"Text to improve:\n{text}")
            ])
            
            improved_text = response.content.strip()
            
            # Apply basic grammar fixes
            for pattern, replacement in self.grammar_fixes:
                improved_text = re.sub(pattern, replacement, improved_text)
            
            return improved_text
            
        except Exception as e:
            logger.warning(f"Grammar optimization failed: {e}")
            # Apply basic fixes even if AI fails
            for pattern, replacement in self.grammar_fixes:
                text = re.sub(pattern, replacement, text)
            return text
    
    def optimize_section_order(self, cv_memory: Dict[str, Any]) -> Dict[str, Any]:
        """Optimize the order of CV sections for maximum impact"""
        
        optimized_memory = {}
        
        # Add sections in optimal order
        for section in self.section_order:
            if section in cv_memory and cv_memory[section]:
                optimized_memory[section] = cv_memory[section]
        
        # Add any remaining sections
        for key, value in cv_memory.items():
            if key not in optimized_memory:
                optimized_memory[key] = value
        
        logger.info("CV sections reordered for optimal impact")
        return optimized_memory
    
    async def optimize_experience_descriptions(self, experiences: List[Dict]) -> List[Dict]:
        """Optimize work experience descriptions"""
        
        optimized_experiences = []
        
        for exp in experiences:
            if not isinstance(exp, dict):
                optimized_experiences.append(exp)
                continue
            
            optimized_exp = exp.copy()
            
            # Optimize description
            description = exp.get("description", "")
            if description:
                optimized_description = await self.optimize_grammar_and_style(description)
                optimized_exp["description"] = optimized_description
            
            # Optimize achievements if present
            achievements = exp.get("achievements", [])
            if achievements:
                optimized_achievements = []
                for achievement in achievements:
                    if isinstance(achievement, str):
                        optimized_achievement = await self.optimize_grammar_and_style(achievement)
                        optimized_achievements.append(optimized_achievement)
                    else:
                        optimized_achievements.append(achievement)
                optimized_exp["achievements"] = optimized_achievements
            
            optimized_experiences.append(optimized_exp)
        
        return optimized_experiences
    
    async def optimize_summary(self, summary: str) -> str:
        """Optimize professional summary for impact"""
        
        if not summary:
            return summary
        
        system_prompt = """Optimize this professional summary for maximum impact:

1. Ensure it's 2-3 sentences (80-120 words)
2. Start with years of experience or professional title
3. Highlight key achievements and skills
4. End with value proposition or career goals
5. Use confident, professional language
6. Include relevant keywords for ATS systems
7. Make it compelling and memorable

Return only the optimized summary."""

        try:
            response = await self.llm.ainvoke([
                SystemMessage(content=system_prompt),
                HumanMessage(content=f"Current summary: {summary}")
            ])
            
            optimized_summary = response.content.strip()
            return optimized_summary
            
        except Exception as e:
            logger.warning(f"Summary optimization failed: {e}")
            return await self.optimize_grammar_and_style(summary)
    
    def validate_cv_completeness(self, cv_memory: Dict[str, Any]) -> Dict[str, Any]:
        """Validate CV completeness and provide recommendations"""
        
        validation_result = {
            "is_complete": True,
            "missing_sections": [],
            "recommendations": [],
            "completeness_score": 100
        }
        
        required_sections = {
            "personal_info": "Personal information (name, email, phone)",
            "experiences": "Work experience",
            "skills": "Skills and technologies"
        }
        
        recommended_sections = {
            "summary": "Professional summary",
            "education": "Education background"
        }
        
        # Check required sections
        missing_required = []
        for section, description in required_sections.items():
            if not cv_memory.get(section):
                missing_required.append(description)
                validation_result["is_complete"] = False
        
        # Check recommended sections
        missing_recommended = []
        for section, description in recommended_sections.items():
            if not cv_memory.get(section):
                missing_recommended.append(description)
        
        # Calculate completeness score
        total_sections = len(required_sections) + len(recommended_sections)
        present_sections = total_sections - len(missing_required) - len(missing_recommended)
        validation_result["completeness_score"] = int((present_sections / total_sections) * 100)
        
        # Generate recommendations
        if missing_required:
            validation_result["missing_sections"].extend(missing_required)
            validation_result["recommendations"].append(
                f"Add missing required sections: {', '.join(missing_required)}"
            )
        
        if missing_recommended:
            validation_result["recommendations"].append(
                f"Consider adding: {', '.join(missing_recommended)}"
            )
        
        # Content quality recommendations
        personal_info = cv_memory.get("personal_info", {})
        if not personal_info.get("linkedin") and not personal_info.get("github"):
            validation_result["recommendations"].append(
                "Add LinkedIn profile or GitHub for better visibility"
            )
        
        experiences = cv_memory.get("experiences", [])
        if len(experiences) < 2:
            validation_result["recommendations"].append(
                "Add more work experience entries for better credibility"
            )
        
        skills = cv_memory.get("skills", [])
        if len(skills) < 5:
            validation_result["recommendations"].append(
                "Add more skills to showcase your technical expertise"
            )
        
        return validation_result
    
    def compress_pdf(self, pdf_path: Path) -> Path:
        """Compress PDF file for smaller size"""
        
        try:
            # Try to use Ghostscript for PDF compression
            compressed_path = pdf_path.parent / f"compressed_{pdf_path.name}"
            
            # Ghostscript compression command
            gs_command = [
                "gs",
                "-sDEVICE=pdfwrite",
                "-dCompatibilityLevel=1.4",
                "-dPDFSETTINGS=/screen",
                "-dNOPAUSE",
                "-dQUIET",
                "-dBATCH",
                f"-sOutputFile={compressed_path}",
                str(pdf_path)
            ]
            
            result = subprocess.run(gs_command, capture_output=True, text=True)
            
            if result.returncode == 0 and compressed_path.exists():
                # Check if compression was effective
                original_size = pdf_path.stat().st_size
                compressed_size = compressed_path.stat().st_size
                
                if compressed_size < original_size * 0.8:  # At least 20% reduction
                    logger.info(f"PDF compressed: {original_size} -> {compressed_size} bytes")
                    # Replace original with compressed version
                    compressed_path.replace(pdf_path)
                else:
                    # Compression not effective, remove compressed version
                    compressed_path.unlink()
                    
            return pdf_path
            
        except Exception as e:
            logger.warning(f"PDF compression failed: {e}")
            return pdf_path
    
    def generate_download_url(self, file_path: Path, base_url: str = "http://localhost:8002") -> str:
        """Generate public download URL for the CV file"""
        
        filename = file_path.name
        download_url = f"{base_url}/api/v1/cv/download/{filename}"
        
        return download_url


async def output_optimization_node(state: Dict[str, Any]) -> Dict[str, Any]:
    """
    Output Optimization Layer - Final improvements and quality assurance
    
    Args:
        state: Current agent state with rendered CV
        
    Returns:
        Updated state with optimized CV and download URL
    """
    logger.info("Output Optimization Layer: Optimizing final output")
    
    try:
        cv_memory = state.get("cv_memory", {})
        pdf_path = state.get("pdf_path")
        intent = state.get("intent", "")
        
        if not cv_memory:
            return {
                **state,
                "error": "No CV memory provided for optimization"
            }
        
        optimizer = OutputOptimizer()
        
        # Optimize CV content
        optimized_memory = cv_memory.copy()
        
        # 1. Optimize section order
        optimized_memory = optimizer.optimize_section_order(optimized_memory)
        
        # 2. Optimize summary
        if optimized_memory.get("summary"):
            optimized_summary = await optimizer.optimize_summary(optimized_memory["summary"])
            optimized_memory["summary"] = optimized_summary
        
        # 3. Optimize experience descriptions
        if optimized_memory.get("experiences"):
            optimized_experiences = await optimizer.optimize_experience_descriptions(optimized_memory["experiences"])
            optimized_memory["experiences"] = optimized_experiences
        
        # 4. Validate CV completeness
        validation_result = optimizer.validate_cv_completeness(optimized_memory)
        
        # 5. Compress PDF if available
        if pdf_path and Path(pdf_path).exists():
            pdf_file = Path(pdf_path)
            optimizer.compress_pdf(pdf_file)
            
            # Generate download URL
            download_url = optimizer.generate_download_url(pdf_file)
        else:
            download_url = None
        
        logger.success("CV optimization completed successfully")
        
        # Generate final response based on validation
        if validation_result["is_complete"]:
            if intent == "generate_cv":
                assistant_message = f"🎉 Your professional CV is complete and optimized! (Quality Score: {validation_result['completeness_score']}%)\n\n"
                if download_url:
                    assistant_message += f"📥 Download: {download_url}"
                
                if validation_result["recommendations"]:
                    assistant_message += f"\n\n💡 Suggestions for improvement:\n" + "\n".join(f"• {rec}" for rec in validation_result["recommendations"])
            else:
                assistant_message = f"CV updated and optimized! Quality score: {validation_result['completeness_score']}%"
        else:
            assistant_message = f"CV updated! To complete your CV, please add:\n" + "\n".join(f"• {item}" for item in validation_result["missing_sections"])
        
        return {
            **state,
            "cv_memory": optimized_memory,
            "optimized": True,
            "validation_result": validation_result,
            "download_url": download_url,
            "quality_score": validation_result["completeness_score"],
            "messages": state.get("messages", []) + [
                {"role": "assistant", "content": assistant_message}
            ]
        }
        
    except Exception as e:
        logger.error(f"Output optimization failed: {e}")
        return {
            **state,
            "error": f"Output optimization failed: {str(e)}"
        }