"""
Simple Interview Agent - Agent12
"""

import logging
from livekit.agents import Agent, JobContext
from livekit.plugins import google, silero

logger = logging.getLogger(__name__)


class InterviewAgent(Agent):
    """
    Simple AI Interview Agent using Google Real-time Model.

    Features:
    - Real-time conversation processing
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

        # Use companySpelling if available, otherwise use company_name
        self.display_company_name = self.metadata.get("companySpelling", company_name)

        # Debug logging for company spelling
        logger.info(f"🔍 DEBUG - metadata keys: {list(self.metadata.keys())}")
        logger.info(f"🔍 DEBUG - companyName from param: {company_name}")
        logger.info(
            f"🔍 DEBUG - companySpelling from metadata: {self.metadata.get('companySpelling')}"
        )
        logger.info(
            f"🔍 DEBUG - final display_company_name: {self.display_company_name}"
        )

        # Generate instructions
        instructions = self._build_instructions()

        # Log agent configuration
        logger.info(
            f"Creating InterviewAgent for {candidate_name} - {job_name} at {company_name}"
        )
        if self.display_company_name != company_name:
            logger.info(
                f"🎯 Using companySpelling: '{self.display_company_name}' instead of '{company_name}'"
            )
        logger.info(f"Language: {self.interview_language}")
        logger.info(f"Instructions length: {len(instructions)} characters")

        # Initialize parent Agent with real-time model
        super().__init__(
            instructions=instructions,
            llm=google.beta.realtime.RealtimeModel(
                model="gemini-2.0-flash-exp",
                temperature=0.5,
            ),
            vad=silero.VAD.load(),
            **kwargs,
        )

        logger.info("✅ InterviewAgent initialized with Google Real-time model")

    async def on_enter(self):
        """Called when the agent enters the session - generate initial greeting."""
        try:
            # Generate language-appropriate greeting
            if self.interview_language == "arabic":
                greeting_instruction = (
                    f"ابدأ بالترحيب وعرّف بنفسك بثقة بصفتك رامي من شركة {self.display_company_name}. "
                    f"أعلن بوضوح أنك ستجري مقابلة مع {self.candidate_name} لمنصب {self.job_name}. "
                    f"تحدث  بالعربية الفصحى، بأسلوب مهني وقوي يعكس خبرتك."
                )
            else:
                greeting_instruction = f"Greet and introduce yourself as Rami from {self.display_company_name} and start the interview with {self.candidate_name} for the {self.job_name} position."

            self.session.generate_reply(instructions=greeting_instruction)
            logger.info("✅ Initial greeting generated")
        except Exception as e:
            logger.error(f"❌ Failed to generate initial greeting: {e}")

    def _build_instructions(self) -> str:
        """Build simple agent instructions focused on the backend interview prompt."""

        # Main interview prompt from backend - this is the key part
        if self.interview_prompt and self.interview_prompt.strip():
            if self.interview_language == "arabic":
                interview_instructions = (
                    f"\n\nتحليل السيرة الذاتية:\n{self.cv_analysis}"
                    f"\n\nتعليمات المقابلة:\n{self.interview_prompt}"
                )
            else:
                interview_instructions = (
                    f"\n\nCV ANALYSIS:\n{self.cv_analysis}"
                    f"\n\nINTERVIEW INSTRUCTIONS:\n{self.interview_prompt}"
                )

        return f"{interview_instructions}"

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
                    "شكراً لوقتك. هذا يختتم المقابلة",
                    "هذا يختتم المقابلة",
                    "شكراً لوقتك",
                    "المقابلة مكتملة الآن",
                    "هذا يختتم مقابلتنا",
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
