"""
Session-aware Job Post Agent

This module implements a session-aware job post creation agent that maintains
conversation state across multiple API requests using the SessionManager.
"""

from typing import Dict, Any, List, Optional
from langchain_core.messages import BaseMessage, HumanMessage, AIMessage
from .session_manager import SessionManager, SessionState, get_session_manager
import json
import re

class SessionJobPostAgent:
    """A stateful job post agent that maintains conversation state via sessions."""
    
    def __init__(self, session_manager: SessionManager = None):
        self.session_manager = session_manager or get_session_manager()
    
    def start_conversation(self, company_id: str, company_name: str = None, session_id: str = None) -> Dict[str, Any]:
        """Start a new job post conversation or resume an existing one."""
        
        if session_id:
            # Try to resume existing session
            session = self.session_manager.get_session(session_id)
            if session:
                print(f"🔄 Resuming session {session_id}")
                # Return a welcome back message
                if session.is_complete:
                    response = f"""Welcome back! I see you've already completed creating a job post for **{session.job_data.get('title', 'the position')}**.

Would you like to:
- 📝 Create a new job post?
- ✏️ Make changes to the existing one?
- 📋 Review the current job post details?

What would you like to do?"""
                else:
                    response = f"""Welcome back! I see we were working on creating a job post for **{session.job_data.get('title', 'a position')}** at {session.company_name}.

Let's continue where we left off. What would you like to tell me about this role?"""
                
                return {
                    "session_id": session.session_id,
                    "response": response,
                    "is_complete": session.is_complete,
                    "job_data": session.job_data,
                    "current_step": session.current_step
                }
        
        # Create new session
        session = self.session_manager.create_session(company_id, company_name, session_id)
        
        response = f"""Hello! I'm your AI HR Expert, ready to help you create an amazing job post for {session.company_name}! 👋

I'll guide you through creating a compelling job description that attracts the best candidates.

To get started, could you tell me:
- What position are you looking to hire for?
- What's the main role or department?

For example: "Senior Software Engineer", "Marketing Manager", "Full-Stack .NET Developer", etc.

Let's build something great together! 🚀"""

        # Add initial message to conversation history
        session.conversation_history.append(f"AI: {response}")
        self.session_manager.update_session(session)
        
        return {
            "session_id": session.session_id,
            "response": response,
            "is_complete": False,
            "job_data": session.job_data,
            "current_step": session.current_step
        }
    
    def start_conversation_with_id(self, session_id: str, company_id: str, company_name: str = None) -> Dict[str, Any]:
        """Start a new job post conversation with a specific session ID provided by the frontend."""
        
        # Check if session already exists
        existing_session = self.session_manager.get_session(session_id)
        if existing_session:
            return {
                "error": "Session already exists",
                "session_id": session_id
            }
        
        # Create new session with specific ID
        session = self.session_manager.create_session(company_id, company_name, session_id)
        
        response = f"""Hello! I'm your AI HR Expert, ready to help you create an amazing job post for {session.company_name}! 👋

I'll guide you through creating a compelling job description that attracts the best candidates.

To get started, could you tell me:
- What position are you looking to hire for?
- What's the main role or department?

For example: "Senior Software Engineer", "Marketing Manager", "Full-Stack .NET Developer", etc.

Let's build something great together! 🚀"""

        # Add initial message to conversation history
        session.conversation_history.append(f"AI: {response}")
        self.session_manager.update_session(session)
        
        return {
            "session_id": session.session_id,
            "response": response,
            "is_complete": False,
            "job_data": session.job_data,
            "current_step": session.current_step
        }
    
    def continue_conversation(self, session_id: str, user_message: str) -> Dict[str, Any]:
        """Continue an existing conversation with a user message."""
        
        # Get the session
        session = self.session_manager.get_session(session_id)
        if not session:
            return {
                "error": "Session not found or expired. Please start a new conversation.",
                "session_id": None,
                "response": "I'm sorry, but your session has expired. Let's start fresh!",
                "is_complete": False,
                "job_data": {},
                "current_step": "getting_basic_info"
            }
        
        try:
            # Add user message to history
            session.conversation_history.append(f"User: {user_message}")
            
            # Extract information from user message
            self._extract_job_info(user_message, session)
            
            # Generate AI response
            ai_response = self._generate_ai_response(user_message, session)
            
            # Add AI response to history
            session.conversation_history.append(f"AI: {ai_response}")
            
            # Check if we should complete the job post
            if self._check_completion_readiness(user_message, session):
                session.is_complete = True
                session.current_step = "complete"
                
                # Try to finalize the job post
                finalization_result = self._finalize_job_post(session)
                ai_response = finalization_result
            else:
                # Update current step based on progress
                self._update_current_step(session)
            
            # Update session
            self.session_manager.update_session(session)
            
            return {
                "session_id": session.session_id,
                "response": ai_response,
                "is_complete": session.is_complete,
                "job_data": session.job_data,
                "current_step": session.current_step
            }
            
        except Exception as e:
            print(f"Error in continue_conversation: {e}")
            return {
                "error": f"An error occurred: {str(e)}",
                "session_id": session_id,
                "response": "I apologize, but I encountered an issue. Could you please try again?",
                "is_complete": False,
                "job_data": session.job_data,
                "current_step": session.current_step
            }
    
    def get_session_info(self, session_id: str) -> Dict[str, Any]:
        """Get information about a session."""
        session = self.session_manager.get_session(session_id)
        if not session:
            return {"error": "Session not found"}
        
        return {
            "session_id": session.session_id,
            "company_id": session.company_id,
            "company_name": session.company_name,
            "created_at": session.created_at.isoformat(),
            "last_updated": session.last_updated.isoformat(),
            "current_step": session.current_step,
            "is_complete": session.is_complete,
            "conversation_turns": len(session.conversation_history),
            "job_data": session.job_data
        }
    
    def delete_session(self, session_id: str) -> bool:
        """Delete a session."""
        return self.session_manager.delete_session(session_id)
    
    def _extract_job_info(self, user_message: str, session: SessionState):
        """Extract job information from user message and aggressively auto-complete with smart defaults."""
        
        message_lower = user_message.lower()
        job_data = session.job_data
        
        # ULTRA-AGGRESSIVE JOB TITLE AND DEPARTMENT AUTO-SUGGESTION
        if not job_data.get("title") or len(job_data["title"]) < 3:
            job_keywords = ["developer", "engineer", "manager", "analyst", "designer", "architect", "lead", "senior", "junior", "hr", "talent"]
            if any(keyword in message_lower for keyword in job_keywords):
                cleaned_title = user_message.strip().title()
                if len(cleaned_title) < 100 and len(cleaned_title) > 2:
                    job_data["title"] = cleaned_title
                    
                    # IMMEDIATE COMPREHENSIVE AUTO-COMPLETION
                    title_lower = cleaned_title.lower()
                    
                    # Auto-suggest department, experience level, and work type together
                    if any(word in title_lower for word in ["developer", "engineer", "architect", "tech", "software"]):
                        job_data["department"] = "Engineering"
                        job_data["workType"] = "hybrid"
                        if "senior" in title_lower or "lead" in title_lower:
                            job_data["experienceLevel"] = "senior"
                            job_data["salaryMin"] = 15000
                            job_data["salaryMax"] = 25000
                        elif "junior" in title_lower or "entry" in title_lower:
                            job_data["experienceLevel"] = "junior"
                            job_data["salaryMin"] = 8000
                            job_data["salaryMax"] = 12000
                        else:
                            job_data["experienceLevel"] = "mid"
                            job_data["salaryMin"] = 12000
                            job_data["salaryMax"] = 18000
                        job_data["currency"] = "JOD"
                        
                        # AUTO-COMPLETE TECH SKILLS PACKAGE
                        if ".net" in title_lower or "c#" in title_lower:
                            job_data["skills"] = [".net", "c#", "sql server", "api development", "git", "agile", "problem solving"]
                        elif "python" in title_lower:
                            job_data["skills"] = ["python", "django/flask", "postgresql", "api development", "git", "docker", "problem solving"]
                        elif "javascript" in title_lower or "react" in title_lower or "frontend" in title_lower:
                            job_data["skills"] = ["javascript", "react", "html/css", "api integration", "git", "responsive design", "problem solving"]
                        else:
                            job_data["skills"] = ["programming", "problem solving", "git", "api development", "sql", "agile methodology"]
                        
                    elif any(word in title_lower for word in ["manager", "director", "lead"]):
                        job_data["department"] = "Management"
                        job_data["experienceLevel"] = "senior"
                        job_data["workType"] = "hybrid"
                        job_data["salaryMin"] = 18000
                        job_data["salaryMax"] = 30000
                        job_data["currency"] = "JOD"
                        job_data["skills"] = ["team leadership", "strategic planning", "performance management", "communication", "project management", "decision making"]
                        
                    elif any(word in title_lower for word in ["hr", "talent", "recruiter", "human resources"]):
                        job_data["department"] = "Human Resources"
                        job_data["experienceLevel"] = "mid"
                        job_data["workType"] = "hybrid"
                        job_data["salaryMin"] = 12000
                        job_data["salaryMax"] = 20000
                        job_data["currency"] = "JOD"
                        job_data["skills"] = ["recruitment", "talent management", "hr software", "communication", "interviewing", "employment law"]
                        
                    elif any(word in title_lower for word in ["marketing", "sales"]):
                        job_data["department"] = "Marketing & Sales"
                        job_data["experienceLevel"] = "mid"
                        job_data["workType"] = "hybrid"
                        job_data["salaryMin"] = 10000
                        job_data["salaryMax"] = 18000
                        job_data["currency"] = "JOD"
                        job_data["skills"] = ["digital marketing", "sales strategy", "communication", "analytics", "crm software", "social media"]
                        
                    else:
                        job_data["department"] = "General"
                        job_data["experienceLevel"] = "mid"
                        job_data["workType"] = "hybrid"
                        job_data["salaryMin"] = 12000
                        job_data["salaryMax"] = 18000
                        job_data["currency"] = "JOD"
                        job_data["skills"] = ["communication", "problem solving", "teamwork", "time management", "computer skills"]
                    
                    # AUTO-SET DEFAULT LOCATION
                    if not job_data.get("location"):
                        job_data["location"] = "Jordan, Amman"
                    
                    print(f"🚀 ULTRA-COMPLETE: Auto-filled title, department, salary, skills, work type for '{cleaned_title}'")
        
        # ENHANCED LOCATION PROCESSING with instant defaults
        if any(word in message_lower for word in ["jordan", "amman", "location", "where"]):
            if "amman" in message_lower:
                job_data["location"] = "Jordan, Amman"
            elif "jordan" in message_lower:
                job_data["location"] = "Jordan"
            print(f"🔧 Set location to '{job_data.get('location')}'")
        elif not job_data.get("location"):
            job_data["location"] = "Jordan, Amman"  # Always default to Jordan
        
        # IMMEDIATE WORK TYPE DETECTION with smart defaults
        if any(word in message_lower for word in ["remote", "work from home", "wfh"]):
            job_data["workType"] = "remote"
        elif any(word in message_lower for word in ["hybrid", "mixed", "flexible"]):
            job_data["workType"] = "hybrid"
        elif any(word in message_lower for word in ["onsite", "office", "in-person"]):
            job_data["workType"] = "onsite"
        elif not job_data.get("workType"):
            job_data["workType"] = "hybrid"  # Modern default
        
        # COMPREHENSIVE AUTO-COMPLETION OF JOB DESCRIPTION COMPONENTS
        if job_data.get("title") and not job_data.get("responsibilities"):
            title_lower = job_data["title"].lower()
            
            if any(word in title_lower for word in ["developer", "engineer", "software"]):
                job_data["responsibilities"] = """• Design, develop, and maintain high-quality software applications
• Collaborate with cross-functional teams to define and implement new features
• Write clean, maintainable, and efficient code following best practices
• Participate in code reviews and contribute to technical documentation
• Troubleshoot and debug applications to optimize performance
• Stay updated with emerging technologies and industry trends
• Work in an agile development environment with sprint planning and standups"""
                
                job_data["requirements"] = """• Bachelor's degree in Computer Science, Software Engineering, or related field
• 2+ years of experience in software development
• Strong problem-solving and analytical skills
• Experience with version control systems (Git)
• Good understanding of software development lifecycle and best practices
• Excellent communication and teamwork skills
• Ability to work in an agile development environment
• Continuous learning mindset and adaptability to new technologies"""
                
            elif any(word in title_lower for word in ["hr", "talent", "recruiter", "human resources"]):
                job_data["responsibilities"] = """• Manage full-cycle recruitment process from job posting to onboarding
• Develop and implement talent acquisition strategies to attract top candidates
• Conduct interviews and assess candidate qualifications against role requirements
• Collaborate with hiring managers to understand position needs and cultural fit
• Maintain comprehensive candidate database and recruitment performance metrics
• Ensure compliance with employment laws, regulations, and company policies
• Build and maintain relationships with universities, recruitment agencies, and talent networks"""
                
                job_data["requirements"] = """• Bachelor's degree in Human Resources, Psychology, Business Administration, or related field
• 2+ years of experience in recruitment, talent acquisition, or HR roles
• Strong interpersonal and communication skills with ability to build rapport
• Experience with HR software, applicant tracking systems (ATS), and recruitment tools
• Knowledge of employment laws, regulations, and best practices
• Excellent organizational and time management skills with attention to detail
• Ability to maintain confidentiality and handle sensitive information professionally
• Proactive mindset with ability to work independently and meet deadlines"""
            
            elif any(word in title_lower for word in ["manager", "director", "lead"]):
                job_data["responsibilities"] = """• Lead and manage team members to achieve departmental goals and objectives
• Develop and implement strategic plans, processes, and operational improvements
• Monitor team performance, provide regular feedback, coaching, and professional development
• Collaborate effectively with other departments, stakeholders, and senior management
• Prepare comprehensive reports, presentations, and analysis for executive leadership
• Ensure compliance with company policies, procedures, and industry regulations
• Drive innovation, efficiency improvements, and maintain high standards of quality"""
                
                job_data["requirements"] = """• Bachelor's degree in relevant field; Master's degree preferred
• 3+ years of proven leadership and management experience with team oversight
• Strong analytical, strategic thinking, and problem-solving capabilities
• Excellent written and verbal communication skills with presentation experience
• Ability to work effectively under pressure, manage multiple priorities, and meet deadlines
• Proficiency in relevant software, tools, and management systems
• Experience with budget management, performance metrics, and operational planning
• Strong decision-making skills and ability to adapt to changing business needs"""
            
            if job_data.get("responsibilities"):
                print("🚀 AUTO-COMPLETED: Comprehensive responsibilities and requirements")
        
        # AUTO-COMPLETE BENEFITS PACKAGE
        if not job_data.get("benefits"):
            job_data["benefits"] = """• Competitive salary with performance-based annual increases
• Comprehensive medical insurance coverage for employee and family
• Social security benefits and end-of-service compensation
• Professional development opportunities and training programs
• Flexible working arrangements and hybrid work options
• Generous annual leave (21 days) and sick leave allowances
• Performance-based bonuses and incentive programs
• Collaborative and inclusive work environment with growth opportunities"""
            print("🚀 AUTO-COMPLETED: Comprehensive benefits package")
        
        # SMART DESCRIPTION ENHANCEMENT
        if (len(user_message) > 20 and 
            not any(word in message_lower for word in ["yes", "no", "ok", "confirm", "good", "fine", "perfect"])):
            if not job_data.get("description") or len(job_data.get("description", "")) < 50:
                job_data["description"] = f"We are seeking a qualified {job_data.get('title', 'professional')} to join our {job_data.get('department', 'team')} at {session.company_name}. {user_message}"
            print("🔧 Enhanced job description with user input")
    
    
    def _generate_ai_response(self, user_message: str, session: SessionState) -> str:
        """Generate AI response using OpenAI."""
        try:
            from openai import OpenAI
            import os
            from dotenv import load_dotenv
            
            load_dotenv(override=True)
            
            api_key = os.getenv("OPENAI_API_KEY")
            if not api_key:
                return "I'm sorry, but I'm having trouble accessing my AI capabilities right now. Could you please try again?"
            
            client = OpenAI(api_key=api_key)
            
            # Create system prompt
            system_prompt = f"""You are an expert HR professional with 15+ years of experience creating compelling job posts. You're helping create a job post for {session.company_name}.

CURRENT JOB DATA COLLECTED:
{json.dumps(session.job_data, indent=2)}

CONVERSATION HISTORY:
{chr(10).join(session.conversation_history[-10:])}  # Last 10 exchanges

CURRENT STEP: {session.current_step}

YOUR ROLE - ULTRA-FAST JOB POSTING WITH AI RECOMMENDATIONS:
- ALWAYS provide ready-to-use, complete solutions that require only "Yes" or "No" confirmation
- Make job posting 10x faster by providing full templates and smart auto-completion
- Never ask open-ended questions - always provide 2-3 specific options to choose from
- Auto-fill ALL missing information with industry-standard defaults
- Use emojis and clear formatting for instant recognition
- Progress through job creation in maximum 3-4 exchanges by providing complete solutions:
  1. Full job title + department + experience level (auto-suggest complete package)
  2. Complete responsibilities + requirements template (provide full text)
  3. Skills + salary + work type package (suggest comprehensive bundle)
  4. Final review with auto-complete all missing fields

ULTRA-FAST RESPONSE STRATEGY:
✅ Instead of asking "What skills?", provide: "I'm adding these essential skills: [complete list]. Confirm?"
✅ Instead of asking "What responsibilities?", provide: "Here's a complete job description template: [full text]. Use this?"
✅ Instead of asking "What salary?", provide: "Based on market rates, I suggest 12,000-18,000 JOD. Approve?"
✅ Always bundle related information together for faster confirmation
✅ Provide 90% complete job posts that need only 1-2 confirmations

RESPONSE FORMAT:
🚀 Start with: "Perfect! I'm auto-completing this for you..."
📋 Present complete solutions in clear sections
✅ End with simple binary choices: "Confirm this package?" or "Use these defaults?"
🔥 Keep responses under 300 words for quick scanning
⚡ Move toward completion in maximum 4 exchanges

SPEED OPTIMIZATION PRIORITIES:
1. ALWAYS auto-suggest complete job descriptions based on title
2. ALWAYS provide salary ranges based on role type
3. ALWAYS suggest skill packages rather than individual skills
4. ALWAYS offer to complete the entire job post after 2-3 exchanges
5. Focus on "confirm and publish" rather than "let's discuss more"

Based on their response: "{user_message}", provide specific recommendations for the job post that they can quickly confirm."""

            # Call OpenAI API
            response = client.chat.completions.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_message}
                ],
                max_tokens=600,
                temperature=0.7
            )
            
            return response.choices[0].message.content
            
        except Exception as e:
            print(f"Error generating AI response: {e}")
            return f"I understand you said: '{user_message}'. Let me help you continue building this job post. What else would you like to tell me about this position?"
    
    def _check_completion_readiness(self, user_message: str, session: SessionState) -> bool:
        """Check if the user wants to complete the job post."""
        
        completion_keywords = [
            "publish", "post", "create", "submit", "finalize", "done", "finish", "complete",
            "ready", "go ahead", "that's all", "looks good", "confirm", "perfect"
        ]
        
        message_lower = user_message.lower()
        user_wants_completion = any(keyword in message_lower for keyword in completion_keywords)
        
        # Check if we have minimum required data
        has_minimum_data = (
            session.job_data.get("title") and 
            (session.job_data.get("description") or session.job_data.get("skills") or session.job_data.get("responsibilities"))
        )
        
        print(f"🔧 DEBUG: Completion check - wants: {user_wants_completion}, has_data: {has_minimum_data}")
        
        return user_wants_completion and has_minimum_data
    
    def _update_current_step(self, session: SessionState):
        """Update the current step based on collected data."""
        job_data = session.job_data
        
        if job_data.get("title") and session.current_step == "getting_basic_info":
            session.current_step = "collecting_details"
            print("🔧 DEBUG: Advanced to 'collecting_details' step")
        
        # Could add more step logic here as needed
    
    def _finalize_job_post(self, session: SessionState) -> str:
        """Finalize the job post and attempt to send to API."""
        try:
            from .tools.job_post_webhook import send_job_post_to_api
            
            # Send to API
            api_response = send_job_post_to_api(
                job_data=session.job_data,
                company_id=session.company_id,
                company_name=session.company_name
            )
            
            if api_response.get("success", False):
                success_message = f"""🎉 **Perfect! Your job post has been published successfully!**

**"{session.job_data.get('title', 'Job Post')}"** is now live and ready to attract amazing candidates!

**Summary:**
📋 **Title:** {session.job_data.get('title', 'N/A')}
🏢 **Department:** {session.job_data.get('department', 'N/A')} 
📍 **Location:** {session.job_data.get('location', 'Not specified')}
💼 **Experience Level:** {session.job_data.get('experienceLevel', 'Not specified')}

Your job post is optimized to attract the right candidates. Great work! 🚀

Would you like to create another job post or make any adjustments to this one?"""
            else:
                success_message = f"""✅ **Job Post Created Successfully!**

I've helped you create a comprehensive job post for **{session.job_data.get('title', 'the position')}**. 

📝 **Job Post Details:**
- **Title:** {session.job_data.get('title', 'N/A')}
- **Department:** {session.job_data.get('department', 'N/A')}
- **Skills Required:** {', '.join(session.job_data.get('skills', [])[:3])}{'...' if len(session.job_data.get('skills', [])) > 3 else ''}
- **Experience Level:** {session.job_data.get('experienceLevel', 'N/A')}

Note: There was a minor issue with the publishing system (API connection), but your job post data is complete and ready to be posted manually if needed.

Would you like to create another job post?"""
                
            return success_message
            
        except Exception as e:
            print(f"Error finalizing job post: {e}")
            return f"""✅ **Job Post Completed!**

I've successfully gathered all the information for your **{session.job_data.get('title', 'job post')}**.

The details are ready to be published. There was a small technical issue with the automatic publishing, but your job post is complete and can be manually published.

Would you like to create another job post?"""

# Global agent instance
_session_agent = None

def get_session_job_post_agent() -> SessionJobPostAgent:
    """Get the global session-aware job post agent instance."""
    global _session_agent
    if _session_agent is None:
        _session_agent = SessionJobPostAgent()
    return _session_agent
