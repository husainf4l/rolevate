"""Tests for Pydantic models."""
import pytest
from datetime import datetime
from pydantic import ValidationError
from models import (
    CompanyInfo,
    JobInfo,
    CandidateInfo,
    ApplicationData,
    TranscriptEntry,
    CreateInterviewInput
)


class TestModels:
    """Test suite for Pydantic models."""
    
    def test_company_info_valid(self):
        """Test valid company info creation."""
        company = CompanyInfo(
            name="Test Company",
            description="A test company",
            phone="+1234567890",
            email="test@company.com"
        )
        assert company.name == "Test Company"
        assert company.email == "test@company.com"
    
    def test_company_info_minimal(self):
        """Test company info with only required fields."""
        company = CompanyInfo(name="Minimal Co")
        assert company.name == "Minimal Co"
        assert company.description is None
    
    def test_job_info_valid(self, mock_application_data):
        """Test valid job info creation."""
        job_data = mock_application_data["job"]
        job = JobInfo(**job_data)
        assert job.title == "Software Engineer"
        assert job.interview_language == "English"
        assert job.company.name == "Test Company"
    
    def test_candidate_info_valid(self):
        """Test valid candidate info."""
        candidate = CandidateInfo(id="test-123", name="John Doe")
        assert candidate.id == "test-123"
        assert candidate.name == "John Doe"
    
    def test_application_data_valid(self, mock_application_data):
        """Test valid application data."""
        app = ApplicationData(**mock_application_data)
        assert app.candidate.name == "Test Candidate"
        assert app.job.title == "Software Engineer"
        assert app.cv_analysis_results == "Strong technical background"
    
    def test_transcript_entry_valid(self):
        """Test valid transcript entry."""
        transcript = TranscriptEntry(
            interviewId="int-123",
            content="Hello world",
            speaker="Candidate",
            language="en"
        )
        assert transcript.interview_id == "int-123"
        assert transcript.content == "Hello world"
        assert transcript.speaker == "Candidate"
        assert transcript.language == "en"
    
    def test_transcript_entry_invalid_language(self):
        """Test transcript entry with invalid language code."""
        with pytest.raises(ValidationError):
            TranscriptEntry(
                interviewId="int-123",
                content="Test",
                speaker="Agent",
                language="invalid"
            )
    
    def test_transcript_entry_invalid_confidence(self):
        """Test transcript entry with invalid confidence."""
        with pytest.raises(ValidationError):
            TranscriptEntry(
                interviewId="int-123",
                content="Test",
                speaker="Agent",
                confidence=1.5  # Should be 0-1
            )
    
    def test_create_interview_input_valid(self):
        """Test valid interview input creation."""
        input_data = CreateInterviewInput(
            applicationId="app-123",
            interviewerId="int-456",
            type="VIDEO",
            status="SCHEDULED"
        )
        assert input_data.application_id == "app-123"
        assert input_data.type == "VIDEO"
    
    def test_create_interview_input_defaults(self):
        """Test interview input with default values."""
        input_data = CreateInterviewInput(
            applicationId="app-123",
            interviewerId="int-456"
        )
        assert input_data.type == "VIDEO"
        assert input_data.status == "SCHEDULED"
        assert isinstance(input_data.scheduled_at, datetime)
