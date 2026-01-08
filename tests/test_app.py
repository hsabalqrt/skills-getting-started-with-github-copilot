import pytest
from fastapi.testclient import TestClient
from src.app import app

client = TestClient(app)

def test_get_activities():
    response = client.get("/activities")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, dict)
    assert "Chess Club" in data

def test_signup_and_unregister():
    # Use a unique email to avoid conflicts
    test_email = "testuser@mergington.edu"
    activity = "Chess Club"
    # Signup
    response = client.post(f"/activities/{activity}/signup?email={test_email}")
    assert response.status_code == 200 or response.status_code == 400
    # Unregister
    response = client.delete(f"/activities/{activity}/unregister?email={test_email}")
    assert response.status_code == 200 or response.status_code == 404

def test_signup_duplicate():
    activity = "Chess Club"
    email = "michael@mergington.edu"  # Already registered
    response = client.post(f"/activities/{activity}/signup?email={email}")
    assert response.status_code == 400
    assert "already signed up" in response.json()["detail"]

def test_unregister_not_found():
    activity = "Chess Club"
    email = "notfound@mergington.edu"
    response = client.delete(f"/activities/{activity}/unregister?email={email}")
    assert response.status_code == 404
    assert "Participant not found" in response.json()["detail"]

def test_unregister_invalid_email_format():
    """Test that unregister endpoint rejects invalid email formats"""
    activity = "Chess Club"
    
    # Test various invalid email formats
    invalid_emails = [
        "invalidemail",           # Missing @ and domain
        "invalid@",               # Missing domain
        "@invalid.com",           # Missing local part
        "invalid@.com",           # Missing domain name
        "invalid@domain",         # Missing TLD
        "invalid @domain.com",    # Space in email
        "invalid@domain .com",    # Space in domain
    ]
    
    for email in invalid_emails:
        response = client.delete(f"/activities/{activity}/unregister?email={email}")
        assert response.status_code == 400, f"Expected 400 for email: {email}"
        assert "Invalid email format" in response.json()["detail"], f"Expected 'Invalid email format' error for email: {email}"

