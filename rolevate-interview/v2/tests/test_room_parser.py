"""Tests for room name parser utility."""
import pytest
from utils.room_parser import parse_application_id_from_room, validate_room_name
from exceptions import DataValidationError


class TestRoomParser:
    """Test suite for room name parsing."""
    
    def test_parse_valid_uuid_format(self):
        """Test parsing room name with standard UUID format."""
        room_name = "interview-abc12345-1234-5678-9abc-def123456789-1234567890"
        result = parse_application_id_from_room(room_name)
        assert result == "abc12345-1234-5678-9abc-def123456789"
    
    def test_parse_non_uuid_format(self):
        """Test parsing room name with non-standard format."""
        room_name = "interview-app123-456-def-789-1234567890"
        result = parse_application_id_from_room(room_name)
        assert result == "app123-456-def-789"
    
    def test_parse_simple_format(self):
        """Test parsing simple room name format."""
        room_name = "interview-simple-id-123456"
        result = parse_application_id_from_room(room_name)
        assert result == "simple-id"
    
    def test_parse_empty_room_name(self):
        """Test parsing empty room name raises error."""
        with pytest.raises(DataValidationError) as exc_info:
            parse_application_id_from_room("")
        assert "cannot be empty" in str(exc_info.value)
    
    def test_parse_invalid_format_missing_parts(self):
        """Test parsing room name with insufficient parts."""
        with pytest.raises(DataValidationError) as exc_info:
            parse_application_id_from_room("interview-123")
        assert "Invalid room name format" in str(exc_info.value)
    
    def test_parse_invalid_format_wrong_prefix(self):
        """Test parsing room name with wrong prefix."""
        with pytest.raises(DataValidationError) as exc_info:
            parse_application_id_from_room("meeting-app-123-456")
        assert "Invalid room name format" in str(exc_info.value)
    
    def test_validate_valid_room_name(self):
        """Test validation of valid room name."""
        assert validate_room_name("interview-app-id-123456") is True
    
    def test_validate_invalid_room_name(self):
        """Test validation of invalid room name."""
        assert validate_room_name("invalid-format") is False
    
    def test_validate_empty_room_name(self):
        """Test validation of empty room name."""
        assert validate_room_name("") is False
