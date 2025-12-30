import React from 'react'
import NavBar from "./NavBar";
import BannerImage from "../Assets/handsTogetherImageFromGoogle.jpeg";

import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import HandshakeIcon from '@mui/icons-material/Handshake';
import BusinessIcon from '@mui/icons-material/Business';

import { useNavigate } from 'react-router-dom';

const API_URL = process.env.REACT_APP_API_URL;

const Home = () => {
  const navigate = useNavigate();

    const handleVolunteer = () => {
      navigate('/opp-list');
    };

    const handleCreateEvent = () => {
      // create the event with post then navigate to that page

      // get the id of the organization
      const oid = 1;

      // Default values for a new event
      const title = "New Event";
      const description = null;
      const capacity = null;
      const date = null;
      const duration = null;
      const tags = null;
      const address = null;
      const longitude = 0.0;
      const latitude = 0.0;
      const image = null;

      fetch(`${API_URL}/api/orgs/${oid}/events`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          title,
          description,
          capacity,
          date,
          duration,
          tags,
          address,
          latitude,
          longitude,
          image
        })
      })
      .then(res => {
        if (!res.ok) throw new Error("Request failed");
        return res.json();
      })
      .then(result => {
        const eid = result.data.id;
        navigate(`/event/${eid}`); // indicate a successful creation
      })
      .catch(err => {
        alert("Error creating event");
        console.error("Error:", err);
      });
    };

    const handleOrgs = () => {
      navigate('/organizations');
    };

  return (
    <div className="home-container">
      <NavBar/>
        <hr></hr>
      <div className = "home-banner-container" >
        <div className = "home-bannerImage-container" >
            {/*No Background image for now<img src={BannerBackground} alt=""  anchor="left"/>*/}
            
        </div>

        <div className="home-text-section" >
            <h1 className="primary-heading" >
                Our Mission
            </h1>
            <p className="primary-text" >
We empower volunteers to discover meaningful opportunities with trusted organizations, offering the flexibility to engage on their own terms, on their own schedule.
            </p>
            <button className="secondary-button"  onClick={handleCreateEvent}>
                Create New Event <AddCircleOutlineIcon />
            </button>

            <p> <br></br></p>
            <button className="secondary-button" onClick={handleVolunteer}>
                Browse Opportunities <HandshakeIcon />
            </button>
            <p><br></br></p>
            <button className="secondary-button" onClick={handleOrgs}>
                Browse Companies <BusinessIcon />
            </button>
        </div>

        <div className="home-image-container" >
            <img src={BannerImage} alt=""></img>
        </div>
      </div>
    </div>
  )
}

export default Home
