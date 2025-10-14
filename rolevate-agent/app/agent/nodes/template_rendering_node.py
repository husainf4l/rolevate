"""
Template Rendering Layer - Uses Jinja2 to fill HTML templates and convert to PDF
Renders professional CV templates with structured data
"""
from typing import Dict, Any, Optional
from pathlib import Path
from loguru import logger
import weasyprint
from jinja2 import Environment, FileSystemLoader, Template
from app.config import settings
import datetime
import os


class TemplateRenderer:
    """Render CV templates with structured data"""
    
    def __init__(self):
        # Setup template directories
        self.templates_dir = Path(__file__).parent.parent.parent / "templates" / "cv_templates"
        self.output_dir = Path(settings.output_dir)
        
        # Ensure directories exist
        self.templates_dir.mkdir(parents=True, exist_ok=True)
        self.output_dir.mkdir(parents=True, exist_ok=True)
        
        # Setup Jinja2 environment
        self.jinja_env = Environment(
            loader=FileSystemLoader(str(self.templates_dir)),
            autoescape=True
        )
        
        # Add custom filters
        self.jinja_env.filters['format_date'] = self.format_date
        self.jinja_env.filters['format_duration'] = self.format_duration
        self.jinja_env.filters['split_skills'] = self.split_skills_by_category
    
    def format_date(self, date_str: str) -> str:
        """Format date string for display"""
        if not date_str:
            return ""
        
        try:
            # Handle various date formats
            if len(date_str) == 4:  # Year only
                return date_str
            elif "-" in date_str:
                return date_str.replace("-", "/")
            else:
                return date_str
        except:
            return date_str
    
    def format_duration(self, start_date: str, end_date: str) -> str:
        """Calculate and format duration between dates"""
        if not start_date:
            return ""
        
        if not end_date or end_date.lower() in ["current", "present", "now"]:
            end_date = str(datetime.datetime.now().year)
        
        try:
            start_year = int(start_date[:4]) if start_date else 0
            end_year = int(end_date[:4]) if end_date else datetime.datetime.now().year
            
            duration = end_year - start_year
            if duration <= 0:
                return ""
            elif duration == 1:
                return "1 year"
            else:
                return f"{duration} years"
        except:
            return ""
    
    def split_skills_by_category(self, skills: list) -> Dict[str, list]:
        """Group skills by category"""
        categorized = {}
        
        for skill in skills:
            if isinstance(skill, dict):
                category = skill.get("category", "Technical Skills")
                name = skill.get("name", "")
                proficiency = skill.get("proficiency", "")
                
                if category not in categorized:
                    categorized[category] = []
                
                categorized[category].append({
                    "name": name,
                    "proficiency": proficiency
                })
            else:
                # Handle string skills
                if "Technical Skills" not in categorized:
                    categorized["Technical Skills"] = []
                categorized["Technical Skills"].append({"name": str(skill), "proficiency": ""})
        
        return categorized
    
    def prepare_template_data(self, cv_memory: Dict[str, Any]) -> Dict[str, Any]:
        """Prepare data for template rendering"""
        
        # Extract and clean data
        personal_info = cv_memory.get("personal_info", {})
        experiences = cv_memory.get("experiences", [])
        education = cv_memory.get("education", [])
        skills = cv_memory.get("skills", [])
        summary = cv_memory.get("summary", "")
        
        # Sort experiences by start date (most recent first)
        def get_start_year(exp):
            try:
                start_date = exp.get("start_date", "") if isinstance(exp, dict) else ""
                return int(start_date[:4]) if start_date else 0
            except:
                return 0
        
        sorted_experiences = sorted(
            [exp for exp in experiences if isinstance(exp, dict)],
            key=get_start_year,
            reverse=True
        )
        
        # Sort education by end year (most recent first)
        def get_end_year(edu):
            try:
                end_year = edu.get("end_year", "") if isinstance(edu, dict) else ""
                return int(end_year) if end_year else 0
            except:
                return 0
        
        sorted_education = sorted(
            [edu for edu in education if isinstance(edu, dict)],
            key=get_end_year,
            reverse=True
        )
        
        # Calculate total years of experience
        total_experience = len(sorted_experiences) * 1.5  # Average 1.5 years per role
        
        template_data = {
            "personal_info": {
                "name": personal_info.get("name", ""),
                "email": personal_info.get("email", ""),
                "phone": personal_info.get("phone", ""),
                "location": personal_info.get("location", ""),
                "linkedin": personal_info.get("linkedin", ""),
                "github": personal_info.get("github", ""),
                "website": personal_info.get("website", "")
            },
            "summary": summary,
            "experiences": sorted_experiences,
            "education": sorted_education,
            "skills": skills,
            "total_experience_years": int(total_experience),
            "generated_date": datetime.datetime.now().strftime("%B %Y"),
            "has_github": bool(personal_info.get("github")),
            "has_linkedin": bool(personal_info.get("linkedin")),
            "has_website": bool(personal_info.get("website"))
        }
        
        return template_data
    
    def get_available_templates(self) -> Dict[str, str]:
        """Get list of available CV templates"""
        templates = {
            "modern": "Modern CV with contemporary styling and visual appeal",
            "classic": "Traditional CV layout with clean, professional design",
            "executive": "Executive-level CV with sophisticated layout for senior positions"
        }
        
        return templates
    
    def ensure_template_exists(self, template_name: str) -> bool:
        """Ensure template file exists, create if missing"""
        template_file = self.templates_dir / f"{template_name}.html"
        
        if template_file.exists():
            return True
        
        # Create default template if missing
        logger.info(f"Creating default {template_name} template")
        default_template = self.get_default_template(template_name)
        
        with open(template_file, "w", encoding="utf-8") as f:
            f.write(default_template)
        
        return True
    
    def get_default_template(self, template_name: str) -> str:
        """Get default template HTML content"""
        
        if template_name == "modern":
            return self.get_modern_template()
        elif template_name == "classic":
            return self.get_classic_template()
        elif template_name == "executive":
            return self.get_executive_template()
        else:
            return self.get_modern_template()  # Default to modern
    
    def get_modern_template(self) -> str:
        """Modern CV template with contemporary styling"""
        return """<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ personal_info.name }} - CV</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            line-height: 1.6;
            color: #2d3748;
            background: white;
        }
        
        .cv-container {
            max-width: 210mm;
            margin: 0 auto;
            padding: 40px;
            background: white;
        }
        
        .header {
            text-align: center;
            margin-bottom: 40px;
            padding-bottom: 20px;
            border-bottom: 2px solid #3182ce;
        }
        
        .name {
            font-size: 32px;
            font-weight: 700;
            color: #1a202c;
            margin-bottom: 8px;
        }
        
        .contact-info {
            display: flex;
            justify-content: center;
            gap: 20px;
            flex-wrap: wrap;
            color: #4a5568;
            font-size: 14px;
        }
        
        .section {
            margin-bottom: 32px;
        }
        
        .section-title {
            font-size: 18px;
            font-weight: 600;
            color: #3182ce;
            margin-bottom: 16px;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        
        .experience-item, .education-item {
            margin-bottom: 24px;
            padding-left: 20px;
            border-left: 3px solid #e2e8f0;
        }
        
        .job-header {
            margin-bottom: 8px;
        }
        
        .job-title {
            font-size: 16px;
            font-weight: 600;
            color: #1a202c;
        }
        
        .company-name {
            font-size: 14px;
            color: #3182ce;
            margin-top: 2px;
        }
        
        .job-duration {
            font-size: 12px;
            color: #718096;
            margin-top: 2px;
        }
        
        .job-description {
            margin-top: 12px;
            color: #4a5568;
            font-size: 14px;
            line-height: 1.5;
        }
        
        .skills-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
        }
        
        .skill-category {
            background: #f7fafc;
            padding: 16px;
            border-radius: 8px;
            border-left: 4px solid #3182ce;
        }
        
        .skill-category-title {
            font-weight: 600;
            color: #2d3748;
            margin-bottom: 8px;
            font-size: 14px;
        }
        
        .skill-list {
            display: flex;
            flex-wrap: wrap;
            gap: 6px;
        }
        
        .skill-item {
            background: #3182ce;
            color: white;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: 500;
        }
        
        .summary {
            background: #f7fafc;
            padding: 20px;
            border-radius: 8px;
            color: #2d3748;
            font-size: 14px;
            line-height: 1.6;
            margin-bottom: 32px;
        }
        
        @media print {
            .cv-container { padding: 20px; }
            .section { page-break-inside: avoid; }
        }
    </style>
</head>
<body>
    <div class="cv-container">
        <!-- Header -->
        <header class="header">
            <h1 class="name">{{ personal_info.name or "Your Name" }}</h1>
            <div class="contact-info">
                {% if personal_info.email %}<span>📧 {{ personal_info.email }}</span>{% endif %}
                {% if personal_info.phone %}<span>📱 {{ personal_info.phone }}</span>{% endif %}
                {% if personal_info.location %}<span>📍 {{ personal_info.location }}</span>{% endif %}
                {% if personal_info.linkedin %}<span>💼 {{ personal_info.linkedin }}</span>{% endif %}
                {% if personal_info.github %}<span>💻 {{ personal_info.github }}</span>{% endif %}
            </div>
        </header>
        
        <!-- Summary -->
        {% if summary %}
        <section class="section">
            <div class="summary">
                {{ summary }}
            </div>
        </section>
        {% endif %}
        
        <!-- Experience -->
        {% if experiences %}
        <section class="section">
            <h2 class="section-title">Professional Experience</h2>
            {% for exp in experiences %}
            <div class="experience-item">
                <div class="job-header">
                    <div class="job-title">{{ exp.position or "Position" }}</div>
                    <div class="company-name">{{ exp.company or "Company" }}</div>
                    <div class="job-duration">
                        {{ exp.start_date | format_date }} - {{ exp.end_date | format_date or "Present" }}
                        {% if exp.start_date and exp.end_date %}
                        ({{ exp.start_date | format_duration(exp.end_date) }})
                        {% endif %}
                    </div>
                </div>
                {% if exp.description %}
                <div class="job-description">
                    {{ exp.description | replace('\n', '<br>') | safe }}
                </div>
                {% endif %}
            </div>
            {% endfor %}
        </section>
        {% endif %}
        
        <!-- Education -->
        {% if education %}
        <section class="section">
            <h2 class="section-title">Education</h2>
            {% for edu in education %}
            <div class="education-item">
                <div class="job-header">
                    <div class="job-title">{{ edu.degree or "Degree" }}{% if edu.field_of_study %} in {{ edu.field_of_study }}{% endif %}</div>
                    <div class="company-name">{{ edu.institution or "Institution" }}</div>
                    <div class="job-duration">
                        {{ edu.start_year }} - {{ edu.end_year or "Present" }}
                    </div>
                </div>
                {% if edu.description %}
                <div class="job-description">
                    {{ edu.description }}
                </div>
                {% endif %}
            </div>
            {% endfor %}
        </section>
        {% endif %}
        
        <!-- Skills -->
        {% if skills %}
        <section class="section">
            <h2 class="section-title">Skills & Technologies</h2>
            <div class="skills-grid">
                {% for category, category_skills in skills | split_skills %}
                <div class="skill-category">
                    <div class="skill-category-title">{{ category }}</div>
                    <div class="skill-list">
                        {% for skill in category_skills %}
                        <span class="skill-item">{{ skill.name }}</span>
                        {% endfor %}
                    </div>
                </div>
                {% endfor %}
            </div>
        </section>
        {% endif %}
    </div>
</body>
</html>"""
    
    def get_classic_template(self) -> str:
        """Classic CV template with traditional styling"""
        return """<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ personal_info.name }} - CV</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        body {
            font-family: 'Times New Roman', serif;
            line-height: 1.6;
            color: #333;
            background: white;
        }
        
        .cv-container {
            max-width: 210mm;
            margin: 0 auto;
            padding: 40px;
            background: white;
        }
        
        .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 1px solid #333;
        }
        
        .name {
            font-size: 28px;
            font-weight: bold;
            margin-bottom: 10px;
        }
        
        .contact-info {
            font-size: 14px;
            line-height: 1.4;
        }
        
        .section {
            margin-bottom: 25px;
        }
        
        .section-title {
            font-size: 16px;
            font-weight: bold;
            margin-bottom: 10px;
            border-bottom: 1px solid #333;
            padding-bottom: 5px;
        }
        
        .experience-item, .education-item {
            margin-bottom: 20px;
        }
        
        .job-title {
            font-weight: bold;
            font-size: 14px;
        }
        
        .company-name {
            font-style: italic;
            margin-top: 2px;
        }
        
        .job-duration {
            font-size: 12px;
            margin-top: 2px;
        }
        
        .job-description {
            margin-top: 8px;
            font-size: 14px;
            text-align: justify;
        }
        
        .skills-list {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
        }
        
        .skill-item {
            font-size: 14px;
        }
        
        .summary {
            font-size: 14px;
            text-align: justify;
            margin-bottom: 25px;
        }
        
        @media print {
            .cv-container { padding: 20px; }
        }
    </style>
</head>
<body>
    <div class="cv-container">
        <!-- Header -->
        <header class="header">
            <h1 class="name">{{ personal_info.name or "Your Name" }}</h1>
            <div class="contact-info">
                {% if personal_info.email %}{{ personal_info.email }}{% endif %}
                {% if personal_info.phone and personal_info.email %} • {% endif %}
                {% if personal_info.phone %}{{ personal_info.phone }}{% endif %}
                {% if personal_info.location and (personal_info.email or personal_info.phone) %}<br>{% endif %}
                {% if personal_info.location %}{{ personal_info.location }}{% endif %}
                {% if personal_info.linkedin %}<br>{{ personal_info.linkedin }}{% endif %}
            </div>
        </header>
        
        <!-- Summary -->
        {% if summary %}
        <section class="section">
            <div class="summary">
                {{ summary }}
            </div>
        </section>
        {% endif %}
        
        <!-- Experience -->
        {% if experiences %}
        <section class="section">
            <h2 class="section-title">PROFESSIONAL EXPERIENCE</h2>
            {% for exp in experiences %}
            <div class="experience-item">
                <div class="job-title">{{ exp.position or "Position" }}</div>
                <div class="company-name">{{ exp.company or "Company" }}</div>
                <div class="job-duration">{{ exp.start_date | format_date }} - {{ exp.end_date | format_date or "Present" }}</div>
                {% if exp.description %}
                <div class="job-description">{{ exp.description | replace('\n', '<br>') | safe }}</div>
                {% endif %}
            </div>
            {% endfor %}
        </section>
        {% endif %}
        
        <!-- Education -->
        {% if education %}
        <section class="section">
            <h2 class="section-title">EDUCATION</h2>
            {% for edu in education %}
            <div class="education-item">
                <div class="job-title">{{ edu.degree or "Degree" }}{% if edu.field_of_study %}, {{ edu.field_of_study }}{% endif %}</div>
                <div class="company-name">{{ edu.institution or "Institution" }}</div>
                <div class="job-duration">{{ edu.end_year or "Year" }}</div>
            </div>
            {% endfor %}
        </section>
        {% endif %}
        
        <!-- Skills -->
        {% if skills %}
        <section class="section">
            <h2 class="section-title">SKILLS</h2>
            <div class="skills-list">
                {% for skill in skills %}
                <span class="skill-item">{{ skill.name if skill.name else skill }}{% if not loop.last %}, {% endif %}</span>
                {% endfor %}
            </div>
        </section>
        {% endif %}
    </div>
</body>
</html>"""
    
    def get_executive_template(self) -> str:
        """Executive CV template with sophisticated styling"""
        return self.get_modern_template()  # Use modern as base for now
    
    async def render_html(self, cv_memory: Dict[str, Any], template_name: str = "modern") -> str:
        """Render CV data to HTML"""
        
        # Ensure template exists
        if not self.ensure_template_exists(template_name):
            raise ValueError(f"Template '{template_name}' not available")
        
        # Prepare data for template
        template_data = self.prepare_template_data(cv_memory)
        
        # Load and render template
        try:
            template = self.jinja_env.get_template(f"{template_name}.html")
            html_content = template.render(**template_data)
            
            logger.success(f"HTML rendered successfully using {template_name} template")
            return html_content
            
        except Exception as e:
            logger.error(f"Failed to render template {template_name}: {e}")
            raise
    
    async def render_pdf(self, cv_memory: Dict[str, Any], template_name: str = "modern", output_filename: Optional[str] = None) -> Path:
        """Render CV data to PDF"""
        
        # Generate HTML first
        html_content = await self.render_html(cv_memory, template_name)
        
        # Generate output filename
        if not output_filename:
            name = cv_memory.get("personal_info", {}).get("name", "cv")
            name = "".join(c for c in name if c.isalnum() or c in " -_").strip()
            timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
            output_filename = f"cv_{name}_{timestamp}.pdf"
        
        if not output_filename.endswith(".pdf"):
            output_filename += ".pdf"
        
        output_path = self.output_dir / output_filename
        
        # Convert HTML to PDF using WeasyPrint
        try:
            # Configure WeasyPrint
            css = weasyprint.CSS(string="""
                @page {
                    size: A4;
                    margin: 2cm;
                }
                body {
                    font-size: 12px;
                }
            """)
            
            html_doc = weasyprint.HTML(string=html_content)
            html_doc.write_pdf(str(output_path), stylesheets=[css])
            
            logger.success(f"PDF generated successfully: {output_path.name}")
            return output_path
            
        except Exception as e:
            logger.error(f"Failed to generate PDF: {e}")
            raise


async def template_rendering_node(state: Dict[str, Any]) -> Dict[str, Any]:
    """
    Template Rendering Layer - Renders CV templates with structured data
    
    Args:
        state: Current agent state with enhanced CV data
        
    Returns:
        Updated state with rendered HTML and PDF paths
    """
    logger.info("Template Rendering Layer: Rendering CV template")
    
    try:
        cv_memory = state.get("cv_memory", {})
        template_name = state.get("template_name", cv_memory.get("selected_template", "modern"))
        output_format = state.get("output_format", "pdf")
        intent = state.get("intent", "")
        
        if not cv_memory:
            return {
                **state,
                "error": "No CV memory provided for template rendering"
            }
        
        renderer = TemplateRenderer()
        
        # Always render HTML for preview
        html_content = await renderer.render_html(cv_memory, template_name)
        
        result = {
            **state,
            "html_content": html_content,
            "template_name": template_name
        }
        
        # Generate PDF if requested or if generating final CV
        if output_format == "pdf" or intent == "generate_cv":
            pdf_path = await renderer.render_pdf(cv_memory, template_name)
            result["pdf_path"] = str(pdf_path)
            result["output_path"] = str(pdf_path)
        
        logger.success(f"Template rendering completed for {template_name}")
        
        # Generate appropriate response
        if intent == "generate_cv":
            assistant_message = f"🎉 Your professional CV has been generated! Download it using the link below."
        else:
            assistant_message = f"CV preview updated with {template_name} template. Looking great!"
        
        result["messages"] = state.get("messages", []) + [
            {"role": "assistant", "content": assistant_message}
        ]
        
        return result
        
    except Exception as e:
        logger.error(f"Template rendering failed: {e}")
        return {
            **state,
            "error": f"Template rendering failed: {str(e)}"
        }