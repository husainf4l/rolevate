"""
PDF Renderer Node - Convert structured CV data into professional PDF documents
Uses Jinja2 templating and WeasyPrint for high-quality PDF generation
"""
import asyncio
import os
import uuid
from typing import Dict, Any, Optional
from pathlib import Path
from pydantic import BaseModel, Field
from loguru import logger
from datetime import datetime
import json

from jinja2 import Environment, FileSystemLoader, select_autoescape
import weasyprint
from weasyprint import HTML, CSS
from weasyprint.text.fonts import FontConfiguration

from app.config import settings

# Import utility tools
from app.agent.tools.formatting_tools import DateFormattingTool, PhoneFormattingTool


class PDFRenderer:
    """Professional PDF rendering service for CV documents"""
    
    def __init__(self):
        self.exports_dir = Path("exports")
        self.templates_dir = Path("app/templates/cv_templates")
        self.assets_dir = Path("app/templates/assets")
        
        # Ensure directories exist
        self.exports_dir.mkdir(exist_ok=True)
        self.templates_dir.mkdir(parents=True, exist_ok=True)
        self.assets_dir.mkdir(parents=True, exist_ok=True)
        
        # Setup Jinja2 environment
        self.jinja_env = Environment(
            loader=FileSystemLoader([str(self.templates_dir)]),
            autoescape=select_autoescape(['html', 'xml'])
        )
        
        # Add custom filters
        self._setup_jinja_filters()
        
        # Font configuration for WeasyPrint
        self.font_config = FontConfiguration()
        
        # Template configurations
        self.template_configs = {
            "modern": {
                "template_file": "modern_template.html",
                "css_file": "modern_styles.css",
                "color_scheme": {"primary": "#2563eb", "secondary": "#64748b", "accent": "#0ea5e9"},
                "fonts": ["Inter", "system-ui", "sans-serif"]
            },
            "classic": {
                "template_file": "classic_template.html", 
                "css_file": "classic_styles.css",
                "color_scheme": {"primary": "#374151", "secondary": "#6b7280", "accent": "#1f2937"},
                "fonts": ["Times New Roman", "serif"]
            },
            "executive": {
                "template_file": "executive_template.html",
                "css_file": "executive_styles.css",
                "color_scheme": {"primary": "#1e40af", "secondary": "#475569", "accent": "#3730a3"},
                "fonts": ["Georgia", "serif"]
            },
            "creative": {
                "template_file": "creative_template.html",
                "css_file": "creative_styles.css",
                "color_scheme": {"primary": "#7c3aed", "secondary": "#a78bfa", "accent": "#8b5cf6"},
                "fonts": ["Helvetica", "Arial", "sans-serif"]
            },
            "minimal": {
                "template_file": "minimal_template.html",
                "css_file": "minimal_styles.css", 
                "color_scheme": {"primary": "#000000", "secondary": "#666666", "accent": "#999999"},
                "fonts": ["Arial", "Helvetica", "sans-serif"]
            },
            "technical": {
                "template_file": "technical_template.html",
                "css_file": "technical_styles.css",
                "color_scheme": {"primary": "#0f172a", "secondary": "#475569", "accent": "#0ea5e9"},
                "fonts": ["Roboto Mono", "Consolas", "monospace"]
            }
        }
    
    def _setup_jinja_filters(self):
        """Setup custom Jinja2 filters for template rendering"""
        
        def format_date(date_str: str) -> str:
            """Format date string for display using utility tool"""
            return DateFormattingTool.format_date(date_str)
        
        def format_phone(phone: str) -> str:
            """Format phone number for display using utility tool"""
            return PhoneFormattingTool.format_phone(phone)
        
        def truncate_text(text: str, length: int = 100) -> str:
            """Truncate text to specified length"""
            if not text or len(text) <= length:
                return text
            return text[:length].rsplit(' ', 1)[0] + "..."
        
        def skill_level_bar(level: str) -> str:
            """Generate HTML for skill level visualization"""
            level_map = {
                "beginner": 20, "basic": 20,
                "intermediate": 50, "proficient": 60,
                "advanced": 80, "expert": 100, "native": 100
            }
            
            percentage = level_map.get(level.lower(), 50)
            return f'<div class="skill-bar"><div class="skill-level" style="width: {percentage}%"></div></div>'
        
        def get_initials(name: str) -> str:
            """Get initials from full name"""
            if not name:
                return ""
            
            parts = name.strip().split()
            if len(parts) >= 2:
                return f"{parts[0][0]}{parts[-1][0]}".upper()
            elif len(parts) == 1:
                return parts[0][:2].upper()
            return ""
        
        # Register filters
        self.jinja_env.filters['format_date'] = format_date
        self.jinja_env.filters['format_phone'] = format_phone
        self.jinja_env.filters['truncate_text'] = truncate_text
        self.jinja_env.filters['skill_level_bar'] = skill_level_bar
        self.jinja_env.filters['get_initials'] = get_initials
    
    def _create_default_templates(self):
        """Create default HTML templates if they don't exist"""
        
        # Modern template
        modern_template = """
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ cv_data.personal_info.full_name or "Professional CV" }}</title>
    <style>
        body { font-family: Inter, system-ui, sans-serif; margin: 0; padding: 20px; color: #1f2937; line-height: 1.6; }
        .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #2563eb; padding-bottom: 20px; }
        .name { font-size: 28px; font-weight: bold; color: #1e40af; margin-bottom: 10px; }
        .contact { display: flex; justify-content: center; gap: 20px; flex-wrap: wrap; font-size: 14px; }
        .section { margin-bottom: 25px; }
        .section-title { font-size: 18px; font-weight: bold; color: #2563eb; border-bottom: 1px solid #e5e7eb; padding-bottom: 5px; margin-bottom: 15px; }
        .experience-item, .education-item { margin-bottom: 20px; }
        .job-title { font-weight: bold; color: #1e40af; }
        .company { color: #6b7280; font-style: italic; }
        .date-range { float: right; color: #6b7280; font-size: 14px; }
        .description { margin-top: 8px; text-align: justify; }
        .skills-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px; }
        .skill-category { margin-bottom: 15px; }
        .skill-category-title { font-weight: bold; color: #374151; margin-bottom: 5px; }
        .skills-list { display: flex; flex-wrap: wrap; gap: 8px; }
        .skill-tag { background: #e0f2fe; color: #0369a1; padding: 4px 8px; border-radius: 4px; font-size: 13px; }
    </style>
</head>
<body>
    <div class="header">
        <div class="name">{{ cv_data.personal_info.full_name or "Professional Name" }}</div>
        <div class="contact">
            {% if cv_data.personal_info.email %}<span>📧 {{ cv_data.personal_info.email }}</span>{% endif %}
            {% if cv_data.personal_info.phone %}<span>📞 {{ cv_data.personal_info.phone | format_phone }}</span>{% endif %}
            {% if cv_data.personal_info.linkedin %}<span>💼 {{ cv_data.personal_info.linkedin }}</span>{% endif %}
            {% if cv_data.personal_info.location %}<span>📍 {{ cv_data.personal_info.location }}</span>{% endif %}
        </div>
    </div>

    {% if cv_data.summary %}
    <div class="section">
        <div class="section-title">Professional Summary</div>
        <div class="description">{{ cv_data.summary }}</div>
    </div>
    {% endif %}

    {% if cv_data.experiences %}
    <div class="section">
        <div class="section-title">Professional Experience</div>
        {% for exp in cv_data.experiences %}
        <div class="experience-item">
            <div class="job-title">{{ exp.job_title or "Position Title" }}</div>
            <div class="company">{{ exp.company or "Company Name" }} 
                <span class="date-range">{{ exp.start_date | format_date }} - {{ exp.end_date | format_date }}</span>
            </div>
            {% if exp.location %}<div class="location" style="color: #6b7280; font-size: 14px;">{{ exp.location }}</div>{% endif %}
            {% if exp.description %}<div class="description">{{ exp.description }}</div>{% endif %}
            {% if exp.achievements %}
            <ul style="margin-top: 8px;">
                {% for achievement in exp.achievements %}
                <li>{{ achievement }}</li>
                {% endfor %}
            </ul>
            {% endif %}
        </div>
        {% endfor %}
    </div>
    {% endif %}

    {% if cv_data.education %}
    <div class="section">
        <div class="section-title">Education</div>
        {% for edu in cv_data.education %}
        <div class="education-item">
            <div class="job-title">{{ edu.degree or "Degree" }}</div>
            <div class="company">{{ edu.institution or "Institution" }}
                <span class="date-range">{{ edu.start_date | format_date }} - {{ edu.end_date | format_date }}</span>
            </div>
            {% if edu.gpa %}<div style="color: #6b7280; font-size: 14px;">GPA: {{ edu.gpa }}</div>{% endif %}
        </div>
        {% endfor %}
    </div>
    {% endif %}

    {% if cv_data.skills %}
    <div class="section">
        <div class="section-title">Technical Skills</div>
        <div class="skills-grid">
            {% for category, skills in cv_data.skills.items() %}
            {% if skills %}
            <div class="skill-category">
                <div class="skill-category-title">{{ category.replace('_', ' ').title() }}</div>
                <div class="skills-list">
                    {% for skill in skills %}
                    <span class="skill-tag">{{ skill }}</span>
                    {% endfor %}
                </div>
            </div>
            {% endif %}
            {% endfor %}
        </div>
    </div>
    {% endif %}

    {% if cv_data.languages %}
    <div class="section">
        <div class="section-title">Languages</div>
        <div class="skills-list">
            {% for lang in cv_data.languages %}
            <span class="skill-tag">{{ lang.language }} ({{ lang.proficiency }})</span>
            {% endfor %}
        </div>
    </div>
    {% endif %}
</body>
</html>
        """
        
        # Save modern template
        modern_file = self.templates_dir / "modern_template.html"
        if not modern_file.exists():
            modern_file.write_text(modern_template)
            logger.info("Created default modern template")
    
    def prepare_cv_data_for_template(self, cv_data: Dict[str, Any]) -> Dict[str, Any]:
        """Prepare and validate CV data for template rendering"""
        
        # Create a clean copy with proper structure
        prepared_data = {
            "personal_info": cv_data.get("personal_info", {}),
            "summary": cv_data.get("summary", ""),
            "experiences": cv_data.get("experiences", []),
            "education": cv_data.get("education", []),
            "skills": cv_data.get("skills", {}),
            "languages": cv_data.get("languages", []),
            "projects": cv_data.get("projects", []),
            "certifications": cv_data.get("certifications", []),
            "generated_at": datetime.now().strftime("%B %d, %Y")
        }
        
        # Ensure personal info has required fields
        if not prepared_data["personal_info"].get("full_name"):
            prepared_data["personal_info"]["full_name"] = "Professional Name"
        
        # Sort experiences by start date (most recent first)
        try:
            prepared_data["experiences"] = sorted(
                prepared_data["experiences"],
                key=lambda x: x.get("start_date", "2000-01"),
                reverse=True
            )
        except:
            pass  # Keep original order if sorting fails
        
        return prepared_data
    
    async def render_html(self, cv_data: Dict[str, Any], template_name: str = "modern") -> str:
        """Render CV data to HTML using Jinja2 template"""
        
        logger.info(f"🎨 Rendering HTML with {template_name} template...")
        
        # Ensure default templates exist
        self._create_default_templates()
        
        # Get template configuration
        template_config = self.template_configs.get(template_name, self.template_configs["modern"])
        
        # Prepare data for template
        prepared_data = self.prepare_cv_data_for_template(cv_data)
        
        try:
            # Load template
            template = self.jinja_env.get_template(template_config["template_file"])
            
            # Render HTML
            html_content = template.render(
                cv_data=prepared_data,
                config=template_config,
                timestamp=datetime.now().isoformat()
            )
            
            logger.success("✅ HTML rendered successfully")
            return html_content
            
        except Exception as e:
            logger.error(f"❌ HTML rendering failed: {e}")
            # Fallback to basic template
            return self._render_fallback_html(prepared_data)
    
    def _render_fallback_html(self, cv_data: Dict[str, Any]) -> str:
        """Fallback HTML rendering if templates fail"""
        
        personal = cv_data.get("personal_info", {})
        
        html = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>{personal.get('full_name', 'CV')}</title>
            <style>
                body {{ font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }}
                h1 {{ color: #2c3e50; border-bottom: 2px solid #3498db; }}
                h2 {{ color: #34495e; margin-top: 30px; }}
                .contact {{ margin-bottom: 20px; }}
            </style>
        </head>
        <body>
            <h1>{personal.get('full_name', 'Professional CV')}</h1>
            <div class="contact">
                {personal.get('email', '')} | {personal.get('phone', '')}
            </div>
        """
        
        if cv_data.get("summary"):
            html += f"<h2>Summary</h2><p>{cv_data['summary']}</p>"
        
        if cv_data.get("experiences"):
            html += "<h2>Experience</h2>"
            for exp in cv_data["experiences"]:
                html += f"""
                <h3>{exp.get('job_title', 'Position')}</h3>
                <p><strong>{exp.get('company', 'Company')}</strong> | {exp.get('start_date', '')} - {exp.get('end_date', '')}</p>
                <p>{exp.get('description', '')}</p>
                """
        
        html += "</body></html>"
        return html
    
    async def render_pdf(self, cv_data: Dict[str, Any], template_name: str = "modern", 
                        output_filename: Optional[str] = None) -> Path:
        """Render CV data to PDF file"""
        
        logger.info(f"📄 Starting PDF rendering with {template_name} template...")
        
        try:
            # Generate HTML
            html_content = await self.render_html(cv_data, template_name)
            
            # Generate filename if not provided
            if not output_filename:
                timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
                name_part = cv_data.get("personal_info", {}).get("full_name", "CV")
                # Clean filename
                name_part = "".join(c for c in name_part if c.isalnum() or c in (' ', '_', '-')).strip()
                name_part = name_part.replace(' ', '_')
                output_filename = f"cv_{name_part}_{timestamp}.pdf"
            
            # Ensure .pdf extension
            if not output_filename.endswith('.pdf'):
                output_filename += '.pdf'
            
            output_path = self.exports_dir / output_filename
            
            # Configure WeasyPrint
            base_url = str(self.templates_dir)
            
            # Create CSS for the template
            css_content = self._get_template_css(template_name)
            
            # Render PDF
            html_doc = HTML(string=html_content)
            css_doc = CSS(string=css_content) if css_content else None
            
            stylesheets = [css_doc] if css_doc else []
            
            html_doc.write_pdf(
                str(output_path),
                stylesheets=stylesheets
            )
            
            logger.success(f"✅ PDF rendered successfully: {output_path}")
            return output_path
            
        except Exception as e:
            logger.error(f"❌ PDF rendering failed: {e}")
            raise
    
    def _get_template_css(self, template_name: str) -> str:
        """Get CSS for the specified template"""
        
        css_styles = {
            "modern": """
                @page { size: A4; margin: 0.75in; }
                body { font-size: 11pt; }
                .header { page-break-after: avoid; }
                .section { page-break-inside: avoid; margin-bottom: 20pt; }
                .experience-item { page-break-inside: avoid; }
            """,
            "classic": """
                @page { size: A4; margin: 1in; }
                body { font-size: 12pt; font-family: Times, serif; }
                .section { margin-bottom: 18pt; }
            """,
            "minimal": """
                @page { size: A4; margin: 0.8in; }
                body { font-size: 10pt; }
                .section { margin-bottom: 15pt; }
            """
        }
        
        return css_styles.get(template_name, css_styles["modern"])


async def pdf_renderer_node(state: Dict[str, Any]) -> Dict[str, Any]:
    """
    LangGraph node for PDF rendering
    
    Input: state with 'cv_memory' and 'selected_template'
    Output: state with 'pdf_path' and 'pdf_metadata'
    """
    logger.info("📄 Starting PDF rendering...")
    
    try:
        renderer = PDFRenderer()
        
        # Get data from state
        cv_memory = state.get("cv_memory", {})
        selected_template = state.get("selected_template", "modern")
        
        if not cv_memory:
            raise ValueError("No CV data found for PDF rendering")
        
        # Generate unique filename
        user_id = state.get("user_id", "user")
        session_id = state.get("session_id", str(uuid.uuid4())[:8])
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        
        filename = f"cv_{user_id}_{session_id}_{timestamp}"
        
        # Render PDF
        pdf_path = await renderer.render_pdf(cv_memory, selected_template, filename)
        
        # Create metadata
        pdf_metadata = {
            "filename": pdf_path.name,
            "path": str(pdf_path),
            "size_bytes": pdf_path.stat().st_size,
            "template_used": selected_template,
            "generated_at": datetime.now().isoformat(),
            "pages": 1  # Could implement page counting
        }
        
        # Update state
        state["pdf_path"] = str(pdf_path)
        state["pdf_metadata"] = pdf_metadata
        state["processing_step"] = "pdf_rendering_complete"
        
        logger.success(f"✅ PDF rendering completed: {pdf_path.name}")
        
        return state
        
    except Exception as e:
        logger.error(f"❌ PDF rendering failed: {e}")
        state["processing_step"] = f"pdf_rendering_error: {str(e)}"
        return state


# Input/Output Schemas for LangGraph
class PDFRendererInput(BaseModel):
    """Input schema for PDF renderer node"""
    cv_memory: Dict[str, Any] = Field(..., description="CV data to render")
    selected_template: str = Field(default="modern", description="Template name to use")
    output_filename: Optional[str] = Field(None, description="Custom output filename")


class PDFRendererOutput(BaseModel):
    """Output schema for PDF renderer node"""
    pdf_path: str = Field(..., description="Path to generated PDF file")
    pdf_metadata: Dict[str, Any] = Field(..., description="PDF generation metadata")
    processing_step: str = Field(..., description="Processing status")


# Node metadata for LangGraph
PDF_RENDERER_NODE_METADATA = {
    "name": "pdf_renderer_node",
    "description": "Render structured CV data into professional PDF documents",
    "input_schema": PDFRendererInput,
    "output_schema": PDFRendererOutput,
    "dependencies": ["jinja2", "weasyprint"],
    "timeout": 60,
    "retry_count": 2
}