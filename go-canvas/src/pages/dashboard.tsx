import { Button, FormControl, Grid, MenuItem, Select, SelectChangeEvent } from "@mui/material";
import React from "react";
import { Helmet } from "react-helmet";
import Header from "../components/header";
import Sidebar from "../components/sidebar";
import { orderscard, profitIcon, selectDropdown } from "../assets/images";
import CustomTable from "../components/table";


function DropdownArrow() {
    return (
        <img className="dropdown-icon" src={selectDropdown} alt="downarrow" />
    );
}

function DashboardPage() {

    const [number, setNumber] = React.useState('');
    const handleChange = (event: SelectChangeEvent) => {
        setNumber(event.target.value as string);
    };
    return (
        <>
            <Helmet>
                <title>Go Canvas</title>
            </Helmet>
        {/* Dashboardpage-Start */}
            <div className="wrapper">
                <div className="overlay" onClick={e => document.body.classList.toggle('sidebar-open')}></div>
                <div className="search-overlay" onClick={e => document.body.classList.toggle('search-open')}></div>
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
                            <Grid item md={12} lg={12} spacing={3} container className="grid-section-1">
        {/* Dashboardpage-Two-Cards-Start */}
                                <Grid item sm={12} md={6} lg={6} className="order-grid">
                                    <div className="card order-card">
                                        <div className="sellings">
                                            <div className="selling-icon">
                                                <img src={orderscard} alt="order" />
                                            </div>
                                            <div className="selling-details">
                                                <h3>Course</h3>
                                                <p>Python</p>
                                            </div>
                                            {/* <span className="selilng-pl">+20</span> */}
                                        </div>
                                    </div>
                                </Grid>
                                <Grid item sm={12} md={6} lg={6} className="profit-grid">
                                    <div className="card profit-card">
                                        <div className="sellings">
                                            <div className="selling-icon">
                                                <img src={profitIcon} alt="profit" />
                                            </div>
                                            <div className="selling-details">
                                                <h3>Course</h3>
                                                <p>java</p>
                                            </div>
                                            {/* <span className="selilng-pl">+$ 840,00</span> */}
                                        </div>
                                    </div>
                                </Grid>
                            </Grid>
                        </Grid>
                    </div>
                </main>
            </div>
        {/* Dashboardpage-End */}
        </>
    );
}

export default DashboardPage;