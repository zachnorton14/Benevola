import '../styles/App.css';
import '../styles/LandingPage.css';
import { useNavigate } from 'react-router-dom';

import NavBar from "../Components/NavBar";
import Footer from "../Components/Footer";
import ArrowButton from "../Components/ArrowButton";

// icons
import companyIcon from "../Assets/icons/company.svg";
import volunteerIcon from "../Assets/icons/volunteer.svg";


function LandingPage() {
  const navigate = useNavigate();

  // Used for taking users to making an org account
  const handleNewOrgAcc = () => {
    navigate('/login');
  };

  // Used for taking users to making an volunteer account
  const handleNewVolAcc = () => {
    navigate('/login');
  };

  // Used for taking users to about us
  const handleAboutUs = () => {
    navigate('/our-mission');
  };

  // Used for taking users to browse Orgs
  const handleBrowseOrgsButton = () => {
    navigate('/organizations');
  };
  
  // Used for taking users to browse Opportunities
  const handleBrowseEventsButton = () => {
    navigate('/opp-list');
  };

  // Takes organizations to the create event page
  const handleCreateButton = () => {
    navigate('/create-event');
  };


  return (
    <div>
      <head>
        <title> Benevola Landing page</title>
      </head>

      <div className="landing-navbar">
        <NavBar/>
        <hr></hr>
      </div>

      <div className="main-grid">
        {/* Section 1 Container, title and side images*/}
        <div className="section-1 s1-layout">
          <div className="s1-left"> 
            <div className="section-1-images-con flex">
              <div className="section-1-image flex"> <img src="https://images.unsplash.com/photo-1578357078586-491adf1aa5ba?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8dm9sdW50ZWVyfGVufDB8fDB8fHww" alt="handshake"></img> </div>
              <div className="section-1-image flex"> <img src="https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="a heart made with hands"></img> </div>
            </div>
          </div>

          <div className="s1-main"> 
            <div className="section-1-text-con">

              <h1>
                Volunteer work that <br></br> fits  you — without the endless searching.
              </h1>

              <div className="section-1-desc-and-button-con flex">
                <p>
                  Your next volunteer opportunity is closer than you think. 
                  <br></br> Benevola helps volunteers quickly connect with organizations that are ready to work.
                  <br></br>
                  <b className="section-1-desc-highlight"> No noise. Just opportunities that matter. </b>
                </p> 
                <br></br>

                <div className="flex">
                  <ArrowButton
                    title="Browse Opportunties"
                    event={handleBrowseEventsButton}
                    size="large"
                    color="default"/>
                </div>
              </div>
            </div>
          </div>

          <div className="s1-right"> 
            <div className="section-1-images-con flex">
              <div className="section-1-image flex"> <img src="https://images.unsplash.com/photo-1618477460930-d8bffff64172?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="trash pickup"></img> </div>
              <div className="section-1-image flex"> <img src="https://images.unsplash.com/photo-1612691997195-c11c53dc6aa0?q=80&w=1074&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="grandma"></img> </div>
            </div>
          </div>
        </div>

        {/** Section 2 */}
        <div className="section-2"> 
          <div className="s2-blur-box">
            <h1> Are you an organization in need of volunteers? </h1>
            
            <p className="s2-desc">
              Post opportunities, reach motivated volunteers, 
              and manage sign-ups in one place. 
              Benevola helps organizations connect with people who want 
              to make an impact — without the overhead. 
            </p>

            <div className="button-1 flex"> 
              <ArrowButton
                    title="Post a Volunteer Opportunity"
                    event={handleCreateButton}
                    size="large"
                    color="default"/>
            </div>
          </div>
        </div>

        {/** Section 3 */}
        <div className="section-3 s3-layout"> 
          <div className="s3-get-started s3-con"> 
            <h1> New to Benevola? </h1>

            <p className="dark-desc">
              Benevola links volunteers with trusted organizations.
              <br></br>
              Choose Volunteer to find opportunities, or Organization to post and manage volunteer events.
            
            </p>
            <div className="button-1 flex">
              <ArrowButton
                    title="I'm an Organization"
                    event={handleNewOrgAcc}
                    size="medium"
                    color="default"/>
            </div>
            <div className="button-2 flex">
              <ArrowButton
                    title="I'm a Volunteer"
                    event={handleNewVolAcc}
                    size="medium"
                    color="default"/>
            </div>
            
            </div>
          <div className="s3-learn-more s3-con flex">
            <p className="dark-desc">
              Learn why Benevola exists, what drives our mission, and how we're building a simpler way for people and organizations to do good — together.
            </p>
            <div className="button-1 flex">
              <br></br>
              <ArrowButton
                    title="About us"
                    event={handleAboutUs}
                    size="large"
                    color="default"/>
            </div>
          </div>
          <div className="s3-events s3-con s3-con-small"> 
            <div className="s3-small-icon-con flex">
              <img className="s3-small-icon" src={volunteerIcon} alt="icon"/>
            </div>
            <div className="button-1 flex"> 
              <ArrowButton
                    title="Opportunities"
                    event={handleBrowseEventsButton}
                    size="medium"
                    color="black"/>
            </div>
          </div>
          <div className="s3-orgs s3-con s3-con-small"> 
            <div className="s3-small-icon-con flex">
              <img className="s3-small-icon" src={companyIcon} alt="icon"/>
            </div>
            <div className="button-1 flex"> 
              <ArrowButton
                    title="Organizations"
                    event={handleBrowseOrgsButton}
                    size="medium"
                    color="black"/>
            </div>
          </div>
        </div>

        
        
      </div>

      {/** Section 4 - footer */}
      <Footer />
    </div>
  );
}

export default LandingPage;