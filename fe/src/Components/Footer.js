import '../styles/Footer.css';
import { List, ListItem, ListItemButton } from "@mui/material";
import { Typography } from "@mui/material";
import { useNavigate } from 'react-router-dom';

function Footer() {
    const navigate = useNavigate();
    
    
    const sections = [
        {
            title: "Volunteer",
            items: [
                { name: "Browse Opportunites", link: "/opp-list" },
                { name: "Create Account", link: "/login" },
            ],
        },
        {
            title: "Organizations",
            items: [
                { name: "Browse Organizations", link: "/organizations" },
                { name: "Create Opportunity", link: "/create-event" },
                { name: "Create Account", link: "/login" },
            ],
        },
        {
            title: "Home",
            items: [
                { name: "Go Home", link: "/" },
                { name: "Login", link: "/login" },
                { name: "Dashboard", link: "/login" },
            ],
        },
        {
            title: "About us",
            items: [
                { name: "Our Mission", link: "/our-mission" },
                { name: "Contact Us", link: "/" },
            ],
        },
        ];


    return (
        <div className="footer-container">
            <div className="footer-grid">
                <div className="links"> 
                    <List className="section-list">
                        {sections.map((section) => (
                            <ListItem key={section.title} disablePadding className="link-list">
                                <Typography className="section-header">
                                    {section.title}
                                </Typography>
                            <List disablePadding>
                                {section.items.map((item) => (
                                <ListItem key={item.name} disablePadding>
                                    <ListItemButton component="a" onClick={() => navigate(item.link)}>
                                        <Typography className="section-item">
                                            {item.name}
                                        </Typography>
                                    </ListItemButton>
                                </ListItem>
                                ))}
                            </List>
                            </ListItem>
                        ))}
                    </List>
                </div>
                <div className="info flex"> Benevola.com </div>
            </div>
        </div>
    );
}



export default Footer;