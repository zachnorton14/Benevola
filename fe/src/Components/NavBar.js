import React, {useState } from "react";
import Logo from "../Assets/benevolaLogoRectangleVerticalSpacing.png";
import { BsCart2 } from "react-icons/bs";
import {HiOutlineBars3} from "react-icons/hi2";
import { Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, } from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import InfoIcon from "@mui/icons-material/Info";
import HandshakeIcon from '@mui/icons-material/Handshake';
import BusinessIcon from '@mui/icons-material/Business';
import AccountBoxIcon from '@mui/icons-material/AccountBox';
import { useNavigate } from 'react-router-dom';

const NavBar = () => {
    const navigate = useNavigate();

    const handleVolunteer = () => {
      navigate('/opp-list');
    };

    const handleHome = () => {
      navigate('/');
    };

    const [openMenu, setOpenMenu] = useState(false);
    const menuOptions = [
        {
            text:"Home",
            icon:<HomeIcon/>
        },
        {
            text:"Our Mission",
            icon:<InfoIcon/>
        },
        {
            text:"Opportunities",
            icon:<HandshakeIcon/>
        },
        {
            text:"Companies",
            icon:<BusinessIcon/>
        },
        {
            text:"My Profile",
            icon:<AccountBoxIcon/>
        },
    ];

  return (
    <nav>
      <div className="nav-logo-container">
        <img src={Logo} alt="Benevola Logo" onClick={handleHome}/>
      </div>
      <div className="navbar-links-container" >
        <a href="" onClick={handleHome}>Home</a>
        <a href="">Our Mission</a>
        <a href="">Companies</a>
        <a href="">My Profile</a>
        <button className="primary-button" onClick={handleVolunteer}> Volunteer </button>
      </div>
      <div className="navbar-menu-container" >
        <HiOutlineBars3 onClick={() => setOpenMenu(true)} />
      </div>
      <Drawer 
        open ={openMenu}
        onClose={() => setOpenMenu(false)} 
        anchor="right" >
        <Box 
            sx= {{width:250}}
            role="presentation"
            onClick={() => setOpenMenu(false)} 
            onKeyDown={() => setOpenMenu(false)}    
        >
            <List>
                {menuOptions.map((item) => (
                    <ListItem key={item.text} disablePadding>
                        <ListItemButton>
                            <ListItemIcon> {item.icon} </ListItemIcon>
                            <ListItemText primary={item.text} />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>
        </Box>
      </Drawer>
    </nav>

  )
};

export default NavBar;

