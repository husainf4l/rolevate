"""
Template Renderer for CV Generation
Handles Jinja2 template rendering with CV data
"""

import os
import json
from typing import Dict, Any, Optional
from jinja2 import Environment, FileSystemLoader, Template
import logging

logger = logging.getLogger(__name__)

class TemplateRenderer:
    """
    Renders CV templates with provided data using Jinja2
    """
    
    def __init__(self, templates_dir: str = None):
        """Initialize template renderer with templates directory."""
        if templates_dir is None:
            # Default to agents/templates directory
            current_dir = os.path.dirname(os.path.abspath(__file__))
            templates_dir = os.path.join(os.path.dirname(current_dir), 'templates')
        
        self.templates_dir = templates_dir
        
        # Create Jinja2 environment
        self.env = Environment(
            loader=FileSystemLoader(templates_dir),
            autoescape=True,
            trim_blocks=True,
            lstrip_blocks=True
        )
        
        logger.info(f"Template renderer initialized with directory: {templates_dir}")
    
    def get_available_templates(self) -> Dict[str, Dict[str, Any]]:
        """Get list of available templates with metadata."""
        templates = {}
        
        if not os.path.exists(self.templates_dir):
            logger.warning(f"Templates directory does not exist: {self.templates_dir}")
            return templates
        
        for filename in os.listdir(self.templates_dir):
            if filename.endswith('.html'):
                template_id = filename.replace('.html', '')
                metadata_file = os.path.join(self.templates_dir, f"{template_id}.json")
                
                template_info = {
                    'id': template_id,
                    'filename': filename,
                    'name': template_id.replace('_', ' ').title()
                }
                
                # Load metadata if available
                if os.path.exists(metadata_file):
                    try:
                        with open(metadata_file, 'r') as f:
                            metadata = json.load(f)
                            template_info.update(metadata)
                    except Exception as e:
                        logger.warning(f"Failed to load metadata for {template_id}: {e}")
                
                templates[template_id] = template_info
        
        return templates
    
    def render_template(self, template_name: str, cv_data: Dict[str, Any]) -> str:
        """
        Render a template with CV data.
        
        Args:
            template_name: Template filename (e.g., 'classic_cv.html')
            cv_data: Dictionary containing CV data
            
        Returns:
            Rendered HTML string
        """
        try:
            template = self.env.get_template(template_name)
            
            # Prepare data for rendering
            render_data = self._prepare_cv_data(cv_data)
            
            # Render template
            html = template.render(**render_data)
            
            logger.info(f"Successfully rendered template: {template_name}")
            return html
            
        except Exception as e:
            logger.error(f"Failed to render template {template_name}: {e}")
            raise
    
    def _prepare_cv_data(self, cv_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Prepare CV data for template rendering.
        
        Args:
            cv_data: Raw CV data dictionary
            
        Returns:
            Processed data ready for template rendering
        """
        # Create a copy to avoid modifying original data
        render_data = dict(cv_data)
        
        # Ensure required fields exist with defaults
        defaults = {
            'name': 'Your Name',
            'title': 'Your Title', 
            'contact': 'your.email@example.com | +1234567890',
            'summary': 'Professional summary will appear here.',
            'skills': [],
            'experience': [],
            'education': []
        }
        
        for key, default_value in defaults.items():
            if key not in render_data or not render_data[key]:
                render_data[key] = default_value
        
        # Process contact information
        if isinstance(render_data.get('contact'), dict):
            contact_parts = []
            contact_info = render_data['contact']
            
            if contact_info.get('email'):
                contact_parts.append(contact_info['email'])
            if contact_info.get('phone'):
                contact_parts.append(contact_info['phone'])
            if contact_info.get('address'):
                contact_parts.append(contact_info['address'])
            if contact_info.get('linkedin'):
                contact_parts.append(f"LinkedIn: {contact_info['linkedin']}")
                
            render_data['contact'] = ' | '.join(contact_parts)
        
        # Ensure skills is a list
        if isinstance(render_data.get('skills'), str):
            render_data['skills'] = [s.strip() for s in render_data['skills'].split(',')]
        
        # Process experience entries
        if render_data.get('experience'):
            for exp in render_data['experience']:
                # Ensure required fields
                exp.setdefault('title', 'Job Title')
                exp.setdefault('company', 'Company Name')
                exp.setdefault('start_date', 'Start Date')
                exp.setdefault('end_date', 'End Date')
                exp.setdefault('description', 'Job description and achievements.')
        
        # Process education entries
        if render_data.get('education'):
            for edu in render_data['education']:
                # Ensure required fields
                edu.setdefault('degree', 'Degree')
                edu.setdefault('institution', 'Institution')
                edu.setdefault('year', 'Year')
        
        return render_data
    
    def preview_template(self, template_name: str) -> str:
        """
        Generate a preview of the template with sample data.
        
        Args:
            template_name: Template filename
            
        Returns:
            Rendered HTML with sample data
        """
        sample_data = {
            'name': 'John Smith',
            'title': 'Senior Financial Analyst',
            'contact': 'john.smith@email.com | +1 (555) 123-4567 | New York, NY',
            'summary': 'Results-driven financial professional with 8+ years of experience in investment banking and financial analysis. Proven track record of developing comprehensive financial models and delivering strategic insights that drive business growth.',
            'skills': [
                'Financial Modeling & Analysis',
                'Excel & VBA Programming', 
                'PowerPoint Presentations',
                'Risk Management',
                'Investment Banking',
                'Due Diligence',
                'Bloomberg Terminal',
                'SQL & Python'
            ],
            'experience': [
                {
                    'title': 'Senior Financial Analyst',
                    'company': 'Goldman Sachs',
                    'start_date': 'Jan 2020',
                    'end_date': 'Present',
                    'description': 'Lead financial analysis for M&A transactions worth over $2B. Built complex financial models for client presentations and investment decisions. Collaborated with cross-functional teams to deliver strategic recommendations.'
                },
                {
                    'title': 'Financial Analyst',
                    'company': 'JPMorgan Chase',
                    'start_date': 'Jun 2018',
                    'end_date': 'Dec 2019',
                    'description': 'Conducted comprehensive financial analysis and valuation for mid-market companies. Prepared detailed pitch books and investment memoranda. Supported senior bankers in client meetings and deal execution.'
                }
            ],
            'education': [
                {
                    'degree': 'MBA in Finance',
                    'institution': 'Wharton School, University of Pennsylvania',
                    'year': '2018'
                },
                {
                    'degree': 'Bachelor of Science in Economics',
                    'institution': 'New York University',
                    'year': '2016'
                }
            ]
        }
        
        return self.render_template(template_name, sample_data)


# Convenience functions
def render_cv(template_name: str, cv_data: Dict[str, Any], templates_dir: str = None) -> str:
    """
    Convenience function to render a CV template.
    
    Args:
        template_name: Template filename
        cv_data: CV data dictionary
        templates_dir: Optional templates directory path
        
    Returns:
        Rendered HTML
    """
    renderer = TemplateRenderer(templates_dir)
    return renderer.render_template(template_name, cv_data)


def get_template_preview(template_name: str, templates_dir: str = None) -> str:
    """
    Get a preview of a template with sample data.
    
    Args:
        template_name: Template filename
        templates_dir: Optional templates directory path
        
    Returns:
        Rendered HTML preview
    """
    renderer = TemplateRenderer(templates_dir)
    return renderer.preview_template(template_name)