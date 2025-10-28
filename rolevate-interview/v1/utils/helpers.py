"""
Utility functions for the interview system
Helper functions for common operations
"""

import re
import logging
from typing import Optional

logger = logging.getLogger(__name__)

# UUID regex pattern
UUID_PATTERN = re.compile(
    r"[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}",
    re.IGNORECASE
)


def parse_application_id(room_name: str) -> Optional[str]:
    """
    Extract application ID (UUID) from LiveKit room name
    
    Expected format: interview-{uuid}-{optional-suffix}
    Example: interview-354046a3-44a5-48ee-9d84-6bd7c7b3455c-4
    
    Args:
        room_name: The LiveKit room name
        
    Returns:
        The application ID (UUID) or None if not found
    """
    # Try to find UUID pattern in room name
    match = UUID_PATTERN.search(room_name)
    
    if match:
        application_id = match.group(0)
        logger.info(f"Extracted application ID: {application_id} from room: {room_name}")
        return application_id
    
    logger.warning(f"Could not extract application ID from room name: {room_name}")
    return None


def format_duration(seconds: float) -> str:
    """
    Format duration in seconds to human-readable string
    
    Args:
        seconds: Duration in seconds
        
    Returns:
        Formatted duration string (e.g., "1h 23m 45s")
    """
    hours = int(seconds // 3600)
    minutes = int((seconds % 3600) // 60)
    secs = int(seconds % 60)
    
    parts = []
    if hours > 0:
        parts.append(f"{hours}h")
    if minutes > 0:
        parts.append(f"{minutes}m")
    if secs > 0 or not parts:
        parts.append(f"{secs}s")
    
    return " ".join(parts)


def sanitize_room_name(name: str) -> str:
    """
    Sanitize room name for safe usage
    
    Args:
        name: Raw room name
        
    Returns:
        Sanitized room name
    """
    # Remove or replace unsafe characters
    sanitized = re.sub(r'[^\w\-]', '-', name)
    # Remove multiple consecutive dashes
    sanitized = re.sub(r'-+', '-', sanitized)
    # Remove leading/trailing dashes
    sanitized = sanitized.strip('-')
    
    return sanitized.lower()
