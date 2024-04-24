import React from "react";
import { Helmet } from "react-helmet";
import FacultySidebar from "../../components/facultysidebar";
import Header from "../../components/header";

function AddAnnouncement(){
return(<>
    <Helmet>
      <title>Announcements-Faculty</title>
    </Helmet>
    {/* Dashboardpage-Start */}
    <div className="wrapper">
      <div
        className="overlay"
        onClick={(e) => document.body.classList.toggle("sidebar-open")}
      ></div>
      <Header></Header>
      <div className="main-background"></div>
      <main className="dashnoard-content">
        <div className="sidebar">
          <FacultySidebar></FacultySidebar>
        </div>
        <div className="main-content">
          <div className="main-title">
            <h5>Announcements</h5>
            <h6>Go-Canvas</h6>
          </div>
          
        </div>
      </main>
    </div>
  </>)
}

export default AddAnnouncement;