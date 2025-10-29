"""
Custom exception hierarchy for the Rolevate Interview Agent.
Provides clear, specific exceptions for different error scenarios.
"""


class RolevateException(Exception):
    """Base exception for all Rolevate-specific errors."""
    
    def __init__(self, message: str, details: dict = None):
        self.message = message
        self.details = details or {}
        super().__init__(self.message)


class ConfigurationError(RolevateException):
    """Raised when configuration is invalid or missing."""
    pass


class ExternalServiceError(RolevateException):
    """Base exception for external service failures."""
    pass


class GraphQLError(ExternalServiceError):
    """Raised when GraphQL API requests fail."""
    pass


class LiveKitError(ExternalServiceError):
    """Raised when LiveKit operations fail."""
    pass


class AWSError(ExternalServiceError):
    """Raised when AWS S3 operations fail."""
    pass


class DataValidationError(RolevateException):
    """Raised when data validation fails."""
    pass


class ResourceNotFoundError(RolevateException):
    """Raised when a requested resource is not found."""
    pass


class RetryExhaustedError(ExternalServiceError):
    """Raised when all retry attempts have been exhausted."""
    pass


class TranscriptError(RolevateException):
    """Raised when transcript operations fail."""
    pass


class RecordingError(RolevateException):
    """Raised when recording operations fail."""
    pass


class InterviewError(RolevateException):
    """Raised when interview operations fail."""
    pass
