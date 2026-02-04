"""
Pytest configuration and fixtures for Go Canvas API tests.
"""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

# Import the app and database dependencies
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from main import app
from alphagocanvas.database.models import Base
from alphagocanvas.database import database_dependency as get_db

# Create an in-memory SQLite database for testing
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db():
    """Override database dependency for testing"""
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()


@pytest.fixture(scope="function")
def test_db():
    """Create a fresh database for each test"""
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def client(test_db):
    """Create a test client with the test database"""
    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture
def sample_student_data():
    """Sample student signup data"""
    return {
        "Userfirstname": "John",
        "Userlastname": "Doe",
        "Useremail": "john.doe@test.com",
        "Userpassword": "testpassword123",
        "Userrole": "Student"
    }


@pytest.fixture
def sample_faculty_data():
    """Sample faculty signup data"""
    return {
        "Userfirstname": "Jane",
        "Userlastname": "Smith",
        "Useremail": "jane.smith@test.com",
        "Userpassword": "facultypass123",
        "Userrole": "Faculty"
    }


@pytest.fixture
def registered_student(client, sample_student_data):
    """Create and return a registered student"""
    response = client.post("/signup", json=sample_student_data)
    return {
        "signup_data": sample_student_data,
        "signup_response": response.json() if response.status_code == 200 else None
    }


@pytest.fixture
def registered_faculty(client, sample_faculty_data):
    """Create and return a registered faculty member"""
    response = client.post("/signup", json=sample_faculty_data)
    return {
        "signup_data": sample_faculty_data,
        "signup_response": response.json() if response.status_code == 200 else None
    }


@pytest.fixture
def student_token(client, registered_student):
    """Get authentication token for a student"""
    if not registered_student["signup_response"]:
        pytest.skip("Student registration failed")

    response = client.post(
        "/token",
        data={
            "username": registered_student["signup_data"]["Useremail"],
            "password": registered_student["signup_data"]["Userpassword"],
        }
    )
    if response.status_code == 200:
        return response.json()["access_token"]
    return None


@pytest.fixture
def faculty_token(client, registered_faculty):
    """Get authentication token for a faculty member"""
    if not registered_faculty["signup_response"]:
        pytest.skip("Faculty registration failed")

    response = client.post(
        "/token",
        data={
            "username": registered_faculty["signup_data"]["Useremail"],
            "password": registered_faculty["signup_data"]["Userpassword"],
        }
    )
    if response.status_code == 200:
        return response.json()["access_token"]
    return None


@pytest.fixture
def auth_headers(student_token):
    """Get authorization headers for a student"""
    if not student_token:
        pytest.skip("No student token available")
    return {"Authorization": f"Bearer {student_token}"}


@pytest.fixture
def faculty_auth_headers(faculty_token):
    """Get authorization headers for a faculty member"""
    if not faculty_token:
        pytest.skip("No faculty token available")
    return {"Authorization": f"Bearer {faculty_token}"}
