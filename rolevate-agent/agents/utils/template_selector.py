"""
AI-Powered Template Selector
Intelligently selects the best CV template based on job title, industry, and CV content.
"""

import re
from typing import Dict, Any, List, Optional
from enum import Enum
import logging

logger = logging.getLogger(__name__)

class CVTemplate(Enum):
    """Available CV templates."""
    MODERN = "modern_cv.html"
    CLASSIC = "classic_cv.html"
    SIMPLE = "simple_cv.html"
    CREATIVE = "creative_cv.html"
    EXECUTIVE = "executive_cv.html"
    TECHNICAL = "technical_cv.html"

class TemplateSelector:
    """
    AI-powered template selector that chooses the best template based on CV content.
    """
    
    def __init__(self):
        """Initialize the template selector with rule mappings."""
        
        # Industry/Job title mappings to templates
        self.template_rules = {
            CVTemplate.TECHNICAL: {
                'job_titles': [
                    'software engineer', 'developer', 'programmer', 'architect',
                    'data scientist', 'ml engineer', 'devops', 'sre', 'backend',
                    'frontend', 'fullstack', 'full stack', 'tech lead', 'cto',
                    'system administrator', 'network engineer', 'cybersecurity',
                    'security engineer', 'database administrator', 'dba'
                ],
                'skills': [
                    'python', 'java', 'javascript', 'react', 'node.js', 'docker',
                    'kubernetes', 'aws', 'azure', 'gcp', 'tensorflow', 'pytorch',
                    'sql', 'nosql', 'mongodb', 'postgresql', 'redis', 'git'
                ],
                'keywords': [
                    'api', 'microservices', 'cloud', 'devops', 'ci/cd', 'agile',
                    'scrum', 'machine learning', 'artificial intelligence', 'blockchain'
                ]
            },
            
            CVTemplate.EXECUTIVE: {
                'job_titles': [
                    'ceo', 'cto', 'cfo', 'coo', 'president', 'vice president', 'vp',
                    'director', 'senior director', 'executive', 'head of', 'chief',
                    'managing director', 'general manager', 'senior manager'
                ],
                'skills': [
                    'leadership', 'strategy', 'management', 'p&l', 'budget',
                    'stakeholder management', 'board reporting', 'governance'
                ],
                'keywords': [
                    'led team', 'managed budget', 'strategic planning', 'board',
                    'stakeholders', 'revenue growth', 'transformation', 'merger'
                ]
            },
            
            CVTemplate.CREATIVE: {
                'job_titles': [
                    'designer', 'creative director', 'art director', 'graphic designer',
                    'ui designer', 'ux designer', 'product designer', 'web designer',
                    'illustrator', 'photographer', 'videographer', 'animator',
                    'creative', 'artist', 'copywriter', 'content creator'
                ],
                'skills': [
                    'photoshop', 'illustrator', 'figma', 'sketch', 'adobe creative',
                    'indesign', 'after effects', 'premiere', 'cinema 4d', 'blender',
                    'ui/ux', 'user experience', 'user interface', 'typography'
                ],
                'keywords': [
                    'creative', 'visual', 'brand', 'portfolio', 'design thinking',
                    'user-centered', 'aesthetic', 'visual identity', 'campaign'
                ]
            },
            
            CVTemplate.CLASSIC: {
                'job_titles': [
                    'accountant', 'financial analyst', 'investment banker', 'auditor',
                    'lawyer', 'attorney', 'consultant', 'business analyst',
                    'project manager', 'operations manager', 'hr manager',
                    'marketing manager', 'sales manager', 'account manager'
                ],
                'skills': [
                    'excel', 'powerpoint', 'financial modeling', 'budgeting',
                    'forecasting', 'compliance', 'risk management', 'audit',
                    'legal research', 'contract negotiation', 'project management'
                ],
                'keywords': [
                    'financial', 'compliance', 'regulatory', 'corporate', 'business',
                    'professional', 'traditional', 'established', 'fortune 500'
                ]
            },
            
            CVTemplate.MODERN: {
                'job_titles': [
                    'product manager', 'growth manager', 'marketing specialist',
                    'digital marketing', 'social media manager', 'content manager',
                    'startup', 'entrepreneur', 'business development', 'sales',
                    'customer success', 'account executive', 'partnerships'
                ],
                'skills': [
                    'growth hacking', 'a/b testing', 'analytics', 'google analytics',
                    'seo', 'sem', 'social media', 'content marketing', 'email marketing',
                    'crm', 'salesforce', 'hubspot', 'slack', 'notion'
                ],
                'keywords': [
                    'startup', 'growth', 'modern', 'innovative', 'digital', 'agile',
                    'data-driven', 'metrics', 'kpi', 'conversion', 'engagement'
                ]
            }
        }
        
        # Default fallback template
        self.default_template = CVTemplate.SIMPLE
    
    def _extract_job_titles(self, cv_data: Dict[str, Any]) -> List[str]:
        """Extract job titles from CV data."""
        titles = []
        
        # Current title
        if cv_data.get('title'):
            titles.append(cv_data['title'].lower())
        
        # Experience titles
        if cv_data.get('experience'):
            for exp in cv_data['experience']:
                if exp.get('title'):
                    titles.append(exp['title'].lower())
        
        return titles
    
    def _extract_skills(self, cv_data: Dict[str, Any]) -> List[str]:
        """Extract skills from CV data."""
        skills = []
        
        if cv_data.get('skills'):
            if isinstance(cv_data['skills'], list):
                skills.extend([skill.lower() for skill in cv_data['skills']])
            elif isinstance(cv_data['skills'], str):
                # Parse comma-separated skills
                parsed_skills = [s.strip().lower() for s in cv_data['skills'].split(',')]
                skills.extend(parsed_skills)
        
        return skills
    
    def _extract_keywords(self, cv_data: Dict[str, Any]) -> List[str]:
        """Extract keywords from summary and descriptions."""
        text_content = []
        
        # Summary
        if cv_data.get('summary'):
            text_content.append(cv_data['summary'].lower())
        
        # Experience descriptions
        if cv_data.get('experience'):
            for exp in cv_data['experience']:
                if exp.get('description'):
                    text_content.append(exp['description'].lower())
        
        # Combine all text and extract keywords
        full_text = ' '.join(text_content)
        
        # Simple keyword extraction (in a real implementation, you might use NLP)
        words = re.findall(r'\b\w+\b', full_text)
        return words
    
    def _score_template(self, template: CVTemplate, cv_data: Dict[str, Any]) -> float:
        """Calculate relevance score for a template."""
        if template not in self.template_rules:
            return 0.0
        
        rules = self.template_rules[template]
        score = 0.0
        
        # Extract CV features
        job_titles = self._extract_job_titles(cv_data)
        skills = self._extract_skills(cv_data)
        keywords = self._extract_keywords(cv_data)
        
        # Score based on job titles (highest weight)
        title_score = 0
        for title in job_titles:
            for rule_title in rules.get('job_titles', []):
                if rule_title in title or any(word in title for word in rule_title.split()):
                    title_score += 10
        score += title_score
        
        # Score based on skills (medium weight)
        skill_score = 0
        for skill in skills:
            for rule_skill in rules.get('skills', []):
                if rule_skill in skill or skill in rule_skill:
                    skill_score += 5
        score += skill_score
        
        # Score based on keywords (lower weight)
        keyword_score = 0
        for keyword in keywords:
            if keyword in rules.get('keywords', []):
                keyword_score += 1
        score += keyword_score
        
        # Normalize by content length to avoid bias toward longer CVs
        content_length = len(job_titles) + len(skills) + len(keywords)
        if content_length > 0:
            score = score / content_length * 100
        
        logger.debug(f"Template {template.value} score: {score:.2f}")
        return score
    
    def choose_template(self, cv_data: Dict[str, Any]) -> str:
        """
        Choose the best template based on CV content.
        
        Args:
            cv_data: Complete CV data dictionary
            
        Returns:
            Template filename
        """
        if not cv_data:
            return self.default_template.value
        
        # Score all templates
        scores = {}
        for template in CVTemplate:
            scores[template] = self._score_template(template, cv_data)
        
        # Find the best template
        best_template = max(scores, key=scores.get)
        best_score = scores[best_template]
        
        # Use default if no template has a good score
        if best_score < 5:  # Minimum threshold
            logger.info(f"No template scored well (best: {best_score:.2f}), using default")
            return self.default_template.value
        
        logger.info(f"Selected template: {best_template.value} (score: {best_score:.2f})")
        return best_template.value
    
    def get_template_recommendations(self, cv_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Get ranked template recommendations with scores.
        
        Args:
            cv_data: Complete CV data dictionary
            
        Returns:
            List of template recommendations with scores and reasons
        """
        recommendations = []
        
        for template in CVTemplate:
            score = self._score_template(template, cv_data)
            
            # Generate reasoning
            reasons = []
            if template == CVTemplate.TECHNICAL:
                if any('engineer' in title for title in self._extract_job_titles(cv_data)):
                    reasons.append("Contains engineering job titles")
                if any(skill in ['python', 'java', 'javascript'] for skill in self._extract_skills(cv_data)):
                    reasons.append("Has technical skills")
            
            elif template == CVTemplate.CREATIVE:
                if any('design' in title for title in self._extract_job_titles(cv_data)):
                    reasons.append("Contains design job titles")
                if any(skill in ['photoshop', 'figma', 'ui/ux'] for skill in self._extract_skills(cv_data)):
                    reasons.append("Has creative skills")
            
            elif template == CVTemplate.EXECUTIVE:
                if any(title in ['director', 'manager', 'vp'] for title in self._extract_job_titles(cv_data)):
                    reasons.append("Contains leadership titles")
                if 'leadership' in self._extract_skills(cv_data):
                    reasons.append("Has leadership skills")
            
            # Add recommendation
            recommendations.append({
                'template': template.value,
                'score': score,
                'confidence': min(score / 20, 1.0),  # Normalize to 0-1
                'reasons': reasons if reasons else ['General fit based on content analysis']
            })
        
        # Sort by score
        recommendations.sort(key=lambda x: x['score'], reverse=True)
        return recommendations


def select_cv_template(cv_data: Dict[str, Any]) -> str:
    """
    Convenience function to select the best template for CV data.
    
    Args:
        cv_data: Complete CV data dictionary
        
    Returns:
        Template filename
    """
    selector = TemplateSelector()
    return selector.choose_template(cv_data)


def get_template_suggestions(cv_data: Dict[str, Any]) -> List[Dict[str, Any]]:
    """
    Get template suggestions with explanations.
    
    Args:
        cv_data: Complete CV data dictionary
        
    Returns:
        List of template suggestions
    """
    selector = TemplateSelector()
    return selector.get_template_recommendations(cv_data)