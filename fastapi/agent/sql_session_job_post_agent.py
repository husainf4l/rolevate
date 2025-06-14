"""
SQL Session-aware Job Post Agent

This module implements a session-aware job post creation agent that uses
SQL database for session management instead of JSON files.
"""

from typing import Dict, Any, List, Optional
from .sql_session_manager import SQLSessionManager, SQLSessionState, get_sql_session_manager
import json
import re

class SQLSessionJobPostAgent:
    """A stateful job post agent that uses SQL database for session management."""
    
    def __init__(self, session_manager: SQLSessionManager = None):
        self.session_manager = session_manager or get_sql_session_manager()
    
    def start_conversation(self, company_id: str, company_name: str = None, session_id: str = None) -> Dict[str, Any]:
        """Start a new job post conversation or resume an existing one."""
        
        if session_id:
            # Try to resume existing session
            session = self.session_manager.get_session(session_id)
            if session:
                print(f"🔄 Resuming SQL session {session_id}")
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
        
        try:
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
            
        except ValueError as e:
            return {
                "error": str(e),
                "session_id": session_id
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
            
            # Update session in database
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
    
    def get_company_sessions(self, company_id: str, limit: int = 50) -> List[Dict[str, Any]]:
        """Get all sessions for a company."""
        sessions = self.session_manager.get_sessions_by_company(company_id, limit)
        return [session.to_dict() for session in sessions]
    
    def get_session_stats(self) -> Dict[str, Any]:
        """Get session statistics."""
        return self.session_manager.get_session_stats()
    
    def cleanup_expired_sessions(self) -> int:
        """Clean up expired sessions."""
        return self.session_manager.cleanup_expired_sessions()
    
    # Helper methods (reusing the same logic from the original agent)
    def _extract_job_info(self, user_message: str, session: SQLSessionState):
        """Extract job information from user message and aggressively auto-complete with smart defaults."""
        
        message_lower = user_message.lower()
        job_data = session.job_data
        
        # EXTRACT SALARY INFORMATION FIRST (before title extraction to avoid conflicts)
        salary_patterns = [
            r'salary\s+(\d+)\s*(?:to|-)\s*(\d+)',
            r'(\d+)\s*(?:to|-)\s*(\d+)\s*(?:jod|salary)',
            r'(\d+)k?\s*(?:to|-)\s*(\d+)k?\s*jod',
            r'salary\s*range\s*(\d+)\s*(?:to|-)\s*(\d+)'
        ]
        
        for pattern in salary_patterns:
            match = re.search(pattern, message_lower)
            if match:
                try:
                    salary_min = int(match.group(1))
                    salary_max = int(match.group(2))
                    if salary_min <= salary_max:
                        job_data["salaryMin"] = salary_min
                        job_data["salaryMax"] = salary_max
                        job_data["currency"] = "JOD"
                        break
                except ValueError:
                    continue
        
        # EXTRACT LOCATION INFORMATION (improved to be more specific)
        location_patterns = [
            r'(\w+\s+street\s+amman\s+jordan)',
            r'(\w+\s+street\s+amman)',
            r'(\w+\s+street)',
            r'(amman\s+jordan)',
            r'(amman)',
        ]
        
        for pattern in location_patterns:
            match = re.search(pattern, message_lower, re.IGNORECASE)
            if match:
                location = match.group(1).strip()
                # Clean and format location
                location = re.sub(r'\s+', ' ', location)
                if 'jordan' not in location.lower() and 'amman' in location.lower():
                    location += ', Jordan'
                elif 'amman' not in location.lower() and 'jordan' in location.lower():
                    location = 'Amman, ' + location
                job_data["location"] = location.title()
                break
        
        # ULTRA-AGGRESSIVE JOB TITLE AUTO-SUGGESTION
        if not job_data.get("title") or len(job_data["title"]) < 3:
            # Look for job title patterns
            job_keywords = ["developer", "engineer", "manager", "analyst", "designer", "architect", "lead", "senior", "junior", "hr", "talent"]
            
            # Try to extract job title from the message
            if any(keyword in message_lower for keyword in job_keywords):
                # Enhanced patterns for better title extraction
                patterns = [
                    # Match "ht talent manager" -> "HR Talent Manager"
                    r'\b(h[rt])\s+(talent|hr|human\s*resources?)\s+(manager|lead|director|head|specialist)',
                    # Standard manager patterns
                    r'(?:^|\s)(.{0,50}(?:manager|lead|director|head|specialist|coordinator|officer|executive)[^0-9]{0,30})(?:\s+(?:salary|sal|pay|range|department|dept|in|at|with|for|position|job|role)|\s*$)',
                    r'(?:^|\s)((?:senior|junior|mid-level|lead|principal|executive)\s+.{0,50}(?:manager|engineer|developer|analyst|designer|architect|specialist)[^0-9]{0,30})(?:\s+(?:salary|sal|pay|range|department|dept|in|at|with|for|position|job|role)|\s*$)',
                    # Simple talent/hr manager patterns
                    r'\b(\w+)\s+(talent|hr|human\s*resources?)\s+(manager|specialist)',
                    r'\b(talent|hr|human\s*resources?)\s+(manager|specialist|lead)',
                    # Generic patterns
                    r'job post for (?:a |an )?(.+?)(?:\s+(?:salary|sal|pay|range|department|dept|in|at|with|position|requiring)|$)',
                    r'create (?:a |an )?(.+?)(?:\s+(?:salary|sal|pay|range|department|dept|in|at|with|position|requiring)|$)',
                    r'hire (?:a |an )?(.+?)(?:\s+(?:salary|sal|pay|range|department|dept|in|at|with|position|requiring)|$)',
                ]
                
                for pattern in patterns:
                    match = re.search(pattern, message_lower, re.IGNORECASE)
                    if match:
                        if pattern.startswith(r'\b(h[rt])'):
                            # Special handling for "ht talent manager" -> "HR Talent Manager"
                            dept = "HR" if match.group(1).lower() in ['hr', 'ht'] else match.group(1)
                            role_type = match.group(2).replace('hr', 'Human Resources').replace('talent', 'Talent')
                            position = match.group(3)
                            potential_title = f"{dept.upper()} {role_type.title()} {position.title()}"
                        else:
                            potential_title = match.group(1).strip()
                            # Clean up the title
                            potential_title = re.sub(r'\s+', ' ', potential_title)  # Normalize whitespace
                            potential_title = re.sub(r'\s+(salary|sal|pay|range|department|dept).*$', '', potential_title, flags=re.IGNORECASE)
                            
                            # Fix common abbreviations
                            potential_title = re.sub(r'\bhr\b', 'HR', potential_title, flags=re.IGNORECASE)
                            potential_title = re.sub(r'\bht\b', 'HR', potential_title, flags=re.IGNORECASE)
                        
                        if len(potential_title) > 2 and len(potential_title) < 80:
                            job_data["title"] = potential_title.title()
                            break
                
                # If no pattern matched, try simpler extraction for manager roles
                if not job_data.get("title"):
                    # Look specifically for manager roles with context
                    manager_match = re.search(r'(\w+(?:\s+\w+){0,3})\s+manager', message_lower)
                    if manager_match:
                        title_part = manager_match.group(1).strip()
                        # Fix common abbreviations
                        title_part = re.sub(r'\bhr\b', 'HR', title_part, flags=re.IGNORECASE)
                        title_part = re.sub(r'\bht\b', 'HR', title_part, flags=re.IGNORECASE)
                        job_data["title"] = f"{title_part.title()} Manager"
                
                # Auto-complete based on detected title
                if job_data.get("title"):
                    title_lower = job_data["title"].lower()
                    
                    # Auto-suggest experience level, and work type together
                    if any(word in title_lower for word in ["developer", "engineer", "architect", "tech", "software"]):
                        job_data["workType"] = "HYBRID"
                        if "senior" in title_lower or "lead" in title_lower:
                            job_data["experienceLevel"] = "SENIOR"
                            job_data["salaryMin"] = 15000
                            job_data["salaryMax"] = 25000
                        elif "junior" in title_lower or "entry" in title_lower:
                            job_data["experienceLevel"] = "JUNIOR"
                            job_data["salaryMin"] = 8000
                            job_data["salaryMax"] = 12000
                        else:
                            job_data["experienceLevel"] = "MID_LEVEL"
                            job_data["salaryMin"] = 12000
                            job_data["salaryMax"] = 18000
                        job_data["currency"] = "JOD"
                        
                        # AUTO-COMPLETE TECH SKILLS PACKAGE
                        if ".net" in title_lower or "c#" in title_lower:
                            job_data["skills"] = [".net", "c#", "sql server", "api development", "git", "agile", "problem solving"]
                        elif "python" in title_lower:
                            job_data["skills"] = ["python", "django/flask", "postgresql", "api development", "git", "docker", "problem solving"]
                        elif "react" in title_lower or "frontend" in title_lower:
                            job_data["skills"] = ["react", "javascript", "typescript", "html", "css", "git", "responsive design"]
                        elif "java" in title_lower:
                            job_data["skills"] = ["java", "spring boot", "mysql", "rest apis", "git", "maven", "problem solving"]
                        elif "full" in title_lower and "stack" in title_lower:
                            job_data["skills"] = ["javascript", "react", "node.js", "databases", "git", "api development", "problem solving"]
                        else:
                            job_data["skills"] = ["programming", "software development", "git", "problem solving", "team collaboration"]
                    
                    elif any(word in title_lower for word in ["manager", "lead", "director", "head"]):
                        job_data["workType"] = "HYBRID"
                        job_data["experienceLevel"] = "SENIOR"
                        # Only set default salary if not already extracted from user message
                        if not job_data.get("salaryMin") or job_data.get("salaryMin") == 0:
                            job_data["salaryMin"] = 18000
                            job_data["salaryMax"] = 30000
                            job_data["currency"] = "JOD"
                        job_data["skills"] = ["leadership", "team management", "strategic planning", "communication", "project management"]
                    
                    elif any(word in title_lower for word in ["marketing", "digital", "social"]):
                        job_data["workType"] = "HYBRID"
                        job_data["experienceLevel"] = "MID_LEVEL"
                        job_data["salaryMin"] = 10000
                        job_data["salaryMax"] = 18000
                        job_data["currency"] = "JOD"
                        job_data["skills"] = ["digital marketing", "social media", "content creation", "analytics", "communication"]
        
        # AUTO-COMPLETE COMMON FIELDS
        if not job_data.get("location"):
            if any(city in message_lower for city in ["amman", "jordan", "remote"]):
                if "remote" in message_lower:
                    job_data["location"] = "Remote"
                    job_data["workType"] = "REMOTE"
                else:
                    job_data["location"] = "Amman, Jordan"
        
        # AUTO-SUGGEST BENEFITS PACKAGE
        if not job_data.get("benefits") or len(job_data["benefits"]) < 10:
            job_data["benefits"] = """• Competitive salary package
• Health insurance coverage
• Professional development opportunities
• Flexible working hours
• Annual performance bonuses
• Collaborative team environment"""
        
        # AUTO-GENERATE DESCRIPTIONS IF EMPTY
        if not job_data.get("description") or len(job_data["description"]) < 10:
            if job_data.get("title"):
                job_data["description"] = f"""We are seeking a talented {job_data['title']} to join our dynamic team at {session.company_name}. This is an excellent opportunity for a skilled professional to contribute to innovative projects and grow their career in a supportive environment.

The ideal candidate will bring expertise in {', '.join(job_data.get('skills', ['relevant technologies'])[:3])} and demonstrate strong problem-solving abilities. You'll work alongside experienced professionals and have opportunities to make meaningful contributions to our products and services."""
        
        # AUTO-GENERATE RESPONSIBILITIES
        if not job_data.get("responsibilities") or len(job_data["responsibilities"]) < 10:
            if "developer" in job_data.get("title", "").lower() or "engineer" in job_data.get("title", "").lower():
                job_data["responsibilities"] = """• Develop and maintain high-quality software applications
• Collaborate with cross-functional teams to define and implement new features
• Write clean, maintainable, and efficient code
• Participate in code reviews and technical discussions
• Troubleshoot and debug applications to optimize performance
• Stay updated with latest technology trends and best practices"""
            elif "manager" in job_data.get("title", "").lower():
                job_data["responsibilities"] = """• Lead and mentor team members to achieve project goals
• Develop and implement strategic plans and processes
• Coordinate with stakeholders and other departments
• Monitor project progress and ensure timely delivery
• Conduct performance reviews and provide feedback
• Foster a positive and productive work environment"""
        
        # AUTO-GENERATE REQUIREMENTS
        if not job_data.get("requirements") or len(job_data["requirements"]) < 10:
            experience_level = job_data.get("experienceLevel", "mid")
            years_exp = "3-5" if experience_level == "mid" else ("5+" if experience_level == "senior" else "1-3")
            
            job_data["requirements"] = f"""• {years_exp} years of relevant experience
• Bachelor's degree in related field or equivalent experience
• Strong proficiency in {', '.join(job_data.get('skills', ['required skills'])[:3])}
• Excellent communication and teamwork skills
• Problem-solving mindset and attention to detail
• Ability to work independently and manage multiple tasks"""
    
    def _generate_ai_response(self, user_message: str, session: SQLSessionState) -> str:
        """Generate AI response using OpenAI for intelligent, contextual responses."""
        try:
            # Check if this is an enhancement request
            enhancement_keywords = ["enhance", "improve", "better", "upgrade", "polish", "refine", "optimize"]
            is_enhancement_request = any(keyword in user_message.lower() for keyword in enhancement_keywords)
            
            # Import OpenAI and required modules
            from openai import OpenAI
            import os
            from dotenv import load_dotenv
            import json
            
            load_dotenv(override=True)
            
            api_key = os.getenv("OPENAI_API_KEY")
            if not api_key:
                print("⚠️ OpenAI API key not found, using fallback response")
                return self._fallback_response(user_message, session)
            
            client = OpenAI(api_key=api_key)
            
            # Create comprehensive system prompt
            system_prompt = f"""You are an expert HR professional with 15+ years of experience creating compelling job posts. You're helping create a job post for {session.company_name}.

CURRENT JOB DATA COLLECTED:
{json.dumps(session.job_data, indent=2)}

CONVERSATION HISTORY:
{chr(10).join(session.conversation_history[-10:])}

CURRENT STEP: {session.current_step}

IMPORTANT: The job data should NOT include a "department" field in the final API payload. Department information should be mentioned in descriptions but not as a separate field.

YOUR ROLE - {"ENHANCEMENT MODE" if is_enhancement_request else "ULTRA-FAST JOB POSTING"} WITH AI RECOMMENDATIONS:
{"🔥 ENHANCEMENT MODE ACTIVATED - Act as a senior HR consultant:" if is_enhancement_request else ""}
{"1. Analyze the current job data and identify specific areas for improvement" if is_enhancement_request else ""}
{"2. Suggest enhanced job title, compelling description, refined requirements" if is_enhancement_request else ""}
{"3. Provide market-competitive salary recommendations" if is_enhancement_request else ""}
{"4. Add modern workplace benefits and attractive perks" if is_enhancement_request else ""}
{"5. Make the job post more appealing to top-tier candidates" if is_enhancement_request else ""}
{"6. Ensure all data follows proper format (no department field)" if is_enhancement_request else ""}

- ALWAYS provide ready-to-use, complete solutions that require only "Yes" or "No" confirmation
- Make job posting 10x faster by providing full templates and smart auto-completion
- Never ask open-ended questions - always provide 2-3 specific options to choose from
- Auto-fill ALL missing information with industry-standard defaults
- Use emojis and clear formatting for instant recognition

ULTRA-FAST RESPONSE STRATEGY:
✅ Instead of asking "What skills?", provide: "I'm adding these essential skills: [complete list]. Confirm?"
✅ Instead of asking "What responsibilities?", provide: "Here's a complete job description template: [full text]. Use this?"
✅ Instead of asking "What salary?", provide: "Based on market rates, I suggest 12,000-18,000 JOD. Approve?"
✅ Always bundle related information together for faster confirmation
✅ Provide 90% complete job posts that need only 1-2 confirmations

RESPONSE FORMAT:
🚀 Start with: "Perfect! I'm {'enhancing' if is_enhancement_request else 'auto-completing'} this for you..."
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
            
            ai_response = response.choices[0].message.content
            print(f"🤖 OpenAI response generated successfully ({'enhancement' if is_enhancement_request else 'standard'} mode)")
            return ai_response
            
        except Exception as e:
            print(f"❌ Error generating AI response: {e}")
            return self._fallback_response(user_message, session)
    
    def _fallback_response(self, user_message: str, session: SQLSessionState) -> str:
        """Fallback response when OpenAI is not available."""
        job_data = session.job_data
        completion_score = self._calculate_completion_score(session)
        
        if completion_score >= 0.8:  # 80% complete
            return f"""Perfect! I'm auto-completing this for you... 🚀

Here's the updated job details:

**Job Title**: {job_data.get('title', 'Not specified')}
**Experience Level**: {job_data.get('experienceLevel', 'Not specified')}
**Location**: {job_data.get('location', 'Not specified')}
**Work Type**: {job_data.get('workType', 'Not specified')}
**Salary Range**: {job_data.get('salaryMin', 'Not specified')}-{job_data.get('salaryMax', 'Not specified')} {job_data.get('currency', 'JOD')}

**Skills Required**: {', '.join(job_data.get('skills', []))}

The job post looks comprehensive! Would you like me to finalize it, or would you like to make any adjustments?

Type **"finalize"** or **"post it"** to publish the job, or tell me what you'd like to change."""
        
        # Response based on what information we're missing
        missing_fields = []
        
        if not job_data.get("title") or len(job_data["title"]) < 3:
            missing_fields.append("job title")
        if not job_data.get("experienceLevel"):
            missing_fields.append("experience level")
        if not job_data.get("location"):
            missing_fields.append("location")
        
        if missing_fields:
            return f"""Great! I've captured some information. Let me help you with a few more details:

**Current Job Details:**
- **Title**: {job_data.get('title', 'Please specify')}
- **Experience**: {job_data.get('experienceLevel', 'Please specify')}
- **Location**: {job_data.get('location', 'Please specify')}

Could you tell me more about: **{', '.join(missing_fields[:2])}**?

For example: "This requires 3-5 years experience, based in Amman with remote options"."""
        
        # If we have basic info, ask for more details
        return f"""Excellent! I'm building a comprehensive job post for **{job_data.get('title', 'this position')}** at {session.company_name}.

**Current Progress:**
✅ **Title**: {job_data.get('title', 'Set')}
✅ **Experience**: {job_data.get('experienceLevel', 'Set')}
✅ **Location**: {job_data.get('location', 'Set')}
✅ **Salary**: {job_data.get('salaryMin', '')}-{job_data.get('salaryMax', '')} {job_data.get('currency', 'JOD')}

Is there anything specific about this role you'd like to highlight? Such as:
- Special benefits or perks
- Remote work flexibility  
- Specific technologies or tools
- Team culture or growth opportunities

Or simply say **"looks good"** and I'll finalize everything for you! 🎯"""
    
    def _calculate_completion_score(self, session: SQLSessionState) -> float:
        """Calculate how complete the job post is (0.0 to 1.0)."""
        job_data = session.job_data
        score = 0.0
        total_weight = 0.0
        
        # Essential fields with weights
        essential_fields = {
            "title": 0.3,
            "experienceLevel": 0.2,
            "location": 0.2,
            "skills": 0.1,
            "description": 0.1,
            "requirements": 0.05,
            "responsibilities": 0.05
        }
        
        for field, weight in essential_fields.items():
            total_weight += weight
            if field == "skills":
                if job_data.get(field) and len(job_data[field]) > 0:
                    score += weight
            else:
                if job_data.get(field) and len(str(job_data[field])) > 2:
                    score += weight
        
        return score / total_weight if total_weight > 0 else 0.0
    
    def _check_completion_readiness(self, user_message: str, session: SQLSessionState) -> bool:
        """Check if the user wants to complete the job post or if it's ready."""
        
        completion_triggers = [
            "finalize", "post it", "publish", "complete", "done", "finish",
            "looks good", "that's it", "submit", "create the post", "go ahead"
        ]
        
        message_lower = user_message.lower()
        
        # Check for explicit completion triggers
        if any(trigger in message_lower for trigger in completion_triggers):
            return True
        
        # Auto-complete if we have enough information
        completion_score = self._calculate_completion_score(session)
        return completion_score >= 0.85  # 85% complete
    
    def _update_current_step(self, session: SQLSessionState):
        """Update the current step based on job data completeness."""
        job_data = session.job_data
        
        if not job_data.get("title"):
            session.current_step = "getting_basic_info"
        elif not job_data.get("experienceLevel"):
            session.current_step = "getting_details"
        elif not job_data.get("location") or not job_data.get("skills"):
            session.current_step = "getting_specifics"
        else:
            session.current_step = "finalizing"
    
    def _finalize_job_post(self, session: SQLSessionState) -> str:
        """Finalize the job post and attempt to post it via webhook."""
        try:
            from .tools.job_post_webhook import send_job_post_to_api
            
            # Validate and clean experience level
            experience_level = session.job_data.get("experienceLevel", "MID_LEVEL")
            valid_experience_levels = ["ENTRY_LEVEL", "JUNIOR", "MID_LEVEL", "SENIOR", "LEAD", "PRINCIPAL", "EXECUTIVE"]
            
            # Map common variations to valid values
            experience_mapping = {
                "ENTRY": "ENTRY_LEVEL",
                "JUNIOR": "JUNIOR", 
                "MID": "MID_LEVEL",
                "MIDDLE": "MID_LEVEL",
                "SENIOR": "SENIOR",
                "LEAD": "LEAD",
                "PRINCIPAL": "PRINCIPAL",
                "EXECUTIVE": "EXECUTIVE"
            }
            
            if experience_level.upper() in experience_mapping:
                experience_level = experience_mapping[experience_level.upper()]
            elif experience_level.upper() not in valid_experience_levels:
                experience_level = "MID_LEVEL"  # Default fallback
            
            # Validate and clean work type
            work_type = session.job_data.get("workType", "HYBRID")
            valid_work_types = ["HYBRID", "REMOTE", "ON_SITE"]
            work_type_mapping = {
                "ONSITE": "ON_SITE",
                "OFFICE": "ON_SITE",
                "HYBRID": "HYBRID",
                "REMOTE": "REMOTE"
            }
            
            if work_type.upper() in work_type_mapping:
                work_type = work_type_mapping[work_type.upper()]
            elif work_type.upper() not in valid_work_types:
                work_type = "HYBRID"  # Default fallback
            
            # Validate and clean salary values
            try:
                salary_min = float(session.job_data.get("salaryMin", 0))
                if salary_min < 0:
                    salary_min = 0
            except (ValueError, TypeError):
                salary_min = 0
                
            try:
                salary_max = float(session.job_data.get("salaryMax", 0))
                if salary_max < 0:
                    salary_max = 0
            except (ValueError, TypeError):
                salary_max = 0
            
            # Ensure salary_max is at least salary_min
            if salary_max > 0 and salary_min > salary_max:
                salary_min, salary_max = salary_max, salary_min
            
            # Prepare job data for API (excluding department field)
            api_job_data = {
                "title": session.job_data.get("title", "Untitled Position"),
                "description": session.job_data.get("description", ""),
                "requirements": session.job_data.get("requirements", ""),
                "responsibilities": session.job_data.get("responsibilities", ""),
                "benefits": session.job_data.get("benefits", ""),
                "skills": session.job_data.get("skills", []),
                "experienceLevel": experience_level,
                "location": session.job_data.get("location", ""),
                "workType": work_type,
                "salaryMin": int(salary_min) if isinstance(salary_min, (int, float)) else 0,
                "salaryMax": int(salary_max) if isinstance(salary_max, (int, float)) else 0,
                "currency": session.job_data.get("currency", "JOD"),
                "enableAiInterview": session.job_data.get("enableAiInterview", False),
                "isFeatured": session.job_data.get("isFeatured", False),
                "companyId": session.company_id
            }
            
            # Ensure "department" field is not included in the final API payload
            if "department" in api_job_data:
                api_job_data.pop("department")
                
            # Also ensure it's not in the session job data when sending to API
            if "department" in session.job_data:
                # Remove from session data copy only for API submission
                session_data_copy = session.job_data.copy()
                session_data_copy.pop("department")
                # Don't modify the original session.job_data as it's used elsewhere
            else:
                session_data_copy = session.job_data
            
            # Post to API (ensure we're sending the validated data without the department field)
            api_response = send_job_post_to_api(
                job_data=api_job_data,
                company_id=session.company_id,
                company_name=session.company_name
            )
            
            # Check for validation errors
            if api_response.get("validation_errors"):
                error_message = api_response.get("validation_errors", "Unknown validation error")
                
                # Format error message to be more user-friendly
                formatted_error = error_message
                if isinstance(error_message, list):
                    formatted_error = "\n".join([f"- {err}" for err in error_message])
                
                return f"""⚠️ **Job post created but there was an issue publishing it online.**

**📋 Complete Job Details Ready:**
- **Title**: {session.job_data.get('title', 'N/A')}
- **Experience**: {experience_level}
- **Location**: {session.job_data.get('location', 'N/A')}
- **Salary**: {int(salary_min) if isinstance(salary_min, (int, float)) else 0}-{int(salary_max) if isinstance(salary_max, (int, float)) else 0} {session.job_data.get('currency', 'JOD')}

**Error Details**: 
{formatted_error}

The job post data is complete and saved. Please fix the validation issues and try again, or contact your administrator to publish it manually.
"""
            el            if api_response.get("success"):
                return f"""🎉 **Perfect! Your job post has been published successfully!**

**"{session.job_data.get('title', 'Job Post')}"** is now live and ready to attract top talent!

**📋 Final Job Details:**
- **Title**: {session.job_data.get('title', 'N/A')}
- **Experience**: {session.job_data.get('experienceLevel', 'N/A')}
- **Location**: {session.job_data.get('location', 'N/A')}
- **Salary**: {int(float(session.job_data.get('salaryMin', 0)))} - {int(float(session.job_data.get('salaryMax', 0)))} {session.job_data.get('currency', 'JOD')}
- **Skills**: {', '.join(session.job_data.get('skills', []))}

**✨ What's Next:**
- Candidates can now apply for this position
- You'll receive notifications when applications come in
- The AI interview system is {"enabled" if session.job_data.get('enableAiInterview') else "disabled"}

**🚀 Job Post ID**: {api_response.get('job_id', 'Generated successfully')}

Thank you for using our AI HR assistant! Would you like to create another job post?"""
            else:
                return f"""⚠️ **Job post created but there was an issue publishing it online.**

**📋 Complete Job Details Ready:**
- **Title**: {session.job_data.get('title', 'N/A')}
- **Experience**: {experience_level}
- **Location**: {session.job_data.get('location', 'N/A')}
- **Salary**: {int(salary_min) if isinstance(salary_min, (int, float)) else 0}-{int(salary_max) if isinstance(salary_max, (int, float)) else 0} {session.job_data.get('currency', 'JOD')}

**Error Details**: {api_response.get('error', 'Unknown error occurred')}

The job post data is complete and saved. Please contact your administrator to publish it manually."""
                
        except Exception as e:
            print(f"Error in _finalize_job_post: {e}")
            return f"""✅ **Job post information collected successfully!**

**📋 Complete Job Details:**
- **Title**: {session.job_data.get('title', 'N/A')}
- **Experience**: {session.job_data.get('experienceLevel', 'N/A')}
- **Location**: {session.job_data.get('location', 'N/A')}
- **Work Type**: {session.job_data.get('workType', 'N/A')}

All the job information has been collected and is ready for posting. There was a technical issue with automatic posting, but your data is safely stored."""

# Global instance
_sql_session_job_post_agent = None

def get_sql_session_job_post_agent() -> SQLSessionJobPostAgent:
    """Get the global SQL session job post agent instance."""
    global _sql_session_job_post_agent
    if _sql_session_job_post_agent is None:
        _sql_session_job_post_agent = SQLSessionJobPostAgent()
    return _sql_session_job_post_agent
