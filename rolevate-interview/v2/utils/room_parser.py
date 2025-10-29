"""
Room name parser utility with validation.
Handles parsing and validation of LiveKit room names.
"""

import re
from typing import Optional
from exceptions import DataValidationError


# Expected room name format: interview-{uuid}-{timestamp}
ROOM_NAME_PATTERN = re.compile(
    r'^interview-([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})-\d+$'
)

# Fallback pattern for non-standard UUIDs (without hyphens)
FALLBACK_PATTERN = re.compile(
    r'^interview-(.+?)-\d+$'
)


def parse_application_id_from_room(room_name: str) -> str:
    """
    Extract application_id from LiveKit room name with validation.
    
    Args:
        room_name: Room name in format interview-{application_id}-{timestamp}
        
    Returns:
        Application ID extracted from room name
        
    Raises:
        DataValidationError: If room name format is invalid
        
    Examples:
        >>> parse_application_id_from_room("interview-abc123-456-def-789-xyz-1234567890")
        "abc123-456-def-789-xyz"
    """
    if not room_name or not room_name.strip():
        raise DataValidationError(
            "room_name cannot be empty",
            details={"room_name": room_name}
        )
    
    # Try standard UUID pattern first
    match = ROOM_NAME_PATTERN.match(room_name)
    if match:
        return match.group(1)
    
    # Try fallback pattern (for non-standard format)
    # Format: interview-{application_id}-{suffix}
    parts = room_name.split('-')
    if len(parts) >= 3 and parts[0] == 'interview':
        # Take everything between 'interview-' and the last '-{timestamp}'
        application_id = '-'.join(parts[1:-1])
        if application_id:
            return application_id
    
    raise DataValidationError(
        f"Invalid room name format. Expected: interview-{{application_id}}-{{timestamp}}",
        details={"room_name": room_name}
    )


def validate_room_name(room_name: str) -> bool:
    """
    Validate room name format without raising exceptions.
    
    Args:
        room_name: Room name to validate
        
    Returns:
        True if valid, False otherwise
    """
    try:
        parse_application_id_from_room(room_name)
        return True
    except DataValidationError:
        return False
