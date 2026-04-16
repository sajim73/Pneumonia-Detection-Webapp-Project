from models.user import User


def test_register_patient_success(client, app):
    response = client.post(
        "/auth/register",
        json={
            "name": "Sajim Ahmed",
            "email": "sajim@example.com",
            "password": "12345678",
            "role": "patient",
        },
    )

    assert response.status_code == 201
    data = response.get_json()
    assert data["message"] == "Registration successful"
    assert "token" in data
    assert data["user"]["email"] == "sajim@example.com"
    assert data["user"]["role"] == "patient"

    with app.app_context():
        user = User.query.filter_by(email="sajim@example.com").first()
        assert user is not None
        assert user.name == "Sajim Ahmed"


def test_register_admin_success(client):
    response = client.post(
        "/auth/register",
        json={
            "name": "System Admin",
            "email": "sysadmin@example.com",
            "password": "12345678",
            "role": "admin",
            "admin_key": "team-admin-key",
        },
    )

    assert response.status_code == 201
    data = response.get_json()
    assert data["user"]["role"] == "admin"


def test_register_admin_with_wrong_key_fails(client):
    response = client.post(
        "/auth/register",
        json={
            "name": "Fake Admin",
            "email": "fakeadmin@example.com",
            "password": "12345678",
            "role": "admin",
            "admin_key": "wrong-key",
        },
    )

    assert response.status_code == 403
    data = response.get_json()
    assert "Invalid admin registration key" in data["error"]


def test_register_duplicate_email_fails(client, patient_user):
    response = client.post(
        "/auth/register",
        json={
            "name": "Another User",
            "email": "patient@example.com",
            "password": "12345678",
            "role": "patient",
        },
    )

    assert response.status_code == 409
    data = response.get_json()
    assert "already registered" in data["error"]


def test_login_success(client, patient_user):
    response = client.post(
        "/auth/login",
        json={"email": "patient@example.com", "password": "password123"},
    )

    assert response.status_code == 200
    data = response.get_json()
    assert data["message"] == "Login successful"
    assert "token" in data
    assert data["user"]["email"] == "patient@example.com"


def test_login_invalid_password(client, patient_user):
    response = client.post(
        "/auth/login",
        json={"email": "patient@example.com", "password": "wrongpass"},
    )

    assert response.status_code == 401
    data = response.get_json()
    assert "Invalid email or password" in data["error"]


def test_login_missing_fields(client):
    response = client.post("/auth/login", json={"email": ""})

    assert response.status_code == 400
    data = response.get_json()
    assert "Email and password are required" in data["error"]


def test_me_requires_token(client):
    response = client.get("/auth/me")

    assert response.status_code == 401
    data = response.get_json()
    assert "Authorization token is missing" in data["error"]


def test_me_returns_current_user(client, patient_headers):
    response = client.get("/auth/me", headers=patient_headers)

    assert response.status_code == 200
    data = response.get_json()
    assert data["user"]["email"] == "patient@example.com"
    assert data["user"]["role"] == "patient"
