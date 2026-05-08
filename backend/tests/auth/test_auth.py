import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from main import app
from core.database import Base, get_db

SQLALCHEMY_DATABASE_URL = "sqlite:///./test_crypto.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

@pytest.fixture(scope="module")
def client():
    Base.metadata.create_all(bind=engine)
    with TestClient(app) as c:
        yield c
    Base.metadata.drop_all(bind=engine)

def test_signup_success(client):
    response = client.post(
        "/auth/signup",
        json={"username": "testuser", "email": "test@example.com", "password": "testpassword"}
    )
    assert response.status_code == 201
    assert response.json()["message"] == "User created successfully"

def test_signup_duplicate_email(client):
    response = client.post(
        "/auth/signup",
        json={"username": "testuser2", "email": "test@example.com", "password": "testpassword2"}
    )
    assert response.status_code == 400
    assert response.json()["detail"] == "Email already registered"

def test_login_success(client):
    response = client.post(
        "/auth/login",
        json={"email": "test@example.com", "password": "testpassword"}
    )
    assert response.status_code == 200
    assert "access_token" in response.json()
    assert response.json()["token_type"] == "bearer"

def test_login_account_not_exists(client):
    response = client.post(
        "/auth/login",
        json={"email": "notfound@example.com", "password": "testpassword"}
    )
    assert response.status_code == 404
    assert response.json()["detail"] == "Account doesn't exist. Please register"

def test_login_invalid_password(client):
    response = client.post(
        "/auth/login",
        json={"email": "test@example.com", "password": "wrongpassword"}
    )
    assert response.status_code == 401
    assert response.json()["detail"] == "Invalid Password. Please try again"
