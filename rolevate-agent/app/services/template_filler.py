"""Template filling and rendering service."""
from pathlib import Path
from typing import Literal
from jinja2 import Environment, FileSystemLoader, select_autoescape
from loguru import logger

from app.models.schemas import CVData


class TemplateFiller:
    """Fill CV templates with structured data."""
    
    def __init__(self, templates_dir: str = None):
        """
        Initialize template filler.
        
        Args:
            templates_dir: Path to templates directory
        """
        if templates_dir is None:
            # Point to templates directory (cv_templates are in subdirectory)
            templates_dir = Path(__file__).parent.parent / "templates"
        
        self.templates_dir = Path(templates_dir)
        self.cv_templates_dir = self.templates_dir / "cv_templates"
        
        self.env = Environment(
            loader=FileSystemLoader(str(self.templates_dir)),
            autoescape=select_autoescape(['html', 'xml']),
            trim_blocks=True,
            lstrip_blocks=True
        )
        
        # Add custom filters
        self.env.filters['format_date'] = self._format_date
        self.env.filters['format_phone'] = self._format_phone
        self.env.filters['nl2br'] = self._nl2br
    
    def _format_date(self, date_str: str) -> str:
        """Format date string for display."""
        if not date_str:
            return ""
        if date_str.lower() == "present":
            return "Present"
        
        # Try to format YYYY-MM to "Month YYYY"
        try:
            if len(date_str) == 7 and date_str[4] == '-':
                year, month = date_str.split('-')
                months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                         'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
                return f"{months[int(month)-1]} {year}"
        except:
            pass
        
        return date_str
    
    def _format_phone(self, phone: str) -> str:
        """Format phone number."""
        if not phone:
            return ""
        # Remove common formatting
        cleaned = ''.join(c for c in phone if c.isdigit() or c == '+')
        return cleaned if cleaned else phone
    
    def _nl2br(self, text: str) -> str:
        """Convert newlines to HTML br tags."""
        if not text:
            return ""
        return text.replace('\n', '<br>')
    
    def get_available_templates(self) -> list[str]:
        """Get list of available CV template names (excludes UI pages)."""
        # Define CV template names (exclude UI pages like index, chat_index, etc.)
        cv_templates = ["classic_cv", "modern_cv", "executive_cv"]
        available = []
        
        # Check which CV templates actually exist in cv_templates directory
        if self.cv_templates_dir.exists():
            for template_name in cv_templates:
                template_path = self.cv_templates_dir / f"{template_name}.html"
                if template_path.exists():
                    available.append(template_name)
        
        return available if available else cv_templates
    
    def render_html(self, cv_data: CVData, template_name: str = "modern_cv") -> str:
        """
        Render CV data to HTML using specified template.
        
        Args:
            cv_data: Structured CV data
            template_name: Name of template to use
            
        Returns:
            str: Rendered HTML
        """
        logger.info(f"Rendering CV with template: {template_name}")
        
        try:
            # Load template from cv_templates directory
            template_file = f"cv_templates/{template_name}.html" if not template_name.endswith('.html') else f"cv_templates/{template_name}"
            template = self.env.get_template(template_file)
            
            # Render with data
            html = template.render(
                cv=cv_data.model_dump(),
                name=cv_data.full_name,
                title=cv_data.job_title,
                contact=cv_data.contact,
                summary=cv_data.summary,
                experience=cv_data.experience,
                education=cv_data.education,
                skills=cv_data.skills,
                skill_categories=cv_data.skill_categories,
                certifications=cv_data.certifications,
                projects=cv_data.projects,
                languages=cv_data.languages,
                awards=cv_data.awards,
                publications=cv_data.publications,
                volunteer=cv_data.volunteer,
                interests=cv_data.interests
            )
            
            logger.success(f"HTML rendered successfully ({len(html)} chars)")
            return html
            
        except Exception as e:
            logger.error(f"Error rendering template: {e}")
            raise Exception(f"Failed to render template '{template_name}': {e}")
    
    def get_template_css(self, template_name: str) -> str:
        """
        Get CSS file content for a template (if it exists in cv_templates subdirectory).
        
        Args:
            template_name: Name of template
            
        Returns:
            str: CSS content or empty string
        """
        # Try to find CSS in cv_templates subdirectory
        css_path = self.cv_templates_dir / template_name / "style.css"
        
        if css_path.exists():
            return css_path.read_text()
        
        return ""
