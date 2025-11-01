from typing import Dict
import os
import json
from openai import OpenAI


def analyze_performance_node(state: Dict) -> Dict:
    """Analyze interview performance using OpenAI"""
    raw_transcript = state.get("raw_transcript", "")
    interview_info = state.get("interview_info", {})
    job_info = state.get("job_info", {})
    candidate_profile = state.get("candidate_profile", {})
    application_info = state.get("application_info", {})
    
    if not raw_transcript:
        print("⚠️  No transcript available for analysis")
        state["analysis"] = {}
        return state
    
    # Get job and candidate context
    job_title = job_info.get("title", "Unknown Position")
    job_requirements = job_info.get("requirements", "")
    job_responsibilities = job_info.get("responsibilities", "")
    interview_type = interview_info.get("type", "General")
    
    # Get CV analysis if available
    cv_analysis = None
    cv_analysis_raw = application_info.get("cvAnalysisResults")
    if cv_analysis_raw:
        try:
            cv_analysis = json.loads(cv_analysis_raw) if isinstance(cv_analysis_raw, str) else cv_analysis_raw
        except:
            pass
    
    # Build analysis prompt
    prompt = f"""You are an expert HR analyst specializing in interview performance evaluation. 
Analyze the following interview transcript and provide a comprehensive assessment.

**CRITICAL SCORING GUIDELINES - BE HARSH WITH POOR PERFORMANCE:**
- Score 0-5: Absolutely no engagement, refuses to participate, completely unprofessional
- Score 6-10: Incoherent responses, nonsensical answers, extreme confusion, ignores questions
- Score 11-20: Minimal engagement, extremely vague responses, major confusion about role
- Score 21-35: Poor performance with some effort but significant concerns
- Score 36-50: Below average, shows effort but notable issues
- Score 51-70: Average performance with room for improvement
- Score 71-85: Good performance with minor concerns  
- Score 86-100: Excellent performance, strong candidate

**BE STRICT:** If a candidate cannot provide coherent, relevant responses or shows extreme confusion about basic aspects of the role, they should receive very low scores (0-15 range). Do not be generous with scoring.

**Red Flags (should result in very low scores 0-10):**
- Refusing to answer questions (saying "Next question" repeatedly)
- Complete lack of engagement or interest
- Unprofessional behavior during interview
- No substantive responses to any questions
- Showing disrespect or impatience
- Incoherent or nonsensical responses
- Completely ignoring questions and changing subjects
- Extreme confusion about the role or position
- Vague claims with absolutely no supporting details
- Inability to have a coherent conversation

**Minimal Engagement (scores 11-20):**
- Provides extremely brief responses with no detail
- Shows confusion but attempts to engage
- Gives generic answers without specifics
- Cannot articulate experience clearly

**Job Details:**
Position: {job_title}
Type: {interview_type}
Requirements: {job_requirements}
Responsibilities: {job_responsibilities}

**Candidate Background:**
Skills: {', '.join(candidate_profile.get('skills', []))}
Experience: {candidate_profile.get('experience', 'Not provided')}

**CV Analysis Context:**
{f"CV Match Score: {cv_analysis.get('match_score', 'N/A')}%" if cv_analysis else "No CV analysis available"}
{f"CV Strengths: {', '.join(cv_analysis.get('strengths', []))}" if cv_analysis and cv_analysis.get('strengths') else ""}

**Interview Transcript:**
{raw_transcript[:6000]}  

Provide your analysis in JSON format with the following structure:
{{
    "overall_score": <number 0-100>,
    "communication_score": <number 0-100>,
    "technical_score": <number 0-100>,
    "problem_solving_score": <number 0-100>,
    "culture_fit_score": <number 0-100>,
    "strengths": [<list of key strengths observed>],
    "improvement_areas": [<list of areas needing improvement>],
    "key_responses": [<list of standout answers or concerning responses>],
    "interviewer_feedback": "<detailed feedback for hiring team>",
    "candidate_feedback": "<constructive feedback for candidate>",
    "recommendation": "<hire/consider/reject with reasoning>",
    "next_steps": "<recommended follow-up actions>"
}}"""
    
    try:
        client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))
        
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are an expert interview analyst providing structured performance assessments."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.1,
            response_format={"type": "json_object"}
        )
        
        analysis = json.loads(response.choices[0].message.content)
        state["analysis"] = analysis
        
        print(f"🎯 Interview analysis completed:")
        print(f"   Overall Score: {analysis.get('overall_score', 0)}/100")
        print(f"   Communication: {analysis.get('communication_score', 0)}/100")
        print(f"   Technical: {analysis.get('technical_score', 0)}/100")
        print(f"   Recommendation: {analysis.get('recommendation', 'Not specified')}")
        
    except Exception as e:
        print(f"❌ OpenAI analysis error: {e}")
        # Fallback analysis
        state["analysis"] = {
            "overall_score": 50,
            "communication_score": 50,
            "technical_score": 50,
            "problem_solving_score": 50,
            "culture_fit_score": 50,
            "strengths": [],
            "improvement_areas": ["Analysis failed - manual review required"],
            "key_responses": [],
            "interviewer_feedback": f"Automated analysis failed: {str(e)}",
            "candidate_feedback": "Please contact HR for detailed feedback.",
            "recommendation": "manual_review",
            "next_steps": "Require manual review by hiring team"
        }
    
    return state