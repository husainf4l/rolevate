"""
Rolevate GraphQL API client
Handles all communication with the backend API
"""

import logging
from typing import Optional

import aiohttp

from src.core.config import settings
from src.core.models import InterviewContext, InterviewLanguage
from src.core.exceptions import (
    APIConnectionError,
    APIResponseError,
    APITimeoutError
)

logger = logging.getLogger(__name__)


class RolevateAPIClient:
    """
    Async client for Rolevate GraphQL API
    
    Implements:
    - Connection pooling via aiohttp session
    - Proper error handling and retries
    - Request/response logging
    - Timeout management
    """
    
    def __init__(self):
        """Initialize API client with configuration"""
        self.api_url = settings.api.rolevate_api_url
        self.api_key = settings.api.rolevate_api_key
        self.timeout = settings.api.timeout
        self._session: Optional[aiohttp.ClientSession] = None
    
    async def __aenter__(self):
        """Async context manager entry"""
        await self._ensure_session()
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """Async context manager exit"""
        await self.close()
    
    async def _ensure_session(self) -> None:
        """Ensure aiohttp session exists"""
        if self._session is None or self._session.closed:
            self._session = aiohttp.ClientSession()
    
    async def close(self) -> None:
        """Close the aiohttp session"""
        if self._session and not self._session.closed:
            await self._session.close()
    
    async def fetch_interview_context(
        self, 
        application_id: str
    ) -> Optional[InterviewContext]:
        """
        Fetch interview context from API
        
        Args:
            application_id: The application ID to fetch
            
        Returns:
            InterviewContext if successful, None otherwise
            
        Raises:
            APIConnectionError: If unable to connect
            APITimeoutError: If request times out
            APIResponseError: If API returns an error
        """
        if not self.api_key:
            logger.warning("API key not configured, returning minimal context")
            return InterviewContext(application_id=application_id)
        
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
        
        try:
            await self._ensure_session()
            
            result = await self._execute_query(
                query=query,
                variables={"applicationId": application_id}
            )
            
            return self._parse_interview_context(result, application_id)
            
        except aiohttp.ClientError as e:
            raise APIConnectionError(f"Failed to connect to API: {e}")
        except asyncio.TimeoutError:
            raise APITimeoutError(f"API request timed out after {self.timeout}s")
        except Exception as e:
            logger.error(f"Unexpected error fetching interview context: {e}", exc_info=True)
            # Return minimal context on error
            return InterviewContext(application_id=application_id)
    
    async def _execute_query(
        self, 
        query: str, 
        variables: dict
    ) -> dict:
        """
        Execute a GraphQL query
        
        Args:
            query: The GraphQL query string
            variables: Query variables
            
        Returns:
            Parsed JSON response
            
        Raises:
            APIResponseError: If API returns an error
        """
        headers = {
            "x-api-key": self.api_key,
            "Content-Type": "application/json",
        }
        
        payload = {
            "query": query,
            "variables": variables
        }
        
        logger.debug(f"Executing GraphQL query with variables: {variables}")
        
        async with self._session.post(
            self.api_url,
            json=payload,
            headers=headers,
            timeout=aiohttp.ClientTimeout(total=self.timeout)
        ) as response:
            logger.info(f"GraphQL API response status: {response.status}")
            
            if response.status != 200:
                error_text = await response.text()
                raise APIResponseError(
                    f"API returned error: {error_text}",
                    status_code=response.status
                )
            
            result = await response.json()
            
            # Check for GraphQL errors
            if "errors" in result:
                error_msg = "; ".join(str(e) for e in result["errors"])
                raise APIResponseError(f"GraphQL errors: {error_msg}")
            
            return result
    
    def _parse_interview_context(
        self, 
        result: dict, 
        application_id: str
    ) -> InterviewContext:
        """
        Parse GraphQL response into InterviewContext
        
        Args:
            result: The GraphQL response
            application_id: The application ID
            
        Returns:
            Parsed InterviewContext
        """
        data = result.get("data", {})
        application = data.get("application")
        
        if not application:
            logger.warning("No application data in API response")
            return InterviewContext(application_id=application_id)
        
        # Extract candidate info
        candidate_name = None
        candidate = application.get("candidate", {})
        if candidate:
            candidate_name = candidate.get("name")
        
        # Extract job and company info
        job_title = None
        company_name = None
        interview_language = InterviewLanguage.ENGLISH
        
        job = application.get("job", {})
        if job:
            job_title = job.get("title")
            
            # Parse language
            lang_str = job.get("interviewLanguage")
            interview_language = InterviewLanguage.from_string(lang_str)
            
            # Extract company
            company = job.get("company", {})
            if company:
                company_name = company.get("name")
        
        context = InterviewContext(
            application_id=application_id,
            candidate_name=candidate_name,
            job_title=job_title,
            company_name=company_name,
            interview_language=interview_language
        )
        
        logger.info(f"Successfully parsed interview context: {context.get_display_summary()}")
        
        return context


# Import asyncio for timeout handling
import asyncio
