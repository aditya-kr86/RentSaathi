from main import configure_waitlist_rate_limit, reset_waitlist_rate_limit_state


def test_waitlist_success(client):
    response = client.post("/api/waitlist", json={"email": "test1@example.com"})

    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "test1@example.com"
    assert "id" in data
    assert "created_at" in data


def test_waitlist_duplicate_email(client):
    first_response = client.post("/api/waitlist", json={"email": "duplicate@example.com"})
    second_response = client.post("/api/waitlist", json={"email": "duplicate@example.com"})

    assert first_response.status_code == 200
    assert second_response.status_code == 400
    assert second_response.json()["detail"] == "Email already registered on waitlist"


def test_waitlist_rate_limit(client):
    configure_waitlist_rate_limit(max_requests=2, window_seconds=60)
    reset_waitlist_rate_limit_state()

    response_1 = client.post("/api/waitlist", json={"email": "limit1@example.com"})
    response_2 = client.post("/api/waitlist", json={"email": "limit2@example.com"})
    response_3 = client.post("/api/waitlist", json={"email": "limit3@example.com"})

    assert response_1.status_code == 200
    assert response_2.status_code == 200
    assert response_3.status_code == 429
    assert response_3.json()["detail"] == "Too many waitlist requests. Please try again shortly."
