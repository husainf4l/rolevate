"""
Test Professional Profile Assistant with complete banking profile
"""
import sys
import json
sys.path.append('/home/dev/Desktop/rolevate/rolevate-agent')

from app.agent.tools.professional_profile_assistant import ProfessionalProfileAssistant

# Complete test case with all information
complete_profile = """
My name is Husain Al-Mansoori, and I am based in Dubai, UAE. You can reach me at husain.almansoori@email.com or +971-50-123-4567.

I am a Senior Relationship Manager with over 13 years of experience in the banking sector, 
specializing in relationship management, business development, and credit risk. Currently, 
I work at Standard Chartered Bank, where I manage a diverse portfolio of HNW clients, 
focusing on delivering tailored financial solutions. Previously, I was a Relationship 
Manager at Arab Bank from 2010 to 2018, where I successfully grew client portfolios 
and drove business growth. Since joining Standard Chartered in 2018, I have excelled 
in cross-selling, portfolio expansion, and maintaining high levels of client satisfaction. 

I hold a Bachelor's degree in Business Administration from the American University of Dubai (2009) 
and am a Certified Credit Officer. I am currently preparing for my CPA certification.

I am known for my analytical skills, attention to detail, and ability to build strong, 
trust-based relationships with clients and stakeholders. My goal is to continue leveraging 
my expertise to drive business success and deliver exceptional value to my clients.

I speak Arabic (native) and English (fluent), with working knowledge of French.
"""

def test_complete_profile():
    """Test with complete profile information"""
    
    print("=" * 100)
    print("TESTING PROFESSIONAL PROFILE ASSISTANT - COMPLETE PROFILE")
    print("=" * 100)
    
    assistant = ProfessionalProfileAssistant()
    
    # Analyze Profile
    print("\n📊 ANALYZING PROFILE...")
    analysis = assistant.analyze_profile_text(complete_profile)
    
    extracted = analysis.get('extracted_data', {})
    print(f"\n✓ Completeness Score: {analysis.get('completeness_score', 0)}%")
    print(f"✓ Name: {extracted.get('personal_info', {}).get('full_name', 'Not found')}")
    print(f"✓ Current Role: {extracted.get('current_position', {}).get('job_title', 'Not found')}")
    print(f"✓ Organization: {extracted.get('current_position', {}).get('organization', 'Not found')}")
    print(f"✓ Years Experience: {extracted.get('experience', {}).get('years_experience', 'Not found')}")
    print(f"✓ Previous Positions: {len(extracted.get('experience', {}).get('previous_positions', []))}")
    print(f"✓ Skills: {len(extracted.get('skills', []))}")
    
    # Generate CV
    print("\n\n📄 GENERATING PROFESSIONAL CV...")
    print("=" * 100)
    cv_summary = assistant.generate_professional_summary(extracted)
    print(cv_summary)
    
    # Generate JSON
    print("\n\n💾 GENERATING JSON OUTPUT...")
    print("=" * 100)
    json_output = assistant.generate_cv_json(extracted)
    print(json.dumps(json_output, indent=2, ensure_ascii=False))
    
    # Check missing information
    print("\n\n❌ MISSING INFORMATION:")
    print("=" * 100)
    missing = analysis.get('missing_information', [])
    if missing:
        for field in missing:
            print(f"  - {field}")
            question = assistant.generate_follow_up_question([field])
            print(f"    Q: {question}\n")
    else:
        print("✓ Profile is complete!")
    
    print("\n" + "=" * 100)
    print("✅ TEST COMPLETE")
    print("=" * 100)

if __name__ == "__main__":
    test_complete_profile()
