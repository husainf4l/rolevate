"""
Test the validation fix for job posting.

This script tests the validation fixes implemented to resolve the issues:
- "department should not exist"
- "experienceLevel must be one of the following values..."
- "salaryMin/Max is not a valid decimal number"
"""

import os
import sys
from dotenv import load_dotenv

# Ensure we can import from agent module
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from agent.tools.job_post_webhook import send_job_post_to_api, validate_job_post_data

# Load environment variables
load_dotenv()

def test_job_post_validation():
    """Test job post validation with various edge cases."""
    
    print("🧪 Testing job post validation with various cases...")
    
    # Test with department field (should be removed)
    job_data_with_department = {
        "title": "Senior Software Developer",
        "description": "We are looking for an experienced developer",
        "requirements": "At least 5 years of experience",
        "department": "Engineering",  # This should be flagged and removed
        "experienceLevel": "SENIOR",
        "salaryMin": 5000,
        "salaryMax": 7000,
        "skills": ["JavaScript", "React", "Node.js"],
        "location": "Amman, Jordan",
        "workType": "HYBRID"
    }
    
    result = validate_job_post_data(job_data_with_department)
    print("\n✓ Test with department field:")
    print(f"  Valid: {result['valid']}")
    print(f"  Errors: {result['errors']}")
    print(f"  Department still in data: {'department' in job_data_with_department}")
    
    # Test with invalid experienceLevel (should be mapped)
    job_data_with_invalid_level = {
        "title": "Mid-level Developer",
        "description": "We are looking for a mid-level developer",
        "requirements": "At least 3 years of experience",
        "experienceLevel": "mid",  # This should be mapped to MID_LEVEL
        "salaryMin": 3000,
        "salaryMax": 5000,
        "skills": ["JavaScript", "React", "Node.js"],
        "location": "Amman, Jordan",
        "workType": "REMOTE"
    }
    
    result = validate_job_post_data(job_data_with_invalid_level)
    print("\n✓ Test with invalid experienceLevel:")
    print(f"  Valid: {result['valid']}")
    print(f"  Errors: {result['errors']}")
    print(f"  Mapped experienceLevel: {job_data_with_invalid_level.get('experienceLevel')}")
    
    # Test with string salary values (should be converted to int)
    job_data_with_string_salary = {
        "title": "Junior Developer",
        "description": "We are looking for a junior developer",
        "requirements": "At least 1 year of experience",
        "experienceLevel": "JUNIOR",
        "salaryMin": "2000.50",  # This should be converted to 2000
        "salaryMax": "4000.75",  # This should be converted to 4000
        "skills": ["JavaScript", "HTML", "CSS"],
        "location": "Amman, Jordan",
        "workType": "ONSITE"
    }
    
    result = validate_job_post_data(job_data_with_string_salary)
    print("\n✓ Test with string salary values:")
    print(f"  Valid: {result['valid']}")
    print(f"  Errors: {result['errors']}")
    print(f"  Converted salaryMin: {job_data_with_string_salary.get('salaryMin')}")
    print(f"  Converted salaryMax: {job_data_with_string_salary.get('salaryMax')}")

def test_live_api_connection(mock_mode=True):
    """Test the live API connection (without actually submitting unless mock_mode=False)"""
    print("\n🧪 Testing API connection...")
    
    company_id = "test-company-id"  # Use a test company ID
    
    # Create a valid job post data
    job_data = {
        "title": "Full Stack Developer",
        "description": "We are looking for a skilled full-stack developer",
        "requirements": "• At least 3 years of experience\n• Strong JavaScript skills\n• Knowledge of React and Node.js",
        "responsibilities": "• Develop and maintain web applications\n• Collaborate with the team",
        "benefits": "• Competitive salary\n• Flexible working hours",
        "experienceLevel": "MID_LEVEL", 
        "salaryMin": 3500,
        "salaryMax": 6000,
        "skills": ["JavaScript", "React", "Node.js"],
        "location": "Amman, Jordan",
        "workType": "HYBRID",
        "currency": "JOD",
        "enableAiInterview": True
    }
    
    # Check validation first
    validation_result = validate_job_post_data(job_data)
    print(f"Validation result: {validation_result['valid']}")
    if not validation_result['valid']:
        print(f"Errors: {validation_result['errors']}")
    
    # Only send to API if not in mock mode and validation passed
    if not mock_mode and validation_result['valid']:
        api_response = send_job_post_to_api(
            job_data=job_data,
            company_id=company_id,
            company_name="Test Company"
        )
        
        print(f"API Response success: {api_response.get('success')}")
        if not api_response.get('success'):
            print(f"Error: {api_response.get('error')}")
            if 'validation_errors' in api_response:
                print(f"Validation errors: {api_response.get('validation_errors')}")
    else:
        print("✓ Mock mode enabled - API call not executed")
        
    print("✅ Testing complete")

if __name__ == "__main__":
    # Test validation
    test_job_post_validation()
    
    # Test API connection in mock mode (won't actually submit)
    test_live_api_connection(mock_mode=True)
    
    # Uncomment to test with a real API call
    # test_live_api_connection(mock_mode=False)
