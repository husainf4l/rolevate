import os
import logging
from typing import Optional, Dict, Any, List
from datetime import datetime
import requests
import uuid

logger = logging.getLogger("interview-service")


class InterviewService:
    """Service to manage interview records and transcripts in GraphQL"""
    
    def __init__(self):
        self.graphql_endpoint = os.getenv("GRAPHQL_ENDPOINT")
        self.api_key = os.getenv("ROLEVATE_API_KEY")
        self.interview_id: Optional[str] = None
        
        if not self.graphql_endpoint or not self.api_key:
            logger.error("Missing GRAPHQL_ENDPOINT or ROLEVATE_API_KEY in environment")
    
    def _execute_graphql(self, query: str, variables: Optional[Dict] = None) -> Optional[Dict]:
        """Execute a GraphQL query or mutation"""
        try:
            headers = {
                "Content-Type": "application/json",
                "x-api-key": self.api_key
            }
            
            payload = {
                "query": query,
                "variables": variables or {}
            }
            
            logger.debug(f"GraphQL request: {payload}")
            
            response = requests.post(
                self.graphql_endpoint,
                json=payload,
                headers=headers,
                timeout=10
            )
            
            logger.debug(f"GraphQL response status: {response.status_code}")
            logger.debug(f"GraphQL response body: {response.text}")
            
            response.raise_for_status()
            result = response.json()
            
            if "errors" in result:
                logger.error(f"GraphQL errors: {result['errors']}")
                return None
            
            return result.get("data")
            
        except requests.exceptions.RequestException as e:
            logger.error(f"GraphQL request failed: {e}")
            return None
        except Exception as e:
            logger.error(f"Unexpected error executing GraphQL: {e}", exc_info=True)
            return None
    
    def create_interview(
        self,
        application_id: str,
        interviewer_id: Optional[str] = None,
        room_id: Optional[str] = None,
        interview_type: str = "VIDEO"
    ) -> Optional[str]:
        """
        Create a new interview record
        
        Args:
            application_id: The application ID this interview is for
            interviewer_id: ID of the interviewer (optional, must be valid UUID if provided)
            room_id: LiveKit room ID
            interview_type: Type of interview (VIDEO, PHONE, IN_PERSON)
            
        Returns:
            Interview ID if successful, None otherwise
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
        
        input_data = {
            "applicationId": application_id,
            "scheduledAt": datetime.utcnow().isoformat(),
            "type": interview_type,
            "status": "SCHEDULED",
            "roomId": room_id
        }
        
        # Use provided interviewerId or generate a UUID for AI agent
        if interviewer_id:
            input_data["interviewerId"] = interviewer_id
        else:
            # Generate a consistent UUID for AI agent interviews
            input_data["interviewerId"] = str(uuid.uuid4())
            logger.debug(f"Generated AI interviewer ID: {input_data['interviewerId']}")
        
        variables = {
            "input": input_data
        }
        
        result = self._execute_graphql(mutation, variables)
        
        if result and "createInterview" in result:
            self.interview_id = result["createInterview"]["id"]
            logger.info(f"Interview created successfully: {self.interview_id}")
            return self.interview_id
        
        logger.error("Failed to create interview record")
        return None
    
    def update_interview(
        self,
        interview_id: str,
        status: Optional[str] = None,
        recording_url: Optional[str] = None,
        duration: Optional[float] = None,
        feedback: Optional[str] = None,
        rating: Optional[float] = None,
        ai_analysis: Optional[Dict[str, Any]] = None
    ) -> bool:
        """
        Update an existing interview record
        
        Args:
            interview_id: The interview ID to update
            status: New status (SCHEDULED, IN_PROGRESS, COMPLETED, CANCELLED, NO_SHOW)
            recording_url: URL to the recording
            duration: Interview duration in minutes
            feedback: Interview feedback text
            rating: Interview rating (0-5)
            ai_analysis: AI analysis results as JSON
            
        Returns:
            True if successful, False otherwise
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
        
        # Build input with only provided fields
        input_data = {}
        if status is not None:
            input_data["status"] = status
        if recording_url is not None:
            input_data["recordingUrl"] = recording_url
        if duration is not None:
            input_data["duration"] = duration
        if feedback is not None:
            input_data["feedback"] = feedback
        if rating is not None:
            input_data["rating"] = rating
        if ai_analysis is not None:
            input_data["aiAnalysis"] = ai_analysis
        
        variables = {
            "id": interview_id,
            "input": input_data
        }
        
        result = self._execute_graphql(mutation, variables)
        
        if result and "updateInterview" in result:
            logger.info(f"Interview updated successfully: {interview_id}")
            return True
        
        logger.error(f"Failed to update interview: {interview_id}")
        return False
    
    def complete_interview(
        self,
        interview_id: str,
        recording_url: Optional[str] = None,
        duration: Optional[float] = None
    ) -> bool:
        """
        Mark an interview as completed
        
        Args:
            interview_id: The interview ID
            recording_url: URL to the recording (optional)
            duration: Interview duration in minutes (optional)
            
        Returns:
            True if successful, False otherwise
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
        
        result = self._execute_graphql(mutation, variables)
        
        if result and "completeInterview" in result:
            # Update with recording URL only if we have a valid one
            if recording_url and recording_url.strip():
                self.update_interview(
                    interview_id,
                    recording_url=recording_url,
                    duration=duration
                )
            
            logger.info(f"Interview completed: {interview_id}")
            return True
        
        logger.error(f"Failed to complete interview: {interview_id}")
        return False
    
    def add_transcript(
        self,
        interview_id: str,
        content: str,
        speaker: str,
        timestamp: Optional[datetime] = None,
        confidence: Optional[float] = None,
        language: Optional[str] = None
    ) -> bool:
        """
        Add a single transcript entry
        
        Args:
            interview_id: The interview ID
            content: Transcript text content
            speaker: Speaker name (e.g., "Candidate", "Agent", "Laila Al Noor")
            timestamp: Timestamp of the speech (defaults to now)
            confidence: Speech recognition confidence (0-1)
            language: Language code (e.g., "en", "ar")
            
        Returns:
            True if successful, False otherwise
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
        
        variables = {
            "input": {
                "interviewId": interview_id,
                "content": content,
                "speaker": speaker,
                "timestamp": (timestamp or datetime.utcnow()).isoformat(),
                "confidence": confidence,
                "language": language
            }
        }
        
        result = self._execute_graphql(mutation, variables)
        
        if result and "createTranscript" in result:
            logger.debug(f"Transcript added for interview {interview_id}")
            return True
        
        logger.error(f"Failed to add transcript for interview {interview_id}")
        return False
    
    def add_transcripts_bulk(
        self,
        interview_id: str,
        transcripts: List[Dict[str, Any]]
    ) -> bool:
        """
        Add multiple transcript entries in bulk
        
        Args:
            interview_id: The interview ID
            transcripts: List of transcript dictionaries with keys:
                - content: str (required)
                - speaker: str (required)
                - timestamp: datetime (optional)
                - confidence: float (optional)
                - language: str (optional)
            
        Returns:
            True if successful, False otherwise
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
        
        # Format inputs
        inputs = []
        for transcript in transcripts:
            input_data = {
                "interviewId": interview_id,
                "content": transcript["content"],
                "speaker": transcript["speaker"],
                "timestamp": transcript.get("timestamp", datetime.utcnow()).isoformat()
            }
            
            if "confidence" in transcript:
                input_data["confidence"] = transcript["confidence"]
            if "language" in transcript:
                input_data["language"] = transcript["language"]
            
            inputs.append(input_data)
        
        variables = {"inputs": inputs}
        
        result = self._execute_graphql(mutation, variables)
        
        if result and "createBulkTranscripts" in result:
            logger.info(f"Added {len(transcripts)} transcripts for interview {interview_id}")
            return True
        
        logger.error(f"Failed to add bulk transcripts for interview {interview_id}")
        return False
