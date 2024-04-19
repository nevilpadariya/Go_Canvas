import { Grid, Select, SelectChangeEvent } from "@mui/material";
import React from "react";
import { Helmet } from "react-helmet";
import Header from "../components/header";
import Sidebar from "../components/sidebar";
import DashboardCard from "../components/dashboardcard";
import { orderscard, profitIcon, selectDropdown } from "../assets/images";
import Accordion from '@mui/material/Accordion';
import AccordionActions from '@mui/material/AccordionActions';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Button from '@mui/material/Button';

function DropdownArrow() {
  return <img className="dropdown-icon" src={selectDropdown} alt="downarrow" />;
}

function DashboardPage() {
  const [number, setNumber] = React.useState("");
  const handleChange = (event: SelectChangeEvent) => {
    setNumber(event.target.value as string);
  };
  return (
    <>
      <Helmet>
        <title>Go-Canvas</title>
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
        <main className="dashnoard-content">
          <div className="sidebar">
            <Sidebar></Sidebar>
          </div>
          <div className="main-content">
            <div className="main-title">
              <h5>Dashboard</h5>
              <h6>Go-Canvas</h6>
            </div>
            <Grid container spacing={3} className="grid-sections">
              <Grid
                item
                md={12}
                lg={12}
                spacing={3}
                container
                className="grid-section-1"
              >
                <Grid item sm={12} md={4} lg={4} className="courses-grid">
                  <DashboardCard></DashboardCard>
                </Grid>
                <Grid item sm={12} md={4} lg={4} className="courses-grid">
                  <DashboardCard></DashboardCard>
                </Grid>
              </Grid>
            </Grid>
            <div className="dashboard-dropdown">
            <Accordion>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel1-content"
          id="panel1-header"
        >
          Previous Semesters
        </AccordionSummary>
        <AccordionDetails>
        <Grid container spacing={3} className="grid-sections">
              <Grid
                item
                md={12}
                lg={12}
                spacing={3}
                container
                className="grid-section-1"
              >
                <Grid item sm={12} md={4} lg={4} className="courses-grid">
                  <DashboardCard></DashboardCard>
                </Grid>
                <Grid item sm={12} md={4} lg={4} className="courses-grid">
                  <DashboardCard></DashboardCard>
                </Grid>
              </Grid>
            </Grid>
        </AccordionDetails>
      </Accordion>
            </div>
          </div>
        </main>
      </div>
      {/* Dashboardpage-End */}
    </>
  );
}

export default DashboardPage;
