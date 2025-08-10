"""
Simple Interview Agent - Agent10
"""

import logging
from livekit.agents import Agent, JobContext

logger = logging.getLogger(__name__)


class InterviewAgent(Agent):
    """
    Simple AI Interview Agent.

    Features:
    - Clean, straightforward interview flow
    - Multilingual support (Arabic/English)
    - Professional HR approach
    """

    def __init__(
        self,
        ctx: JobContext,
        candidate_name: str = "the candidate",
        job_name: str = "this position",
        company_name: str = "our company",
        interview_prompt: str = "",
        cv_summary: str = "",
        cv_analysis: dict = None,
        interview_language: str = "english",
        transcript_saver=None,
        metadata: dict = None,
        **kwargs,
    ):
        """
        Initialize the interview agent.

        Args:
            ctx: The job context provided by the agent framework.
            candidate_name: Name of the interview candidate
            job_name: Position being interviewed for
            company_name: Company conducting the interview
            interview_prompt: Specific interview guidelines and questions
            cv_summary: A summary of the candidate's CV
            cv_analysis: A detailed analysis of the candidate's CV
            interview_language: Language for the interview (english/arabic)
            **kwargs: Additional arguments passed to parent Agent class
        """
        self.ctx = ctx
        self.candidate_name = candidate_name
        self.job_name = job_name
        self.company_name = company_name
        self.interview_prompt = interview_prompt
        self.cv_summary = cv_summary
        self.cv_analysis = cv_analysis or {}
        self.interview_language = interview_language.lower()
        self.transcript_saver = transcript_saver
        self.metadata = metadata or {}

        # Generate instructions
        instructions = self._build_instructions()

        # Log agent configuration
        logger.info(
            f"Creating InterviewAgent for {candidate_name} - {job_name} at {company_name}"
        )
        logger.info(f"Language: {self.interview_language}")
        logger.info(f"Instructions length: {len(instructions)} characters")

        # Initialize parent Agent
        super().__init__(instructions=instructions, **kwargs)

        logger.info(
            "✅ InterviewAgent initialized - transcript saving handled by session event handlers"
        )

    def _build_instructions(self) -> str:
        """Build simple agent instructions focused on the backend interview prompt."""

        # Simple base personality
        if self.interview_language == "arabic":
            base = (
                f"أنت ليلى النور، مسؤولة موارد بشرية من {self.company_name}. "
                f"تقومين بإجراء مقابلة عمل لمنصب {self.job_name} مع {self.candidate_name}. "
                f"أنت المُحاورة المحترفة. تحدثي بالعربية بشكل مهني ومحترم."
            )
        else:
            base = (
                f"You are Laila Al Noor, a professional HR interviewer from {self.company_name}. "
                f"You are conducting an interview for the {self.job_name} position with {self.candidate_name}. "
                f"You are the professional interviewer. Speak in English professionally and respectfully."
            )

        # Main interview prompt from backend - this is the key part
        if self.interview_prompt and self.interview_prompt.strip():
            interview_instructions = (
                f"\n\nCV ANALYSIS:\n{self.cv_analysis}"
                f"\n\nINTERVIEW INSTRUCTIONS:\n{self.interview_prompt}"
                f"\n\nIMPORTANT: Do not ask more than 1 question at a time. Wait for the candidate's response before asking additional questions."
                f"\n\nNOTE: If the candidate asks about something you don't know or that's outside the scope of this interview, politely redirect them back to the interview questions. Stay focused on your role as an interviewer."
            )
        else:
            # Fallback if no specific prompt
            interview_instructions = (
                f"\n\nINTERVIEW INSTRUCTIONS:\n"
                f"Conduct a professional interview for the {self.job_name} position. "
                f"Ask relevant questions about experience, skills, and qualifications. "
                f"Keep it focused and professional."
                f"\n\nCV ANALYSIS:\n{self.cv_analysis}"
                f"\n\nIMPORTANT: Do not ask more than 2 questions at a time. Wait for the candidate's response before asking additional questions."
                f"\n\nNOTE: If the candidate asks about something you don't know or that's outside the scope of this interview, politely redirect them back to the interview questions. Stay focused on your role as an interviewer."
            )

        # Simple ending rule
        ending_rule = "\n\nEnd the interview with: 'Thank you for your time. This concludes the interview.'"

        return f"{base}{interview_instructions}{ending_rule}"

    async def _on_llm_becoming_idle(self):
        """Check if interview concluded and end session."""
        try:
            history = self.get_chat_history()
            if history:
                last_message = history[-1]
                # Check for various ways the interview might conclude
                conclusion_phrases = [
                    "Thank you for your time. This concludes the interview.",
                    "This concludes the interview",
                    "Thank you for your time",
                    "The interview is now complete",
                    "That concludes our interview",
                ]

                message_content = last_message.content.lower()
                if any(
                    phrase.lower() in message_content for phrase in conclusion_phrases
                ):
                    logger.info(
                        f"Interview concluded - ending session. Last message: {last_message.content[:100]}..."
                    )
                    # Give a small delay to ensure the message is fully processed
                    import asyncio

                    await asyncio.sleep(1)
                    self.ctx.task.set_result("Interview concluded by agent")
                    await self.ctx.disconnect()
                    return
        except Exception as e:
            logger.error(f"Error checking for conclusion: {e}")

        return await super()._on_llm_becoming_idle()
