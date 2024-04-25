import React from "react";
import { Helmet } from "react-helmet";
import Sidebar from "../../components/sidebar";
import Header from "../../components/header";
import DashboardCard from "../../components/dashboardcard";
import { Accordion, AccordionDetails, AccordionSummary } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

function CourseHomepage() {
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
        <Header></Header>
        <div className="main-background"></div>
        <div className="course-container">
          <main className="course-content">
            <div className="sidebar course-sidebar">
              <Sidebar></Sidebar>
            </div>
            <div className="main-content" style={{ display: "flex" }}>
              {/* <div className="sidebar-course">
                <CourseSidebar></CourseSidebar>
              </div> */}
              <div style={{ width: "100%", paddingLeft: "10px" }}>
                <div className="main-title">
                  <h5>Course</h5>
                  <h6>Go-Canvas</h6>
                </div>
                <div className="course-content-section">
                  <DashboardCard></DashboardCard>
                  <div className="content-dropdown">
                    <Accordion>
                      <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        aria-controls="panel1-content"
                        id="panel1-header"
                      >
                        Assignments
                      </AccordionSummary>
                      <AccordionDetails></AccordionDetails>
                    </Accordion>
                  </div>
                  <div className="content-dropdown">
                    <Accordion>
                      <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        aria-controls="panel1-content"
                        id="panel1-header"
                      >
                        Grades
                      </AccordionSummary>
                      <AccordionDetails></AccordionDetails>
                    </Accordion>
                  </div>
                  <div className="content-dropdown">
                    <Accordion>
                      <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        aria-controls="panel1-content"
                        id="panel1-header"
                      >
                        Quizzes
                      </AccordionSummary>
                      <AccordionDetails></AccordionDetails>
                    </Accordion>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}

export default CourseHomepage;
