import { createTheme, ThemeProvider } from '@mui/material';
import React from 'react';
import './App.css';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import LoginPage from './pages/login';
import DashboardPage from './pages/dashboard';
import AccountPage from './pages/account';
import CoursesPage from './pages/courses';
import CourseHomepage from './pages/coursehomepage';
import Test from './pages/test';
import AdminDashboardPage from './pages/admindashboard';

function App() {
  const theme = createTheme({
    palette: {
      primary: {
        main: "#75CA67"
      },
      secondary: {
        main: "#999999"
      },
    },
    breakpoints: {
      values: {
        xs: 0,
        sm: 575,
        md: 767,
        lg: 991,
        xl: 1199,
      }
    },
    spacing: 8,
    typography: {
      fontFamily: [
        'Fira Sans', 'sans-serif',
      ].join(','),
    },
  });
  return (
    <ThemeProvider theme={theme}>
      <BrowserRouter>
        <Routes>
          <Route path="dashboard" element={<DashboardPage />}></Route>
          <Route path="courses" element={<CoursesPage />}></Route>
          <Route path="account" element={<AccountPage />}></Route>
          <Route path="courseshome" element={<CourseHomepage />}></Route>
          <Route path="test" element={<Test />}></Route>
          <Route path="dashadmin" element={<AdminDashboardPage />}></Route>
          <Route path="/" element={<LoginPage />}></Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
