import React, {useState } from "react";
import Logo from "../Assets/benevolaLogoRectangleVerticalSpacing.png";
import {HiOutlineBars3} from "react-icons/hi2";
import { Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Button } from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import InfoIcon from "@mui/icons-material/Info";
import HandshakeIcon from '@mui/icons-material/Handshake';
import BusinessIcon from '@mui/icons-material/Business';
import AccountBoxIcon from '@mui/icons-material/AccountBox';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import LoginIcon from '@mui/icons-material/Login';
import { useNavigate } from 'react-router-dom';

const NavBar = () => {
    const navigate = useNavigate();

    const handleVolunteer = () => {
      navigate('/opp-list');
    };

    const handleRegister = () => {
      navigate('/prototype/register/user');
    };

    const handleLogin = () => {
      navigate('/prototype/login/user');
    };

    const handleHome = () => {
      navigate('/');
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
            action: handleHome
        },
        {
            text:"Our Mission",
            icon:<InfoIcon/>,
            action: handleHome
        },
        {
            text:"Companies",
            icon:<BusinessIcon/>,
            action: handleOrgs
        },
        {
            text:"My Profile",
            icon:<AccountBoxIcon/>,
            action: handleProfile
        },
        {
            text:"Login (Prototype)",
            icon:<LoginIcon/>,
            action: handleLogin
        },
        {
            text:"Register (Prototype)",
            icon:<PersonAddIcon/>,
            action: handleRegister
        },
    ];

  return (
    <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 20px' }}>
      <div className="nav-logo-container" style={{ cursor: 'pointer' }}>
        <img src={Logo} alt="Benevola Logo" onClick={handleHome} style={{ height: '50px' }}/>
      </div>
      
      <div className="navbar-links-container" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <a href="/" onClick={handleHome}>Home</a>
        <a href="/organizations" onClick={handleOrgs}>Companies</a>
        <a href="/my-profile" onClick={handleProfile}>My Profile</a>
        
        {/* Prototype Section Separator */}
        <div style={{ width: '1px', height: '20px', backgroundColor: '#ccc', margin: '0 10px' }}></div>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button size="small" variant="outlined" onClick={handleLogin} startIcon={<LoginIcon />}>
            Login
          </Button>
          <Button size="small" variant="outlined" onClick={handleRegister} startIcon={<PersonAddIcon />}>
            Register
          </Button>
        </Box>

        <button className="primary-button" onClick={handleVolunteer} style={{ marginLeft: '10px' }}> 
          Volunteer 
        </button>
      </div>

      <div className="navbar-menu-container">
        <HiOutlineBars3 onClick={() => setOpenMenu(true)} style={{ fontSize: '30px', cursor: 'pointer' }} />
      </div>

      <Drawer 
        open={openMenu}
        onClose={() => setOpenMenu(false)} 
        anchor="right"
      >
        <Box 
            sx= {{width:250}}
            role="presentation"
            onClick={() => setOpenMenu(false)} 
            onKeyDown={() => setOpenMenu(false)}    
        >
            <List>
                {menuOptions.map((item) => (
                    <ListItem key={item.text} disablePadding>
                        <ListItemButton onClick={item.action}>
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

