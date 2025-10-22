"""
Test LLM-Enhanced Professional Profile Assistant
"""
import sys
import json
import asyncio
sys.path.append('/home/dev/Desktop/rolevate/rolevate-agent')

from app.agent.tools.professional_profile_assistant import ProfessionalProfileAssistant

# User's professional description
user_profile = """
I am a Senior Relationship Manager at Jordan Commercial Bank, with more than 15 years of proven experience in corporate banking, credit structuring, and financial relationship management. Since joining Jordan Commercial Bank in 2018, I have been managing a broad and diverse portfolio of corporate clients across industries including manufacturing, construction, trading, and services. In my current role, I specialize in structuring and negotiating complex credit facilities, analyzing financial performance, and developing customized financial solutions to support clients' growth strategies. I collaborate closely with treasury, trade finance, and risk management departments to deliver tailored financial products that enhance both client satisfaction and bank profitability. My responsibilities include credit proposal preparation, portfolio monitoring, covenant tracking, and compliance with regulatory and internal policies. Prior to this, I served as a Relationship Manager at Arab Bank from 2010 to 2018, where I handled mid-market corporate accounts, focusing on trade finance, project lending, and long-term client relationship development. I played a key role in structuring financing solutions for complex transactions, strengthening client loyalty, and expanding the bank's corporate footprint. I hold a Bachelor's Degree in Business Administration from the University of Jordan (2009) and am a Certified Credit Officer. I am currently preparing for the Jordanian Certified Public Accountant (JCPA) certification to expand my analytical and financial reporting expertise. I believe that successful banking relationships are built on trust, transparency, and value creation. My professional mission is to help clients achieve sustainable financial growth through strategic advisory and intelligent financial planning. As the banking industry transitions into the digital and fintech era, I am passionate about integrating innovation, data analytics, and automation into corporate banking processes to enhance decision-making, reduce risk, and deliver superior client experiences.
"""

def print_section(title, char="="):
    print("\n" + char * 100)
    print(f" {title}")
    print(char * 100 + "\n")

def main():
    print_section("🤖 LLM-ENHANCED PROFESSIONAL PROFILE ASSISTANT", "=")
    
    # Initialize assistant with LLM
    print("Initializing OpenAI GPT-4...")
    assistant = ProfessionalProfileAssistant(use_llm=True)
    
    if assistant.use_llm:
        print("✅ OpenAI GPT-4 Active - Using AI-powered extraction")
    else:
        print("⚠️ LLM Not Available - Using regex fallback")
    
    # Analyze profile
    print_section("📊 ANALYZING PROFILE WITH GPT-4")
    print("Processing... (this may take a few seconds)")
    
    analysis = assistant.analyze_profile_text(user_profile, use_llm=True)
    extracted = analysis.get('extracted_data', {})
    
    print(f"✅ Analysis Complete!")
    print(f"   Completeness Score: {analysis.get('completeness_score', 0)}%")
    print(f"   Missing Fields: {len(analysis.get('missing_information', []))}")
    
    # Display extracted data
    print_section("✅ EXTRACTED INFORMATION")
    
    personal = extracted.get('personal_info', {})
    print(f"👤 Personal Info:")
    print(f"   • Name: {personal.get('full_name', 'Not provided')}")
    print(f"   • Email: {personal.get('email', 'Not provided')}")
    print(f"   • Phone: {personal.get('phone', 'Not provided')}")
    print(f"   • Location: {personal.get('location', 'Not provided')}")
    
    current = extracted.get('current_position', {})
    print(f"\n💼 Current Position:")
    print(f"   • Title: {current.get('job_title', 'N/A')}")
    print(f"   • Organization: {current.get('organization', 'N/A')}")
    print(f"   • Since: {extracted.get('experience', {}).get('current_start_year', 'N/A')}")
    
    exp = extracted.get('experience', {})
    print(f"\n📈 Experience:")
    print(f"   • Total Years: {exp.get('years_experience', 'N/A')}")
    print(f"   • Previous Positions: {len(exp.get('previous_positions', []))}")
    
    print(f"\n🎓 Education:")
    edu = extracted.get('education', {})
    print(f"   • Degree: {edu.get('degree', 'N/A')}")
    print(f"   • Institution: {edu.get('institution', 'N/A')}")
    print(f"   • Year: {edu.get('graduation_year', 'N/A')}")
    
    certs = extracted.get('certifications', [])
    print(f"\n📜 Certifications: {len(certs)}")
    for cert in certs:
        print(f"   • {cert.get('certification_name', 'N/A')} ({cert.get('status', 'Completed')})")
    
    skills = extracted.get('skills', [])
    print(f"\n💡 Skills: {len(skills)} identified")
    if skills:
        print(f"   {', '.join(skills[:10])}{'...' if len(skills) > 10 else ''}")
    
    # Generate CV
    print_section("📄 GENERATING PROFESSIONAL CV WITH GPT-4")
    print("Generating... (this may take a few seconds)")
    
    cv_output = assistant.generate_professional_summary(extracted, use_llm=True)
    print(cv_output if cv_output else "❌ CV generation failed")
    
    # Generate JSON
    print_section("💾 STRUCTURED JSON OUTPUT")
    json_output = assistant.generate_cv_json(extracted)
    print(json.dumps(json_output, indent=2, ensure_ascii=False))
    
    # Follow-up questions
    missing = analysis.get('missing_information', [])
    if missing:
        print_section("❓ SMART FOLLOW-UP QUESTIONS")
        print("Generating contextual questions...")
        
        question = assistant.generate_follow_up_question(missing, extracted)
        print(f"\n📝 {question}")
    
    print_section("✅ TEST COMPLETE", "=")
    print(f"\n📊 Summary:")
    print(f"   • LLM Status: {'✅ Active' if assistant.use_llm else '❌ Inactive'}")
    print(f"   • Completeness: {analysis.get('completeness_score', 0)}%")
    print(f"   • Extraction Method: {'🤖 OpenAI GPT-4' if assistant.use_llm else '📝 Regex'}")
    print()

if __name__ == "__main__":
    main()
