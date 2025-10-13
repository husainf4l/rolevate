"""Test API endpoints."""
import pytest
from fastapi.testclient import TestClient

from src.api.main import app


client = TestClient(app)


def test_root_endpoint():
    """Test root endpoint."""
    response = client.get("/")
    assert response.status_code == 200
    assert "service" in response.json()


def test_health_check():
    """Test health check endpoint."""
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"


def test_list_templates():
    """Test templates listing endpoint."""
    response = client.get("/api/v1/templates")
    assert response.status_code == 200
    assert "templates" in response.json()


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
