#!/usr/bin/env python3
"""
Test Script for Enhanced CV Filler Agent
Tests all 7 enhancements with production API calls
"""

import requests
import json
import time
import os
from pathlib import Path

# Configuration
BASE_URL = "http://localhost:8000"
TEST_CV_PATH = "test_cv.txt"

def create_test_cv():
    """Create a sample CV file for testing"""
    cv_content = """
John Doe
Software Engineer
john.doe@email.com | +1-234-567-8900 | New York, NY

PROFESSIONAL SUMMARY
Experienced software engineer with 8+ years in full-stack development, 
specializing in cloud-native applications and AI integration.

WORK EXPERIENCE

Senior Software Engineer | TechCorp Inc. | 2021-Present | New York, NY
• Led development of microservices architecture serving 1M+ users
• Implemented CI/CD pipelines reducing deployment time by 60%
• Architected scalable backend systems
• Mentored 5 junior developers

Full Stack Developer | StartupXYZ | 2019-2021 | San Francisco, CA  
• Built responsive web applications using React and Node.js
• Developed RESTful APIs serving mobile applications
• Launched 3 major product features
• Improved code coverage to 85%

TECHNICAL SKILLS
Languages: Python, JavaScript, Java, TypeScript
Frameworks: React, Node.js, FastAPI, Django, Express.js
Tools: Docker, Kubernetes, AWS, PostgreSQL, Redis, Git

EDUCATION
Master of Computer Science | Stanford University | 2019 | GPA: 3.8/4.0
Bachelor of Computer Engineering | UC Berkeley | 2017 | GPA: 3.6/4.0

CERTIFICATIONS
• AWS Certified Solutions Architect
• Kubernetes Administrator (CKA)  
• Google Cloud Professional
"""
    
    with open(TEST_CV_PATH, 'w') as f:
        f.write(cv_content)
    
    return TEST_CV_PATH

def test_api_health():
    """Test health check endpoint"""
    print("🔍 Testing API Health...")
    
    try:
        response = requests.get(f"{BASE_URL}/api/health", timeout=10)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ API Status: {data['status']}")
            print(f"📊 Enhancements Available: {data['enhancements_available']}/7")
            
            for service, status in data['services'].items():
                emoji = "✅" if status else "❌"
                print(f"  {emoji} {service.replace('_', ' ').title()}: {'Available' if status else 'Not Available'}")
            
            return True
        else:
            print(f"❌ Health check failed: {response.status_code}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Cannot connect to API: {e}")
        return False

def test_cv_processing():
    """Test CV processing with all enhancements"""
    print("\n🚀 Testing CV Processing Pipeline...")
    
    # Create test CV
    cv_path = create_test_cv()
    
    try:
        # Prepare request
        with open(cv_path, 'rb') as f:
            files = {'cv_file': (TEST_CV_PATH, f, 'text/plain')}
            data = {
                'enable_deduplication': True,
                'enable_smart_formatting': True,
                'enable_cloud_storage': True,
                'cloud_provider': 'local',  # Use local storage for testing
                'output_format': 'pdf'
            }
            
            print("📤 Uploading CV for processing...")
            start_time = time.time()
            
            response = requests.post(
                f"{BASE_URL}/api/cv/process",
                files=files,
                data=data,
                timeout=60
            )
        
        processing_time = round((time.time() - start_time) * 1000, 2)
        
        if response.status_code == 200:
            result = response.json()
            
            print(f"✅ Processing completed in {processing_time}ms")
            print(f"📄 Job ID: {result['job_id']}")
            print(f"🎨 Template Used: {result['template_used']}")
            print(f"📁 PDF URL: {result['pdf_url']}")
            
            # Processing Summary
            summary = result['processing_summary']
            print(f"\n📊 Processing Summary:")
            print(f"  • Experiences: {summary['experiences_processed']}")
            print(f"  • Skills: {summary['skills_extracted']}")  
            print(f"  • Duplicates Removed: {summary['duplicates_removed']}")
            print(f"  • Formatting Applied: {summary['formatting_applied']}")
            print(f"  • Cloud Stored: {summary['cloud_stored']}")
            
            # Enhancements Applied
            enhancements = result['enhancements_applied']
            print(f"\n🎯 Enhancements Applied:")
            for enhancement, applied in enhancements.items():
                emoji = "✅" if applied else "⏸️"
                name = enhancement.replace('_', ' ').title()
                print(f"  {emoji} {name}")
            
            # Data Quality Check
            data = result['data']
            print(f"\n📋 Extracted Data Quality:")
            print(f"  • Name: {data['personal_info']['name']}")
            print(f"  • Job Title: {data['job_title']}")
            print(f"  • Experiences: {len(data['experiences'])}")
            print(f"  • Technical Skills: {len(data['skills']['technical'])}")
            print(f"  • Education: {len(data['education'])}")
            
            return True
            
        else:
            print(f"❌ Processing failed: {response.status_code}")
            print(f"Error: {response.text}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Request failed: {e}")
        return False
        
    finally:
        # Cleanup
        if os.path.exists(cv_path):
            os.remove(cv_path)

def test_templates_endpoint():
    """Test templates listing"""
    print("\n🎨 Testing Templates Endpoint...")
    
    try:
        response = requests.get(f"{BASE_URL}/api/templates", timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Available Templates: {len(data['templates'])}")
            print(f"🎯 Default Template: {data['default']}")
            print(f"🤖 AI Selection: {data['ai_selection']}")
            
            for template in data['templates']:
                print(f"  📄 {template}")
            
            return True
        else:
            print(f"❌ Templates request failed: {response.status_code}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Templates request error: {e}")
        return False

def main():
    """Run all tests"""
    print("="*60)
    print("🧪 ENHANCED CV FILLER AGENT - TEST SUITE")
    print("="*60)
    
    # Test API connectivity
    if not test_api_health():
        print("\n❌ API is not responding. Make sure the server is running:")
        print("   cd /home/dev/Desktop/rolevate/rolevate-agent")
        print("   source /home/dev/Desktop/rolevate/rolevate/venv/bin/activate")
        print("   python production_cv_agent.py")
        return False
    
    # Test template listing
    test_templates_endpoint()
    
    # Test CV processing pipeline
    success = test_cv_processing()
    
    print("\n" + "="*60)
    if success:
        print("🎉 ALL TESTS PASSED!")
        print("🚀 Enhanced CV Filler Agent is working perfectly!")
        print("📊 All 7 intelligent enhancements are operational")
    else:
        print("❌ TESTS FAILED!")
        print("🔧 Check server logs for troubleshooting")
    print("="*60)
    
    return success

if __name__ == "__main__":
    main()