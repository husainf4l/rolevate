from ..tools.graphql_tool import update_application_analysis
from typing import Dict
import json


def update_application_node(state: Dict) -> Dict:
    """Update the application with CV analysis results"""
    application_id = state.get("application_id")
    analysis = state.get("analysis")
    extracted = state.get("extracted") or {}
    
    if not application_id or not analysis:
        return state
    
    # Prepare CV analysis results as JSON string
    cv_results = json.dumps({
        "match_score": analysis.get("match_score", 0),
        "skills_matched": analysis.get("skills_matched", []),
        "skills_missing": analysis.get("skills_missing", []),
        "experience_summary": analysis.get("experience_summary", ""),
        "strengths": analysis.get("strengths", []),
        "concerns": analysis.get("concerns", []),
        "detailed_feedback": analysis.get("detailed_feedback", ""),
        "linkedin": extracted.get("linkedin", "")
    })
    
    # Prepare AI recommendations for CV
    ai_cv_recommendations = f"""
**Recommendation:** {analysis.get('recommendation', 'review')}

**Key Strengths:**
{chr(10).join(f'• {s}' for s in analysis.get('strengths', []))}

**Areas of Concern:**
{chr(10).join(f'• {c}' for c in analysis.get('concerns', []))}

**Overall Assessment:**
{analysis.get('detailed_feedback', '')}
"""
    
    # Prepare interview recommendations based on gaps
    skills_missing = analysis.get('skills_missing', [])
    concerns = analysis.get('concerns', [])
    
    interview_recommendations = f"""
**Suggested Interview Focus Areas:**

1. **Skills Verification:**
{chr(10).join(f'   • Ask about: {skill}' for skill in skills_missing[:5]) if skills_missing else '   • Verify claimed skills and experience'}

2. **Address Concerns:**
{chr(10).join(f'   • {concern}' for concern in concerns[:5]) if concerns else '   • General experience discussion'}

3. **Behavioral Questions:**
   • Ask for specific examples related to: {', '.join(analysis.get('skills_matched', [])[:3])}
   • Explore problem-solving scenarios relevant to missing skills
"""
    
    res = update_application_analysis(
        application_id=application_id,
        cv_analysis_score=int(analysis.get("match_score", 0)),
        cv_analysis_results=cv_results,
        ai_cv_recommendations=ai_cv_recommendations,
        ai_interview_recommendations=interview_recommendations
    )
    
    state["application_update_response"] = res
    return state
