import NavBar from "../Components/NavBar";
import '../App.css';
import { List } from "@mui/material";

import PlaceIcon from '@mui/icons-material/Place';
import FrequencyIcon from '@mui/icons-material/AccessTime';
import PeopleIcon from '@mui/icons-material/People';

/**
 * The User Feed Page
 * This page displays the opportunites relevant to the current user
 * Author: Owen Voorhees 
 */

function OppListPage() {
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
      page:"placeholder1",
      tags:[{name: "In Person"}, {name: "Outside"}, {name: "loooooooooooooooooooooooooooooooooooooooooooooooooooooooooooonggggg taaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaag"}],
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
      page:"placeholder2",
      tags:[{name: "In Person"}, {name: "Dirty"}, { name: "Outside"}],
    },
    {
      image:"https://plus.unsplash.com/premium_photo-1677567996070-68fa4181775a?q=80&w=1172&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      orgLogo: "https://yt3.googleusercontent.com/ytc/AIdro_lx0bC3sO3-n_bl9JlKGphcyQS-LYB4tzpz80iMMRBD2bs=s160-c-k-c0x00ffffff-no-rj",
      title:"Tutoring with David Sher",
      organization:"Youtube loooooong ooooooooooooooooooooooooooorg",
      description:"Help with teaching linked lists with David Sher. David Sher needs your help to educate the masses on linked lists. Long description with multiple lines for testing. This is too long, I'm running out of things to type. This should be cutoff at the end because it is so long.",
      tags:"Placeholder tags",
      location:"Charolette, NC",
      frequency:"Monthly",
      length:"67 hours",
      spots:"1",
      date:"2/13/2023",
      page:"placeholder3",
      tags:[{name: "Virtual"}, {name: "Tutoring"}, { name: "Inside"}],
    },
  ]

  return (
    /* Wraps everything with the correct size of margins*/
    <div className="App">
      {/* Creates the nav bar with a horizontal line for separation */}
      <NavBar/>
      <hr></hr>

      
      Testing, Testing 123 

      {/* Title of the feed page*/}
      <div className="opp-list-title-container">
        <div className="opp-list-title-text">
          Find volunteer opportunities, perfect for you.
        </div>
      </div>
      <div className="opp-list-title-container">
        <div className="opp-list-title-secondary-text">
          {/*Blank for now.. Your Personalized Feed */}
        </div>
      </div>
      
      {/* Display all of the feeds on the page */}
      <div className="opp-list-container">
        <List className="opp-list-list">
            {feedOpportunities.map((item) => (
                // Make a box around each post
                <div className="opp-list-singular-post-container">

                  {/* Now make the image at the top of each post */}
                  <div className="opp-list-SP-image-container">
                    <img className="opp-list-SP-image" src={item.image} alt={item.title}></img>
                  </div>

                  {/* Format the text section below the image to prevent overflow */}
                  <div className="opp-list-SP-title-container">
                    
                    {/* Use a blank section to create spacing in between the picture and text */}
                    <div className="opp-list-SP-title-margin"> </div>

                    {/* Display the Organization's logo, to left of the title */}
                    <div className="opp-list-org-logo-container">
                      <img className="opp-list-org-logo" src={item.orgLogo} alt={item.title}></img>
                    </div>

                    {/* Add the title text for this opportunity */}
                    <div className="opp-list-SP-title-text">
                      <div className="opp-list-SP-title-font"> {item.title}  </div>
                      <div className="opp-list-SP-org-font"> {item.organization} </div>
                      <div className="opp-list-SP-description-font">  {item.description} </div>

                
                      <div className="opp-list-SP-icon-info">
                        <PlaceIcon/> <div className="opp-list-SP-icon-text"> {item.location} </div>
                      </div>

                      <div className="opp-list-SP-icon-info">
                        <FrequencyIcon/> <div className="opp-list-SP-icon-text"> {item.frequency} , {item.length} </div>
                      </div>

                      <div className="opp-list-SP-icon-info">
                        <PeopleIcon/> <div className="opp-list-SP-icon-text"> {item.spots} volunteers needed </div>
                      </div>

                    </div> 

                    {/* Add the two buttons at the bottom of the post */}
                    <div className="opp-list-SP-RSVP-button-container">
                      <button className="opp-list-SP-RSVP-button">
                        Reserve your spot
                      </button>
                    </div>

                    <div className="opp-list-SP-Learn-More-button-container">
                      <button className="opp-list-SP-Learn-More-button">
                        Learn More
                      </button>
                    </div>

                    {/* Finally, add the tags of this post to right of the information, above the buttons */}
                    <div className="opp-list-tags-container">
                      <List className="opp-tags-list">
                          {item.tags.map((tag) => (
                            <div className="opp-list-tags-format">
                              {tag.name}
                            </div>
                          ))}
                      </List>
                    </div>
                  </div>
                </div>
            ))}
        </List>
      </div>
    </div>
  );
}

export default OppListPage;