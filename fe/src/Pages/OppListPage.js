import NavBar from "../Components/NavBar";
import '../App.css';
import { List } from "@mui/material";
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PlaceIcon from '@mui/icons-material/Place';
import FrequencyIcon from '@mui/icons-material/AccessTime';
import PeopleIcon from '@mui/icons-material/People';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';

const API_URL = process.env.REACT_APP_API_URL;
const MAP_API = process.env.REACT_APP_MAP_API;

/**
 * The User Feed Page
 * This page displays the opportunites relevant to the current user
 * Author: Owen Voorhees 
 */

function OppListPage() {
  const defaultOrgLog = "https://cdn-icons-png.flaticon.com/512/8611/8611393.png";

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [locations, setLocations] = useState({});

  // used to navigate the user after successful creation
  const navigate = useNavigate();

  // used to handle when a user wants to view the details of one event
  const handleViewEvent = (id) => {
    navigate(`/event/${id}`);
  };

  useEffect(() => {
    fetch(`${API_URL}/api/events`)
      .then(res => {
        if (!res.ok) {
          throw new Error("Failed to fetch events");
        }
        return res.json();
      })
      .then(data => {
        setEvents(Array.isArray(data.data) ? data.data : []);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  // formats the time HH:MM into H hours and M minutes
  function formatDuration(timeStr) {
    if (!timeStr || typeof timeStr !== "string") return "";

    const [hoursStr, minutesStr] = timeStr.split(":");
    const hours = Number(hoursStr);
    const minutes = Number(minutesStr);

    if (Number.isNaN(hours) || Number.isNaN(minutes)) return "";

    if (hours === 0 && minutes === 0) return "0 minutes";

    if (hours === 0) return `${minutes} minutes`;
    if (minutes === 0) return `${hours} hours`;

    return `${hours} hours ${minutes} minutes`;
  }

  function formatEventTime(isoString) {
    if (!isoString) return "";

    const date = new Date(isoString);
    if (isNaN(date.getTime())) return "";

    const datePart = date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric"
    });

    const timePart = date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true
    });

    return `${datePart} at ${timePart}`;
  }

  // use cache so we dont have to get city every render
  const geoCache = new Map();

  async function getCityState(lat, lng) {
    const key = `${lat},${lng}`;
    if (geoCache.has(key)) return geoCache.get(key);

    const res = await fetch(
      `${MAP_API}/reverse?lat=${lat}&lon=${lng}`
    );

    const data = await res.json();
    const props = data.features?.[0]?.properties || {};

    const result = {
      city: props.city || props.town || props.village || "",
      state: props.state || ""
    };

    geoCache.set(key, result);
    return result;
  }


  useEffect(() => {
  events.forEach(event => {
    if (locations[event.id]) return;

    getCityState(event.latitude, event.longitude)
      .then(({ city, state }) => {
        let label;

        if (city && state) label = `${city}, ${state}`;
        else if (state) label = state;
        else label = "Unknown location";

        setLocations(prev => ({
          ...prev,
          [event.id]: label
        }));
      })
      .catch(() => {
        setLocations(prev => ({
          ...prev,
          [event.id]: "Unknown location"
        }));
      });
  });
}, [events]);



  if (loading)  {
    console.log('Loading');
    return (
      <div className="App">
        <NavBar/>
        <hr></hr>
        <div className="opp-list-title-container">
          <div className="opp-list-title-text">
            Loading Events...
          </div>
        </div>
      </div>
      );
  }

  if (error) {
    console.log('Error');
    return (
      <div className="App">
        <NavBar/>
        <hr></hr>
        <div className="opp-list-title-container">
          <div className="opp-list-title-text">
            Error Loading Events
          </div>
        </div>
      </div>
      );
  }
  
  return (
    /* Wraps everything with the correct size of margins*/
    <div className="App">
      {/* Creates the nav bar with a horizontal line for separation */}
      <NavBar/>
      <hr></hr>

      {/* Title of the feed page*/}
      <div className="opp-list-title-container">
        <div className="opp-list-title-text">
          Find volunteer opportunities, perfect for you.
          <br></br>
          Displaying {events.length} events
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
            {events.map((item) => (
                // Make a box around each post
                <div className="opp-list-singular-post-container" key={item.id}>

                  {/* Now make the image at the top of each post */}
                  <div className="opp-list-SP-image-container">
                    {/* <img className="opp-list-SP-image" src={item.logo} alt={item.title}></img>*/}
                  </div>

                  {/* Format the text section below the image to prevent overflow */}
                  <div className="opp-list-SP-title-container">
                    
                    {/* Use a blank section to create spacing in between the picture and text */}
                    <div className="opp-list-SP-title-margin"> </div>

                    {/* Display the Organization's logo, to left of the title */}
                    <div className="opp-list-org-logo-container">
                      <img className="opp-list-org-logo" src={defaultOrgLog} alt={item.title}></img>
                    </div>

                    {/* Add the title text for this opportunity */}
                    <div className="opp-list-SP-title-text">
                      <div className="opp-list-SP-title-font"> {item.title}  </div>
                      <div className="opp-list-SP-org-font"> {item.organizationId} </div>
                      <div className="opp-list-SP-description-font">  {item.description} </div>

                
                      <div className="opp-list-SP-icon-info">
                        <PlaceIcon/> <div className="opp-list-SP-icon-text"> {locations[item.id] ?? "Loading location..."} </div>
                      </div>

                      <div className="opp-list-SP-icon-info">
                        <FrequencyIcon/> <div className="opp-list-SP-icon-text"> {formatDuration(item.duration)} </div>
                      </div>

                      <div className="opp-list-SP-icon-info">
                        <CalendarMonthIcon/> <div className="opp-list-SP-icon-text"> {formatEventTime(item.time)} </div>
                      </div>

                      <div className="opp-list-SP-icon-info">
                        <PeopleIcon/> <div className="opp-list-SP-icon-text"> {item.capacity} volunteers needed </div>
                      </div>

                    </div> 

                    {/* Add the two buttons at the bottom of the post */}
                    <div className="opp-list-SP-RSVP-button-container">
                      <button className="opp-list-SP-RSVP-button" onClick={() => handleViewEvent(item.id)}>
                        Reserve your spot
                      </button>
                    </div>

                    <div className="opp-list-SP-Learn-More-button-container">
                      <button className="opp-list-SP-Learn-More-button" onClick={() => handleViewEvent(item.id)}>
                        Learn More
                      </button>
                    </div>

                    {/* Finally, add the tags of this post to right of the information, above the buttons */}
                    <div className="opp-list-tags-container">
                      {/*<List className="opp-tags-list">
                          {item.tags.map((tag) => (
                            <div className="opp-list-tags-format">
                              {tag.name}
                            </div>
                          ))}
                      </List>*/}
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