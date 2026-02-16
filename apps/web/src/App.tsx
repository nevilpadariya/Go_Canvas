import React, { Suspense, lazy } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { SidebarProvider } from "@/context/SidebarContext";
import ProtectedRoute from "./ProtectedRoutes";

const LandingPage = lazy(() => import("./pages/landing"));
const SignupPage = lazy(() => import("./pages/signup"));
const ForgotPasswordPage = lazy(() => import("./pages/forgot-password"));
const ResetPasswordPage = lazy(() => import("./pages/reset-password"));
const DashboardPage = lazy(() => import("./pages/student/dashboard"));
const AccountPage = lazy(() => import("./pages/student/account"));
const StudentAssignments = lazy(() => import("./pages/student/assignments"));
const AssignmentDetail = lazy(() => import("./pages/student/assignment-detail"));
const TakeQuiz = lazy(() => import("./pages/student/take-quiz"));
const StudentGrades = lazy(() => import("./pages/student/grades"));
const StudentModules = lazy(() => import("./pages/student/modules"));
const StudentDiscussions = lazy(() => import("./pages/student/discussions"));
const StudentCalendar = lazy(() => import("./pages/student/calendar"));
const StudentInbox = lazy(() => import("./pages/student/inbox"));
const AdminDashboardPage = lazy(() => import("./pages/admin/admindashboard"));
const FacultyDashnboard = lazy(() => import("./pages/faculty/facultydashboard"));
const AddAssignment = lazy(() => import("./pages/faculty/facultyassignment"));
const AddGrades = lazy(() => import("./pages/faculty/facultygrades"));
const FacultyGradebook = lazy(() => import("./pages/faculty/facultygradebook"));
const FacultySpeedGrader = lazy(() => import("./pages/faculty/facultyspeedgrader"));
const AddQuiz = lazy(() => import("./pages/faculty/facultyquiz"));
const AddAnnouncement = lazy(() => import("./pages/faculty/faculyannouncement"));
const AssignCourse = lazy(() => import("./pages/admin/assigncourse"));
const AddSyllabus = lazy(() => import("./pages/faculty/facultysyllabus"));
const StudentList = lazy(() => import("./pages/admin/students"));
const AdminUsersPage = lazy(() => import("./pages/admin/users"));
const Course = lazy(() => import("./pages/student/course"));
const CourseFaculty = lazy(() => import("./pages/faculty/facultycourse"));
const CourseStudentList = lazy(() => import("./pages/faculty/facultystudentlist"));
const UnauthorizedAccess = lazy(() => import("./pages/access"));

function App() {
  return (
    <BrowserRouter>
      <SidebarProvider>
        <Suspense
          fallback={
            <div className="min-h-screen flex items-center justify-center text-muted-foreground">
              Loading...
            </div>
          }
        >
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
          path="/student/modules"
          element={
            <ProtectedRoute role="student">
              <StudentModules />
            </ProtectedRoute>
          }
        ></Route>
        <Route
          path="/student/modules/:courseid"
          element={
            <ProtectedRoute role="student">
              <StudentModules />
            </ProtectedRoute>
          }
        ></Route>
        <Route
          path="/student/discussions"
          element={
            <ProtectedRoute role="student">
              <StudentDiscussions />
            </ProtectedRoute>
          }
        ></Route>
        <Route
          path="/student/discussions/:courseid"
          element={
            <ProtectedRoute role="student">
              <StudentDiscussions />
            </ProtectedRoute>
          }
        ></Route>
        <Route
          path="/student/calendar"
          element={
            <ProtectedRoute role="student">
              <StudentCalendar />
            </ProtectedRoute>
          }
        ></Route>
        <Route
          path="/student/inbox"
          element={
            <ProtectedRoute role="student">
              <StudentInbox />
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
          path="faculty_speedgrader/:courseid"
          element={
            <ProtectedRoute role="faculty">
              <FacultySpeedGrader />
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
        <Route path="/login" element={<LandingPage />}></Route> {/* Redirect to landing page */}
        <Route path="/signup" element={<SignupPage />}></Route>
        <Route path="/forgot-password" element={<ForgotPasswordPage />}></Route>
        <Route path="/reset-password" element={<ResetPasswordPage />}></Route>
        <Route path="student_list" element={<ProtectedRoute role="admin"><StudentList /></ProtectedRoute>}></Route>
        <Route path="users_list" element={<ProtectedRoute role="admin"><AdminUsersPage /></ProtectedRoute>}></Route>
        <Route path="error" element={<UnauthorizedAccess />}></Route>
      </Routes>
      </Suspense>
      </SidebarProvider>
    </BrowserRouter>
  );
}

export default App;
