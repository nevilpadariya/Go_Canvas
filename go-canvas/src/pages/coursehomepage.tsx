import { Button, Grid, IconButton, TextField } from "@mui/material";
import React from "react";
import Header from "../components/header";
import Sidebar from "../components/sidebar";
import { Helmet } from "react-helmet";
import CourseSidebar from "../components/coursesidebar";
import TemporaryDrawer from "../components/drawer";
import { menuIcon } from "../assets/images";
import { useLocation, useNavigate } from "react-router-dom";


function CourseHomepage() {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const location = useLocation();
    const navigate = useNavigate();
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
          <div className="toggle-sidebar">
            <CourseSidebar></CourseSidebar>
            {/* <TemporaryDrawer></TemporaryDrawer> */}
            </div>
          <div className="main-content">
            <div className="main-title">
              
            <div className="header-section" style={{alignItems: 'center', justifyContent: "center"}}>
            {
                location.pathname != '/' && (<IconButton className="menu-btn" style={{left: 0, position: "absolute"}} onClick={e => { document.body.classList.toggle('toggle-open');}}><img src={menuIcon} alt="menu" /></IconButton>) 
            } </div>

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
