from typing import Dict
import os
import json
from openai import OpenAI


def analyze_node(state: Dict) -> Dict:
    """Use OpenAI to analyze CV against job requirements"""
    raw_text = state.get("raw_text", "")
    job_info = state.get("job_info") or {}
    application_info = state.get("application_info") or {}
    extracted = state.get("extracted") or {}
    
    job_title = job_info.get("title", "Unknown Position")
    job_description = job_info.get("description", "")
    job_requirements = job_info.get("requirements", "")
    cover_letter = application_info.get("coverLetter", "")
    linkedin = extracted.get("linkedin", "")  # Get LinkedIn from extracted CV data
    
    # Build prompt for OpenAI
    prompt = f"""You are an expert HR analyst. Analyze the following CV against the job requirements and provide a detailed assessment.

Job Title: {job_title}
Job Description: {job_description}
Job Requirements: {job_requirements}

CV Content:
{raw_text[:4000]}

Additional Information:
- Cover Letter: {cover_letter[:500] if cover_letter else "Not provided"}
- LinkedIn Profile: {linkedin if linkedin else "Not found in CV"}

Provide your analysis in JSON format with the following structure:
{{
    "match_score": <number 0-100>,
    "skills_matched": [<list of matched skills>],
    "skills_missing": [<list of missing skills>],
    "experience_summary": "<brief summary>",
    "strengths": [<list of strengths>],
    "concerns": [<list of concerns>],
    "recommendation": "<hire/consider/reject>",
    "detailed_feedback": "<detailed explanation>"
}}"""
    
    try:
        # Initialize OpenAI client inside function to ensure env vars are loaded
        client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))
        
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are an expert HR analyst providing structured CV assessments."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            response_format={"type": "json_object"}
        )
        
        analysis = json.loads(response.choices[0].message.content)
        # Add the extracted LinkedIn URL to the analysis result
        analysis["linkedin"] = linkedin
        state["analysis"] = analysis
        
    except Exception as e:
        print(f"OpenAI analysis error: {e}")
        # Fallback to simple analysis
        state["analysis"] = {
            "match_score": 50,
            "skills_matched": [],
            "skills_missing": [],
            "experience_summary": "Error during analysis",
            "strengths": [],
            "concerns": ["Analysis failed"],
            "recommendation": "manual_review",
            "detailed_feedback": f"Error: {str(e)}"
        }
    
    return state
