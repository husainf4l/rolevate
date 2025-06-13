#!/usr/bin/env python3
"""
Stateful Interactive Console for Job Post Agent
This version maintains conversation state between turns to avoid recursion issues.
"""

from agent.job_post_agent import run_job_post_agent
from typing import Dict, Any, List
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
        """Process user input and return AI response."""
        
        print(f"🔧 DEBUG: Processing user input: '{user_input}'")
        print(f"🔧 DEBUG: Current step: {self.current_step}")
        print(f"🔧 DEBUG: Current job data: {list(self.job_data.keys())}")
        
        # Add to conversation history
        self.conversation_history.append(f"User: {user_input}")
        
        try:
            # Call the simplified agent
            messages = run_job_post_agent(
                user_input=user_input,
                company_id=self.company_id,
                company_name=self.company_name
            )
            
            if messages and len(messages) > 0:
                ai_response = messages[-1].content
                self.conversation_history.append(f"AI: {ai_response}")
                
                # Extract and update job data from user input
                self._extract_job_info(user_input)
                
                # Check if user wants to complete
                if self._check_completion_keywords(user_input):
                    self.is_complete = True
                    return self._finalize_job_post()
                
                print(f"✅ DEBUG: Generated AI response: '{ai_response[:100]}...'")
                return ai_response
            else:
                return "I apologize, I didn't receive a proper response. Could you please try again?"
                
        except Exception as e:
            print(f"❌ DEBUG: Error processing input: {str(e)}")
            return f"I encountered an issue: {str(e)}. Let's continue - could you tell me more about the job position?"
    
    def _extract_job_info(self, user_message: str):
        """Extract job information from user message."""
        
        message_lower = user_message.lower()
        
        # Extract job title if not set
        if not self.job_data.get("title"):
            # Simple extraction - look for job-related keywords
            if any(word in message_lower for word in ["developer", "engineer", "manager", "analyst", "designer"]):
                # Clean up the input to use as title
                cleaned_title = user_message.strip().title()
                if len(cleaned_title) < 100:  # Reasonable title length
                    self.job_data["title"] = cleaned_title
                    print(f"🔧 DEBUG: Extracted title: '{cleaned_title}'")
        
        # Extract experience level
        if "senior" in message_lower or "lead" in message_lower:
            self.job_data["experienceLevel"] = "senior"
        elif "junior" in message_lower or "entry" in message_lower:
            self.job_data["experienceLevel"] = "junior"
        elif "mid" in message_lower or "intermediate" in message_lower:
            self.job_data["experienceLevel"] = "mid"
        
        # Extract skills
        common_skills = [".net", "c#", "python", "javascript", "react", "sql", "aws", "azure"]
        found_skills = [skill for skill in common_skills if skill in message_lower]
        if found_skills:
            self.job_data["skills"].extend(found_skills)
            self.job_data["skills"] = list(set(self.job_data["skills"]))  # Remove duplicates
        
        # Build description
        if len(user_message) > 20:
            if self.job_data["description"]:
                self.job_data["description"] += f"\n\n{user_message}"
            else:
                self.job_data["description"] = user_message
    
    def _check_completion_keywords(self, user_message: str) -> bool:
        """Check if user wants to complete the job post."""
        completion_keywords = ["ready", "publish", "post it", "create it", "done", "finished", "looks good"]
        return any(keyword in user_message.lower() for keyword in completion_keywords)
    
    def _finalize_job_post(self) -> str:
        """Finalize the job post and attempt to send to API."""
        
        print("🔧 DEBUG: Finalizing job post...")
        
        try:
            from agent.tools.job_post_webhook import send_job_post_to_api
            
            # Send to API
            api_response = send_job_post_to_api(
                job_data=self.job_data,
                company_id=self.company_id,
                company_name=self.company_name
            )
            
            if api_response.get("success", False):
                return f"""🎉 **Perfect! Your job post has been published successfully!**

**"{self.job_data.get('title', 'Job Post')}"** is now live!

**Summary:**
📋 **Title:** {self.job_data.get('title', 'N/A')}
💼 **Experience Level:** {self.job_data.get('experienceLevel', 'Not specified')}
🛠️ **Skills:** {', '.join(self.job_data.get('skills', [])[:5])}

Would you like to create another job post?"""
            else:
                return f"""✅ **Job Post Created Successfully!**

I've helped you create a comprehensive job post for **{self.job_data.get('title', 'the position')}**.

**Details:**
- **Title:** {self.job_data.get('title', 'N/A')}
- **Experience Level:** {self.job_data.get('experienceLevel', 'N/A')}
- **Skills:** {', '.join(self.job_data.get('skills', [])[:3])}

Note: There was an issue with the API connection, but your job post is ready.

Would you like to create another job post?"""
                
        except Exception as e:
            print(f"❌ DEBUG: Error finalizing: {str(e)}")
            return f"""❌ **Error Publishing Job Post**

I encountered an issue: {str(e)}

However, I've created your job post content:
**Title:** {self.job_data.get('title', 'N/A')}

Would you like to try again or create another job post?"""

def main():
    print("🤖 CONVERSATIONAL AI HR EXPERT")
    print("=" * 50)
    
    # Get company info
    company_id = input("Enter Company ID: ").strip() or "demo-company-123"
    company_name = input("Enter Company Name: ").strip() or "Demo Company"
    
    print(f"\n✅ Company: {company_name} (ID: {company_id})")
    print("\n🚀 Let's create your job post!")
    print("💡 Example: 'I want to create a job post for a Senior .NET Developer'")
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
    main()
