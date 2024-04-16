import { Button, Grid, TextField } from "@mui/material";
import React from "react";
import Header from "../components/header";
import Sidebar from "../components/sidebar";
import { Helmet } from "react-helmet";
import CourseSidebar from "../components/coursesidebar";

function CourseHomepage() {
  return (
    <>
      <Helmet>
        <title>Course</title>
      </Helmet>
      {/* Dashboardpage-Start */}
      <div className="wrapper">
        <div
          className="overlay"
          onClick={(e) => document.body.classList.toggle("sidebar-open")}
        ></div>
        <div
          className="search-overlay"
          onClick={(e) => document.body.classList.toggle("search-open")}
        ></div>
        <Header></Header>
        <div className="main-background"></div>
        <main className="course-content">
          <div className="sidebar course-sidebar">
            <Sidebar></Sidebar>
          </div>
          <div><CourseSidebar></CourseSidebar></div>
          <div className="main-content">
            <div className="main-title">
              <h5>Course</h5>
              <h6>Go-Canvas</h6>
            </div>
          </div>
        </main>
      </div>
      {/* Dashboardpage-End */}
    </>
  );
}

export default CourseHomepage;
