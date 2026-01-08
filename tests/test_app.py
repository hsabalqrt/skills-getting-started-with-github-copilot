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
    
    # Ensure a clean state for this email/activity combination
    cleanup_response = client.delete(f"/activities/{activity}/unregister?email={test_email}")
    assert cleanup_response.status_code in (200, 404)

    # Signup should now succeed
    response = client.post(f"/activities/{activity}/signup?email={test_email}")
    assert response.status_code == 200

    # Signing up again should fail with 400 (duplicate)
    duplicate_response = client.post(f"/activities/{activity}/signup?email={test_email}")
    assert duplicate_response.status_code == 400

    # Unregister should now succeed
    response = client.delete(f"/activities/{activity}/unregister?email={test_email}")
    assert response.status_code == 200

    # Unregistering again should report not found
    not_found_response = client.delete(f"/activities/{activity}/unregister?email={test_email}")
    assert not_found_response.status_code == 404

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
