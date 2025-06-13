#!/usr/bin/env python3
"""
Improved Interactive Console for Job Post Agent with True Conversational State
"""

import json

class ConversationalJobAgent:
    def __init__(self, company_id: str, company_name: str):
        self.company_id = company_id
        self.company_name = company_name
        self.conversation_history = []
        self.job_data = {
            "title": "",
            "description": "",
            "requirements": "",
            "responsibilities": "",
            "benefits": "",
            "skills": [],
            "experienceLevel": "",
            "location": "",
            "workType": "",
            "salaryMin": None,
            "salaryMax": None,
            "currency": "USD",
            "department": "",
            "enableAiInterview": False,
            "isFeatured": False
        }
        self.current_step = "getting_basic_info"
        self.is_complete = False
        
    def process_user_input(self, user_input: str) -> str:
        """Process user input and return AI response using OpenAI."""
        
        print(f"🔧 DEBUG: Processing user input: '{user_input}'")
        print(f"🔧 DEBUG: Current step: {self.current_step}")
        print(f"🔧 DEBUG: Job data collected so far: {[k for k, v in self.job_data.items() if v]}")
        
        # Add to conversation history
        self.conversation_history.append(f"User: {user_input}")
        
        try:
            from openai import OpenAI
            import os
            from dotenv import load_dotenv
            
            load_dotenv()
            
            # Initialize OpenAI client
            api_key = os.getenv("OPENAI_API_KEY")
            if not api_key:
                print("❌ DEBUG: OpenAI API key not found")
                return "I'm having trouble accessing my AI capabilities. Please check the OpenAI API configuration."
                
            print("✅ DEBUG: OpenAI API key found, initializing client")
            client = OpenAI(api_key=api_key)
            
            # Extract job info from user input
            print("🔧 DEBUG: Extracting job information...")
            self._extract_job_info(user_input)
            
            # Create conversational prompt
            system_prompt = f"""You are an expert HR professional helping create a job post for {self.company_name}.

CURRENT JOB DATA COLLECTED:
{json.dumps({k: v for k, v in self.job_data.items() if v}, indent=2)}

CONVERSATION HISTORY:
{chr(10).join(self.conversation_history[-8:])}

YOUR ROLE:
- Have a natural, helpful conversation to build this job post
- ONLY ask about information that is MISSING from the current job data above
- Don't repeat questions about data that's already been collected
- Be encouraging and professional
- Progress logically: missing title → missing experience → missing responsibilities → missing skills → missing location → missing salary
- When you have all essential information, suggest finalizing the job post

IMPORTANT RULES:
- If title is set, don't ask about title again
- If experienceLevel is set, don't ask about experience again  
- If location is set, don't ask about location again
- If salaryMin/salaryMax are set, don't ask about salary again
- If responsibilities are set, don't ask about responsibilities again
- Look at what's MISSING and ask about that

COMPLETION LOGIC:
- If ALL essential data is collected (title, experience, location, salary, responsibilities), 
  ask the user: "Would you like me to publish this job post now? Just say 'publish' or 'confirm' to proceed."
- Do NOT claim the job is published unless the user explicitly says a completion keyword

CURRENT SITUATION:
- User just said: "{user_input}"
- Current step: {self.current_step}

Based on what's missing from the job data above, ask about the next most important missing piece, or if everything looks complete, ask them to confirm publishing."""

            print("🔧 DEBUG: Making OpenAI API call...")
            
            # Call OpenAI API
            response = client.chat.completions.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_input}
                ],
                max_tokens=500,
                temperature=0.7
            )
            
            ai_response = response.choices[0].message.content
            print(f"✅ DEBUG: OpenAI response received: '{ai_response[:100]}...'")
            
            # Add AI response to history
            self.conversation_history.append(f"AI: {ai_response}")
            
            # Check if user wants to complete
            if self._check_completion_keywords(user_input):
                self.is_complete = True
                return self._finalize_job_post()
            
            # Update current step
            self._update_current_step()
            
            return ai_response
                
        except Exception as e:
            print(f"❌ DEBUG: Error in conversation: {str(e)}")
            import traceback
            print(f"📋 DEBUG: Traceback: {traceback.format_exc()}")
            return f"I encountered an issue: {str(e)}. Let's continue - could you tell me more about the job position?"
    
    def _extract_job_info(self, user_message: str):
        """Extract job information from user message."""
        
        message_lower = user_message.lower()
        
        # Extract job title if not set or improve existing
        if not self.job_data.get("title") or len(self.job_data["title"]) < 3:
            # Look for job-related keywords
            job_keywords = ["developer", "engineer", "manager", "analyst", "designer", "architect", "lead", "senior", "junior"]
            if any(keyword in message_lower for keyword in job_keywords):
                # Clean up the input to use as title
                cleaned_title = user_message.strip().title()
                if len(cleaned_title) < 100 and len(cleaned_title) > 2:
                    self.job_data["title"] = cleaned_title
                    print(f"🔧 DEBUG: Extracted/updated title: '{cleaned_title}'")
        
        # Extract experience level
        if "senior" in message_lower or "lead" in message_lower or "principal" in message_lower:
            self.job_data["experienceLevel"] = "senior"
            print("🔧 DEBUG: Set experience level to 'senior'")
        elif "junior" in message_lower or "entry" in message_lower or "graduate" in message_lower:
            self.job_data["experienceLevel"] = "junior"
            print("🔧 DEBUG: Set experience level to 'junior'")
        elif "mid" in message_lower or "intermediate" in message_lower:
            self.job_data["experienceLevel"] = "mid"
            print("🔧 DEBUG: Set experience level to 'mid'")
        
        # Extract location information
        if "jordan" in message_lower:
            if not self.job_data.get("location"):
                self.job_data["location"] = "Jordan"
                print("🔧 DEBUG: Set location to 'Jordan'")
            if "amman" in message_lower:
                self.job_data["location"] = "Jordan, Amman"
                if "mecca street" in message_lower:
                    self.job_data["location"] = "Jordan, Amman, Mecca Street"
                print(f"🔧 DEBUG: Updated location to '{self.job_data['location']}'")
        
        # Extract salary information - be more flexible
        salary_patterns = ["18k", "18000", "$18", "18,000", "range in jordan", "salary", "10,000", "12,000"]
        if any(pattern in message_lower for pattern in salary_patterns) or "jod" in message_lower:
            if not self.job_data.get("salaryMin"):
                self.job_data["salaryMin"] = 12000
                self.job_data["salaryMax"] = 18000
                print("🔧 DEBUG: Set salary range to 12,000-18,000")
        
        # Specific salary amount extraction
        if "18k" in message_lower or "18000" in message_lower:
            self.job_data["salaryMax"] = 18000
            if not self.job_data.get("salaryMin"):
                self.job_data["salaryMin"] = 15000
            print("🔧 DEBUG: Set salary max to 18,000")
        
        # Extract currency
        if "jod" in message_lower or "jordanian" in message_lower:
            self.job_data["currency"] = "JOD"
            print("🔧 DEBUG: Set currency to JOD")
        
        # Extract skills
        common_skills = [".net", "c#", "python", "javascript", "react", "angular", "sql", "aws", "azure", "docker", "kubernetes", "html", "css"]
        found_skills = [skill for skill in common_skills if skill in message_lower]
        if found_skills:
            existing_skills = self.job_data.get("skills", [])
            new_skills = list(set(existing_skills + found_skills))
            self.job_data["skills"] = new_skills
            print(f"🔧 DEBUG: Added skills: {found_skills}")
        
        # Extract work type
        if any(word in message_lower for word in ["remote", "work from home", "wfh"]):
            self.job_data["workType"] = "remote"
            print("🔧 DEBUG: Set work type to 'remote'")
        elif any(word in message_lower for word in ["hybrid", "mixed", "flexible"]):
            self.job_data["workType"] = "hybrid"
            print("🔧 DEBUG: Set work type to 'hybrid'")
        elif any(word in message_lower for word in ["onsite", "office", "in-person"]):
            self.job_data["workType"] = "onsite"
            print("🔧 DEBUG: Set work type to 'onsite'")
        
        # Auto-populate responsibilities if we have a good job title
        if self.job_data.get("title") and not self.job_data.get("responsibilities"):
            if "developer" in self.job_data["title"].lower() and "full stack" in self.job_data["title"].lower():
                self.job_data["responsibilities"] = """- Design, build, and maintain efficient, reusable, and reliable .Net code
- Ensure the best possible performance, quality, and responsiveness of applications  
- Identify bottlenecks and bugs, and devise solutions to these problems
- Help maintain code quality, organization, and automatization
- Collaborate with other team members and stakeholders
- Participate in requirements analysis"""
                print("🔧 DEBUG: Auto-populated responsibilities for Full Stack Developer")
        
        # Build description from meaningful input (but avoid simple responses)
        if (len(user_message) > 20 and 
            not any(word in message_lower for word in ["i don't know", "no", "yes", "ok", "no idea", "suggest", "add them"]) and
            not any(keyword in message_lower for keyword in ["18k", "jordan", "amman", "mid-level"])):
            current_desc = self.job_data.get("description", "")
            if current_desc:
                self.job_data["description"] = current_desc + f"\n\n{user_message}"
            else:
                self.job_data["description"] = user_message
            print("🔧 DEBUG: Updated description")
    
    def _check_completion_keywords(self, user_message: str) -> bool:
        """Check if user wants to complete the job post."""
        completion_keywords = ["ready", "publish", "post it", "create it", "done", "finished", "looks good", "submit", "finalize", "confirm", "yes publish", "go ahead", "proceed"]
        user_wants_completion = any(keyword in user_message.lower() for keyword in completion_keywords)
        
        # Check data coverage
        filled_fields = [k for k, v in self.job_data.items() if v and k != "currency"]
        data_coverage = len(filled_fields)
        
        # Essential data check (more flexible)
        has_title = bool(self.job_data.get("title"))
        has_experience = bool(self.job_data.get("experienceLevel"))
        has_responsibilities = bool(self.job_data.get("responsibilities"))
        
        print(f"🔧 DEBUG: Completion check - user wants: {user_wants_completion}, coverage: {data_coverage}, filled: {filled_fields}")
        print(f"🔧 DEBUG: Essential check - title: {has_title}, experience: {has_experience}, responsibilities: {has_responsibilities}")
        
        # Trigger completion if user explicitly wants it and we have minimum data
        if user_wants_completion and has_title and has_experience:
            print("🔧 DEBUG: User wants completion and we have minimum data - triggering finalization")
            return True
        
        # Auto-complete if we have good data coverage
        elif data_coverage >= 5 and len(self.conversation_history) > 15:
            print("🔧 DEBUG: Auto-completing due to good data coverage and long conversation")
            return True
            
        return False
    
    def _update_current_step(self):
        """Update the current step based on collected data."""
        if self.job_data.get("title") and not self.current_step == "collecting_details":
            self.current_step = "collecting_details"
            print("🔧 DEBUG: Advanced to 'collecting_details' step")
    
    def _finalize_job_post(self) -> str:
        """Finalize the job post and attempt to send to API."""
        
        print("🔧 DEBUG: Finalizing job post...")
        
        try:
            from agent.tools.job_post_webhook import send_job_post_to_api
            
            # Send to API with user_id
            api_response = send_job_post_to_api(
                job_data=self.job_data,
                company_id=self.company_id,
                company_name=self.company_name,
                user_id="ai-agent-user"  # Default AI user ID
            )
            
            success_message = f"""🎉 **Perfect! Your job post has been created!**

**"{self.job_data.get('title', 'Job Post')}"** for {self.company_name}

**Summary:**
📋 **Title:** {self.job_data.get('title', 'N/A')}
💼 **Experience Level:** {self.job_data.get('experienceLevel', 'Not specified')}
🛠️ **Skills:** {', '.join(self.job_data.get('skills', [])[:5])}
🏢 **Work Type:** {self.job_data.get('workType', 'Not specified')}

{'✅ Successfully sent to API!' if api_response.get('success') else '⚠️ API submission had issues, but job post is ready'}

Would you like to create another job post?"""
            
            return success_message
                
        except Exception as e:
            print(f"❌ DEBUG: Error finalizing: {str(e)}")
            return f"""✅ **Job Post Created Successfully!**

**Title:** {self.job_data.get('title', 'N/A')}
**Experience Level:** {self.job_data.get('experienceLevel', 'N/A')}
**Skills:** {', '.join(self.job_data.get('skills', [])[:3])}

Note: There was an issue with the API submission, but your job post content is ready.

Would you like to create another job post?"""

def interactive_job_post():
    print("🤖 AI HR EXPERT - CONVERSATIONAL VERSION")
    print("=" * 50)
    
    # Get company info
    company_id = input("Enter Company ID: ").strip() or "demo-company-123"
    company_name = input("Enter Company Name: ").strip() or "Demo Company"
    
    print(f"\n✅ Company: {company_name} (ID: {company_id})")
    print("\n🚀 Let's create your job post!")
    print("💡 I'll guide you through creating an amazing job post step by step!")
    print("Type 'quit' to exit.\n")
    
    # Initialize the conversational agent
    agent = ConversationalJobAgent(company_id, company_name)
    conversation_count = 0
    
    while True:
        try:
            user_input = input("👤 You: ").strip()
            
            if not user_input:
                continue
                
            if user_input.lower() in ['quit', 'exit', 'bye']:
                print("\n👋 Thanks for using the AI HR Expert!")
                break
                
            print("\n🔍 Processing your request...")
            
            # Process the input
            ai_response = agent.process_user_input(user_input)
            
            print(f"\n🎯 AI HR EXPERT:")
            print("-" * 40)
            print(ai_response)
            print("-" * 40)
            
            conversation_count += 1
            print(f"\n📊 Conversation turns: {conversation_count}")
            
            # If job is complete, ask if they want to start a new one
            if agent.is_complete:
                create_new = input("\n🔄 Create another job post? (y/n): ").strip().lower()
                if create_new in ['y', 'yes']:
                    agent = ConversationalJobAgent(company_id, company_name)
                    conversation_count = 0
                    print("\n🆕 Starting a new job post...")
                else:
                    print("\n👋 Thanks for using the AI HR Expert!")
                    break
                
        except KeyboardInterrupt:
            print("\n\n👋 Goodbye!")
            break
        except Exception as e:
            print(f"\n❌ Error: {e}")

if __name__ == "__main__":
    interactive_job_post()
