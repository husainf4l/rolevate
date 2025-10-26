"""
Utility functions for Rolevate Interview Agent
"""

import re
import logging
from typing import Optional

logger = logging.getLogger("rolevate-agent")

# Regular expression for parsing room names
ROOM_NAME_PATTERN = re.compile(r"interview-([0-9a-f-]+)(?:-\d+)?$")


def parse_application_id(room_name: str) -> Optional[str]:
    """
    Parse application ID from room name.
    
    The room name format is: interview-{uuid}-{optional-suffix}
    Example: interview-354046a3-44a5-48ee-9d84-6bd7c7b3455c-4
    
    This function extracts just the UUID portion without any trailing suffix.
    
    Args:
        room_name: The LiveKit room name
        
    Returns:
        The application ID (UUID) or None if parsing fails
    """
    # Split by hyphen
    room_parts = room_name.split("-")
    
    # UUID has 5 parts: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
    # In the room name, after "interview-", we need parts [1] through [5]
    if len(room_parts) >= 6 and room_parts[0] == "interview":
        # Join parts [1] through [5] to get the full UUID
        application_id = "-".join(room_parts[1:6])
        logger.info(f"Parsed application ID '{application_id}' from room '{room_name}'")
        return application_id
    
    logger.warning(f"Unable to parse application ID from room name: {room_name}")
    return None


def setup_logging(level: int = logging.INFO):
    """
    Setup logging configuration for the agent.
    
    Args:
        level: Logging level (default: INFO)
    """
    logging.basicConfig(
        level=level,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    
    # Set specific logger level
    logger = logging.getLogger("rolevate-agent")
    logger.setLevel(level)
