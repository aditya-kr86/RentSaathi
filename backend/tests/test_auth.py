from main import configure_login_rate_limit, reset_login_rate_limit_state


def test_register_success(client):
    response = client.post(
        "/auth/register",
        json={"email": "newuser@example.com", "password": "StrongPass1!"},
    )

    assert response.status_code == 200
    data = response.json()
    assert data["token_type"] == "bearer"
    assert data["access_token"]
    assert data["refresh_token"]
    assert data["user"]["email"] == "newuser@example.com"


def test_register_duplicate_email(client):
    first = client.post(
        "/auth/register",
        json={"email": "duplicate@example.com", "password": "StrongPass1!"},
    )
    second = client.post(
        "/auth/register",
        json={"email": "duplicate@example.com", "password": "StrongPass1!"},
    )

    assert first.status_code == 200
    assert second.status_code == 400
    assert second.json()["detail"] == "Email is already registered"


def test_login_success_and_protected_route(client):
    register = client.post(
        "/auth/register",
        json={"email": "login@example.com", "password": "StrongPass1!"},
    )
    assert register.status_code == 200

    login = client.post(
        "/auth/login",
        json={"email": "login@example.com", "password": "StrongPass1!"},
    )
    assert login.status_code == 200
    token = login.json()["access_token"]

    me = client.get("/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me.status_code == 200
    assert me.json()["email"] == "login@example.com"


def test_login_rate_limit(client):
    client.post(
        "/auth/register",
        json={"email": "ratelimit@example.com", "password": "StrongPass1!"},
    )

    configure_login_rate_limit(max_requests=2, window_seconds=60)
    reset_login_rate_limit_state()

    response_1 = client.post(
        "/auth/login",
        json={"email": "ratelimit@example.com", "password": "wrong-password"},
    )
    response_2 = client.post(
        "/auth/login",
        json={"email": "ratelimit@example.com", "password": "wrong-password"},
    )
    response_3 = client.post(
        "/auth/login",
        json={"email": "ratelimit@example.com", "password": "wrong-password"},
    )

    assert response_1.status_code == 401
    assert response_2.status_code == 401
    assert response_3.status_code == 429
    assert response_3.json()["detail"] == "Too many login attempts. Please try again shortly."


def test_refresh_token(client):
    register = client.post(
        "/auth/register",
        json={"email": "refresh@example.com", "password": "StrongPass1!"},
    )
    assert register.status_code == 200

    refresh_token = register.json()["refresh_token"]
    refresh = client.post("/auth/refresh", json={"refresh_token": refresh_token})

    assert refresh.status_code == 200
    payload = refresh.json()
    assert payload["token_type"] == "bearer"
    assert payload["access_token"]
    assert payload["refresh_token"]
