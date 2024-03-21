import React from "react";
import { NavLink } from "react-router-dom";
import { dashboardIcon, sidebarSetting, ratesIcon, ordersIcon, marketingIcon, reportsIcon, productsIcon, dashboardactive, ordersactive, ratesactive, productsactive, sidebarsettingactive, reportsactive, marketingactive, johnsmithside } from "../assets/images";


function Sidebar(){
    return(
        <>
        <div className="profile">
        <div className="profile-img">
            <img src={johnsmithside} alt="john-smith" />
        </div>
        <h6>John Smith</h6>
        </div>
        <nav className="navbar">
            <ul>
            <li><NavLink className="nav-link" onClick={e => document.body.classList.remove('sidebar-open')} to={"/dashboard"} title="Dashboard"> <img src={dashboardIcon} alt="dashboard" className="default-icon" /><img src={dashboardactive} alt="dashboard" className="active-icon" /> Dashboard</NavLink></li>
            <li><NavLink className="nav-link" onClick={e => document.body.classList.remove('sidebar-open')} to={"/courses"} title="Courses"> <img src={ordersIcon} alt="courses" className="default-icon" /><img src={ordersactive} alt="courses" className="active-icon" /> Courses</NavLink></li>
            <li><NavLink className="nav-link" onClick={e => document.body.classList.remove('sidebar-open')} to={"/account"} title="Account"> <img src={productsIcon} alt="account" className="default-icon" /><img src={productsactive} alt="account" className="active-icon" /> Account</NavLink></li>
            {/* <li><NavLink className="nav-link" onClick={e => document.body.classList.remove('sidebar-open')} to={"/marketing"} title="Marketing"> <img src={marketingIcon} alt="marketing" className="default-icon" /><img src={marketingactive} alt="marketing" className="active-icon" /> Marketing</NavLink></li>
            <li><NavLink className="nav-link" onClick={e => document.body.classList.remove('sidebar-open')} to={"/rates"} title="Rates"> <img src={ratesIcon} alt="rates" className="default-icon" /><img src={ratesactive} alt="rates" className="active-icon" /> Rates</NavLink></li>
            <li><NavLink className="nav-link" onClick={e => document.body.classList.remove('sidebar-open')} to={"/report"} title="Reports"> <img src={reportsIcon} alt="reports" className="default-icon" /><img src={reportsactive} alt="reports" className="active-icon" /> Reports</NavLink></li>
            <li><NavLink className="nav-link" onClick={e => document.body.classList.remove('sidebar-open')} to={"/settings"} title="Settings"> <img src={sidebarSetting} alt="settingss" className="default-icon" /><img src={sidebarsettingactive} alt="settings" className="active-icon" /> Settings</NavLink></li> */}
            </ul>
        </nav>
        </>
    )
}
export default Sidebar;