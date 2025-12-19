import React from 'react'
import NavBar from "./NavBar";
//import BannerBackground from "../Assets/benevolaHomeBackgroundV1.png";
import BannerImage from "../Assets/handsTogetherImageFromGoogle.jpeg";
import {FiArrowRight } from "react-icons/fi";

const Home = () => {
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
            <button className="secondary-button">
                Manage My Schedule <FiArrowRight />
            </button>

            <p> <br></br></p>
            <button className="secondary-button">
                Browse Opportunies <FiArrowRight />
            </button>
            <p><br></br></p>
            <button className="secondary-button">
                Browse Organizations <FiArrowRight />
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
