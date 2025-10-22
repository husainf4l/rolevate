"""
LanguageTool Grammar Checking Service
Provides professional grammar and spelling correction using LanguageTool API
Works alongside OpenAI for comprehensive text optimization
"""
import asyncio
from typing import Dict, Any, List, Optional, Tuple
import language_tool_python
from loguru import logger
import re
from dataclasses import dataclass

from app.config import settings


@dataclass
class GrammarSuggestion:
    """Grammar correction suggestion from LanguageTool"""
    original_text: str
    corrected_text: str
    error_type: str
    message: str
    offset: int
    length: int
    confidence: float = 1.0


class LanguageToolService:
    """
    Advanced grammar and spelling checking using LanguageTool
    Integrates with existing OpenAI grammar optimization
    """
    
    def __init__(self):
        self.tool = None
        self.supported_languages = ["en-US", "en-GB", "en-CA", "en-AU"]
        self.default_language = "en-US"
        self._initialize_tool()
    
    def _initialize_tool(self) -> None:
        """Initialize LanguageTool with lazy loading"""
        try:
            logger.info("Initializing LanguageTool grammar checker...")
            # Use local LanguageTool installation for better performance
            self.tool = language_tool_python.LanguageTool(self.default_language)
            logger.success("✅ LanguageTool initialized successfully")
        except Exception as e:
            logger.warning(f"⚠️ LanguageTool initialization failed: {e}")
            logger.info("Grammar checking will fall back to OpenAI only")
            self.tool = None
    
    def is_available(self) -> bool:
        """Check if LanguageTool is available"""
        return self.tool is not None
    
    async def check_grammar(self, text: str, language: str = None) -> List[GrammarSuggestion]:
        """
        Check grammar and spelling in text
        
        Args:
            text: Text to check
            language: Language code (default: en-US)
            
        Returns:
            List of grammar suggestions
        """
        if not self.tool or not text or len(text.strip()) < 3:
            return []
        
        language = language or self.default_language
        
        try:
            # Run grammar check
            matches = self.tool.check(text)
            
            suggestions = []
            for match in matches:
                # Create suggestion object
                suggestion = GrammarSuggestion(
                    original_text=text[match.offset:match.offset + match.errorLength],
                    corrected_text=match.replacements[0] if match.replacements else "",
                    error_type=match.ruleId,
                    message=match.message,
                    offset=match.offset,
                    length=match.errorLength,
                    confidence=self._calculate_confidence(match)
                )
                suggestions.append(suggestion)
            
            return suggestions
            
        except Exception as e:
            logger.error(f"Grammar check failed: {e}")
            return []
    
    def _calculate_confidence(self, match) -> float:
        """Calculate confidence score for a grammar match"""
        # High confidence for spelling errors
        if "MORFOLOGIK_RULE" in match.ruleId:
            return 0.9
        
        # Medium confidence for common grammar rules
        if any(rule in match.ruleId for rule in ["COMMA", "AGREEMENT", "TENSE"]):
            return 0.8
        
        # Lower confidence for style suggestions
        if any(rule in match.ruleId for rule in ["STYLE", "REDUNDANCY"]):
            return 0.6
        
        return 0.7  # Default confidence
    
    async def apply_corrections(self, text: str, language: str = None) -> str:
        """
        Apply automatic corrections to text
        
        Args:
            text: Text to correct
            language: Language code
            
        Returns:
            Corrected text
        """
        if not self.tool or not text:
            return text
        
        try:
            # Get corrections
            suggestions = await self.check_grammar(text, language)
            
            # Apply high-confidence corrections automatically
            corrected_text = text
            offset_adjustment = 0
            
            # Sort by offset to apply corrections from left to right
            high_confidence_suggestions = [
                s for s in suggestions 
                if s.confidence >= 0.8 and s.corrected_text
            ]
            
            for suggestion in sorted(high_confidence_suggestions, key=lambda x: x.offset):
                # Adjust offset for previous corrections
                adjusted_offset = suggestion.offset + offset_adjustment
                adjusted_end = adjusted_offset + suggestion.length
                
                # Apply correction
                before = corrected_text[:adjusted_offset]
                after = corrected_text[adjusted_end:]
                corrected_text = before + suggestion.corrected_text + after
                
                # Track offset change
                offset_adjustment += len(suggestion.corrected_text) - suggestion.length
                
                logger.debug(f"Applied correction: '{suggestion.original_text}' → '{suggestion.corrected_text}'")
            
            return corrected_text
            
        except Exception as e:
            logger.error(f"Failed to apply corrections: {e}")
            return text
    
    async def check_cv_section(self, text: str, section_type: str = "general") -> Dict[str, Any]:
        """
        Check grammar for specific CV sections with tailored rules
        
        Args:
            text: Text to check
            section_type: Type of CV section (summary, experience, education, etc.)
            
        Returns:
            Dictionary with corrections and suggestions
        """
        if not text or not self.tool:
            return {
                "original_text": text,
                "corrected_text": text,
                "suggestions": [],
                "error_count": 0
            }
        
        try:
            # Get all suggestions
            suggestions = await self.check_grammar(text)
            
            # Filter suggestions based on CV section
            filtered_suggestions = self._filter_cv_suggestions(suggestions, section_type)
            
            # Apply automatic corrections
            corrected_text = await self.apply_corrections(text)
            
            return {
                "original_text": text,
                "corrected_text": corrected_text,
                "suggestions": [
                    {
                        "original": s.original_text,
                        "correction": s.corrected_text,
                        "message": s.message,
                        "type": s.error_type,
                        "confidence": s.confidence
                    }
                    for s in filtered_suggestions
                ],
                "error_count": len(filtered_suggestions),
                "improvement_applied": text != corrected_text
            }
            
        except Exception as e:
            logger.error(f"CV section check failed: {e}")
            return {
                "original_text": text,
                "corrected_text": text,
                "suggestions": [],
                "error_count": 0
            }
    
    def _filter_cv_suggestions(self, suggestions: List[GrammarSuggestion], 
                              section_type: str) -> List[GrammarSuggestion]:
        """Filter suggestions based on CV section requirements"""
        
        # CV-specific filtering rules
        cv_rules = {
            "summary": {
                "skip_rules": ["PASSIVE_VOICE"],  # Passive voice is sometimes OK in summaries
                "focus_rules": ["SPELLING", "AGREEMENT", "COMMA"]
            },
            "experience": {
                "skip_rules": ["FRAGMENT"],  # Bullet points can be fragments
                "focus_rules": ["SPELLING", "TENSE", "AGREEMENT"]
            },
            "education": {
                "skip_rules": ["PASSIVE_VOICE"],
                "focus_rules": ["SPELLING", "PROPER_NOUN"]
            },
            "skills": {
                "skip_rules": ["FRAGMENT", "PASSIVE_VOICE"],  # Skills are often just lists
                "focus_rules": ["SPELLING"]
            }
        }
        
        rules = cv_rules.get(section_type, cv_rules["summary"])
        
        filtered = []
        for suggestion in suggestions:
            # Skip rules that don't apply to this CV section
            if any(skip_rule in suggestion.error_type for skip_rule in rules.get("skip_rules", [])):
                continue
            
            # Prioritize important rules for this section
            if any(focus_rule in suggestion.error_type for focus_rule in rules.get("focus_rules", [])):
                suggestion.confidence = min(suggestion.confidence + 0.1, 1.0)
            
            filtered.append(suggestion)
        
        return filtered
    
    async def check_professional_tone(self, text: str) -> Dict[str, Any]:
        """
        Check if text maintains professional tone suitable for CVs
        
        Args:
            text: Text to analyze
            
        Returns:
            Analysis of professional tone
        """
        if not text:
            return {"score": 1.0, "suggestions": []}
        
        # Professional tone analysis
        informal_patterns = [
            r'\b(gonna|wanna|gotta|kinda)\b',
            r'\b(yeah|yep|nope|ok)\b',
            r'\b(awesome|cool|super|amazing)\b',
            r'!{2,}',  # Multiple exclamation marks
            r'\?{2,}',  # Multiple question marks
        ]
        
        tone_issues = []
        score = 1.0
        
        for pattern in informal_patterns:
            matches = re.finditer(pattern, text, re.IGNORECASE)
            for match in matches:
                tone_issues.append({
                    "text": match.group(),
                    "position": match.start(),
                    "issue": "Informal language detected",
                    "suggestion": "Consider using more professional language"
                })
                score -= 0.1
        
        return {
            "score": max(score, 0.0),
            "suggestions": tone_issues,
            "is_professional": score >= 0.8
        }
    
    def close(self):
        """Clean up LanguageTool resources"""
        if self.tool:
            try:
                self.tool.close()
                logger.info("LanguageTool resources cleaned up")
            except Exception as e:
                logger.warning(f"Failed to close LanguageTool: {e}")


# Singleton instance for reuse
_language_tool_service = None

def get_language_tool_service() -> LanguageToolService:
    """Get or create LanguageTool service instance"""
    global _language_tool_service
    if _language_tool_service is None:
        _language_tool_service = LanguageToolService()
    return _language_tool_service