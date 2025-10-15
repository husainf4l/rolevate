"""
Test Professional Profile Assistant with real banking example
"""
import sys
import json
sys.path.append('/home/dev/Desktop/rolevate/rolevate-agent')

from app.agent.tools.professional_profile_assistant import ProfessionalProfileAssistant

# Test with the exact paragraph provided
test_paragraph = """
I am a Senior Relationship Manager with over 13 years of experience in the banking sector, 
specializing in relationship management, business development, and credit risk. Currently, 
I work at Standard Chartered Bank, where I manage a diverse portfolio of HNW clients, 
focusing on delivering tailored financial solutions. Previously, I was a Relationship 
Manager at Arab Bank from 2010 to 2018, where I successfully grew client portfolios 
and drove business growth. Since joining Standard Chartered in 2018, I have excelled 
in cross-selling, portfolio expansion, and maintaining high levels of client satisfaction. 
I am known for my analytical skills, attention to detail, and ability to build strong, 
trust-based relationships with clients and stakeholders. My goal is to continue leveraging 
my expertise to drive business success and deliver exceptional value.
"""

def test_professional_profile():
    """Test the Professional Profile Assistant"""
    
    print("=" * 80)
    print("TESTING PROFESSIONAL PROFILE ASSISTANT")
    print("=" * 80)
    
    assistant = ProfessionalProfileAssistant()
    
    # Test 1: Analyze Profile
    print("\n1. ANALYZING PROFILE TEXT")
    print("-" * 80)
    analysis = assistant.analyze_profile_text(test_paragraph)
    print("\n✓ Analysis Complete:")
    print(json.dumps(analysis, indent=2))
    
    # Test 2: Generate Professional Summary
    print("\n\n2. GENERATING PROFESSIONAL CV SUMMARY")
    print("-" * 80)
    # Pass the extracted_data portion to the CV generator
    cv_summary = assistant.generate_professional_summary(analysis.get('extracted_data', {}))
    print("\n✓ CV Summary Generated:")
    print(cv_summary)
    
    # Test 3: Generate JSON Output
    print("\n\n3. GENERATING JSON OUTPUT")
    print("-" * 80)
    json_output = assistant.generate_cv_json(analysis.get('extracted_data', {}))
    print("\n✓ JSON Output:")
    print(json.dumps(json_output, indent=2))
    
    # Test 4: Check for missing information
    print("\n\n4. CHECKING FOR MISSING INFORMATION")
    print("-" * 80)
    missing_info = assistant._identify_missing_information(analysis)
    print("\n✓ Missing Fields:")
    for field in missing_info:
        print(f"  - {field}")
    
    # Test 5: Generate follow-up question
    if missing_info:
        print("\n\n5. GENERATING FOLLOW-UP QUESTION")
        print("-" * 80)
        question = assistant.generate_follow_up_question(missing_info[0])
        print(f"\n✓ Question: {question}")
    
    print("\n" + "=" * 80)
    print("TEST COMPLETE")
    print("=" * 80)

if __name__ == "__main__":
    test_professional_profile()
