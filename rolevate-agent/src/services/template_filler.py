"""Template filling and rendering service."""
from pathlib import Path
from typing import Literal
from jinja2 import Environment, FileSystemLoader, select_autoescape
from loguru import logger

from ..models.cv_schema import CVData


class TemplateFiller:
    """Fill CV templates with structured data."""
    
    def __init__(self, templates_dir: str = None):
        """
        Initialize template filler.
        
        Args:
            templates_dir: Path to templates directory
        """
        if templates_dir is None:
            templates_dir = Path(__file__).parent.parent / "templates"
        
        self.templates_dir = Path(templates_dir)
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
        """Get list of available template names."""
        templates = []
        
        if self.templates_dir.exists():
            for template_dir in self.templates_dir.iterdir():
                if template_dir.is_dir() and (template_dir / "template.html").exists():
                    templates.append(template_dir.name)
        
        return templates
    
    def render_html(self, cv_data: CVData, template_name: str = "modern") -> str:
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
            # Load template
            template_path = f"{template_name}/template.html"
            template = self.env.get_template(template_path)
            
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
        Get CSS file content for a template.
        
        Args:
            template_name: Name of template
            
        Returns:
            str: CSS content
        """
        css_path = self.templates_dir / template_name / "style.css"
        
        if css_path.exists():
            return css_path.read_text()
        
        return ""
    
    def fill_docx_template(self, cv_data: CVData, template_name: str = "modern") -> Path:
        """
        Fill a DOCX template with CV data.
        
        Args:
            cv_data: Structured CV data
            template_name: Name of template to use
            
        Returns:
            Path: Path to filled DOCX file
        """
        logger.info(f"Filling DOCX template: {template_name}")
        
        try:
            from docxtpl import DocxTemplate
        except ImportError:
            raise ImportError("docxtpl is required for DOCX templates")
        
        template_path = self.templates_dir / template_name / "template.docx"
        
        if not template_path.exists():
            raise FileNotFoundError(f"DOCX template not found: {template_path}")
        
        try:
            doc = DocxTemplate(str(template_path))
            
            # Prepare context
            context = cv_data.model_dump()
            
            # Render template
            doc.render(context)
            
            # Save to temporary location
            output_path = self.templates_dir.parent / "outputs" / f"{cv_data.full_name.replace(' ', '_')}_filled.docx"
            output_path.parent.mkdir(exist_ok=True)
            doc.save(str(output_path))
            
            logger.success(f"DOCX filled and saved to: {output_path}")
            return output_path
            
        except Exception as e:
            logger.error(f"Error filling DOCX template: {e}")
            raise Exception(f"Failed to fill DOCX template: {e}")
