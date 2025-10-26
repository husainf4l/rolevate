"""
Rolevate Interview Agent implementation
"""

import logging
from typing import Optional

from livekit.agents import Agent

from models import InterviewContext

logger = logging.getLogger("rolevate-agent")


class RolevateAgent(Agent):
    """
    Rolevate Interview Agent with personalized context.
    
    This agent conducts professional interviews with candidates,
    supporting both English and Arabic languages. It uses the
    interview context to personalize the conversation.
    """
    
    def __init__(self, interview_context: Optional[InterviewContext] = None) -> None:
        """
        Initialize the Rolevate agent.
        
        Args:
            interview_context: Optional interview context for personalization
        """
        super().__init__(
            instructions=self._build_instructions(interview_context)
        )
        self.interview_context = interview_context
    
    def _build_instructions(self, context: Optional[InterviewContext]) -> str:
        """
        Build agent instructions with optional context.
        
        The instructions define how the agent should behave during
        the interview, including language support and tone.
        
        Args:
            context: Interview context with candidate and job information
            
        Returns:
            Instructions string for the agent
        """
        base_instructions = """You are a professional AI interviewer for Rolevate.

INTERVIEW STYLE:
- Be professional, friendly, and ask thoughtful questions
- Your responses should be concise and conversational (this is a voice interview)
- Listen carefully to the candidate's answers and ask relevant follow-up questions
- Maintain a positive and encouraging tone throughout the interview"""
        
        # Enforce strict language based on interview_language
        if context and context.interview_language:
            if context.interview_language.lower() == "arabic":
                base_instructions += """

CRITICAL LANGUAGE REQUIREMENT:
- You MUST conduct the ENTIRE interview in Arabic
- ALWAYS respond in Arabic, regardless of what language the candidate uses
- If the candidate speaks English or any other language, politely acknowledge their response but continue in Arabic
- All questions, feedback, and conversation must be in Arabic only
- The interview language is set to Arabic and must be strictly maintained"""
            else:
                base_instructions += """

CRITICAL LANGUAGE REQUIREMENT:
- You MUST conduct the ENTIRE interview in English
- ALWAYS respond in English, regardless of what language the candidate uses
- If the candidate speaks Arabic or any other language, politely acknowledge their response but continue in English
- All questions, feedback, and conversation must be in English only
- The interview language is set to English and must be strictly maintained"""
        
        if context and context.candidate_name:
            base_instructions += f"\n\nYou are interviewing {context.candidate_name}"
            if context.job_title:
                base_instructions += f" for the {context.job_title} position"
            if context.company_name:
                base_instructions += f" at {context.company_name}"
            base_instructions += "."
        
        return base_instructions
    
    async def on_enter(self):
        """
        Called when agent enters the room - greet the candidate.
        
        This method is triggered when the agent joins the interview room
        and sends an initial greeting to the candidate.
        """
        greeting = self._build_greeting()
        await self.session.say(greeting)
    
    def _build_greeting(self) -> str:
        """
        Build a personalized greeting based on interview context.
        
        The greeting is customized based on available information about
        the candidate, job position, and company. It starts in the
        preferred interview language if specified.
        
        Returns:
            Personalized greeting string
        """
        if not self.interview_context:
            return "Hello! Welcome to your Rolevate interview. Let's get started."
        
        # Determine greeting language based on interview_language
        use_arabic = (
            self.interview_context.interview_language and 
            self.interview_context.interview_language.lower() == "arabic"
        )
        
        if use_arabic:
            # Arabic greeting
            parts = ["مرحباً"]
            
            if self.interview_context.candidate_name:
                parts.append(f"{self.interview_context.candidate_name}")
            
            greeting = " ".join(parts) + "."
            
            if self.interview_context.job_title and self.interview_context.company_name:
                greeting += (
                    f" أهلاً بك في مقابلتك لوظيفة {self.interview_context.job_title} "
                    f"في شركة {self.interview_context.company_name}."
                )
            elif self.interview_context.job_title:
                greeting += f" أهلاً بك في مقابلتك لوظيفة {self.interview_context.job_title}."
            else:
                greeting += " أهلاً بك في مقابلتك مع روليفيت."
            
            greeting += " لنبدأ."
        else:
            # English greeting (default)
            parts = ["Hello"]
            
            if self.interview_context.candidate_name:
                parts.append(f"{self.interview_context.candidate_name}")
            
            greeting = " ".join(parts) + "."
            
            if self.interview_context.job_title and self.interview_context.company_name:
                greeting += (
                    f" Welcome to your interview for the {self.interview_context.job_title} "
                    f"position at {self.interview_context.company_name}."
                )
            elif self.interview_context.job_title:
                greeting += f" Welcome to your interview for the {self.interview_context.job_title} position."
            else:
                greeting += " Welcome to your Rolevate interview."
            
            greeting += " Let's get started."
        
        return greeting
