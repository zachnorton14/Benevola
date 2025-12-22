import { Link } from 'react-router-dom';
import NavBar from "../Components/NavBar";
import '../App.css';
import HandshakeBanner from "../Assets/handshake-banner.jpg";
import React, { useState, useEffect } from 'react';
import { Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, } from "@mui/material";

import PlaceIcon from '@mui/icons-material/Place';
import FrequencyIcon from '@mui/icons-material/AccessTime';
import PeopleIcon from '@mui/icons-material/People';

/**
 * The User Feed Page
 * This page displays the opportunites relevant to the current user
 * Author: Owen Voorhees 
 */

function UserFeedPage() {
  /*const [items, setItems] = useState([]);
  //const [loading, setLoading] = useState(false);
  const [newItem, setNewItem] = useState({ name: '', description: '' });

  const handleAddItem = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newItem),
      });
      const addedItem = await response.json();
      
      // Add the new item to our local state
      setItems([...items, addedItem]);
      setNewItem({ name: '', description: '' });
    } catch (error) {
      console.error('Error adding item:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewItem(prev => ({
      ...prev,
      [name]: value
    }));
  };*/

  let feedOpportunities = [
    {
      image:"https://images.unsplash.com/photo-1615897570582-285ffe259530?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmb29kJTIwYmFuayUyMGNoYXJpdHl8ZW58MXx8fHwxNzY1NzQzNDk1fDA&ixlib=rb-4.1.0&q=80&w=1080",
      orgLogo: "https://cdn-icons-png.flaticon.com/512/8611/8611393.png",
      title:"Community Food Bank Assistant",
      organization:"City Food Bank",
      description:"Help sort and distribute food to families in need. Join our team...",
      tags:"Placeholder tags",
      location:"New York, NY",
      frequency:"Weekly",
      length:"3-4 hours",
      spots:"10",
      date:"11/17/2025",
      page:"placeholder1"
    },
    {
      image:"https://images.unsplash.com/photo-1758599667717-27c61bcdd14b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbnZpcm9ubWVudGFsJTIwY2xlYW51cCUyMHZvbHVudGVlcnN8ZW58MXx8fHwxNzY1ODI1NTc4fDA&ixlib=rb-4.1.0&q=80&w=1080",
      orgLogo: "https://cdn-icons-png.flaticon.com/512/8611/8611393.png",
      title:"Beach Cleanup Volunteer",
      organization:"Ocean Conservation Society",
      description:"Help clean our beaches Join our team...",
      tags:"Placeholder tags",
      location:"Wilmington, NC",
      frequency:"Weekly",
      length:"3 hours",
      spots:"30",
      date:"9/3/2025",
      page:"placeholder2"
    },
    {
      image:"https://plus.unsplash.com/premium_photo-1677567996070-68fa4181775a?q=80&w=1172&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      orgLogo: "https://yt3.googleusercontent.com/ytc/AIdro_lx0bC3sO3-n_bl9JlKGphcyQS-LYB4tzpz80iMMRBD2bs=s160-c-k-c0x00ffffff-no-rj",
      title:"Tutoring with David Sher",
      organization:"Youtube",
      description:"Help with teaching linked lists with David Sher",
      tags:"Placeholder tags",
      location:"Charolette, NC",
      frequency:"Monthly",
      length:"67 hours",
      spots:"1",
      date:"2/13/2023",
      page:"placeholder3"
    },
  ]

  return (
    /* Wraps everything with the correct size of margins*/
    <div className="App">
      {/* Creates the nav bar with a horizontal line for separation */}
      <NavBar/>
      <hr></hr>
      
      {/* Title of the feed page*/}
      <div className="user-feed-title-container">
        <div className="user-feed-title-text">
          Find volunteer opportunities, perfect for you.
        </div>
      </div>
      <div className="user-feed-title-container">
        <div className="user-feed-title-secondary-text">
          {/*Blank for now.. Your Personalized Feed */}
        </div>
      </div>
      
      {/* Display all of the feeds on the page */}
      <div className="user-feed-container">
        <List className="user-feed-list">
            {feedOpportunities.map((item) => (
                // Make a box around each post
                <div className="user-feed-singular-post-container">

                  {/* Now make the image at the top of each post */}
                  <div className="user-feed-SP-image-container">
                    <img className="user-feed-SP-image" src={item.image} alt={item.title}></img>
                  </div>

                  {/* Format the text section below the image to prevent overflow */}
                  <div className="user-feed-SP-title-container">
                    
                    {/* Use a blank section to create spacing in between the picture and text */}
                    <div className="user-feed-SP-title-margin"> </div>

                    {/* Display the Organization's logo, to left of the title */}
                    <div className="user-feed-org-logo-container">
                      <img className="user-feed-org-logo" src={item.orgLogo} alt={item.title}></img>
                    </div>

                    {/* Add the title text for this opportunity */}
                    <div className="user-feed-SP-title-text">
                      <div className="user-feed-SP-title-font"> {item.title}  </div>
                      <div className="user-feed-SP-org-font"> {item.organization} </div>
                      <div className="user-feed-SP-description-font">  {item.description} </div>

                
                      <div className="user-feed-SP-icon-info">
                        <PlaceIcon/> {item.location}
                      </div>

                      <div className="user-feed-SP-icon-info">
                        <FrequencyIcon/> {item.frequency} , {item.length}
                      </div>

                      <div className="user-feed-SP-icon-info">
                        <PeopleIcon/> {item.spots} volunteers needed
                      </div>

                    </div> 

                    <ListItem key={item.text}>
                        <ListItemButton className="user-feed-SP-RSVP-button">
                            <ListItemText className="user-feed-SP-RSVP-button" primary="Reserve Your Spot" />
                        </ListItemButton>
                    </ListItem>
                  </div>
                </div>
            ))}
        </List>
      </div>
    </div>
  );
}

export default UserFeedPage;