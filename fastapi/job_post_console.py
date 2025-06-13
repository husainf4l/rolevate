#!/usr/bin/env python3
"""
Interactive Console Interface for the Job Post Creation Agent

This script provides a command-line interface to interact with the AI HR Expert
for creating job posts through a conversational flow.
"""

import sys
import os
from typing import Dict, Any

# Add the current directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from agent.job_post_agent import run_job_post_agent

class JobPostConsole:
    def __init__(self):
        self.company_id = None
        self.company_name = None
        self.conversation_history = []
        
    def print_banner(self):
        """Print the welcome banner."""
        print("=" * 80)
        print("🤖 AI HR EXPERT - JOB POST CREATION AGENT")
        print("=" * 80)
        print("Welcome! I'm your AI HR Expert, ready to help you create amazing job posts.")
        print("Type 'quit', 'exit', or 'bye' to end the conversation.")
        print("Type 'reset' to start a new job post.")
        print("Type 'help' for available commands.")
        print("=" * 80)
        
    def print_help(self):
        """Print available commands."""
        print("\n📋 AVAILABLE COMMANDS:")
        print("  help     - Show this help message")
        print("  reset    - Start a new job post creation")
        print("  status   - Show current company information")
        print("  quit     - Exit the application")
        print("  exit     - Exit the application")
        print("  bye      - Exit the application")
        print()
        
    def get_company_info(self):
        """Get company information from user."""
        print("\n🏢 COMPANY SETUP")
        print("-" * 20)
        
        while not self.company_id:
            company_id = input("Enter your Company ID: ").strip()
            if company_id:
                self.company_id = company_id
            else:
                print("❌ Company ID is required. Please try again.")
                
        company_name = input("Enter your Company Name (optional): ").strip()
        if company_name:
            self.company_name = company_name
        else:
            self.company_name = "Your Company"
            
        print(f"✅ Company setup complete!")
        print(f"   ID: {self.company_id}")
        print(f"   Name: {self.company_name}")
        print()
        
    def reset_conversation(self):
        """Reset the conversation and start over."""
        print("\n🔄 RESETTING CONVERSATION...")
        self.company_id = None
        self.company_name = None
        self.conversation_history = []
        self.get_company_info()
        
    def show_status(self):
        """Show current status."""
        print(f"\n📊 CURRENT STATUS:")
        print(f"   Company ID: {self.company_id or 'Not set'}")
        print(f"   Company Name: {self.company_name or 'Not set'}")
        print(f"   Messages in conversation: {len(self.conversation_history)}")
        print()
        
    def process_message(self, user_input: str):
        """Process user message with the agent."""
        try:
            print("\n🤖 AI HR Expert is thinking...")
            
            # Call the job post agent
            messages = run_job_post_agent(
                user_input=user_input,
                company_id=self.company_id,
                company_name=self.company_name
            )
            
            # Store in conversation history
            self.conversation_history.extend(messages)
            
            # Get the latest AI response
            if messages:
                ai_response = messages[-1].content
                print("\n🎯 AI HR EXPERT:")
                print("-" * 50)
                print(ai_response)
                print("-" * 50)
            else:
                print("\n❌ No response from the AI agent.")
                
        except Exception as e:
            print(f"\n❌ ERROR: {str(e)}")
            print("Please try again or type 'help' for available commands.")
            
    def run(self):
        """Run the interactive console."""
        self.print_banner()
        
        # Get company information
        self.get_company_info()
        
        print("🚀 Ready to create your job post! What position would you like to hire for?")
        print("💡 Example: 'I want to create a job post for a Senior Software Engineer'")
        print()
        
        while True:
            try:
                # Get user input
                user_input = input("👤 You: ").strip()
                
                # Handle empty input
                if not user_input:
                    continue
                    
                # Handle commands
                if user_input.lower() in ['quit', 'exit', 'bye']:
                    print("\n👋 Thank you for using the AI HR Expert! Goodbye!")
                    break
                elif user_input.lower() == 'help':
                    self.print_help()
                    continue
                elif user_input.lower() == 'reset':
                    self.reset_conversation()
                    continue
                elif user_input.lower() == 'status':
                    self.show_status()
                    continue
                    
                # Process the message with the agent
                self.process_message(user_input)
                
            except KeyboardInterrupt:
                print("\n\n👋 Goodbye! Thanks for using the AI HR Expert!")
                break
            except EOFError:
                print("\n\n👋 Goodbye! Thanks for using the AI HR Expert!")
                break
            except Exception as e:
                print(f"\n❌ Unexpected error: {str(e)}")
                print("Please try again.")

def main():
    """Main function to run the console interface."""
    console = JobPostConsole()
    console.run()

if __name__ == "__main__":
    main()
