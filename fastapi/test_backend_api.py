"""
Test script to directly check the NestJS backend API connection.
This test bypasses the CV analysis workflow and sends a request directly to the backend.
"""
import requests
import json
import time
import sys

def test_api_connection():
    """
    Send a test request directly to the NestJS API endpoint 
    to check if it's working correctly.
    """
    print("\n----- TESTING NESTJS API CONNECTION -----\n")
    
    # Use the provided application ID
    candidate_id = "29c313d7-04dc-4a08-bc93-95efe273511e"
    application_id = "37b613ca-941b-4135-b081-f3523cf0ce8a"
    
    # Prepare the test payload
    start_time = time.time()
    # Job Post ID
    job_post_id = "0c679bbe-daf5-49fc-a74d-908eae108c48"
    
    # Create WhatsApp link
    whatsapp_link = f"http://rolevate.com/room?phoneNumber=1234567890&jobId=306bfccd-5030-46bb-b468-e5027a073b4a"
    
    payload = {
        "cvUrl": "test/upload/1.pdf",
        "extractedText": "This is a test CV content for API testing purposes.",
        "candidateName": "John Doe",  # New field
        "candidateEmail": "john.doe@example.com",  # New field
        "candidatePhone": "+1234567890",  # New field
        "jobId": job_post_id,  # Add job post ID
        "whatsappLink": whatsapp_link,  # Add WhatsApp link
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
    
    print("Sending request to NestJS API...")
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
        except Exception as e:
            # If not JSON, print as text
            print(f"Failed to parse JSON: {e}")
            print(response.text)
        
        # Check response code
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

def run_with_timeout(timeout=10):
    """Run the test with a timeout to avoid hanging."""
    import threading
    
    result = {"success": None}
    
    def target():
        result["success"] = test_api_connection()
    
    thread = threading.Thread(target=target)
    thread.daemon = True
    thread.start()
    thread.join(timeout)
    
    if thread.is_alive():
        print(f"\n⚠ Test timed out after {timeout} seconds!")
        print("   This might indicate a connectivity issue or that the server is not responding.")
        return False
    
    return result["success"]

if __name__ == "__main__":
    success = run_with_timeout()
    if not success:
        print("\nTroubleshooting tips:")
        print("1. Check if your NestJS server is running")
        print("2. Confirm the server is listening on port 4005")
        print("3. Verify the API endpoint path (/api/cv-analysis)")
        print("4. Check if the UUIDs used are registered in your database")
        print("5. Look for error messages in your NestJS server logs")
        sys.exit(1)
    else:
        sys.exit(0)
