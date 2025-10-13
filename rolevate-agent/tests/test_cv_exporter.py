"""Test CV export functionality."""
import pytest
from pathlib import Path

from src.services.cv_exporter import CVExporter
from src.models.cv_schema import CVData, ContactInfo, Experience


@pytest.fixture
def sample_cv_data():
    """Create sample CV data for testing."""
    return CVData(
        full_name="Test User",
        job_title="Software Engineer",
        contact=ContactInfo(
            email="test@example.com",
            phone="+1-234-567-8900",
            location="San Francisco, CA"
        ),
        summary="Experienced software engineer with focus on backend development.",
        experience=[
            Experience(
                job_title="Senior Engineer",
                company="Tech Company",
                start_date="2020-01",
                end_date="Present",
                is_current=True,
                achievements=[
                    "Built scalable microservices",
                    "Improved system performance"
                ]
            )
        ],
        skills=["Python", "FastAPI", "Docker", "AWS"]
    )


@pytest.mark.asyncio
async def test_export_to_pdf(sample_cv_data):
    """Test PDF export."""
    exporter = CVExporter()
    
    output_path = await exporter.export_to_pdf(
        cv_data=sample_cv_data,
        template_name="modern"
    )
    
    assert output_path.exists()
    assert output_path.suffix == '.pdf'
    
    # Cleanup
    output_path.unlink()


@pytest.mark.asyncio
async def test_export_to_docx(sample_cv_data):
    """Test DOCX export."""
    exporter = CVExporter()
    
    output_path = await exporter.export_to_docx(
        cv_data=sample_cv_data,
        template_name="modern"
    )
    
    assert output_path.exists()
    assert output_path.suffix == '.docx'
    
    # Cleanup
    output_path.unlink()


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
