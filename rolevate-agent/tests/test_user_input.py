"""
Test the Professional Profile Assistant with the user's actual input
"""
import sys
import json
sys.path.append('/home/dev/Desktop/rolevate/rolevate-agent')

from app.agent.tools.professional_profile_assistant import ProfessionalProfileAssistant

# User's actual professional description
user_input = """
I am a Senior Relationship Manager at Jordan Commercial Bank, with more than 15 years of proven experience in corporate banking, credit structuring, and financial relationship management. Since joining Jordan Commercial Bank in 2018, I have been managing a broad and diverse portfolio of corporate clients across industries including manufacturing, construction, trading, and services. In my current role, I specialize in structuring and negotiating complex credit facilities, analyzing financial performance, and developing customized financial solutions to support clients' growth strategies. I collaborate closely with treasury, trade finance, and risk management departments to deliver tailored financial products that enhance both client satisfaction and bank profitability. My responsibilities include credit proposal preparation, portfolio monitoring, covenant tracking, and compliance with regulatory and internal policies. Prior to this, I served as a Relationship Manager at Arab Bank from 2010 to 2018, where I handled mid-market corporate accounts, focusing on trade finance, project lending, and long-term client relationship development. I played a key role in structuring financing solutions for complex transactions, strengthening client loyalty, and expanding the bank's corporate footprint. I hold a Bachelor's Degree in Business Administration from the University of Jordan (2009) and am a Certified Credit Officer. I am currently preparing for the Jordanian Certified Public Accountant (JCPA) certification to expand my analytical and financial reporting expertise. Core Competencies Corporate and Commercial Banking Credit Structuring and Risk Assessment Financial Statement and Cash Flow Analysis Trade Finance and Treasury Solutions Lending Proposals and Credit Documentation Relationship and Portfolio Management Client Acquisition and Retention Strategy Regulatory Compliance and Governance Strategic Negotiation and Financial Advisory Philosophy I believe that successful banking relationships are built on trust, transparency, and value creation. My professional mission is to help clients achieve sustainable financial growth through strategic advisory and intelligent financial planning. As the banking industry transitions into the digital and fintech era, I am passionate about integrating innovation, data analytics, and automation into corporate banking processes to enhance decision-making, reduce risk, and deliver superior client experiences.
"""

def main():
    print("="*100)
    print("🔍 ANALYZING YOUR PROFESSIONAL PROFILE")
    print("="*100)
    
    assistant = ProfessionalProfileAssistant()
    
    # Step 1: Analyze
    print("\n📊 EXTRACTING INFORMATION...\n")
    analysis = assistant.analyze_profile_text(user_input)
    
    extracted = analysis.get('extracted_data', {})
    completeness = analysis.get('completeness_score', 0)
    missing = analysis.get('missing_information', [])
    
    print(f"✓ Completeness Score: {completeness}%\n")
    
    # Show extracted data
    print("📋 EXTRACTED DATA:")
    print(f"  • Current Position: {extracted.get('current_position', {}).get('job_title', 'Not found')}")
    print(f"  • Organization: {extracted.get('current_position', {}).get('organization', 'Not found')}")
    print(f"  • Years of Experience: {extracted.get('experience', {}).get('years_experience', 'Not found')}")
    print(f"  • Education: {extracted.get('education', {}).get('degree', 'Not found')}")
    print(f"  • Skills Identified: {len(extracted.get('skills', []))}")
    print(f"  • Certifications: {len(extracted.get('certifications', []))}")
    
    if missing:
        print(f"\n⚠️  Missing Information: {', '.join(missing[:5])}")
    
    # Step 2: Generate CV
    print("\n\n" + "="*100)
    print("📄 GENERATING YOUR PROFESSIONAL CV")
    print("="*100 + "\n")
    
    cv_output = assistant.generate_professional_summary(extracted)
    print(cv_output)
    
    # Step 3: Generate JSON
    print("\n\n" + "="*100)
    print("💾 STRUCTURED DATA (JSON OUTPUT)")
    print("="*100 + "\n")
    
    json_output = assistant.generate_cv_json(extracted)
    print(json.dumps(json_output, indent=2, ensure_ascii=False))
    
    # Step 4: Follow-up questions if needed
    if missing and completeness < 100:
        print("\n\n" + "="*100)
        print("❓ FOLLOW-UP QUESTIONS (To Complete Your Profile)")
        print("="*100 + "\n")
        
        for field in missing[:3]:  # Show top 3 missing fields
            question = assistant.generate_follow_up_question([field])
            print(f"  • {question}")
    
    print("\n" + "="*100)
    print("✅ ANALYSIS COMPLETE")
    print("="*100)

if __name__ == "__main__":
    main()
