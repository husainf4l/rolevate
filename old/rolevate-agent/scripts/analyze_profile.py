"""
Complete Analysis and CV Generation for User's Profile
"""
import sys
import json
sys.path.append('/home/dev/Desktop/rolevate/rolevate-agent')

from app.agent.tools.professional_profile_assistant import ProfessionalProfileAssistant

# User's professional description
user_profile = """
I am a Senior Relationship Manager at Jordan Commercial Bank, with more than 15 years of proven experience in corporate banking, credit structuring, and financial relationship management. Since joining Jordan Commercial Bank in 2018, I have been managing a broad and diverse portfolio of corporate clients across industries including manufacturing, construction, trading, and services. In my current role, I specialize in structuring and negotiating complex credit facilities, analyzing financial performance, and developing customized financial solutions to support clients' growth strategies. I collaborate closely with treasury, trade finance, and risk management departments to deliver tailored financial products that enhance both client satisfaction and bank profitability. My responsibilities include credit proposal preparation, portfolio monitoring, covenant tracking, and compliance with regulatory and internal policies. Prior to this, I served as a Relationship Manager at Arab Bank from 2010 to 2018, where I handled mid-market corporate accounts, focusing on trade finance, project lending, and long-term client relationship development. I played a key role in structuring financing solutions for complex transactions, strengthening client loyalty, and expanding the bank's corporate footprint. I hold a Bachelor's Degree in Business Administration from the University of Jordan (2009) and am a Certified Credit Officer. I am currently preparing for the Jordanian Certified Public Accountant (JCPA) certification to expand my analytical and financial reporting expertise. Core Competencies Corporate and Commercial Banking Credit Structuring and Risk Assessment Financial Statement and Cash Flow Analysis Trade Finance and Treasury Solutions Lending Proposals and Credit Documentation Relationship and Portfolio Management Client Acquisition and Retention Strategy Regulatory Compliance and Governance Strategic Negotiation and Financial Advisory Philosophy I believe that successful banking relationships are built on trust, transparency, and value creation. My professional mission is to help clients achieve sustainable financial growth through strategic advisory and intelligent financial planning. As the banking industry transitions into the digital and fintech era, I am passionate about integrating innovation, data analytics, and automation into corporate banking processes to enhance decision-making, reduce risk, and deliver superior client experiences.
"""

def print_section(title, char="="):
    print("\n" + char * 100)
    print(f" {title}")
    print(char * 100 + "\n")

def main():
    assistant = ProfessionalProfileAssistant()
    
    print_section("🔍 PROFESSIONAL PROFILE ANALYSIS", "=")
    
    # Analyze the profile
    analysis = assistant.analyze_profile_text(user_profile)
    extracted = analysis.get('extracted_data', {})
    
    # Display analysis results
    print("📊 EXTRACTION RESULTS:")
    print(f"   Completeness Score: {analysis.get('completeness_score', 0)}%")
    print()
    
    print("✅ SUCCESSFULLY EXTRACTED:")
    print(f"   • Current Position: {extracted.get('current_position', {}).get('job_title', 'N/A')}")
    print(f"   • Current Employer: {extracted.get('current_position', {}).get('organization', 'N/A')}")
    print(f"   • Years of Experience: {extracted.get('experience', {}).get('years_experience', 'N/A')} years")
    print(f"   • Start Date (Current): {extracted.get('experience', {}).get('current_start_year', 'N/A')}")
    
    prev_positions = extracted.get('experience', {}).get('previous_positions', [])
    if prev_positions:
        print(f"   • Previous Positions: {len(prev_positions)}")
        for idx, pos in enumerate(prev_positions, 1):
            if isinstance(pos, dict):
                print(f"      {idx}. {pos.get('position', 'N/A')} at {pos.get('company', 'N/A')} ({pos.get('duration', 'N/A')})")
    
    education = extracted.get('education', {})
    print(f"   • Education Degree: {education.get('degree', 'N/A')}")
    print(f"   • Institution: {education.get('institution', 'N/A')}")
    print(f"   • Graduation Year: {education.get('graduation_year', 'N/A')}")
    
    certifications = extracted.get('certifications', [])
    print(f"   • Certifications: {len(certifications)}")
    for cert in certifications:
        status = cert.get('status', 'Completed')
        print(f"      - {cert.get('certification_name', 'N/A')} ({status})")
    
    skills = extracted.get('skills', [])
    print(f"   • Core Competencies: {len(skills)} identified")
    
    goals = extracted.get('goals', {})
    if goals.get('professional_philosophy'):
        print(f"   • Professional Philosophy: Extracted")
    
    print()
    print("⚠️  MISSING INFORMATION:")
    missing = analysis.get('missing_information', [])
    if missing:
        for field in missing:
            print(f"   • {field}")
    else:
        print("   None - Profile is complete!")
    
    # Generate Professional CV
    print_section("📄 YOUR PROFESSIONAL CV", "=")
    
    # Clean up extracted data for better output
    # Fix philosophy extraction
    if goals.get('professional_philosophy'):
        phil_text = goals['professional_philosophy']
        # Extract only the philosophy part, removing "Core Competencies" prefix
        if 'I believe that' in phil_text:
            phil_start = phil_text.find('I believe that')
            extracted['goals']['professional_philosophy'] = phil_text[phil_start:]
    
    # Generate CV
    cv_output = assistant.generate_professional_summary(extracted)
    print(cv_output)
    
    # Generate JSON Output
    print_section("💾 STRUCTURED DATA (JSON FORMAT)", "=")
    json_output = assistant.generate_cv_json(extracted)
    print(json.dumps(json_output, indent=2, ensure_ascii=False))
    
    # Follow-up questions
    if missing:
        print_section("❓ COMPLETE YOUR PROFILE", "-")
        print("To generate a 100% complete CV, please provide:")
        print()
        
        question_map = {
            'full_name': '1️⃣  What is your full name?',
            'email': '2️⃣  What is your professional email address?',
            'phone': '3️⃣  What is your contact phone number?',
            'location': '4️⃣  What is your current location? (City, Country)',
            'languages': '5️⃣  What languages do you speak and at what proficiency level?'
        }
        
        for field in missing[:5]:
            if field in question_map:
                print(f"   {question_map[field]}")
    
    print_section("✅ ANALYSIS COMPLETE", "=")
    
    print("\n📌 SUMMARY:")
    print(f"   • Profile Completeness: {analysis.get('completeness_score', 0)}%")
    print(f"   • Information Extracted: {14 - len(missing)}/14 fields")
    print(f"   • CV Status: {'✅ Ready' if len(missing) <= 3 else '⚠️  Needs minor info'}")
    print()

if __name__ == "__main__":
    main()
