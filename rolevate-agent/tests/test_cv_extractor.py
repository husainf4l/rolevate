"""Test CV extraction functionality."""
import pytest
from pathlib import Path

from src.services.cv_extractor import CVExtractor
from src.models.cv_schema import CVData


@pytest.mark.asyncio
async def test_extract_from_text():
    """Test extraction from plain text."""
    extractor = CVExtractor()
    
    cv_text = """
    John Doe
    Senior Software Engineer
    Email: john.doe@example.com
    Phone: +1-234-567-8900
    
    Professional Summary:
    Experienced software engineer with 8+ years of building scalable web applications.
    
    Experience:
    Senior Software Engineer at Tech Corp
    2020 - Present
    - Led team of 5 engineers
    - Improved performance by 40%
    
    Education:
    Bachelor of Science in Computer Science
    MIT, 2012-2016
    
    Skills: Python, JavaScript, React, AWS, Docker
    """
    
    cv_data = await extractor.extract_from_text(cv_text)
    
    assert isinstance(cv_data, CVData)
    assert cv_data.full_name == "John Doe"
    assert cv_data.contact.email is not None


@pytest.mark.asyncio
async def test_extract_from_json():
    """Test extraction from JSON."""
    extractor = CVExtractor()
    
    json_data = {
        "full_name": "Jane Smith",
        "job_title": "Data Scientist",
        "contact": {
            "email": "jane@example.com"
        },
        "skills": ["Python", "Machine Learning", "TensorFlow"]
    }
    
    import json
    import tempfile
    
    with tempfile.NamedTemporaryFile(mode='w', suffix='.json', delete=False) as f:
        json.dump(json_data, f)
        temp_path = f.name
    
    try:
        cv_data = await extractor.extract_from_file(temp_path)
        assert cv_data.full_name == "Jane Smith"
        assert "Python" in cv_data.skills
    finally:
        Path(temp_path).unlink()


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
