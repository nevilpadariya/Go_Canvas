import React from "react";
import { Helmet } from "react-helmet";
import Sidebar from "../components/sidebar";
import CourseSidebar from "../components/coursesidebar";
import Header from "../components/header";
import DashboardCard from "../components/dashboardcard";

function Test() {
  return (
    <>
      <Helmet>
        <title>Test</title>
      </Helmet>
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
        <div className="course-container">
          <main className="course-content">
            <div className="sidebar course-sidebar">
              <Sidebar></Sidebar>
            </div>
            <div className="main-content">
              <div className="sidebar-course">
                <CourseSidebar></CourseSidebar>
              </div>
              <div>
                <div className="main-title">
                  <h5>Course</h5>
                  <h6>Go-Canvas</h6>
                </div>
                <div>
                  <DashboardCard></DashboardCard>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}

export default Test;
