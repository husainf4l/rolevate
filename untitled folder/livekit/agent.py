import logging
import asyncio
from dotenv import load_dotenv

from livekit import agents
from livekit.agents import JobContext, WorkerOptions
from livekit.plugins import openai, silero
from livekit import rtc
from config.settings import get_settings

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

# Get application settings
settings = get_settings()


class HRInterviewAgent:
    """Professional HR Interview Agent for multiple job positions"""

    def __init__(self, job_title="Software Developer", company="the company"):
        self.job_title = job_title
        self.company = company
        self.instructions = f"""
You are a highly professional HR assistant conducting an interview for a {job_title} position at {company}.

Your responsibilities:
1. Conduct a structured, professional interview
2. Ask relevant technical and behavioral questions specific to {job_title}
3. Maintain a warm but professional demeanor
4. Adapt your language based on the candidate's responses (Arabic/English)
5. Evaluate the candidate's technical skills, experience, and cultural fit
6. Provide clear, constructive feedback

Interview Structure:
- Welcome and introduction (2-3 minutes)
- Background and experience questions (10-15 minutes)
- Technical questions specific to {job_title} (15-20 minutes)
- Behavioral and situational questions (10-15 minutes)
- Candidate's questions and closing (5-10 minutes)

Focus areas based on job type:
- Technical skills relevant to {job_title}
- Industry best practices
- Problem-solving abilities
- Team collaboration
- Relevant tools and technologies

Maintain professionalism throughout and ensure the candidate feels comfortable.
Be adaptive - if this is a creative role like graphic design, focus on portfolio, creativity, and design process.
If it's a technical role, focus on technical skills and problem-solving.
        """

        logger.info(
            f"HR Interview Agent initialized for {job_title} position at {company}"
        )


def get_job_focus_areas(job_title: str) -> str:
    """Get focus areas based on job title"""
    job_lower = job_title.lower()

    if "graphic" in job_lower or "design" in job_lower:
        return """
- Portfolio review and creative process
- Design software proficiency (Adobe Creative Suite, Figma, etc.)
- Understanding of design principles and typography
- Brand consistency and visual communication
- Client collaboration and feedback incorporation
- Healthcare industry design considerations
- Accessibility and user experience principles
        """
    elif (
        "developer" in job_lower or "software" in job_lower or "programmer" in job_lower
    ):
        return """
- Programming languages and frameworks
- Software development best practices
- Problem-solving and algorithmic thinking
- Code quality and testing approaches
- Team collaboration and version control
- System design and architecture
- Technology stack preferences
        """
    elif "healthcare" in job_lower or "medical" in job_lower:
        return """
- Healthcare industry knowledge
- Patient care considerations
- Medical terminology and procedures
- Compliance and regulatory understanding
- Healthcare technology familiarity
- Patient privacy and confidentiality
- Emergency procedures and protocols
        """
    else:
        return """
- Role-specific technical skills
- Industry knowledge and best practices
- Problem-solving abilities
- Team collaboration and communication
- Professional development and learning
- Leadership and initiative
        """


async def entrypoint(ctx: JobContext):
    """Main entrypoint for the HR Interview Agent"""
    try:
        logger.info(f"Starting HR Interview Agent for room: {ctx.room.name}")

        # Validate required environment variables
        missing_vars = settings.validate_required_vars()
        if missing_vars:
            logger.error(
                f"Missing required environment variables: {', '.join(missing_vars)}"
            )
            return

        # Extract job and candidate information from room name
        # Room format: interview_applicationId_timestamp
        room_parts = ctx.room.name.split("_")
        job_title = "Software Developer"  # Default
        company = "the company"  # Default
        candidate_name = "candidate"  # Default

        # Parse room name for application ID
        application_id = None
        if len(room_parts) >= 2:
            application_id = room_parts[1]
            logger.info(f"Extracted application ID: {application_id}")

        # Try to extract information from room metadata first
        logger.info(f"Room metadata: {ctx.room.metadata}")

        # Parse room metadata if it contains job/candidate info (JSON format)
        if ctx.room.metadata:
            try:
                import json

                metadata = json.loads(ctx.room.metadata)
                if "job" in metadata:
                    job_title = metadata["job"].get("title", job_title)
                    company = metadata["job"].get("company", company)
                if "candidate" in metadata:
                    candidate_name = f"{metadata['candidate'].get('firstName', '')} {metadata['candidate'].get('lastName', '')}".strip()
                logger.info(
                    f"Extracted from metadata - Job: {job_title}, Company: {company}, Candidate: {candidate_name}"
                )
            except (json.JSONDecodeError, KeyError) as e:
                logger.warning(f"Could not parse room metadata: {e}")

        # Create the LLM with customizable instructions
        llm = openai.LLM(model="gpt-4o-mini", temperature=0.7)

        # Wait for participant to get their information
        await ctx.connect()
        participant = await ctx.wait_for_participant()

        if participant:
            # Use participant name if we didn't get it from metadata
            if candidate_name == "candidate":
                candidate_name = participant.name or participant.identity
            logger.info(f"Participant {participant.identity} joined the interview")

            # Try to extract job info from participant metadata if room metadata didn't have it
            if hasattr(participant, "metadata") and participant.metadata:
                logger.info(f"Participant metadata: {participant.metadata}")
                try:
                    import json

                    participant_metadata = json.loads(participant.metadata)
                    if (
                        "job" in participant_metadata
                        and job_title == "Software Developer"
                    ):
                        job_title = participant_metadata["job"].get("title", job_title)
                        company = participant_metadata["job"].get("company", company)
                    if (
                        "candidate" in participant_metadata
                        and candidate_name == "candidate"
                    ):
                        candidate_name = f"{participant_metadata['candidate'].get('firstName', '')} {participant_metadata['candidate'].get('lastName', '')}".strip()
                except (json.JSONDecodeError, KeyError) as e:
                    logger.warning(f"Could not parse participant metadata: {e}")

        # Create dynamic instructions based on job type
        focus_areas = get_job_focus_areas(job_title)

        dynamic_instructions = f"""
You are a highly professional HR assistant conducting an interview for a {job_title} position at {company}.

You are interviewing {candidate_name} today. Make this interview personal and professional.

Your responsibilities:
1. Conduct a structured, professional interview
2. Ask relevant questions specific to {job_title}
3. Maintain a warm but professional demeanor
4. Adapt your language based on the candidate's responses (Arabic/English)
5. Evaluate the candidate's skills, experience, and cultural fit
6. Provide clear, constructive feedback

Interview Structure:
- Welcome and introduction with candidate's name (2-3 minutes)
- Background and experience questions (10-15 minutes)
- Job-specific technical/creative questions (15-20 minutes)
- Behavioral and situational questions (10-15 minutes)
- Candidate's questions and closing (5-10 minutes)

Interview Focus Areas:
{focus_areas}

Maintain professionalism throughout and ensure {candidate_name} feels comfortable.
Always address them by name and make the experience personal and engaging.
        """

        # Create initial chat context with dynamic HR agent instructions
        initial_ctx = llm.chat_ctx
        initial_ctx.messages.append({"role": "system", "content": dynamic_instructions})

        # Create the voice agent with proper configuration
        agent = VoiceAgent(
            instructions=dynamic_instructions,
            chat_ctx=initial_ctx,
            vad=silero.VAD.load(),
            stt=openai.STT(
                model="whisper-1",
                detect_language=True,  # Auto-detect language (Arabic/English)
            ),
            llm=llm,
            tts=openai.TTS(voice="alloy"),  # Professional voice
        )

        # Create agent session
        session = VoiceAgentSession(room=ctx.room, agent=agent)

        # Start the session
        await session.start()

        # Generate personalized initial greeting
        greeting = f"""
Hello {candidate_name}! Welcome to your interview for the {job_title} position at {company}. 
I'm your HR assistant and I'll be conducting this interview today. 
It's wonderful to have you here. Are you ready to begin our conversation?
        """

        await session.say(greeting)

        logger.info(f"HR Interview session started successfully for {candidate_name}")

    except Exception as e:
        logger.error(f"Error in HR Interview entrypoint: {str(e)}")
        raise


def _get_focus_areas_for_job(job_title: str) -> str:
    """Get focus areas based on job title"""
    job_lower = job_title.lower()

    if "graphic" in job_lower or "design" in job_lower:
        return """
if __name__ == "__main__":
    # Run the worker with the entrypoint
    # The worker will automatically join all rooms in your LiveKit project
    agents.cli.run_app(
        WorkerOptions(
            entrypoint_fnc=entrypoint,
            agent_name="hr-interview-agent",
        )
    )
        """
    elif (
        "developer" in job_lower or "software" in job_lower or "programmer" in job_lower
    ):
        return """
- Programming languages and frameworks
- Software development best practices
- Problem-solving and algorithmic thinking
- Code quality and testing approaches
- Team collaboration and version control
- System design and architecture
- Technology stack preferences
        """
    elif "healthcare" in job_lower or "medical" in job_lower:
        return """
- Healthcare industry knowledge
- Patient care considerations
- Medical terminology and procedures
- Compliance and regulatory understanding
- Healthcare technology familiarity
- Patient privacy and confidentiality
- Emergency procedures and protocols
        """
    else:
        return """
- Role-specific technical skills
- Industry knowledge and best practices
- Problem-solving abilities
- Team collaboration and communication
- Professional development and learning
- Leadership and initiative
        """


if __name__ == "__main__":
    # Run the worker with the entrypoint
    # The worker will automatically join all rooms in your LiveKit project
    agents.cli.run_app(
        WorkerOptions(
            entrypoint_fnc=entrypoint,
            agent_name="hr-interview-agent",
            # The agent will join all rooms in your project automatically
            # LiveKit will route room connections to this worker
        )
    )
