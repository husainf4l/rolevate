"""
Example data structures and utilities for interview analysis
"""

from typing import Dict, List, Any


# Example interview analysis result
EXAMPLE_INTERVIEW_ANALYSIS = {
    "overall_score": 78,
    "communication_score": 85,
    "technical_score": 72,
    "problem_solving_score": 80,
    "culture_fit_score": 75,
    "strengths": [
        "Excellent communication skills and articulation",
        "Strong problem-solving approach with clear methodology",
        "Good understanding of software development principles",
        "Shows enthusiasm and genuine interest in the role"
    ],
    "improvement_areas": [
        "Could benefit from more hands-on experience with specific frameworks",
        "Needs to develop deeper understanding of system architecture",
        "Should work on providing more concrete examples from past experience"
    ],
    "key_responses": [
        "Provided a well-structured answer about handling technical challenges",
        "Demonstrated good understanding of teamwork and collaboration",
        "Asked thoughtful questions about company culture and growth opportunities"
    ],
    "interviewer_feedback": "Candidate shows strong potential with good communication skills and problem-solving abilities. Technical knowledge is solid for their experience level, though could be deeper in some areas. Cultural fit seems good based on their questions and responses about teamwork.",
    "candidate_feedback": "You demonstrated strong communication skills and a good problem-solving approach during the interview. To strengthen your profile, consider gaining more hands-on experience with the specific technologies mentioned in the job requirements and be ready to share more concrete examples from your past projects.",
    "recommendation": "consider",
    "next_steps": "Schedule technical deep-dive interview to assess specific framework knowledge. Consider for team fit interview if technical skills meet requirements."
}


# Example transcript data structure
EXAMPLE_TRANSCRIPT_DATA = [
    {
        "id": "transcript_001",
        "content": "Hello, thank you for joining us today. Can you start by telling us a bit about yourself?",
        "speaker": "Interviewer",
        "timestamp": "2024-01-15T10:00:00Z",
        "confidence": 0.95,
        "wordCount": 15,
        "order": 1
    },
    {
        "id": "transcript_002", 
        "content": "Thank you for having me. I'm a software developer with 3 years of experience primarily in web development using React and Node.js. I'm passionate about creating user-friendly applications and have been working on several projects that focus on improving user experience.",
        "speaker": "Candidate",
        "timestamp": "2024-01-15T10:00:15Z",
        "confidence": 0.92,
        "wordCount": 42,
        "order": 2
    },
    {
        "id": "transcript_003",
        "content": "That's great. Can you tell us about a challenging project you worked on and how you approached solving the problems you encountered?",
        "speaker": "Interviewer", 
        "timestamp": "2024-01-15T10:01:00Z",
        "confidence": 0.94,
        "wordCount": 24,
        "order": 3
    }
]


def validate_interview_analysis(analysis: Dict[str, Any]) -> Dict[str, List[str]]:
    """
    Validate interview analysis structure
    
    Returns:
        Dict with 'errors' and 'warnings' lists
    """
    errors = []
    warnings = []
    
    # Check required score fields
    required_scores = ["overall_score", "communication_score", "technical_score", "problem_solving_score", "culture_fit_score"]
    for score_field in required_scores:
        if score_field not in analysis:
            errors.append(f"Missing required score field: {score_field}")
        elif not isinstance(analysis[score_field], (int, float)):
            errors.append(f"Score field {score_field} must be a number")
        elif not 0 <= analysis[score_field] <= 100:
            errors.append(f"Score field {score_field} must be between 0 and 100")
    
    # Check required arrays
    required_arrays = ["strengths", "improvement_areas", "key_responses"]
    for array_field in required_arrays:
        if array_field not in analysis:
            warnings.append(f"Missing recommended array field: {array_field}")
        elif not isinstance(analysis[array_field], list):
            errors.append(f"Field {array_field} must be an array")
    
    # Check required text fields
    required_text = ["interviewer_feedback", "candidate_feedback", "recommendation"]
    for text_field in required_text:
        if text_field not in analysis:
            warnings.append(f"Missing recommended text field: {text_field}")
        elif not isinstance(analysis[text_field], str):
            errors.append(f"Field {text_field} must be a string")
    
    # Validate recommendation values
    valid_recommendations = ["hire", "consider", "reject", "manual_review"]
    if analysis.get("recommendation") not in valid_recommendations:
        warnings.append(f"Recommendation should be one of: {', '.join(valid_recommendations)}")
    
    return {
        "errors": errors,
        "warnings": warnings,
        "isValid": len(errors) == 0
    }


def print_analysis_report(analysis: Dict[str, Any]) -> None:
    """Print a formatted analysis report"""
    validation = validate_interview_analysis(analysis)
    
    print("\n" + "="*60)
    print("INTERVIEW ANALYSIS REPORT")
    print("="*60)
    
    # Scores
    print(f"\n📊 Performance Scores:")
    print(f"  Overall: {analysis.get('overall_score', 0)}/100")
    print(f"  Communication: {analysis.get('communication_score', 0)}/100")
    print(f"  Technical: {analysis.get('technical_score', 0)}/100")
    print(f"  Problem Solving: {analysis.get('problem_solving_score', 0)}/100")
    print(f"  Culture Fit: {analysis.get('culture_fit_score', 0)}/100")
    
    # Recommendation
    recommendation = analysis.get('recommendation', 'Not specified')
    rec_emoji = "✅" if recommendation == "hire" else "🤔" if recommendation == "consider" else "❌"
    print(f"\n{rec_emoji} Recommendation: {recommendation.upper()}")
    
    # Strengths
    strengths = analysis.get('strengths', [])
    if strengths:
        print(f"\n💪 Key Strengths ({len(strengths)}):")
        for strength in strengths:
            print(f"  • {strength}")
    
    # Areas for improvement
    improvements = analysis.get('improvement_areas', [])
    if improvements:
        print(f"\n📈 Areas for Improvement ({len(improvements)}):")
        for improvement in improvements:
            print(f"  • {improvement}")
    
    # Validation results
    print(f"\n🔍 Validation Status: {'✅ PASSED' if validation['isValid'] else '❌ FAILED'}")
    
    if validation['errors']:
        print(f"\n❌ Errors ({len(validation['errors'])}):")
        for error in validation['errors']:
            print(f"  - {error}")
    
    if validation['warnings']:
        print(f"\n⚠️  Warnings ({len(validation['warnings'])}):")
        for warning in validation['warnings']:
            print(f"  - {warning}")
    
    print("="*60 + "\n")


# Test the example
if __name__ == "__main__":
    print("\n🧪 Testing Example Interview Analysis:")
    print_analysis_report(EXAMPLE_INTERVIEW_ANALYSIS)