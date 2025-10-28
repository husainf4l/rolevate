"""
Language-specific handlers for interview agent
Simplifies language logic with strategy pattern
"""

from typing import Optional
from src.core.models import InterviewContext, InterviewLanguage


class LanguageHandler:
    """Base class for language-specific interview handling"""
    
    def get_instructions(self) -> str:
        """Get language-specific instructions"""
        raise NotImplementedError
    
    def build_greeting(self, context: Optional[InterviewContext]) -> str:
        """Build greeting in specific language"""
        raise NotImplementedError


class EnglishHandler(LanguageHandler):
    """English language handler"""
    
    def get_instructions(self) -> str:
        return """

CRITICAL LANGUAGE REQUIREMENT:
- You MUST conduct the ENTIRE interview in English
- ALWAYS respond in English, regardless of candidate's language
- If candidate speaks another language, acknowledge politely but continue in English
- All questions, feedback, and conversation must be in English only"""
    
    def build_greeting(self, context: Optional[InterviewContext]) -> str:
        if not context:
            return "Hello! I am Adam from Rolevate. Welcome to your interview. How are you today?"
        
        greeting = "Hello"
        if context.candidate_name:
            greeting += f" {context.candidate_name}"
        
        greeting += ". I am Adam from Rolevate and welcome to your interview"
        
        if context.company_name:
            greeting += f" at {context.company_name}"
        
        greeting += ". How are you today?"
        return greeting


class ArabicHandler(LanguageHandler):
    """Arabic language handler"""
    

    def get_instructions(self) -> str:
        return """
CRITICAL LANGUAGE REQUIREMENT:
- Conduct the entire interview in Arabic (Modern Standard Arabic, MSA)
- Always respond in Arabic, regardless of candidate's language
- If the candidate speaks another language, acknowledge politely but continue in Arabic
- All questions, feedback, and conversation must be in Arabic only

ARABIC GRAMMAR & STYLE:
- Use professional, warm, and conversational tone
- Maintain grammatical correctness and use respectful forms of address
- Keep sentences short and clear

CRITICAL TONE CONSISTENCY:
⚠️ ALWAYS maintain a calm, steady, professional tone throughout the conversation.
⚠️ NEVER use exclamation marks, excessive enthusiasm, or overly emotional language.
⚠️ NEVER be aggressive, commanding, or harsh in your phrasing.
⚠️ NEVER use humor, jokes, or casual expressions.
⚠️ Keep your voice tone stable, warm, and respectful—like a professional HR interviewer.
⚠️ Use neutral, balanced language that sounds natural when spoken aloud.
⚠️ Avoid dramatic words or phrases that create unnatural voice inflections.

CRITICAL GENDER-AWARE GRAMMAR (MANDATORY):
⚠️ YOU MUST detect the candidate's gender from their name before starting the conversation.
⚠️ Once detected, apply the correct grammatically gendered forms consistently throughout the ENTIRE conversation.
⚠️ Female names typically end in -a, -ah, -ة, -اء, -ى or are common female names (Maria, Sarah, Fatima, etc.)
⚠️ Use feminine forms (with kasra: كِ) for female candidates and masculine forms (ك) for male candidates.
⚠️ Apply gender-appropriate verb conjugations, pronouns, and adjectives in every sentence.
⚠️ Using incorrect gender forms is grammatically wrong and unprofessional in Arabic.

INTERVIEW FLOW:
1. Detect gender from candidate's name immediately
2. Start with a warm, gender-appropriate ice-breaking question
3. Listen and acknowledge the candidate's response
4. Introduce yourself and the interview purpose
5. Guide the conversation naturally, covering background, motivation, and relevant experience
6. Use the company name "Rolevate" in ENGLISH letters only (never transliterate)
7. Keep each part short and maintain gender consistency throughout
"""
    
    def build_greeting(self, context: Optional[InterviewContext]) -> str:
        """
        Return an empty string or a generic placeholder. The LLM should generate a natural, context-aware greeting in Arabic.
        """
        return ""


def get_language_handler(language: InterviewLanguage) -> LanguageHandler:
    """
    Factory function to get appropriate language handler
    
    Args:
        language: The interview language
        
    Returns:
        Appropriate language handler instance
    """
    if language == InterviewLanguage.ARABIC:
        return ArabicHandler()
    return EnglishHandler()
