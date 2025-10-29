"""
Interview Service - Async version with retry logic and proper error handling.
Manages interview records and transcripts via GraphQL API.
"""

import logging
from typing import Optional, Dict, Any, List
from datetime import datetime
import uuid
import aiohttp
from tenacity import (
    retry,
    stop_after_attempt,
    wait_exponential,
    retry_if_exception_type,
    before_sleep_log
)

from config import settings
from exceptions import GraphQLError, InterviewError, TranscriptError
from models import (
    CreateInterviewInput,
    UpdateInterviewInput,
    InterviewResponse,
    TranscriptEntry
)

logger = logging.getLogger(__name__)


class InterviewService:
    """Service to manage interview records and transcripts in GraphQL."""
    
    def __init__(self):
        """Initialize the service with HTTP session."""
        self._session: Optional[aiohttp.ClientSession] = None
        self.graphql_endpoint = settings.graphql_endpoint
        self.api_key = settings.rolevate_api_key
        self.interview_id: Optional[str] = None
    
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
            logger.info("Created new HTTP session for InterviewService")
        return self._session
    
    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=2, max=10),
        retry=retry_if_exception_type((aiohttp.ClientError, GraphQLError)),
        before_sleep=before_sleep_log(logger, logging.WARNING),
        reraise=True
    )
    async def _execute_graphql(
        self,
        query: str,
        variables: Optional[Dict] = None
    ) -> Optional[Dict]:
        """
        Execute a GraphQL query or mutation with retry logic.
        
        Args:
            query: GraphQL query or mutation string
            variables: Optional variables for the query
            
        Returns:
            Response data dictionary or None if errors occurred
            
        Raises:
            GraphQLError: If the GraphQL request fails
        """
        payload = {
            "query": query,
            "variables": variables or {}
        }
        
        logger.debug(
            "Executing GraphQL request",
            extra={"variables": variables}
        )
        
        try:
            session = await self._get_session()
            async with session.post(
                self.graphql_endpoint,
                json=payload
            ) as response:
                response.raise_for_status()
                result = await response.json()
                
                if "errors" in result:
                    error_messages = [e.get("message", str(e)) for e in result["errors"]]
                    logger.error(
                        "GraphQL errors received",
                        extra={"errors": error_messages}
                    )
                    raise GraphQLError(
                        f"GraphQL request failed: {', '.join(error_messages)}",
                        details={"errors": result["errors"]}
                    )
                
                return result.get("data")
                
        except aiohttp.ClientError as e:
            logger.error(f"HTTP request failed: {e}")
            raise GraphQLError(
                f"Failed to execute GraphQL request: {str(e)}",
                details={"original_error": str(e)}
            ) from e
        except Exception as e:
            logger.error(f"Unexpected error executing GraphQL: {e}", exc_info=True)
            raise
    
    async def create_interview(
        self,
        application_id: str,
        interviewer_id: Optional[str] = None,
        room_id: Optional[str] = None,
        interview_type: str = "VIDEO"
    ) -> Optional[str]:
        """
        Create a new interview record with retry logic.
        
        Args:
            application_id: The application ID this interview is for
            interviewer_id: ID of the interviewer (auto-generated if None)
            room_id: LiveKit room ID
            interview_type: Type of interview (VIDEO, PHONE, IN_PERSON)
            
        Returns:
            Interview ID if successful, None otherwise
            
        Raises:
            InterviewError: If interview creation fails
        """
        mutation = """
        mutation CreateInterview($input: CreateInterviewInput!) {
            createInterview(input: $input) {
                id
                status
                scheduledAt
                createdAt
            }
        }
        """
        
        # Use provided interviewerId or generate UUID for AI agent
        if not interviewer_id:
            interviewer_id = str(uuid.uuid4())
            logger.debug(f"Generated AI interviewer ID: {interviewer_id}")
        
        # Create input using Pydantic model
        interview_input = CreateInterviewInput(
            applicationId=application_id,
            interviewerId=interviewer_id,
            scheduledAt=datetime.utcnow(),
            type=interview_type,
            status="SCHEDULED",
            roomId=room_id
        )
        
        # Convert to dict with datetime serialization
        input_dict = interview_input.model_dump(by_alias=True, exclude_none=True)
        # Manually serialize datetime to ISO format
        if "scheduledAt" in input_dict and isinstance(input_dict["scheduledAt"], datetime):
            input_dict["scheduledAt"] = input_dict["scheduledAt"].isoformat()
        
        variables = {
            "input": input_dict
        }
        
        try:
            result = await self._execute_graphql(mutation, variables)
            
            if result and "createInterview" in result:
                self.interview_id = result["createInterview"]["id"]
                logger.info(
                    "Interview created successfully",
                    extra={
                        "interview_id": self.interview_id,
                        "application_id": application_id
                    }
                )
                return self.interview_id
            
            logger.error("Failed to create interview: No data in response")
            return None
            
        except Exception as e:
            logger.error(
                "Failed to create interview",
                extra={"application_id": application_id, "error": str(e)},
                exc_info=True
            )
            raise InterviewError(
                f"Failed to create interview: {str(e)}",
                details={"application_id": application_id}
            ) from e
    
    async def update_interview(
        self,
        interview_id: str,
        **kwargs
    ) -> bool:
        """
        Update an existing interview record.
        
        Args:
            interview_id: The interview ID to update
            **kwargs: Fields to update (status, recording_url, duration, etc.)
            
        Returns:
            True if successful, False otherwise
            
        Raises:
            InterviewError: If update fails
        """
        mutation = """
        mutation UpdateInterview($id: ID!, $input: UpdateInterviewInput!) {
            updateInterview(id: $id, input: $input) {
                id
                status
                recordingUrl
                updatedAt
            }
        }
        """
        
        # Build input using Pydantic model
        update_input = UpdateInterviewInput(**kwargs)
        
        variables = {
            "id": interview_id,
            "input": update_input.model_dump(by_alias=True, exclude_none=True)
        }
        
        try:
            result = await self._execute_graphql(mutation, variables)
            
            if result and "updateInterview" in result:
                logger.info(
                    "Interview updated successfully",
                    extra={"interview_id": interview_id}
                )
                return True
            
            logger.error(
                "Failed to update interview",
                extra={"interview_id": interview_id}
            )
            return False
            
        except Exception as e:
            logger.error(
                "Failed to update interview",
                extra={"interview_id": interview_id, "error": str(e)},
                exc_info=True
            )
            raise InterviewError(
                f"Failed to update interview: {str(e)}",
                details={"interview_id": interview_id}
            ) from e
    
    async def complete_interview(
        self,
        interview_id: str,
        recording_url: Optional[str] = None,
        duration: Optional[float] = None
    ) -> bool:
        """
        Mark an interview as completed.
        
        Args:
            interview_id: The interview ID
            recording_url: URL to the recording (optional)
            duration: Interview duration in minutes (optional)
            
        Returns:
            True if successful, False otherwise
            
        Raises:
            InterviewError: If completion fails
        """
        mutation = """
        mutation CompleteInterview($id: ID!) {
            completeInterview(id: $id) {
                id
                status
                updatedAt
            }
        }
        """
        
        variables = {"id": interview_id}
        
        try:
            result = await self._execute_graphql(mutation, variables)
            
            if result and "completeInterview" in result:
                # Update with recording URL if provided
                if recording_url and recording_url.strip():
                    await self.update_interview(
                        interview_id,
                        recording_url=recording_url,
                        duration=duration
                    )
                
                logger.info(
                    "Interview completed",
                    extra={"interview_id": interview_id}
                )
                return True
            
            logger.error(
                "Failed to complete interview",
                extra={"interview_id": interview_id}
            )
            return False
            
        except Exception as e:
            logger.error(
                "Failed to complete interview",
                extra={"interview_id": interview_id, "error": str(e)},
                exc_info=True
            )
            raise InterviewError(
                f"Failed to complete interview: {str(e)}",
                details={"interview_id": interview_id}
            ) from e
    
    async def add_transcript(
        self,
        interview_id: str,
        content: str,
        speaker: str,
        timestamp: Optional[datetime] = None,
        confidence: Optional[float] = None,
        language: Optional[str] = None
    ) -> bool:
        """
        Add a single transcript entry with retry logic.
        
        Args:
            interview_id: The interview ID
            content: Transcript text content
            speaker: Speaker name
            timestamp: Timestamp of the speech (defaults to now)
            confidence: Speech recognition confidence (0-1)
            language: Language code (e.g., "en", "ar")
            
        Returns:
            True if successful, False otherwise
            
        Raises:
            TranscriptError: If transcript creation fails
        """
        mutation = """
        mutation CreateTranscript($input: CreateTranscriptInput!) {
            createTranscript(input: $input) {
                id
                content
                speaker
                timestamp
            }
        }
        """
        
        # Create transcript entry using Pydantic model
        transcript = TranscriptEntry(
            interviewId=interview_id,
            content=content,
            speaker=speaker,
            timestamp=timestamp or datetime.utcnow(),
            confidence=confidence,
            language=language
        )
        
        variables = {
            "input": transcript.model_dump(by_alias=True, exclude_none=True)
        }
        
        try:
            result = await self._execute_graphql(mutation, variables)
            
            if result and "createTranscript" in result:
                logger.debug(
                    "Transcript added",
                    extra={"interview_id": interview_id, "speaker": speaker}
                )
                return True
            
            return False
            
        except Exception as e:
            logger.error(
                "Failed to add transcript",
                extra={
                    "interview_id": interview_id,
                    "speaker": speaker,
                    "error": str(e)
                }
            )
            # Don't raise - allow interview to continue even if transcript fails
            return False
    
    async def add_transcripts_bulk(
        self,
        interview_id: str,
        transcripts: List[Dict[str, Any]]
    ) -> bool:
        """
        Add multiple transcript entries in bulk.
        
        Args:
            interview_id: The interview ID
            transcripts: List of transcript dictionaries
            
        Returns:
            True if successful, False otherwise
            
        Raises:
            TranscriptError: If bulk transcript creation fails
        """
        mutation = """
        mutation CreateBulkTranscripts($inputs: [CreateTranscriptInput!]!) {
            createBulkTranscripts(inputs: $inputs) {
                id
                content
                speaker
            }
        }
        """
        
        # Format inputs using Pydantic models
        inputs = []
        for transcript_data in transcripts:
            transcript = TranscriptEntry(
                interviewId=interview_id,
                **transcript_data
            )
            inputs.append(
                transcript.model_dump(by_alias=True, exclude_none=True)
            )
        
        variables = {"inputs": inputs}
        
        try:
            result = await self._execute_graphql(mutation, variables)
            
            if result and "createBulkTranscripts" in result:
                logger.info(
                    "Added bulk transcripts",
                    extra={
                        "interview_id": interview_id,
                        "count": len(transcripts)
                    }
                )
                return True
            
            return False
            
        except Exception as e:
            logger.error(
                "Failed to add bulk transcripts",
                extra={
                    "interview_id": interview_id,
                    "count": len(transcripts),
                    "error": str(e)
                }
            )
            return False
    
    async def close(self) -> None:
        """Close the HTTP session and cleanup resources."""
        if self._session and not self._session.closed:
            await self._session.close()
            logger.info("Closed HTTP session for InterviewService")
    
    async def __aenter__(self):
        """Context manager entry."""
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """Context manager exit."""
        await self.close()
