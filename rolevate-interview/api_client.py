"""
API client for interacting with Rolevate GraphQL API
"""

import logging
from typing import Optional

import aiohttp

from config import ROLEVATE_API_URL, ROLEVATE_API_KEY, DEFAULT_TIMEOUT
from models import InterviewContext

logger = logging.getLogger("rolevate-agent")


class RolevateAPIClient:
    """
    Client for interacting with Rolevate GraphQL API.
    
    This client handles all communication with the Rolevate backend,
    including fetching interview context and application details.
    """
    
    def __init__(self, api_url: str = ROLEVATE_API_URL, api_key: str = ROLEVATE_API_KEY):
        """
        Initialize the API client.
        
        Args:
            api_url: The GraphQL API endpoint URL
            api_key: The API key for authentication
        """
        self.api_url = api_url
        self.api_key = api_key
        
    async def fetch_interview_details(self, application_id: str) -> Optional[InterviewContext]:
        """
        Fetch interview details from the Rolevate API.
        
        This method queries the GraphQL API to retrieve information about
        the candidate, job position, and company for a given application.
        
        Args:
            application_id: The application ID to fetch details for
            
        Returns:
            InterviewContext with fetched details, or None if fetch fails
        """
        if not self.api_key:
            logger.error("ROLEVATE_API_KEY not found in environment variables")
            return None
        
        # GraphQL query based on actual schema introspection
        # Application.candidate is of type User (has name field)
        # Application.job is of type Job (has title, interviewLanguage and company fields)
        # Job.company is of type Company (has name field)
        query = """
        query GetInterviewDetails($applicationId: ID!) {
            application(id: $applicationId) {
                candidate {
                    name
                }
                job {
                    title
                    interviewLanguage
                    company {
                        name
                    }
                }
            }
        }
        """
        
        headers = {
            "x-api-key": self.api_key,
            "Content-Type": "application/json",
        }
        
        payload = {
            "query": query,
            "variables": {"applicationId": application_id}
        }
        
        try:
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    self.api_url,
                    json=payload,
                    headers=headers,
                    timeout=aiohttp.ClientTimeout(total=DEFAULT_TIMEOUT)
                ) as response:
                    logger.info(f"GraphQL API response status: {response.status}")
                    
                    if response.status != 200:
                        error_text = await response.text()
                        logger.error(f"GraphQL API error (status {response.status}): {error_text}")
                        return None
                    
                    result = await response.json()
                    
                    # Check for GraphQL errors
                    if "errors" in result:
                        logger.error(f"GraphQL errors: {result['errors']}")
                        return None
                    
                    # Extract and parse data
                    return self._parse_response(result, application_id)
                    
        except aiohttp.ClientError as e:
            logger.error(f"Network error while fetching interview details: {e}")
        except Exception as e:
            logger.error(f"Unexpected error fetching interview details: {e}", exc_info=True)
        
        return None
    
    def _parse_response(self, result: dict, application_id: str) -> Optional[InterviewContext]:
        """
        Parse the GraphQL response into an InterviewContext object.
        
        Args:
            result: The GraphQL response JSON
            application_id: The application ID being queried
            
        Returns:
            InterviewContext with parsed data, or None if parsing fails
        """
        data = result.get("data", {})
        application = data.get("application")
        
        if not application:
            logger.warning("No application data returned from API")
            return None
        
        # Create context object
        context = InterviewContext(application_id=application_id)
        
        # Get candidate name from User type
        candidate = application.get("candidate", {})
        if candidate:
            context.candidate_name = candidate.get("name")
        
        # Get job details
        job = application.get("job", {})
        if job:
            context.job_title = job.get("title")
            context.interview_language = job.get("interviewLanguage")
            
            # Get company from job
            company = job.get("company", {})
            if company:
                context.company_name = company.get("name")
        
        logger.info(
            f"Successfully fetched interview context: "
            f"candidate={context.candidate_name}, "
            f"job={context.job_title}, "
            f"company={context.company_name}, "
            f"language={context.interview_language}"
        )
        
        return context
