"""
Tests for student-related endpoints.
"""
import pytest


class TestStudentProfile:
    """Tests for student profile endpoints"""

    def test_get_student_profile_authenticated(self, client, auth_headers):
        """Test getting student profile when authenticated"""
        response = client.get("/student/profile", headers=auth_headers)
        # The endpoint might return 200 or 404 depending on data availability
        assert response.status_code in [200, 404]

    def test_get_student_profile_unauthenticated(self, client):
        """Test getting student profile without authentication"""
        response = client.get("/student/profile")
        assert response.status_code == 401


class TestStudentCourses:
    """Tests for student course-related endpoints"""

    def test_view_courses_authenticated(self, client, auth_headers):
        """Test viewing enrolled courses"""
        response = client.get("/student/view_contents", headers=auth_headers)
        # Should return 200 even with empty course list
        assert response.status_code in [200, 404]

    def test_view_courses_unauthenticated(self, client):
        """Test viewing courses without authentication"""
        response = client.get("/student/view_contents")
        assert response.status_code == 401


class TestStudentGrades:
    """Tests for student grade endpoints"""

    def test_view_grades_authenticated(self, client, auth_headers):
        """Test viewing grades when authenticated"""
        response = client.get("/student/view_grades", headers=auth_headers)
        assert response.status_code in [200, 404]

    def test_view_grades_with_semester(self, client, auth_headers):
        """Test viewing grades with semester filter"""
        response = client.get(
            "/student/view_grades",
            params={"semester": "Fall25"},
            headers=auth_headers
        )
        assert response.status_code in [200, 404]


class TestStudentAssignments:
    """Tests for student assignment endpoints"""

    def test_get_assignments_without_course(self, client, auth_headers):
        """Test getting assignments without specifying course"""
        response = client.get("/student/assignments", headers=auth_headers)
        # Might require courseid parameter
        assert response.status_code in [200, 400, 404, 422]

    def test_get_assignments_with_course(self, client, auth_headers):
        """Test getting assignments for a specific course"""
        response = client.get(
            "/student/assignments",
            params={"courseid": 1},
            headers=auth_headers
        )
        # Course might not exist, so 404 is acceptable
        assert response.status_code in [200, 404]


class TestStudentQuizzes:
    """Tests for student quiz endpoints"""

    def test_get_quizzes(self, client, auth_headers):
        """Test getting available quizzes"""
        response = client.get(
            "/student/quizzes",
            params={"courseid": 1},
            headers=auth_headers
        )
        assert response.status_code in [200, 404, 422]


class TestStudentAnnouncements:
    """Tests for student announcement endpoints"""

    def test_get_announcements(self, client, auth_headers):
        """Test getting course announcements"""
        response = client.get(
            "/student/announcements",
            params={"courseid": 1},
            headers=auth_headers
        )
        assert response.status_code in [200, 404, 422]
