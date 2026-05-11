import React, {useState } from "react";
import Logo from "../Assets/benevolaLogoRectangleVerticalSpacing.png";
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

    const handleMission = () => {
      navigate('/our-mission');
    };

    const handleProfile = () => {
      navigate('/my-profile');
    };

    const handleOrgs = () => {
      navigate('/organizations');
    };

    const [openMenu, setOpenMenu] = useState(false);
    const menuOptions = [
        {
            text:"Home",
            icon:<HomeIcon/>,
            link:handleHome
        },
        {
            text:"Our Mission",
            icon:<InfoIcon/>,
            link:handleMission
        },
        {
            text:"Opportunities",
            icon:<HandshakeIcon/>,
            link:handleVolunteer
        },
        {
            text:"Companies",
            icon:<BusinessIcon/>,
            link:handleOrgs
        },
        {
            text:"My Profile",
            icon:<AccountBoxIcon/>,
            link:handleProfile
        },
    ];

  return (
    <nav>
      <div className="nav-logo-container">
        <img src={Logo} alt="Benevola Logo" onClick={handleHome}/>
      </div>
      <div className="navbar-links-container" >
        <a href="/" onClick={handleHome}>Home</a>
        <a href="/our-mission" onClick={handleMission}>Our Mission</a>
        <a href="/opp-list" onClick={handleVolunteer}>Opportunities</a>
        <a href="/organizations" onClick={handleOrgs}>Companies</a>
        <button className="primary-button" onClick={handleProfile}> My Profile </button>
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
                        <ListItemButton onClick={item.link}>
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

