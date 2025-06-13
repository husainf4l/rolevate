"""
Script to show what data is extracted from a CV analysis and sent to the API.
This helps debug and verify the extraction functions.
"""
import os
import sys
import json
from pathlib import Path
from dotenv import load_dotenv
from agent import run_agent
from agent.tools.cv_analysis_api import (
    extract_candidate_name, extract_candidate_email, extract_candidate_phone,
    extract_skills, extract_experience, extract_education, extract_strengths_weaknesses,
    extract_improvements, extract_languages, extract_certifications, extract_summary
)

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

def run_extraction_test(pdf_path):
    """Run the CV analysis and show extraction results."""
    print("\n----- TESTING CV DATA EXTRACTION -----\n")
    
    # Valid UUIDs for testing
    candidate_id = "29c313d7-04dc-4a08-bc93-95efe273511e"
    application_id = "37b613ca-941b-4135-b081-f3523cf0ce8a"
    
    # Construct the input for the agent
    user_input = f"""
    Process job application:
    - Candidate ID: {candidate_id}
    - Job Post ID: {application_id}
    - CV: {pdf_path}
    """
    
    print("Processing... (this might take a minute using OpenAI API)\n")
    
    # Call the agent
    messages = run_agent(user_input)
    
    # Get the CV analysis from the agent response
    cv_analysis = None
    for message in messages:
        if message.type == "ai" and "Name:" in message.content and "Education" in message.content:
            cv_analysis = message.content
            break
    
    if not cv_analysis:
        print("Error: Could not find CV analysis in agent responses.")
        sys.exit(1)
    
    print("CV Analysis completed. Now testing data extraction...\n")
    
    # Create wrapper dictionary to match the API function parameter
    cv_analysis_dict = {"analysis": cv_analysis}
    
    # Extract all information using the extraction functions
    extracted_data = {
        "candidateName": extract_candidate_name(cv_analysis_dict),
        "candidateEmail": extract_candidate_email(cv_analysis_dict),
        "candidatePhone": extract_candidate_phone(cv_analysis_dict),
        "skills": extract_skills(cv_analysis_dict),
        "experience": extract_experience(cv_analysis_dict),
        "education": extract_education(cv_analysis_dict),
        "strengths_weaknesses": extract_strengths_weaknesses(cv_analysis_dict),
        "improvements": extract_improvements(cv_analysis_dict),
        "languages": extract_languages(cv_analysis_dict),
        "certifications": extract_certifications(cv_analysis_dict),
        "summary": extract_summary(cv_analysis_dict)
    }
    
    # Print extracted data with nice formatting
    print("----- EXTRACTED DATA -----")
    
    # Personal Information
    print("\n1. Personal Information:")
    print(f"   Name: {extracted_data['candidateName']}")
    print(f"   Email: {extracted_data['candidateEmail']}")
    print(f"   Phone: {extracted_data['candidatePhone']}")
    
    # Skills
    print("\n2. Skills:")
    for skill in extracted_data['skills']:
        print(f"   - {skill}")
    
    # Experience
    print("\n3. Experience:")
    print(json.dumps(extracted_data['experience'], indent=3))
    
    # Education
    print("\n4. Education:")
    print(json.dumps(extracted_data['education'], indent=3))
    
    # Strengths & Weaknesses
    strengths, weaknesses = extracted_data['strengths_weaknesses']
    print("\n5. Strengths:")
    for strength in strengths:
        print(f"   - {strength}")
    
    print("\n6. Weaknesses:")
    for weakness in weaknesses:
        print(f"   - {weakness}")
    
    # Improvements
    print("\n7. Suggested Improvements:")
    for improvement in extracted_data['improvements']:
        print(f"   - {improvement}")
    
    # Languages
    print("\n8. Languages:")
    print(json.dumps(extracted_data['languages'], indent=3))
    
    # Certifications
    print("\n9. Certifications:")
    for certification in extracted_data['certifications']:
        print(f"   - {certification}")
    
    # Summary
    print("\n10. Summary:")
    print(f"   {extracted_data['summary']}")
    
    print("\n----- DATA THAT WOULD BE SENT TO API -----")
    
    # Prepare the API payload
    api_payload = {
        "cvUrl": pdf_path,
        "extractedText": "Full PDF text...",  # Abbreviated
        "candidateName": extracted_data['candidateName'],
        "candidateEmail": extracted_data['candidateEmail'],
        "candidatePhone": extracted_data['candidatePhone'],
        "overallScore": 85,  # Example scores
        "skillsScore": 80,
        "experienceScore": 90,
        "educationScore": 85,
        "languageScore": 75,
        "certificationScore": 70,
        "summary": extracted_data['summary'],
        "strengths": strengths,
        "weaknesses": weaknesses,
        "suggestedImprovements": extracted_data['improvements'],
        "skills": extracted_data['skills'],
        "experience": json.dumps(extracted_data['experience']),
        "education": json.dumps(extracted_data['education']),
        "certifications": extracted_data['certifications'],
        "languages": json.dumps(extracted_data['languages']),
        "aiModel": "gpt-3.5-turbo",
        "processingTime": 1500,  # Example
        "candidateId": candidate_id,
        "applicationId": application_id
    }
    
    # Print keys and summary of values
    for key, value in api_payload.items():
        if isinstance(value, str) and len(value) > 100:
            print(f"{key}: {value[:50]}... (truncated)")
        elif isinstance(value, list) and len(value) > 3:
            print(f"{key}: {value[:3]} ... (and {len(value)-3} more)")
        else:
            print(f"{key}: {value}")

if __name__ == "__main__":
    # Verify environment and get PDF path
    pdf_path = verify_environment()
    
    # Run the extraction test
    run_extraction_test(pdf_path)
