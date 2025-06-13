"""
Direct NestJS backend API test with command line arguments.
Allows testing with specific UUIDs passed as arguments.
"""
import requests
import json
import uuid
import time
import sys
import argparse

def test_api_connection(candidate_id=None, application_id=None):
    """
    Send a test request directly to the NestJS API endpoint.
    
    Args:
        candidate_id: UUID for the candidate (optional)
        application_id: UUID for the application (optional)
    """
    print("\n----- TESTING NESTJS API CONNECTION -----\n")
    
    # Use provided UUIDs or defaults
    if not candidate_id:
        candidate_id = "29c313d7-04dc-4a08-bc93-95efe273511e"  # Default test UUID
    if not application_id:
        application_id = "0c679bbe-daf5-49fc-a74d-908eae108c48"  # Default test UUID
    
    # Validate UUIDs
    try:
        uuid.UUID(candidate_id)
        uuid.UUID(application_id)
    except ValueError:
        print("⚠ Error: Invalid UUID format provided.")
        print("UUIDs must be in the format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx")
        return False
    
    # Prepare test payload
    start_time = time.time()
    payload = {
        "cvUrl": "test/upload/1.pdf",
        "extractedText": "This is a test CV content for API testing purposes.",
        "overallScore": 85,
        "skillsScore": 80,
        "experienceScore": 90,
        "educationScore": 85,
        "languageScore": 75,
        "certificationScore": 70,
        "summary": "Test candidate summary for API connection testing.",
        "strengths": ["Test strength 1", "Test strength 2"],
        "weaknesses": ["Test weakness 1"],
        "suggestedImprovements": ["Test improvement 1"],
        "skills": ["Python", "FastAPI", "NestJS", "API Development"],
        "experience": json.dumps({
            "positions": [
                {
                    "title": "Software Developer",
                    "company": "Test Company",
                    "location": "Test Location",
                    "startDate": "2022-01",
                    "endDate": "Present",
                    "description": "Test job description."
                }
            ]
        }),
        "education": json.dumps({
            "degrees": [
                {
                    "degree": "Computer Science",
                    "institution": "Test University",
                    "location": "Test Location",
                    "startDate": "2018",
                    "endDate": "2022"
                }
            ]
        }),
        "certifications": ["Test Certification 1", "Test Certification 2"],
        "languages": json.dumps({
            "languages": [
                {"name": "English", "level": "C1"},
                {"name": "Spanish", "level": "B1"}
            ]
        }),
        "aiModel": "direct-test",
        "processingTime": round((time.time() - start_time) * 1000),
        "candidateId": candidate_id,
        "applicationId": application_id
    }
    
    print(f"Sending request to NestJS API...")
    print(f"Candidate ID: {candidate_id}")
    print(f"Application ID: {application_id}")
    
    try:
        # Send the request
        response = requests.post(
            "http://localhost:4005/api/cv-analysis",
            json=payload,
            headers={"Content-Type": "application/json"}
        )
        
        # Print response details
        print(f"\nResponse Status Code: {response.status_code}")
        print("Response Headers:")
        for key, value in response.headers.items():
            print(f"  {key}: {value}")
        
        print("\nResponse Content:")
        try:
            # Try to parse as JSON
            response_data = response.json()
            print(json.dumps(response_data, indent=2))
        except:
            # If not JSON, print as text
            print(response.text)
        
        # Check response code and return result
        if response.status_code == 201:
            print("\n✓ Success! API connection is working correctly.")
            return True
        else:
            print(f"\n⚠ API returned non-success status code: {response.status_code}")
            return False
            
    except requests.exceptions.ConnectionError:
        print("⚠ Connection Error: Could not connect to the NestJS server.")
        print("   Is the NestJS server running at http://localhost:4005?")
        return False
    except Exception as e:
        print(f"⚠ Error during API test: {str(e)}")
        return False

if __name__ == "__main__":
    # Set up command line argument parsing
    parser = argparse.ArgumentParser(description='Test NestJS API connection')
    parser.add_argument('--candidate', '-c', help='Candidate UUID')
    parser.add_argument('--application', '-a', help='Application UUID')
    parser.add_argument('--timeout', '-t', type=int, default=10, help='Request timeout in seconds')
    args = parser.parse_args()
    
    print(f"Using timeout: {args.timeout} seconds")
    
    # Run the test with a timeout
    import threading
    result = {"success": None}
    
    def target():
        result["success"] = test_api_connection(args.candidate, args.application)
    
    thread = threading.Thread(target=target)
    thread.daemon = True
    thread.start()
    thread.join(args.timeout)
    
    if thread.is_alive():
        print(f"\n⚠ Test timed out after {args.timeout} seconds!")
        print("   This might indicate a connectivity issue or that the server is not responding.")
        sys.exit(1)
    
    if not result["success"]:
        print("\nTroubleshooting tips:")
        print("1. Check if your NestJS server is running")
        print("2. Confirm the server is listening on port 4005")
        print("3. Verify the API endpoint path (/api/cv-analysis)")
        print("4. Check if the UUIDs used are registered in your database")
        print("5. Look for error messages in your NestJS server logs")
        sys.exit(1)
    else:
        sys.exit(0)
