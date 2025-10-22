import os
import json
from gql import Client, gql
from gql.transport.requests import RequestsHTTPTransport
from typing import Dict, Optional

GRAPHQL_API_URL = os.environ.get("GRAPHQL_API_URL", "http://localhost:4005/api/graphql")
SYSTEM_API_KEY = os.environ.get("SYSTEM_API_KEY", "")


def get_client(api_key: Optional[str] = None):
    """Create a new client with auth headers for each request"""
    # Use provided api_key, fallback to environment variable
    key = api_key or SYSTEM_API_KEY
    headers = {"x-api-key": key}
    transport = RequestsHTTPTransport(
        url=GRAPHQL_API_URL, 
        verify=True, 
        retries=3,
        headers=headers
    )
    return Client(transport=transport, fetch_schema_from_transport=False)


def fetch_job(jobid: str, api_key: Optional[str] = None) -> Optional[Dict]:
    query = gql(
        """
        query GetJob($id: ID!) {
            job(id: $id) {
                id
                title
                description
                requirements
            }
        }
        """
    )
    try:
        client = get_client(api_key)
        res = client.execute(query, variable_values={"id": jobid})
        return res.get("job")
    except Exception as e:
        print(f"GraphQL fetch_job error: {e}")
        return None


def fetch_application(application_id: str, api_key: Optional[str] = None) -> Optional[Dict]:
    query = gql(
        """
        query GetApplication($id: ID!) {
            application(id: $id) {
                id
                coverLetter
            }
        }
        """
    )
    try:
        client = get_client(api_key)
        res = client.execute(query, variable_values={"id": application_id})
        return res.get("application")
    except Exception as e:
        print(f"GraphQL fetch_application error: {e}")
        return None


def post_cv_analysis(candidateid: str, application_id: str, analysis: Dict, resume_url: str, job_id: str, extracted: Dict = None, api_key: Optional[str] = None) -> Optional[Dict]:
    """Post CV analysis results back to NestJS using updateApplicationAnalysis mutation"""
    
    mutation = gql(
        """
        mutation UpdateApplicationAnalysis($input: UpdateApplicationAnalysisInput!) {
            updateApplicationAnalysis(input: $input) {
                id
                cvAnalysisScore
                cvAnalysisResults
                aiCvRecommendations
                aiInterviewRecommendations
                analyzedAt
                candidate {
                    id
                    email
                    name
                    candidateProfile {
                        id
                        firstName
                        lastName
                        phone
                        location
                        linkedinUrl
                        portfolioUrl
                        bio
                        skills
                        experience
                        education
                    }
                }
            }
        }
        """
    )
    
    try:
        # Generate career recommendations for the candidate
        career_recommendations = f"""Based on your CV analysis for this position:

**Match Score:** {analysis.get('match_score', 0)}%

**Your Strengths:**
{chr(10).join('• ' + s for s in analysis.get('strengths', []))}

**Areas for Development:**
{chr(10).join('• ' + c for c in analysis.get('concerns', []))}

**Skills You Have:**
{', '.join(analysis.get('skills_matched', []))}

**Skills to Develop:**
{', '.join(analysis.get('skills_missing', []))}

**Career Advice:**
{analysis.get('detailed_feedback', '')}

**Next Steps:**
{analysis.get('recommendation', 'Consider discussing your application with the hiring team.')}"""

        # Generate interview recommendations
        interview_recommendations = f"""Interview Focus Areas:

**Key Topics to Explore:**
{chr(10).join('• ' + skill for skill in analysis.get('skills_missing', [])[:3])}

**Strengths to Validate:**
{chr(10).join('• ' + strength for strength in analysis.get('strengths', [])[:3])}

**Questions to Ask:**
{chr(10).join('• ' + concern for concern in analysis.get('concerns', [])[:3])}"""

        # Build input for updateApplicationAnalysis mutation
        input_data = {
            "applicationId": application_id,
            "cvAnalysisScore": float(analysis.get('match_score', 0)),
            "cvAnalysisResults": json.dumps(analysis),
            "aiCvRecommendations": career_recommendations,
            "aiInterviewRecommendations": interview_recommendations
        }
        
        # Add candidate info if extracted data is available
        if extracted:
            candidate_info = {}
            
            # Only include fields that have values
            if extracted.get("firstName"):
                candidate_info["firstName"] = extracted["firstName"]
            if extracted.get("lastName"):
                candidate_info["lastName"] = extracted["lastName"]
            if extracted.get("firstName") and extracted.get("lastName"):
                candidate_info["name"] = f"{extracted['firstName']} {extracted['lastName']}"
            if extracted.get("email"):
                candidate_info["email"] = extracted["email"]
            if extracted.get("phone"):
                candidate_info["phone"] = extracted["phone"]
            if extracted.get("location"):
                candidate_info["location"] = extracted["location"]
            if extracted.get("linkedinUrl"):
                candidate_info["linkedinUrl"] = extracted["linkedinUrl"]
            if extracted.get("githubUrl"):
                candidate_info["githubUrl"] = extracted["githubUrl"]
            if extracted.get("portfolioUrl"):
                candidate_info["portfolioUrl"] = extracted["portfolioUrl"]
            if extracted.get("bio"):
                candidate_info["bio"] = extracted["bio"]
            if extracted.get("skills") and len(extracted["skills"]) > 0:
                candidate_info["skills"] = extracted["skills"]
            
            # Experience - handle both string and array formats
            if extracted.get("experience"):
                candidate_info["experience"] = extracted["experience"]
                exp_type = "array" if isinstance(extracted["experience"], list) else "string"
                exp_count = len(extracted["experience"]) if isinstance(extracted["experience"], list) else "N/A"
                print(f"   📋 Experience: {exp_type} format ({exp_count} entries)" if exp_type == "array" else f"   📋 Experience: {exp_type} format")
            
            # Education - handle both string and array formats
            if extracted.get("education"):
                candidate_info["education"] = extracted["education"]
                edu_type = "array" if isinstance(extracted["education"], list) else "string"
                edu_count = len(extracted["education"]) if isinstance(extracted["education"], list) else "N/A"
                print(f"   🎓 Education: {edu_type} format ({edu_count} entries)" if edu_type == "array" else f"   🎓 Education: {edu_type} format")
            
            if candidate_info:
                input_data["candidateInfo"] = candidate_info
                print(f"🔄 Updating application {application_id} with candidate info:")
                print(f"   Basic fields: {[k for k in candidate_info.keys() if k not in ['experience', 'education', 'skills']]}")
                print(f"   Skills: {len(candidate_info.get('skills', []))} skills")

        
        client = get_client(api_key)
        print(f"📤 Posting CV analysis results to NestJS GraphQL...")
        res = client.execute(mutation, variable_values={"input": input_data})
        print(f"✅ Application analysis updated successfully")
        
        return res.get("updateApplicationAnalysis")
        
    except Exception as e:
        print(f"❌ GraphQL post_cv_analysis error: {e}")
        return None


def update_application_status(application_id: str, status: str, api_key: Optional[str] = None) -> Optional[Dict]:
    """Update the application status after analysis is complete
    
    Valid status values: PENDING, ANALYZED, REVIEWED, SHORTLISTED, INTERVIEWED, OFFERED, HIRED, REJECTED, WITHDRAWN
    """
    
    mutation = gql(
        """
        mutation UpdateApplication($id: ID!, $input: UpdateApplicationInput!) {
            updateApplication(id: $id, input: $input) {
                id
                status
            }
        }
        """
    )
    
    try:
        client = get_client(api_key)
        print(f"🔄 Updating application {application_id} status to: {status}")
        res = client.execute(
            mutation, 
            variable_values={
                "id": application_id, 
                "input": {"status": status}
            }
        )
        print(f"✅ Application status updated successfully")
        
        return res.get("updateApplication")
        
    except Exception as e:
        print(f"❌ GraphQL update_application_status error: {e}")
        return None
