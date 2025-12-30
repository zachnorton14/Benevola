import { useLocation} from "react-router-dom";
import { useState, useEffect } from 'react';
import NavBar from "../Components/NavBar";

import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';

const API_URL = process.env.REACT_APP_API_URL;

// NotFoundPage.js
function EventPage() {
  // used for getting the pathna,e
  const location = useLocation();

  // /event/idnumber -> idnumber
  const id = Number(location.pathname.substring(7));

  // are we editing the event?
  const [editing, setEditing] = useState(false);

  // the event information
  const [event, setEvent] = useState(null);

  // is the page loading or is there an error
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // does this person have editing permissions
  const canEdit = true;

  // fetch event function, used for refreshing the page / discarding changes
  const fetchEvent = () => {
    setLoading(true);

    fetch(`${API_URL}/api/events/${id}`)
      .then(res => {
        if (!res.ok) throw new Error("Event not found");
        return res.json();
      })
      .then(data => {
        setEvent(data.data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  };

  // toggle editing
  const toggleEditing = () => {
    // if we are editing, send a PUT request for every item in the event to backend
    if(editing) {
      // put request through events
      // ... 
    }

    // toggle editing
    setEditing(prev => !prev);
  };

  // discard the current changes
  const discardChanges = () => {
    // always reload event data from backend
    fetchEvent();

    // toggle editing
    setEditing(prev => !prev);
  };

  // handle case if the current event is invalid
  // TODO
  if(id === NaN) {
    id = "Invalid event"
  }

  

useEffect(() => {
  fetchEvent();
}, [id]);


  if (loading) {
    return (
      <div className="App">
        <NavBar/>
        <hr></hr>
        <div className="event-page-title">
          Loading Event
        </div>
      </div>
    );
  }  
  if (error) {
    return (
      <div className="App">
        <NavBar/>
        <hr></hr>
        <div className="event-page-title">
          Error loading event
        </div>
      </div>
    );
  }  
  if (!event) {
    return (
      <div className="App">
        <NavBar/>
        <hr></hr>
        <div className="event-page-title">
          Event not found
        </div>
      </div>
    );
  }  

  // readOnly={isReadOnly}
  //<label className={isReadOnly ? "label-readonly" : "label-editable"}>
    //  Title
  //</label>
// Handles the submit of the form, we plan to submit a put request for everything
function handleSubmit(e) {
  e.preventDefault(); // stop browser navigation

  // all fields are required, so it cant be null
  const title = e.target.title.value;
  const description = null; //e.target.description.value;
  const capacity = null; //Number(e.target.capacity.value);
  const date = null; //e.target.time.value;
  const tags = null; //e.target.tags.value;
  const longitude = 1.2; //Number(e.target.longitude.value);
  const latitude = 1.3; //Number(e.target.latitude.value);
  const address = null;
  const duration = null;
  // first make sure the capacity of the event is at least 1
  /*if(capacity < 1) {
    alert("Capacity has to be at least one.");
    return;
  }

  // make sure the date is in the future when creating the event
  const eventDate = new Date(time);   // converts to Date
  const now = new Date();


  if (!isNaN(eventDate.getTime()) && eventDate <= now) {
    alert("Event date must be in the future");
    return;
  }

  // validate the duration of the event
  if(Number(e.target.durationH.value) < 0 || Number(e.target.durationM.value) < 0 ) {
    alert("Duration cannot be negative.");
    return;
  }
  if(Number(e.target.durationM.value) >= 60 ) {
    alert("Duration minutes have to be less than 60.");
    return;
  }

  // MINIMUM Duration
  if(Number(e.target.durationH.value) === 0 && Number(e.target.durationM.value) < 10 ) {
    alert("Duration cannot be less than 10 minutes.");
    return;
  }
  
  // create duration
  const duration = Number(e.target.durationM.value) + Number(e.target.durationH.value * 60);

  // make sure longitude and latitude are valid values
  if(e.target.latitude.value > 90 || e.target.latitude.value < -90) {
    alert("Invalid latitude.");
    return;
  }

  if(e.target.longitude.value > 180 || e.target.longitude.value < -180) {
    alert("Invalid longitude.");
    return;
  }*/

  // if all inputs are valid, upload the profile picture to the amazon bucket
  // ...
  const image = null; //e.target.image.value;
  
  // default organizationID
  const orgId = 723;
  /*
  fetch(`${API_URL}/api/orgs/${orgId}/events`, {
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
    .then(data => {
      console.log("Success:", data);
    })
    .catch(err => {
      alert("Error changing event");
      console.error("Error:", err);
    });*/

    alert("Form Submitted");
}
  

  return (
    <div className="App">
        <NavBar/>
        <hr></hr>
        <form method="POST" action={`${API_URL}/api/events/`} onSubmit={handleSubmit}>
          <div className={editing ? "event-editing" : "event-reading"}>
            <div className="event-page-title"> 
              
              <input className="event-page-title" defaultValue={event.title}
                 readOnly={!editing} onKeyDown={e => e.key === "Enter" && e.preventDefault()} />
            </div>
          </div>

          {/* Only display the edit button if this user can edit */}
          {canEdit ? <button type={editing ? "button" : "submit"} className="event-edit-button" onClick={toggleEditing} >
            {editing ? <div className="event-save-button">Save Changes<div className="event-save-button-icon"><SaveIcon/></div></div> : <div>Edit Event<div className="event-edit-button-icon"><EditIcon/></div></div>}
          </button> : <div></div>}
          {editing ? <button type="button" className="event-discard-button" onClick={discardChanges}> Cancel <div className="event-discard-icon"> <CancelIcon/> </div> </button> : <></>}

          

        </form>
        
        <div>
      <h1>{event.title}</h1>
      <p>{event.description}</p>
      <p>Capacity: {event.capacity}</p>
      <p>
        Time: {new Date(event.time).toLocaleString()}
      </p>
    </div>
    </div>
  );
}

export default EventPage;