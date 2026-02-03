"""
Tests for authentication endpoints (signup, login, password reset).
"""
import pytest


class TestSignup:
    """Tests for the signup endpoint"""

    def test_signup_student_success(self, client, sample_student_data):
        """Test successful student signup"""
        response = client.post("/signup", json=sample_student_data)
        assert response.status_code == 200
        data = response.json()
        assert data["message"] == "Account created successfully"
        assert data["userrole"] == "Student"
        assert data["useremail"] == sample_student_data["Useremail"]
        assert data["id_type"] == "Student_id"
        assert data["assigned_id"] is not None

    def test_signup_faculty_success(self, client, sample_faculty_data):
        """Test successful faculty signup"""
        response = client.post("/signup", json=sample_faculty_data)
        assert response.status_code == 200
        data = response.json()
        assert data["message"] == "Account created successfully"
        assert data["userrole"] == "Faculty"
        assert data["id_type"] == "Faculty_id"

    def test_signup_duplicate_email(self, client, sample_student_data):
        """Test that duplicate email registration fails"""
        # First signup
        response1 = client.post("/signup", json=sample_student_data)
        assert response1.status_code == 200

        # Second signup with same email
        response2 = client.post("/signup", json=sample_student_data)
        assert response2.status_code == 400
        assert "already registered" in response2.json()["detail"].lower()

    def test_signup_missing_fields(self, client):
        """Test signup with missing required fields"""
        incomplete_data = {
            "Userfirstname": "John",
            "Useremail": "incomplete@test.com"
            # Missing other required fields
        }
        response = client.post("/signup", json=incomplete_data)
        assert response.status_code == 422  # Validation error


class TestLogin:
    """Tests for the login endpoint"""

    def test_login_success_with_email(self, client, registered_student):
        """Test successful login with email"""
        if not registered_student["signup_response"]:
            pytest.skip("Student registration failed")

        response = client.post(
            "/token",
            data={
                "username": registered_student["signup_data"]["Useremail"],
                "password": registered_student["signup_data"]["Userpassword"],
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "Bearer"

    def test_login_success_with_id(self, client, registered_student):
        """Test successful login with student ID"""
        if not registered_student["signup_response"]:
            pytest.skip("Student registration failed")

        student_id = registered_student["signup_response"]["assigned_id"]
        response = client.post(
            "/token",
            data={
                "username": str(student_id),
                "password": registered_student["signup_data"]["Userpassword"],
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data

    def test_login_wrong_password(self, client, registered_student):
        """Test login with wrong password"""
        if not registered_student["signup_response"]:
            pytest.skip("Student registration failed")

        response = client.post(
            "/token",
            data={
                "username": registered_student["signup_data"]["Useremail"],
                "password": "wrongpassword",
            }
        )
        assert response.status_code == 401

    def test_login_nonexistent_user(self, client):
        """Test login with non-existent user"""
        response = client.post(
            "/token",
            data={
                "username": "nonexistent@test.com",
                "password": "anypassword",
            }
        )
        assert response.status_code == 401


class TestPasswordReset:
    """Tests for password reset endpoints"""

    def test_forgot_password_existing_email(self, client, registered_student):
        """Test forgot password request for existing user"""
        if not registered_student["signup_response"]:
            pytest.skip("Student registration failed")

        response = client.post(
            "/forgot-password",
            json={"email": registered_student["signup_data"]["Useremail"]}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        # Message should not reveal if email exists
        assert "if an account exists" in data["message"].lower()

    def test_forgot_password_nonexistent_email(self, client):
        """Test forgot password request for non-existent email"""
        response = client.post(
            "/forgot-password",
            json={"email": "nonexistent@test.com"}
        )
        # Should still return 200 to prevent email enumeration
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True

    def test_verify_reset_token_invalid(self, client):
        """Test verifying an invalid reset token"""
        response = client.post(
            "/verify-reset-token",
            json={"token": "invalid-token-12345"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["valid"] is False

    def test_reset_password_invalid_token(self, client):
        """Test reset password with invalid token"""
        response = client.post(
            "/reset-password",
            json={
                "token": "invalid-token-12345",
                "new_password": "newpassword123"
            }
        )
        assert response.status_code == 400


class TestRootEndpoint:
    """Tests for the root API endpoint"""

    def test_root_endpoint(self, client):
        """Test that root endpoint returns API status"""
        response = client.get("/")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "ok"
        assert "Go Canvas" in data["message"]
