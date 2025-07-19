"""
Interview Agent Module
"""

import logging
from livekit.agents import Agent, JobContext

logger = logging.getLogger(__name__)


class InterviewAgent(Agent):
    """
    AI Interview Agent with dynamic personalization capabilities.

    Supports:
    - Multilingual conversations (Arabic/English)
    - Dynamic instruction generation based on room metadata
    - Personalized greetings and interview guidelines
    - Enhanced audio processing and debugging
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
        **kwargs,
    ):
        """
        Initialize the interview agent with personalized instructions.

        Args:
            ctx: The job context provided by the agent framework.
            candidate_name: Name of the interview candidate
            job_name: Position being interviewed for
            company_name: Company conducting the interview
            interview_prompt: Specific interview guidelines and questions
            cv_summary: A summary of the candidate's CV
            cv_analysis: A detailed analysis of the candidate's CV
            **kwargs: Additional arguments passed to parent Agent class
        """
        self.ctx = ctx
        self.candidate_name = candidate_name
        self.job_name = job_name
        self.company_name = company_name
        self.interview_prompt = interview_prompt
        self.cv_summary = cv_summary
        self.cv_analysis = cv_analysis or {}

        # Generate dynamic instructions
        instructions = self._build_instructions()

        # Log agent configuration
        logger.info(
            f"Creating InterviewAgent for {candidate_name} - {job_name} at {company_name}"
        )
        logger.info(f"Instructions length: {len(instructions)} characters")

        # Initialize parent Agent with generated instructions
        super().__init__(instructions=instructions, **kwargs)

    async def on_user_speech_committed(self, message):
        """Log when user speech is detected and processed."""
        logger.info(f"[AUDIO] User speech detected: '{message.content[:50]}...'")
        return await super().on_user_speech_committed(message)

    async def on_user_started_speaking(self):
        """Log when user starts speaking."""
        logger.info("[AUDIO] User started speaking - VAD triggered")
        return await super().on_user_started_speaking()

    async def on_user_stopped_speaking(self):
        """Log when user stops speaking."""
        logger.info("[AUDIO] User stopped speaking - processing speech")
        return await super().on_user_stopped_speaking()

    async def on_connected(self) -> None:
        """Called when agent connects to the room - send initial greeting."""
        logger.info("Agent connected to room - sending welcome message")

        # Create personalized welcome message
        if self.candidate_name == "the candidate":
            greeting = (
                f"مرحباً! أهلاً وسهلاً! Hello and welcome! I'm Laila Al Noor, your AI HR assistant "
                f"from {self.company_name}. I'm here to conduct your interview for the {self.job_name} position. "
                f"I can speak with you in both Arabic and English - feel free to use whichever language "
                f"you're most comfortable with. Shall we begin?"
            )
        else:
            greeting = (
                f"مرحباً {self.candidate_name}! أهلاً وسهلاً! Hello {self.candidate_name}, and welcome! "
                f"I'm Laila Al Noor, your AI HR assistant from {self.company_name}. "
                f"I'm delighted to be conducting your interview today for the {self.job_name} position. "
                f"I can communicate with you in both Arabic and English, so please feel free to use "
                f"whichever language you prefer. Are you ready to get started?"
            )

        # Send the welcome message
        await self.say(greeting)

        return await super().on_connected()

    def _build_instructions(self) -> str:
        """
        Build dynamic agent instructions based on metadata.

        Returns:
            Complete instruction string for the agent
        """
        # Base personality and capabilities
        base_instructions = (
            f"You are Laila Al Noor, a professional and empathetic AI HR assistant representing {self.company_name}. "
            f"You are conducting an interview for the {self.job_name} position with {self.candidate_name}. "
            f"You are fluent in both Arabic and English. If the candidate speaks in Arabic, respond in Arabic. "
            f"If they speak in English, respond in English."
        )

        # Candidate CV Summary and Analysis
        cv_section = ""
        if self.cv_summary and self.cv_summary.strip():
            cv_section = f"\n\nCANDIDATE CV SUMMARY:\n{self.cv_summary}"

        if self.cv_analysis:
            strengths = self.cv_analysis.get("strengths", [])
            weaknesses = self.cv_analysis.get("weaknesses", [])
            overall_fit = self.cv_analysis.get("overallFit", "N/A")

            cv_section += f"\n\nCV ANALYSIS (Overall Fit: {overall_fit}):"
            if strengths:
                cv_section += "\nStrengths to explore:\n- " + "\n- ".join(strengths)
            if weaknesses:
                cv_section += "\nWeaknesses to address:\n- " + "\n- ".join(weaknesses)

        # Contextual Interview Strategy
        strategy_section = (
            "\n\nCONTEXTUAL INTERVIEW STRATEGY:\n"
            "1. Review the CV Analysis in conjunction with the Interview Focus Points.\n"
            "2. If the CV analysis indicates a significant mismatch with the job requirements (e.g., 'Poor' fit, critical weaknesses), your primary goal is to understand the candidate's reasoning for applying and to assess their transferable skills.\n"
            "3. Do not ignore the mismatch. Address it professionally and courteously. For example, you could ask: 'Your background seems quite strong in [candidate's area of strength]. Could you walk me through what interested you in the {self.job_name} position at this time?'\n"
            "4. Adapt your questions based on this context. While you should still cover the core areas in the interview prompt, frame them to explore the candidate's potential and learning agility rather than assuming direct experience.\n"
            "5. If the candidate confirms they lack the required qualifications and shows no clear plan to obtain them, and you have already explored their motivations, you should conclude the interview.\n"
            "6. After you have gathered all the necessary information and the conversation naturally concludes, you must end the interview by saying the specific phrase 'Thank you for your time. This concludes the interview.' This exact phrase will be used to signal the end of the session."
        )

        # Interview guidelines
        if self.interview_prompt and self.interview_prompt.strip():
            interview_section = (
                f"\n\nINTERVIEW FOCUS POINTS:\n{self.interview_prompt}\n\n"
                f"CRITICAL: Focus the conversation on these points. They are specifically designed for the "
                f"{self.job_name} role. Maintain a professional, conversational, and supportive tone."
            )
        else:
            interview_section = (
                f"\n\nConduct a structured professional interview for the {self.job_name} position. "
                f"Focus on relevant skills, experience, and cultural fit. Ask thoughtful follow-up "
                f"questions and provide a positive candidate experience."
            )

        return f"{base_instructions}{cv_section}{strategy_section}{interview_section}"

    async def _on_llm_becoming_idle(self):
        """
        Checks if the LLM has said the concluding phrase and ends the interview if so.
        """
        history = self.get_chat_history()
        if history:
            last_agent_message = history[-1]
            if (
                "Thank you for your time. This concludes the interview."
                in last_agent_message.content
            ):
                logger.info("Concluding phrase detected. Ending the interview.")
                self.ctx.task.set_result("Interview concluded by agent.")
                await self.ctx.disconnect()

        return await super()._on_llm_becoming_idle()
