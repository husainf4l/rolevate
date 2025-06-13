"""
Test script for the CV analysis LangGraph agent.
This script tests the entire workflow, from PDF extraction to OpenAI analysis.
"""
import os
import sys
from pathlib import Path
from dotenv import load_dotenv
from agent import run_agent

def verify_environment():
    """Verify that the environment is properly set up."""
    # Load environment variables
    load_dotenv()
    
    # Check if OpenAI API key is available
    openai_api_key = os.getenv("OPENAI_API_KEY")
    if not openai_api_key:
        print("Error: OPENAI_API_KEY not found in environment variables.")
        print("Please add your OpenAI API key to the .env file.")
        sys.exit(1)
    
    print("✓ OpenAI API key found")
    
    # Check if the test PDF file exists
    test_pdf_path = Path("test/upload/1.pdf").absolute()
    if not test_pdf_path.exists():
        print(f"Error: Test PDF file not found at {test_pdf_path}")
        sys.exit(1)
    
    print(f"✓ Test PDF file found: {test_pdf_path}")
    return str(test_pdf_path)

def run_cv_analysis_test(pdf_path):
    """Run the CV analysis test with the given PDF path."""
    print("\n----- STARTING CV ANALYSIS TEST -----\n")
    
    # Use predefined valid UUIDs that work with the NestJS backend
    candidate_id = "29c313d7-04dc-4a08-bc93-95efe273511e"  # Valid candidate UUID
    application_id = "37b613ca-941b-4135-b081-f3523cf0ce8a"  # Valid application UUID - confirmed working with backend
    
    # Construct the input for the agent
    user_input = f"""
    Process job application:
    - Candidate ID: {candidate_id}
    - Job Post ID: {application_id}
    - CV: {pdf_path}
    """
    
    print(f"Input to agent:\n{user_input}\n")
    print("Processing... (this might take a minute if using OpenAI API)\n")
    
    # Call the agent
    messages = run_agent(user_input)
    
    # Print the agent's responses
    print("\n----- AGENT RESPONSES -----\n")
    for i, message in enumerate(messages):
        print(f"Message {i+1} ({message.type}):")
        print("-" * 40)
        print(message.content)
        print("-" * 40)
        print()

if __name__ == "__main__":
    # Verify environment and get PDF path
    pdf_path = verify_environment()
    
    # Run the CV analysis test
    run_cv_analysis_test(pdf_path)
