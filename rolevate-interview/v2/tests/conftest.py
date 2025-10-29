"""Test configuration and fixtures."""
import pytest
import asyncio
from typing import Generator


@pytest.fixture(scope="session")
def event_loop() -> Generator:
    """Create an event loop for the test session."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest.fixture
def mock_application_data():
    """Mock application data for testing."""
    return {
        "candidate": {
            "id": "test-candidate-id",
            "name": "Test Candidate"
        },
        "cvAnalysisResults": "Strong technical background",
        "job": {
            "id": "test-job-id",
            "title": "Software Engineer",
            "salary": "$100k-$150k",
            "description": "Build amazing software",
            "interviewPrompt": "Ask about technical skills",
            "interviewLanguage": "English",
            "company": {
                "name": "Test Company",
                "description": "A great company",
                "phone": "+1234567890",
                "email": "hr@testcompany.com"
            }
        }
    }


@pytest.fixture
def mock_graphql_response_success():
    """Mock successful GraphQL response."""
    def _response(data):
        return {
            "data": data
        }
    return _response


@pytest.fixture
def mock_graphql_response_error():
    """Mock error GraphQL response."""
    def _response(errors):
        return {
            "errors": errors
        }
    return _response
