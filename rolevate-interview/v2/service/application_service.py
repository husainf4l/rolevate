"""
Application Service - Async version with retry logic and proper error handling.
Fetches application data from GraphQL API with connection pooling.
"""

import logging
from typing import Optional
import aiohttp
from tenacity import (
    retry,
    stop_after_attempt,
    wait_exponential,
    retry_if_exception_type,
    before_sleep_log
)

from config import settings
from exceptions import GraphQLError, ResourceNotFoundError
from models import ApplicationData

logger = logging.getLogger(__name__)


class ApplicationService:
    """Service to fetch application data from GraphQL API."""
    
    def __init__(self):
        """Initialize the service with HTTP session."""
        self._session: Optional[aiohttp.ClientSession] = None
        self.graphql_endpoint = settings.graphql_endpoint
        self.api_key = settings.rolevate_api_key
    
    async def _get_session(self) -> aiohttp.ClientSession:
        """Get or create HTTP session with connection pooling."""
        if self._session is None or self._session.closed:
            timeout = aiohttp.ClientTimeout(total=settings.http_timeout)
            connector = aiohttp.TCPConnector(
                limit=settings.http_max_connections,
                limit_per_host=30
            )
            self._session = aiohttp.ClientSession(
                timeout=timeout,
                connector=connector,
                headers={
                    "Content-Type": "application/json",
                    "x-api-key": self.api_key
                }
            )
            logger.info("Created new HTTP session for ApplicationService")
        return self._session
    
    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=2, max=10),
        retry=retry_if_exception_type((aiohttp.ClientError, GraphQLError)),
        before_sleep=before_sleep_log(logger, logging.WARNING),
        reraise=True
    )
    async def get_application_data(self, application_id: str) -> ApplicationData:
        """
        Fetch application data from GraphQL API with retry logic.
        
        Args:
            application_id: The ID of the application to fetch
            
        Returns:
            ApplicationData: Validated application data
            
        Raises:
            ResourceNotFoundError: If application not found
            GraphQLError: If GraphQL query fails
            ValueError: If application_id is invalid
        """
        if not application_id or not application_id.strip():
            raise ValueError("application_id cannot be empty")
        
        query = """
        query Application($id: ID!) {
            application(id: $id) {
                candidate {
                    id
                    name
                }
                cvAnalysisResults
                job {
                    id
                    title
                    salary
                    company {
                        name
                        description
                        phone
                        email
                    }
                    interviewPrompt
                    description
                    interviewLanguage
                }
            }
        }
        """
        
        variables = {"id": application_id}
        payload = {
            "query": query.strip(),
            "variables": variables
        }
        
        logger.info(
            "Fetching application data",
            extra={"application_id": application_id}
        )
        
        try:
            session = await self._get_session()
            async with session.post(
                self.graphql_endpoint,
                json=payload
            ) as response:
                response.raise_for_status()
                data = await response.json()
                
                if "errors" in data:
                    error_messages = [e.get("message", str(e)) for e in data["errors"]]
                    logger.error(
                        "GraphQL errors received",
                        extra={
                            "application_id": application_id,
                            "errors": error_messages
                        }
                    )
                    raise GraphQLError(
                        f"GraphQL query failed: {', '.join(error_messages)}",
                        details={"errors": data["errors"]}
                    )
                
                application_data = data.get("data", {}).get("application")
                
                if not application_data:
                    logger.warning(
                        "Application not found",
                        extra={"application_id": application_id}
                    )
                    raise ResourceNotFoundError(
                        f"Application not found: {application_id}",
                        details={"application_id": application_id}
                    )
                
                # Validate and parse with Pydantic
                validated_data = ApplicationData.model_validate(application_data)
                
                logger.info(
                    "Successfully fetched application data",
                    extra={
                        "application_id": application_id,
                        "candidate_name": validated_data.candidate.name,
                        "job_title": validated_data.job.title
                    }
                )
                
                return validated_data
                
        except aiohttp.ClientError as e:
            logger.error(
                "HTTP request failed",
                extra={"application_id": application_id, "error": str(e)}
            )
            raise GraphQLError(
                f"Failed to fetch application data: {str(e)}",
                details={"application_id": application_id, "original_error": str(e)}
            ) from e
        except Exception as e:
            logger.error(
                "Unexpected error fetching application data",
                extra={"application_id": application_id, "error": str(e)},
                exc_info=True
            )
            raise
    
    async def close(self) -> None:
        """Close the HTTP session and cleanup resources."""
        if self._session and not self._session.closed:
            await self._session.close()
            logger.info("Closed HTTP session for ApplicationService")
    
    async def __aenter__(self):
        """Context manager entry."""
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """Context manager exit."""
        await self.close()
