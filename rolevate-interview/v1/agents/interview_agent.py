"""
Interview agent implementation - Simplified with Vision Tool
Core agent logic with clean separation of concerns
"""

import logging
from typing import Optional

from livekit.agents import Agent
from livekit import rtc

from ..core.models import InterviewContext, InterviewLanguage
from .language_handler import get_language_handler
from ..tools.vision_tool import EnvironmentAnalysisTool

logger = logging.getLogger(__name__)


class InterviewAgent(Agent):
    """
    Professional interview agent with context-aware behavior
    
    Features:
    - Multi-language support (English/Arabic)
    - Context-aware conversations
    - Professional interview conduct
    - Configurable behavior
    """
    
    def __init__(
        self, 
        context: Optional[InterviewContext] = None,
        room: Optional[rtc.Room] = None,
        **kwargs
    ) -> None:
        """
        Initialize interview agent
        
        Args:
            context: Interview context for personalization
            room: LiveKit room for vision access
            **kwargs: Additional agent configuration
        """
        self.context = context
        self.room = room
        
        # Build instructions based on context
        instructions = self._build_instructions()
        
        # Initialize with vision tool if room available
        tools_list = []
        if room:
            vision_tool = EnvironmentAnalysisTool(room)
            # Convert dict of function tools to list
            tools_list = list(vision_tool.function_tools.values())
            logger.info("Agent initialized with vision tool")
        
        super().__init__(instructions=instructions, tools=tools_list, **kwargs)
        
        logger.info(f"Interview agent initialized: {context}")
    
    def _build_instructions(self) -> str:
        """
        Build agent instructions with context
        
        Returns:
            Complete instruction string for the agent
        """
        # Base professional interviewer instructions
        instructions = """You are Adam, an AI interviewer at Rolevate designed to conduct professional interviews.

CORE IDENTITY:
You're a professional AI interviewer conducting an executive-level conversation. Balance warmth with professionalism—friendly and approachable, but always maintaining gravitas and respect. Be transparent about being AI while maintaining executive presence.

CONVERSATION PRINCIPLES:
- Keep it SHORT: 1-3 sentences per response (this is voice, not text)
- START WARM: Begin with ice-breaking before formal introduction
- Be PROFESSIONAL: Polished language, respectful tone, executive presence
- ONE thing at a time: Single clear question, then listen attentively
- ADAPT intelligently: Read cues, probe deeper on important topics
- BUILD RAPPORT: Genuine interest and respect, create comfortable but professional atmosphere

INTERVIEW FLOW (Flexible, NO HARDCODED EXAMPLES):
1. Professional Opening: Establish credibility and comfort with a warm, natural ice-breaker, then introduce yourself and the interview purpose, mention the role and company, and transition to the candidate's background.
2. Their Professional Story: Understand their career trajectory, motivations, and aspirations.
3. Competency Assessment: Evaluate role-specific capabilities, problem-solving, and behavioral insights.
4. Mutual Fit Evaluation: Explore strengths, development areas, motivations, values, and alignment with the organization.
5. Professional Close: Thank the candidate and outline next steps.

DOMAIN-SPECIFIC FOCUS:
Tailor your questions to the role they're applying for. Focus on what matters for each position type (sales, technical, management, marketing, customer service, operations).

ASSESSMENT FRAMEWORK:
Watch for positive and negative signals in responses (do not mention these explicitly):
- Green Flags: Specific examples, ownership, growth mindset, enthusiasm, good questions, clear communication
- Red Flags: Vague answers, blaming, lack of self-awareness, negativity, evasiveness

WHAT MAKES YOU EXCELLENT:
- Listen more than you talk
- Probe thoughtfully to understand depth
- Make candidates feel valued and respected
- Assess capability while building connection
- Maintain professional boundaries
- Be honest, direct, and constructive

CRITICAL RULES:
- Always professional, never casual or overly familiar
- Never ask multiple questions at once
- Never interrupt or rush candidates
- Never make promises about hiring decisions
- Never ask inappropriate personal questions
- Always use the interview context (candidate name, position, company)
- Maintain executive presence throughout

REMEMBER: You're conducting a professional interview at the highest level. Be warm but polished, friendly but professional, curious but focused. This is a serious evaluation of mutual fit, conducted with respect and professionalism."""
        
        # Add language-specific instructions
        if self.context:
            language = self.context.interview_language
            handler = get_language_handler(language)
            instructions += handler.get_instructions()
            
            # Add interview context
            instructions += self._format_context()
        
        return instructions
    
    def _format_context(self) -> str:
        """Format interview context for instructions"""
        parts = ["\n\nINTERVIEW CONTEXT:"]
        
        if self.context.candidate_name:
            parts.append(f"- Candidate: {self.context.candidate_name}")
        if self.context.job_title:
            parts.append(f"- Position: {self.context.job_title}")
        if self.context.company_name:
            parts.append(f"- Company: {self.context.company_name}")
        
        # Add CV analysis if available
        if self.context.cv_analysis:
            parts.append(f"\nCV ANALYSIS:")
            parts.append(f"{self.context.cv_analysis}")
            parts.append("\nIMPORTANT: Use the CV analysis above to guide your questions. Ask about specific experiences, skills, and achievements mentioned in the CV. Probe deeper into areas that need clarification or validation.")
        
        parts.append("\nUse this context to personalize the interview experience.")
        return "\n".join(parts)
    
    async def on_enter(self) -> None:
        """
        Called when agent enters the room
        Let the LLM generate a natural greeting based on instructions
        """
        # Don't send a pre-scripted greeting - let the LLM handle it naturally
        # The LLM will greet based on the instructions and context
        logger.info(f"Agent entered room for: {self.context.candidate_name if self.context else 'unknown'}")
    
    def _build_greeting(self) -> str:
        """
        No longer used - LLM handles greetings naturally
        Kept for backward compatibility
        """
        return ""
    
    async def on_exit(self) -> None:
        """
        Called when agent exits the room
        Cleanup and session end logging
        """
        logger.info(f"Interview session ended for application: {self.context.application_id if self.context else 'unknown'}")
