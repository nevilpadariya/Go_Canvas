import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { SidebarProvider } from "@/context/SidebarContext";
import LandingPage from "./pages/landing";
import LoginPage from "./pages/login";
import SignupPage from "./pages/signup";
import DashboardPage from "./pages/student/dashboard";
import AccountPage from "./pages/student/account";
import StudentAssignments from "./pages/student/assignments";
import AssignmentDetail from "./pages/student/assignment-detail";
import TakeQuiz from "./pages/student/take-quiz";
import StudentGrades from "./pages/student/grades";
import AdminDashboardPage from "./pages/admin/admindashboard";
import FacultyDashnboard from "./pages/faculty/facultydashboard";
import AddAssignment from "./pages/faculty/facultyassignment";
import AddGrades from "./pages/faculty/facultygrades";
import FacultyGradebook from "./pages/faculty/facultygradebook";
import AddQuiz from "./pages/faculty/facultyquiz";
import AddAnnouncement from "./pages/faculty/faculyannouncement";
import AssignCourse from "./pages/admin/assigncourse";
import AddSyllabus from "./pages/faculty/facultysyllabus";
import StudentList from "./pages/admin/students";
import AdminUsersPage from "./pages/admin/users";
import Course from "./pages/student/course";
import CourseFaculty from "./pages/faculty/facultycourse";
import CourseStudentList from "./pages/faculty/facultystudentlist";
import ProtectedRoute from "./ProtectedRoutes";
import UnauthorizedAccess from "./pages/access";

function App() {
  return (
    <BrowserRouter>
      <SidebarProvider>
        <Routes>
        <Route
          path="dashboard"
          element={
            <ProtectedRoute role="student">
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="account"
          element={
            <ProtectedRoute role="student">
              <AccountPage />
            </ProtectedRoute>
          }
        ></Route>
        <Route
          path="course"
          element={
            <ProtectedRoute role="student">
              <Course />
            </ProtectedRoute>
          }
        ></Route>
        <Route
          path="/course/:courseid"
          element={
            <ProtectedRoute role="student">
              <Course />
            </ProtectedRoute>
          }
        ></Route>
        <Route
          path="/student/assignments"
          element={
            <ProtectedRoute role="student">
              <StudentAssignments />
            </ProtectedRoute>
          }
        ></Route>
        <Route
          path="/student/assignment/:assignmentId"
          element={
            <ProtectedRoute role="student">
              <AssignmentDetail />
            </ProtectedRoute>
          }
        ></Route>
        <Route
          path="/student/quiz/:quizId"
          element={
            <ProtectedRoute role="student">
              <TakeQuiz />
            </ProtectedRoute>
          }
        ></Route>
        <Route
          path="/student/grades"
          element={
            <ProtectedRoute role="student">
              <StudentGrades />
            </ProtectedRoute>
          }
        ></Route>
        <Route
          path="admin_dashboard"
          element={
            <ProtectedRoute role="admin">
              <AdminDashboardPage />
            </ProtectedRoute>
          }
        ></Route>
        <Route
          path="faculty_dashboard"
          element={
            <ProtectedRoute role="faculty">
              <FacultyDashnboard />
            </ProtectedRoute>
          }
        ></Route>
        <Route
          path="coursefaculty/:courseid"
          element={
            <ProtectedRoute role="faculty">
              <CourseFaculty />
            </ProtectedRoute>
          }
        ></Route>
        <Route
          path="faculty_assignment/:courseid"
          element={
            <ProtectedRoute role="faculty">
              <AddAssignment />
            </ProtectedRoute>
          }
        ></Route>
        <Route
          path="faculty_syllabus/:courseid"
          element={
            <ProtectedRoute role="faculty">
              <AddSyllabus />
            </ProtectedRoute>
          }
        ></Route>
        <Route
          path="students/:courseid"
          element={
            <ProtectedRoute role="faculty">
              <CourseStudentList />
            </ProtectedRoute>
          }
        ></Route>
        <Route
          path="faculty_announcement/:courseid"
          element={
            <ProtectedRoute role="faculty">
              <AddAnnouncement />
            </ProtectedRoute>
          }
        ></Route>
        <Route
          path="faculty_quiz/:courseid"
          element={
            <ProtectedRoute role="faculty">
              <AddQuiz />
            </ProtectedRoute>
          }
        ></Route>
        <Route
          path="faculty_gradebook/:courseid"
          element={
            <ProtectedRoute role="faculty">
              <FacultyGradebook />
            </ProtectedRoute>
          }
        ></Route>
        <Route
          path="faculty_grades/:courseid"
          element={
            <ProtectedRoute role="faculty">
              <AddGrades />
            </ProtectedRoute>
          }
        ></Route>
        <Route
          path="assign_course"
          element={
            <ProtectedRoute role="admin">
              <AssignCourse />
            </ProtectedRoute>
          }
        ></Route>
        <Route path="/" element={<LandingPage />}></Route>
        <Route path="/login" element={<LoginPage />}></Route>
        <Route path="/signup" element={<SignupPage />}></Route>
        <Route path="student_list" element={<ProtectedRoute role="admin"><StudentList /></ProtectedRoute>}></Route>
        <Route path="users_list" element={<ProtectedRoute role="admin"><AdminUsersPage /></ProtectedRoute>}></Route>
        <Route path="error" element={<UnauthorizedAccess />}></Route>
      </Routes>
      </SidebarProvider>
    </BrowserRouter>
  );
}

export default App;
