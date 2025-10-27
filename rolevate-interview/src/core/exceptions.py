"""
Exception hierarchy for the interview system
Custom exceptions for better error handling and debugging
"""

from typing import Optional


class RolevateError(Exception):
    """Base exception for all Rolevate errors"""
    pass


class ConfigurationError(RolevateError):
    """Raised when configuration is invalid or missing"""
    pass


class APIError(RolevateError):
    """Base exception for API-related errors"""
    pass


class APIConnectionError(APIError):
    """Raised when unable to connect to API"""
    pass


class APIResponseError(APIError):
    """Raised when API returns an error response"""
    
    def __init__(self, message: str, status_code: Optional[int] = None):
        super().__init__(message)
        self.status_code = status_code


class APITimeoutError(APIError):
    """Raised when API request times out"""
    pass


class ValidationError(RolevateError):
    """Raised when data validation fails"""
    pass


class SessionError(RolevateError):
    """Raised when session management fails"""
    pass
