import os
import json
import asyncio
from typing import Dict, Any, Optional
from datetime import datetime

# Try to import AI libraries, fallback to mock if not available
try:
    from openai import AsyncOpenAI
    from langchain_openai import ChatOpenAI
    OPENAI_AVAILABLE = True
except ImportError:
    OPENAI_AVAILABLE = False

import jinja2
import weasyprint
from pathlib import Path

class ProfessionalCVAgent:
    def __init__(self, template_dir="templates/cv_templates"):
        self.template_env = jinja2.Environment(
            loader=jinja2.FileSystemLoader(template_dir),
            autoescape=jinja2.select_autoescape(['html', 'xml'])
        )
        
        # Initialize AI client if available
        if OPENAI_AVAILABLE:
            api_key = os.getenv("OPENAI_API_KEY", "demo-key")
            if api_key != "demo-key":
                self.client = AsyncOpenAI(api_key=api_key)
                self.use_ai = True
            else:
                self.use_ai = False
        else:
            self.use_ai = False
            
        print(f"🤖 CV Agent initialized - AI Mode: {'ON' if self.use_ai else 'OFF (Demo Mode)'}")

    async def extract_cv_data(self, text: str) -> Dict[str, Any]:
        """Extract structured CV data from user input text using AI or smart parsing"""
        
        if self.use_ai:
            return await self._ai_extract(text)
        else:
            return await self._smart_extract(text)

    async def _ai_extract(self, text: str) -> Dict[str, Any]:
        """Use OpenAI to extract structured data"""
        try:
            system_prompt = """You are a professional CV data extraction expert. Extract structured information from the user's career description and return it as JSON.

REQUIRED JSON STRUCTURE:
{
    "name": "Full Name",
    "title": "Professional Title/Role",
    "email": "email@domain.com",
    "phone": "+1-xxx-xxx-xxxx",
    "location": "City, Country",
    "linkedin": "LinkedIn profile or website",
    "summary": "Professional summary paragraph",
    "skills": {
        "Technical": ["skill1", "skill2"],
        "Leadership": ["skill1", "skill2"],
        "Industry": ["skill1", "skill2"]
    },
    "experience": [
        {
            "title": "Job Title",
            "company": "Company Name",
            "duration": "Start - End Date",
            "description": "Brief job description",
            "achievements": ["Achievement 1", "Achievement 2"]
        }
    ],
    "education": [
        {
            "degree": "Degree Name",
            "institution": "Institution Name",
            "graduation_date": "Year",
            "details": "Additional details if any"
        }
    ]
}

EXTRACTION RULES:
1. If information is missing, use professional defaults or leave empty
2. Extract years of experience and quantify achievements
3. Categorize skills logically (Technical, Leadership, Industry, etc.)
4. Create compelling achievement statements from experience descriptions
5. Infer professional title if not explicitly stated
6. Generate a professional summary if not provided

Return only valid JSON, no additional text."""

            response = await self.client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": f"Extract CV data from this text:\n\n{text}"}
                ],
                temperature=0.3,
                max_tokens=2000
            )
            
            extracted_json = response.choices[0].message.content
            
            # Parse and validate JSON
            try:
                data = json.loads(extracted_json)
                return self._validate_cv_data(data)
            except json.JSONDecodeError:
                print("❌ AI returned invalid JSON, falling back to smart extraction")
                return await self._smart_extract(text)
                
        except Exception as e:
            print(f"❌ AI extraction failed: {e}")
            return await self._smart_extract(text)

    async def _smart_extract(self, text: str) -> Dict[str, Any]:
        """Smart rule-based extraction when AI is not available"""
        
        # Basic keyword detection and parsing
        lines = [line.strip() for line in text.split('\n') if line.strip()]
        
        # Initialize data structure
        data = {
            "name": "Professional",
            "title": "Experienced Professional",
            "email": "",
            "phone": "",
            "location": "",
            "linkedin": "",
            "summary": "",
            "skills": {},
            "experience": [],
            "education": []
        }
        
        # Extract name (usually first line or contains "I am")
        first_line = lines[0] if lines else ""
        if "I am" in first_line:
            potential_name = first_line.replace("I am", "").replace("a", "").strip()
            if len(potential_name.split()) <= 3 and len(potential_name) > 2:
                data["name"] = potential_name.title()
        
        # Extract title/role
        role_keywords = ["manager", "engineer", "developer", "analyst", "director", 
                        "specialist", "consultant", "coordinator", "executive", "lead"]
        
        full_text_lower = text.lower()
        for keyword in role_keywords:
            if keyword in full_text_lower:
                # Find context around the keyword
                sentences = text.split('.')
                for sentence in sentences:
                    if keyword in sentence.lower():
                        # Extract potential title
                        words = sentence.split()
                        for i, word in enumerate(words):
                            if keyword in word.lower():
                                # Take surrounding words as title
                                start = max(0, i-2)
                                end = min(len(words), i+3)
                                title = ' '.join(words[start:end]).strip(' ,.')
                                data["title"] = title.title()
                                break
                        break
        
        # Extract experience years
        import re
        years_match = re.search(r'(\d+)\+?\s*years?\s*(?:of\s+)?(?:experience|exp)', text.lower())
        if years_match:
            years = years_match.group(1)
            data["title"] = f"{data['title']} ({years}+ Years Experience)"
        
        # Extract skills
        skill_keywords = {
            "Technical": ["python", "javascript", "java", "react", "node", "sql", "aws", 
                         "docker", "kubernetes", "git", "api", "rest", "graphql", "mongodb"],
            "Business": ["management", "leadership", "strategy", "analysis", "planning", 
                        "budgeting", "negotiation", "communication", "presentation"],
            "Industry": ["finance", "healthcare", "retail", "manufacturing", "consulting", 
                        "marketing", "sales", "operations", "hr", "legal"]
        }
        
        for category, keywords in skill_keywords.items():
            found_skills = []
            for keyword in keywords:
                if keyword in text.lower():
                    found_skills.append(keyword.title())
            
            if found_skills:
                data["skills"][category] = found_skills[:5]  # Limit to 5 per category
        
        # Generate professional summary
        summary_parts = []
        
        # Add experience summary
        if "experience" in text.lower():
            summary_parts.append(f"Experienced {data['title'].lower()} with a proven track record in professional environments.")
        
        # Add skills summary
        all_skills = []
        for skills_list in data["skills"].values():
            all_skills.extend(skills_list)
        
        if all_skills:
            top_skills = all_skills[:4]
            summary_parts.append(f"Skilled in {', '.join(top_skills[:-1])}, and {top_skills[-1]}.")
        
        # Add generic professional statement
        summary_parts.append("Committed to delivering high-quality results and driving organizational success through strategic thinking and collaborative leadership.")
        
        data["summary"] = " ".join(summary_parts)
        
        # Create experience entry from text
        data["experience"] = [{
            "title": data["title"],
            "company": "Professional Organization",
            "duration": "Current",
            "description": text[:200] + "..." if len(text) > 200 else text,
            "achievements": [
                "Delivered high-quality professional services",
                "Collaborated effectively with cross-functional teams",
                "Contributed to organizational goals and objectives"
            ]
        }]
        
        print("📊 Used smart extraction (demo mode)")
        return data

    def _validate_cv_data(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Validate and clean extracted CV data"""
        
        # Ensure required fields have values
        if not data.get("name"):
            data["name"] = "Professional"
        
        if not data.get("title"):
            data["title"] = "Experienced Professional"
        
        if not data.get("summary"):
            data["summary"] = f"Accomplished {data['title'].lower()} with extensive experience in professional environments, delivering high-quality results and contributing to organizational success."
        
        # Ensure skills is a dictionary
        if not isinstance(data.get("skills"), dict):
            data["skills"] = {"Professional": ["Communication", "Leadership", "Problem Solving"]}
        
        # Ensure experience is a list
        if not isinstance(data.get("experience"), list):
            data["experience"] = []
        
        # Ensure education is a list
        if not isinstance(data.get("education"), list):
            data["education"] = []
        
        return data

    def render_cv_html(self, data: Dict[str, Any], template_name: str) -> str:
        """Render CV data to HTML using the specified template"""
        
        try:
            template = self.template_env.get_template(template_name)
            html_content = template.render(**data)
            
            print(f"✅ Rendered CV using template: {template_name}")
            return html_content
            
        except Exception as e:
            print(f"❌ Template rendering failed: {e}")
            # Fallback to a simple HTML template
            return self._generate_fallback_html(data)

    def _generate_fallback_html(self, data: Dict[str, Any]) -> str:
        """Generate a simple fallback HTML when template fails"""
        
        skills_html = ""
        for category, skills in data.get("skills", {}).items():
            if isinstance(skills, list):
                skills_str = ", ".join(skills)
            else:
                skills_str = str(skills)
            skills_html += f"<p><strong>{category}:</strong> {skills_str}</p>"
        
        experience_html = ""
        for exp in data.get("experience", []):
            experience_html += f"""
            <div style="margin-bottom: 20px; border-left: 3px solid #007acc; padding-left: 15px;">
                <h3>{exp.get('title', 'Position')}</h3>
                <p><strong>{exp.get('company', 'Company')}</strong> | {exp.get('duration', 'Duration')}</p>
                <p>{exp.get('description', '')}</p>
            </div>
            """
        
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>{data.get('name', 'CV')}</title>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px; }}
                .header {{ background: #007acc; color: white; padding: 30px; text-align: center; }}
                .section {{ margin: 30px 0; }}
                .section h2 {{ color: #007acc; border-bottom: 2px solid #007acc; padding-bottom: 5px; }}
                h1 {{ margin: 0; font-size: 2.5em; }}
                .title {{ font-size: 1.2em; opacity: 0.9; }}
            </style>
        </head>
        <body>
            <div class="header">
                <h1>{data.get('name', 'Professional CV')}</h1>
                <p class="title">{data.get('title', 'Professional')}</p>
            </div>
            
            <div class="section">
                <h2>Professional Summary</h2>
                <p>{data.get('summary', 'Experienced professional with a track record of success.')}</p>
            </div>
            
            <div class="section">
                <h2>Skills & Competencies</h2>
                {skills_html}
            </div>
            
            <div class="section">
                <h2>Professional Experience</h2>
                {experience_html}
            </div>
        </body>
        </html>
        """
        
        print("⚠️ Used fallback HTML template")
        return html_content

    async def generate_pdf(self, html_content: str, output_path: str) -> bool:
        """Convert HTML to PDF using WeasyPrint"""
        
        try:
            # Create PDF from HTML
            html_doc = weasyprint.HTML(string=html_content)
            html_doc.write_pdf(output_path)
            
            print(f"📄 PDF generated successfully: {output_path}")
            return True
            
        except Exception as e:
            print(f"❌ PDF generation failed: {e}")
            # Create a simple text-based PDF fallback
            return self._create_text_pdf(output_path)

    def _create_text_pdf(self, output_path: str) -> bool:
        """Create a simple text-based PDF as fallback"""
        try:
            # Simple PDF content
            simple_html = """
            <!DOCTYPE html>
            <html>
            <head><title>CV Generated</title></head>
            <body style="font-family: Arial; padding: 40px;">
                <h1>Professional CV</h1>
                <p>Your CV has been generated successfully.</p>
                <p>This is a simplified version. For the full professional formatting, ensure all dependencies are properly installed.</p>
                <p>Generated on: """ + datetime.now().strftime('%Y-%m-%d %H:%M') + """</p>
            </body>
            </html>
            """
            
            html_doc = weasyprint.HTML(string=simple_html)
            html_doc.write_pdf(output_path)
            return True
            
        except Exception as e:
            print(f"❌ Fallback PDF creation failed: {e}")
            return False

    async def create_professional_cv(self, user_input: str, template_name: str, output_path: str) -> Dict[str, Any]:
        """Complete CV generation pipeline"""
        
        try:
            # Step 1: Extract structured data
            print("🔍 Extracting CV data...")
            cv_data = await self.extract_cv_data(user_input)
            
            # Step 2: Render HTML
            print("🎨 Rendering CV template...")
            html_content = self.render_cv_html(cv_data, template_name)
            
            # Step 3: Generate PDF
            print("📄 Generating PDF...")
            pdf_success = await self.generate_pdf(html_content, output_path)
            
            result = {
                "success": pdf_success,
                "cv_data": cv_data,
                "html_content": html_content,
                "output_path": output_path,
                "ai_used": self.use_ai
            }
            
            print(f"✅ CV generation complete - AI: {'Yes' if self.use_ai else 'No'}")
            return result
            
        except Exception as e:
            print(f"❌ CV generation failed: {e}")
            return {
                "success": False,
                "error": str(e),
                "ai_used": self.use_ai
            }