"""Tests for custom exceptions."""
import pytest
from exceptions import (
    RolevateException,
    ConfigurationError,
    GraphQLError,
    LiveKitError,
    DataValidationError
)


class TestExceptions:
    """Test suite for custom exceptions."""
    
    def test_rolevate_exception_basic(self):
        """Test basic RolevateException."""
        exc = RolevateException("Test error")
        assert exc.message == "Test error"
        assert exc.details == {}
        assert str(exc) == "Test error"
    
    def test_rolevate_exception_with_details(self):
        """Test RolevateException with details."""
        details = {"key": "value", "code": 123}
        exc = RolevateException("Test error", details=details)
        assert exc.message == "Test error"
        assert exc.details == details
    
    def test_configuration_error(self):
        """Test ConfigurationError is RolevateException."""
        exc = ConfigurationError("Config missing")
        assert isinstance(exc, RolevateException)
        assert exc.message == "Config missing"
    
    def test_graphql_error(self):
        """Test GraphQLError with details."""
        errors = [{"message": "Field not found"}]
        exc = GraphQLError("Query failed", details={"errors": errors})
        assert exc.message == "Query failed"
        assert exc.details["errors"] == errors
    
    def test_livekit_error(self):
        """Test LiveKitError."""
        exc = LiveKitError("Recording failed")
        assert isinstance(exc, RolevateException)
    
    def test_data_validation_error(self):
        """Test DataValidationError."""
        exc = DataValidationError("Invalid data", details={"field": "email"})
        assert exc.message == "Invalid data"
        assert exc.details["field"] == "email"
