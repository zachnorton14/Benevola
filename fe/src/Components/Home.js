import React from 'react'
import NavBar from "./NavBar";
import BannerImage from "../Assets/handsTogetherImageFromGoogle.jpeg";

import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import HandshakeIcon from '@mui/icons-material/Handshake';
import BusinessIcon from '@mui/icons-material/Business';

import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();

    const handleVolunteer = () => {
      navigate('/opp-list');
    };

    const handleCreateEvent = () => {
      navigate('/create-event');
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
                Register Event <AddCircleOutlineIcon />
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
