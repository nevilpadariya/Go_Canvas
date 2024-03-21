import { Button, IconButton, Menu, MenuItem, Popover } from "@mui/material";
import React from "react";
import { bessiecooper, companyLogo, darrellsteward, estherhoward, jennywilson, johnsmith, profileDropdown, robertfox } from "../assets/images";
import SearchBar from "./search";
import { messageIcon } from "../assets/images";
import { notificationIcon } from "../assets/images";
import { settingIcon } from "../assets/images";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { searchIcon } from "../assets/images";
import { menuIcon } from "../assets/images";

function Header() {
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const location = useLocation();
    const navigate = useNavigate();
    
    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };

    const [anchorEl2, setAnchorEl2] = React.useState<HTMLButtonElement | null>(null);
    const handleClick2 = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl2(event.currentTarget);
    };
    const handleClose2 = () => {
        setAnchorEl2(null);
    };

    const open2 = Boolean(anchorEl2);
    const id2 = open ? 'simple-popover' : undefined;
    return (<>
        <div className="header">
            <div className="header-section" style={{alignItems: 'center', justifyContent: "center"}}>
            {
                location.pathname != '/' && (<IconButton className="menu-btn" style={{left: 0, position: "absolute"}} onClick={e => { document.body.classList.toggle('sidebar-open'); document.body.classList.remove('search-open') }}><img src={menuIcon} alt="menu" /></IconButton>) 
            } 
            
                <a href="#">
                    <img src={companyLogo} alt="company" className="logo" />
                </a>
                <h2>Go-Canvas</h2>
                {
                    location.pathname != '/' && ( <Button variant="contained" color="info" style={{position: "absolute", right: "10px"}}
                    onClick={()=>{ navigate('/')}}>Log Out</Button>) 
                }
            </div>
        </div>
    </>
    );
}
export default Header;