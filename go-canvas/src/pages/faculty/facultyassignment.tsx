import React from "react";
import FacultySidebar from "../../components/facultysidebar";
import Header from "../../components/header";
import { Helmet } from "react-helmet";

function AddAssignment(){
return(
<>
    <Helmet>
      <title>Dashboard-Faculty</title>
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
            <h5>Assignments</h5>
            <h6>Go-Canvas</h6>
          </div>
          
        </div>
      </main>
    </div>
  </>
)}

export default AddAssignment;