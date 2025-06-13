"""
Test script to directly check the NestJS backend API connection with job ID and WhatsApp link.
This test is specifically focused on the new fields that were added.
"""
import requests
import json
import time
import sys

def test_with_job_id_and_whatsapp():
    """
    Test the NestJS API with job ID and WhatsApp link to verify they are properly sent.
    """
    print("\n----- TESTING NESTJS API WITH JOB ID AND WHATSAPP LINK -----\n")
    
    # Use the provided application ID
    candidate_id = "29c313d7-04dc-4a08-bc93-95efe273511e"
    application_id = "37b613ca-941b-4135-b081-f3523cf0ce8a"
    
    # This is the specific job post ID provided by the user
    job_post_id = "0c679bbe-daf5-49fc-a74d-908eae108c48"
    
    # WhatsApp link with custom format
    whatsapp_link = "http://rolevate.com/room?phoneNumber=966509876543&jobId=306bfccd-5030-46bb-b468-e5027a073b4a"
    
    # Prepare the test payload
    start_time = time.time()
    payload = {
        "cvUrl": "test/upload/1.pdf",
        "extractedText": "This is a test CV content for API testing purposes.",
        "candidateName": "Al-Hussein Q. Abdullah",
        "candidateEmail": "al-hussein@papayatrading.com",
        "candidatePhone": "+962796026659",
        "jobId": job_post_id,
        "whatsappLink": whatsapp_link,
        "overallScore": 85,
        "skillsScore": 80,
        "experienceScore": 90,
        "educationScore": 85,
        "languageScore": 75,
        "certificationScore": 70,
        "summary": "Experienced tech entrepreneur with strong background in AI and business strategy.",
        "strengths": ["Strong entrepreneurial background", "Technical expertise in AI", "Business strategy experience"],
        "weaknesses": ["Limited corporate experience", "Potential skill gaps in specific technologies"],
        "suggestedImprovements": ["Add more details about specific technologies used", "Quantify achievements with metrics"],
        "skills": ["Strategic Thinking", "Business Development", "Project Management", "ERP Implementation"],
        "experience": json.dumps({
            "positions": [
                {
                    "title": "Founder & CEO",
                    "company": "Roxate Ltd",
                    "location": "London",
                    "startDate": "2025-02",
                    "endDate": "Present",
                    "description": "Technology-driven company specializing in AI and SaaS-based enterprise solutions."
                },
                {
                    "title": "Founder & CEO",
                    "company": "Papaya Trading",
                    "location": "Amman",
                    "startDate": "2013-02",
                    "endDate": "Present",
                    "description": "Multi-sector trading firm specializing in medical equipment, cosmetics, and technology."
                }
            ]
        }),
        "education": json.dumps({
            "degrees": [
                {
                    "degree": "BBA in Business Administration",
                    "institution": "The University Of Jordan",
                    "location": "Amman, Jordan",
                    "startDate": "2009",
                    "endDate": "2014"
                }
            ]
        }),
        "certifications": ["Deep Learning Specialization (Stanford University)", "AI for Business Leaders (MIT Sloan)"],
        "languages": json.dumps({
            "languages": [
                {"name": "English", "level": "B2"},
                {"name": "Arabic", "level": "C1"}
            ]
        }),
        "aiModel": "gpt-3.5-turbo",
        "processingTime": round((time.time() - start_time) * 1000),
        "candidateId": candidate_id,
        "applicationId": application_id
    }
    
    print("Sending request to NestJS API...")
    print(f"Candidate ID: {candidate_id}")
    print(f"Application ID: {application_id}")
    print(f"Job Post ID: {job_post_id}")
    print(f"WhatsApp Link: {whatsapp_link}")
    
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
            
            # Verify the jobId and whatsappLink are in the response
            if response_data.get("jobId") == job_post_id:
                print("\n✓ Job Post ID was successfully included in the response")
            else:
                print(f"\n⚠ Job Post ID mismatch: Expected {job_post_id}, got {response_data.get('jobId')}")
                
            if response_data.get("whatsappLink") == whatsapp_link:
                print("✓ WhatsApp Link was successfully included in the response")
            else:
                print(f"⚠ WhatsApp Link mismatch: Expected {whatsapp_link}, got {response_data.get('whatsappLink')}")
                
        except Exception as e:
            # If not JSON, print as text
            print(f"Failed to parse JSON: {e}")
            print(response.text)
        
        # Check response code
        if response.status_code == 201:
            print("\n✓ Success! API connection is working correctly with job ID and WhatsApp link.")
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
    success = test_with_job_id_and_whatsapp()
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
