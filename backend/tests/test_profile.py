def test_create_and_fetch_profile(client):
    register = client.post(
        "/auth/register",
        json={"email": "profile@example.com", "password": "StrongPass1!"},
    )
    assert register.status_code == 200

    token = register.json()["access_token"]

    profile_payload = {
        "full_name": "Demo User",
        "age": 24,
        "gender": "Male",
        "location": "Bangalore",
        "budget_min": 12000,
        "budget_max": 25000,
        "smoking": "No",
        "alcohol": "No",
        "food_preference": "Non-Veg",
        "cooking": "No",
        "cleanliness_level": "High",
        "sleep_schedule": "Early",
        "employment_status": "Student",
        "work_type": "WFH",
        "working_hours": "Flexible",
        "preferred_gender": "Male",
        "preferred_occupation": "Working",
        "guests_allowed": "Yes",
        "noise_tolerance": "Medium",
        "dietary_restrictions": "",
        "personal_habits": "",
    }

    create = client.post(
        "/profile",
        headers={"Authorization": f"Bearer {token}"},
        json=profile_payload,
    )
    assert create.status_code == 200
    create_data = create.json()
    assert create_data["full_name"] == "Demo User"
    assert create_data["user_id"] == register.json()["user"]["id"]

    fetch = client.get(
        "/profile/me",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert fetch.status_code == 200
    fetch_data = fetch.json()
    assert fetch_data["location"] == "Bangalore"
    assert fetch_data["budget_max"] == 25000
