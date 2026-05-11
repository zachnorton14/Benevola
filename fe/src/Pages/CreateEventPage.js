import NavBar from "../Components/NavBar";
import { useNavigate } from 'react-router-dom';

import { useCallback, useEffect } from 'react';


const API_URL = process.env.REACT_APP_API_URL;

function CreateEventPage() {
  const navigate = useNavigate();

  // Is the user logged in and is the user an organization?
  // TODO - verify user is logged in from session key
  const isOrganization = false;

  // the organization id
  // TODO - get org id from session key
  const oid = 1;
  
  // create the event with post then navigate to that page
  const handleCreateEvent = useCallback(() => {

      // Default values for a new event
      const title = "New Event";
      const description = null;
      const capacity = null;
      const date = null;
      const duration = null;
      const tags = [];
      const address = null;
      const longitude = 35.7796;
      const latitude = -78.6382;
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
        const eid = result.data.event.id;
        console.log(result);
        navigate(`/event/${eid}`); // indicate a successful creation
      })
      .catch(err => {
        alert("Error creating event");
        console.error("Error:", err);
      });
    }, [oid, navigate]);

  // automatically navigate user
   useEffect(() => {
    // if the user is logged in and they are an organization
    if (isOrganization) {
        // create an event and navigate that user to that events page
        handleCreateEvent();
    } else {
        // otherwise direct them to the login page
        navigate('/login');
    }
  }, [handleCreateEvent, navigate, isOrganization]); 

  return (
    <div className="App">
        <div className="home-container">
            <NavBar/>
            <hr></hr>
            <div className="home-text-section" >
                <h1 className="primary-heading" >
                     Loading...</h1>
            </div>
        </div>
    </div>
  );
}

export default CreateEventPage;