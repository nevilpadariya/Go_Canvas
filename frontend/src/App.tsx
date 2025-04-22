import { createTheme, ThemeProvider } from "@mui/material";
import React from "react";
import "./App.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import LoginPage from "./pages/login";
import DashboardPage from "./pages/student/dashboard";
import AccountPage from "./pages/student//account";
import AdminDashboardPage from "./pages/admin//admindashboard";
import FacultyDashnboard from "./pages/faculty/facultydashboard";
import AddAssignment from "./pages/faculty/facultyassignment";
import AddGrades from "./pages/faculty/facultygrades";
import AddQuiz from "./pages/faculty/facultyquiz";
import AddAnnouncement from "./pages/faculty/faculyannouncement";
import AssignCourse from "./pages/admin/assigncourse";
import AddSyllabus from "./pages/faculty/facultysyllabus";
import StudentList from "./pages/admin/students";
import Course from "./pages/student/course";
import CourseFaculty from "./pages/faculty/facultycourse";
import CourseStudentList from "./pages/faculty/facultystudentlist";
import ProtectedRoute from "./ProtectedRoutes";
import UnauthorizedAccess from "./pages/access";

function App() {
  const theme = createTheme({
    palette: {
      primary: {
        main: "#75CA67",
      },
      secondary: {
        main: "#999999",
      },
    },
    breakpoints: {
      values: {
        xs: 0,
        sm: 575,
        md: 767,
        lg: 991,
        xl: 1199,
      },
    },
    spacing: 8,
    typography: {
      fontFamily: ["Fira Sans", "sans-serif"].join(","),
    },
  });
  return (
    <ThemeProvider theme={theme}>
      <BrowserRouter>
        <Routes>
          <Route
            path="dashboard"
            element={
              <ProtectedRoute role="student">
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          {/* </Route> */}
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
            // role="student"
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
          <Route path="/" element={<LoginPage />}></Route>
          <Route path="student_list" element={<ProtectedRoute role="admin"><StudentList /></ProtectedRoute>}></Route>
          <Route path="error" element={<UnauthorizedAccess />}></Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
