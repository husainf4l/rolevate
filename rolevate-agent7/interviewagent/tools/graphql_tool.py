import os
import json
from gql import Client, gql
from gql.transport.requests import RequestsHTTPTransport
from typing import Dict, Optional, List, Any

GRAPHQL_API_URL = os.environ.get("GRAPHQL_API_URL", "http://localhost:4005/api/graphql")
SYSTEM_API_KEY = os.environ.get("SYSTEM_API_KEY", "")


def get_client(api_key: Optional[str] = None):
    """Create a new client with auth headers for each request"""
    key = api_key or SYSTEM_API_KEY
    headers = {"x-api-key": key}
    transport = RequestsHTTPTransport(
        url=GRAPHQL_API_URL, 
        verify=True, 
        retries=3,
        headers=headers
    )
    return Client(transport=transport, fetch_schema_from_transport=False)


def fetch_interview(interview_id: str, api_key: Optional[str] = None) -> Optional[Dict]:
    """Fetch interview details including basic info and status"""
    query = gql(
        """
        query GetInterview($id: ID!) {
            interview(id: $id) {
                id
                type
                status
                scheduledAt
                duration
                notes
                feedback
                rating
                recordingUrl
                roomId
                createdAt
                updatedAt
                application {
                    id
                    candidate {
                        id
                        name
                        email
                    }
                    job {
                        id
                        title
                        description
                        requirements
                    }
                }
            }
        }
        """
    )
    try:
        client = get_client(api_key)
        res = client.execute(query, variable_values={"id": interview_id})
        return res.get("interview")
    except Exception as e:
        print(f"GraphQL fetch_interview error: {e}")
        return None


def fetch_interview_transcripts(interview_id: str, api_key: Optional[str] = None) -> Optional[List[Dict]]:
    """Fetch all transcript segments for an interview"""
    query = gql(
        """
        query GetInterviewTranscripts($interviewId: ID!) {
            transcriptsByInterview(interviewId: $interviewId) {
                id
                content
                speaker
                timestamp
                confidence
                language
                sequenceNumber
                createdAt
                updatedAt
            }
        }
        """
    )
    try:
        client = get_client(api_key)
        res = client.execute(query, variable_values={"interviewId": interview_id})
        return res.get("transcriptsByInterview", [])
    except Exception as e:
        print(f"GraphQL fetch_interview_transcripts error: {e}")
        return []


def update_interview_analysis(interview_id: str, analysis: Dict[str, Any], api_key: Optional[str] = None) -> Optional[Dict]:
    """Post interview analysis results back to the backend"""
    
    mutation = gql(
        """
        mutation UpdateInterview($id: ID!, $input: UpdateInterviewInput!) {
            updateInterview(id: $id, input: $input) {
                id
                notes
                feedback
                rating
                aiAnalysis
                createdAt
                updatedAt
            }
        }
        """
    )
    
    try:
        # Generate AI recommendations based on analysis
        ai_recommendations = f"""**Interview Performance Analysis**

**Overall Score:** {analysis.get('overall_score', 0)}/100

**Performance Breakdown:**
• Communication: {analysis.get('communication_score', 0)}/100
• Technical Skills: {analysis.get('technical_score', 0)}/100  
• Problem Solving: {analysis.get('problem_solving_score', 0)}/100
• Culture Fit: {analysis.get('culture_fit_score', 0)}/100

**Key Strengths:**
{chr(10).join('• ' + strength for strength in analysis.get('strengths', []))}

**Areas for Improvement:**
{chr(10).join('• ' + area for area in analysis.get('improvement_areas', []))}

**Interviewer Recommendations:**
{analysis.get('interviewer_feedback', '')}

**Next Steps:**
{analysis.get('recommendation', 'Consider for next round based on performance metrics.')}"""

        # Build input for mutation - using the interview fields that actually exist
        # Convert 0-100 score to 1-10 scale for the rating field
        overall_score = analysis.get('overall_score', 0)
        rating_score = max(1, min(10, round(overall_score / 10)))  # Convert 0-100 to 1-10
        
        input_data = {
            "feedback": ai_recommendations,
            "rating": float(rating_score),
            "aiAnalysis": analysis  # Store the full analysis as JSON
        }
        
        client = get_client(api_key)
        print(f"📊 Posting interview analysis results to backend...")
        res = client.execute(mutation, variable_values={
            "id": interview_id,
            "input": input_data
        })
        print(f"✅ Interview analysis updated successfully")
        
        return res.get("updateInterview")
        
    except Exception as e:
        print(f"❌ GraphQL update_interview_analysis error: {e}")
        return None


def fetch_application_by_interview(interview_id: str, api_key: Optional[str] = None) -> Optional[Dict]:
    """Fetch application details through interview relationship"""
    query = gql(
        """
        query GetApplicationByInterview($interviewId: ID!) {
            interview(id: $interviewId) {
                application {
                    id
                    coverLetter
                    resumeUrl
                    cvAnalysisResults
                    aiCvRecommendations
                    candidate {
                        id
                        name
                        email
                        candidateProfile {
                            id
                            bio
                            skills
                            experience
                            education
                        }
                    }
                    job {
                        id
                        title
                        description
                        requirements
                        responsibilities
                    }
                }
            }
        }
        """
    )
    try:
        client = get_client(api_key)
        res = client.execute(query, variable_values={"interviewId": interview_id})
        interview = res.get("interview")
        return interview.get("application") if interview else None
    except Exception as e:
        print(f"GraphQL fetch_application_by_interview error: {e}")
        return None