import { useLocation} from "react-router-dom";
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import NavBar from "../Components/NavBar";

// icons from material UI
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import DeleteIcon from '@mui/icons-material/Delete';
import FrequencyIcon from '@mui/icons-material/AccessTime';
import PeopleIcon from '@mui/icons-material/People';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import PlaceIcon from '@mui/icons-material/Place';
import StyleIcon from '@mui/icons-material/Style';

// leaflet for the map
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import LocationPickerMap from '../Components/LocationPickerMap.jsx';

// auto address completion component
import AddressCompletion from "../Components/AddressCompletion.js";
import { photonReverse} from "../Components/photonHelper.js"

const API_URL = process.env.REACT_APP_API_URL;

// NotFoundPage.js
function EventPage() {
  // the default org icon
  const defaultOrgLog = "https://cdn-icons-png.flaticon.com/512/8611/8611393.png";

  // the name of the org created, will need to implement soon
  const orgName = "Benevola Foundation";

  // used to navigate the user after successful deletion
  const navigate = useNavigate();

  // used for getting the pathna,e
  const location = useLocation();

  // today's date
  const today = new Date().toISOString().split("T")[0];

  // /event/idnumber -> idnumber
  const id = Number(location.pathname.substring(7));

  // are we editing the event?
  const [editing, setEditing] = useState(false);

  // Address completion code
  const [position, setPosition] = useState({ lat: null, lng: null });
  const [address, setAddress] = useState("");

  // gets a response of 5 auto filled addresses back
  useEffect(() => {
    if (!position.lat) return

    photonReverse(position.lat, position.lng)
      .then(addr => setAddress(addr));

  }, [position]);

  // the event information
  const [event, setEvent] = useState(null);

  // is the page loading or is there an error
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // does this person have editing permissions
  const canEdit = true;

  const [tags, setTags] = useState(null);

   // fetch all of the tags
  // need to un comment once tags arent behind anymore
   /*const fetchTags = () => {
    setLoading(true);

    fetch(`${API_URL}/api/events/tags`, 
      {method: "GET"}
    )
      
      .then(res => {
        if (!res.ok) throw new Error("Tags not found");
        return res.json();
      })
      .then(tags => {
        console.log("Printing Tags: ");
        setTags(tags);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  };*/

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
        //setPosition({ lat: event.latitude, lng: event.longitude });
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  };

  // toggle editing
  const toggleEditing = () => {

    // refresh event to displayed edited title
    if(editing) {
      fetchEvent();
    }

    // toggle editing
    setEditing(prev => !prev);
  };

  // For deleting event
  const deleteEvent = () => {
    fetch(`${API_URL}/api/events/${event.id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json"
      },
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
      });

    // bring the user to the home screen after deleting the event
    navigate("/");
  };

  // discard the current changes
  const discardChanges = () => {
    // always reload event data from backend
    fetchEvent();

    // toggle editing
    setEditing(prev => !prev);
  };

  const safeSubstring = (value, start, end) => {
    return typeof value === "string" ? value.substring(start, end) : "2026-01-01T13:00:00.000";
  }

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


// Handles the submit of the form, we plan to submit a put request for everything
function handleSubmit(e) {
  e.preventDefault(); // stop browser navigation

  // only submit the form if we are editing
  if(editing) {
    // title is always required
    const title = e.target.title.value;

    
    let description = null;
    if(e.target.description !== null) {
      description = e.target.description.value;
    }

    let capacity = null;
    if(e.target.capacity !== null) {
      capacity = Number(e.target.capacity.value);
    }

    let date = null;
    if(e.target.date !== null) {
      const eDate = new Date(date);
      const now = new Date();
      
      if(!isNaN(eDate.getTime()) && eDate <= now) {
        date = e.target.date.value;
      }
    }

    let duration = null;
    if(e.target.durationM !== null && Number(e.target.durationM.value) >= 0) {
      duration = Number(e.target.durationM.value);
    }
    if(e.target.durationH !== null && Number(e.target.durationM.value) >= 0) {
      if(duration == null) {
        duration = Number(e.target.durationH.value * 60);
      } else {
        duration = Number(e.target.durationH.value * 60) + Number(duration);
      }
    }

    // make sure duration is greater than 15 minutes
    if(duration !== null && duration < 10) {
      alert("Event Duration has to be at least 10 minutes.");
      duration = null;
    }

    const tags = null; // e.target.tags.value;

    // address is always required
    const address = e.target.address.value;

    var latitude = position.lat;
    var longitude = position.lng;

    // if all inputs are valid, upload the profile picture to the amazon bucket
    // ...
    const image = null; //e.target.image.value;
    
    
    fetch(`${API_URL}/api/events/${event.id}`, {
      method: "PATCH",
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
      });
  }  
    
  
  // time to let the backend get the response, change the data and for react to get the new event
  var delay = 100;

  // if we aren't editing, no delay is needed
  if(!editing) {
    delay = 0;
  }

  // toggle the editing after form
  setTimeout(() => {
    toggleEditing();
  }, delay);
}

  return (
    <div className="App">
        <NavBar/>
        <hr></hr>
        <form method="POST" action={`${API_URL}/api/events/${event.id}`} onSubmit={handleSubmit}>
          <div className="">
            <div className="event-page-title"> 
              
              <input className={"event-page-title " + (editing ? "event-editing" : "event-reading")} defaultValue={event.title} name="title" required
                 readOnly={!editing} onKeyDown={e => e.key === "Enter" && e.preventDefault()} />
            </div>
          </div>

          {/* Only display the edit button if this user can edit */}
          {canEdit ? <button type="submit" className="event-edit-button" >
            {editing ? <div className="event-save-button">Save Changes<div className="event-save-button-icon"><SaveIcon/></div></div> : <div>Edit Event<div className="event-edit-button-icon"><EditIcon/></div></div>}
          </button> : <></>}

          {/* Discard button just discards changes, no form submission needed */}
          {editing ? <button type="button" className="event-discard-button" onClick={discardChanges}> Cancel <div className="event-discard-icon"> <CancelIcon/> </div> </button> : <></>}

          {/* Only Display the delete button if this user can edit this event*/}
          {(canEdit && editing) ? <button type="button" className="event-delete-button" onDoubleClick={deleteEvent} > Delete Event  <div className="event-delete-icon"> <DeleteIcon/> </div></button> : <></>}
          
          <div className="event-about-container">
            About:
            <input className={"event-about-text " + (editing ? "event-editing" : "event-reading")} defaultValue={event.description || "A description about this event"} name="description"
                 readOnly={!editing} onKeyDown={e => e.key === "Enter" && e.preventDefault()} />
          </div>

          {/* Need to implement organization logos here */}
          <div className="event-org-container">
            <div className="event-org-title-text">
              Hosted by:
            </div>
            <div className="opp-list-org-logo-container">
              <img className="opp-list-org-logo" src={defaultOrgLog} alt={event.title}></img>
            </div>
            <div className="event-org-text">
              {orgName}
            </div>
          </div>
          
          <div className="event-basic-info-container">
            <div className="event-basic-info-title">
              Date
              <div className="event-basic-info-icon">
                <CalendarMonthIcon fontSize="large" />
              </div>

              <input type="datetime-local" className={"event-basic-info-text " + (editing ? "event-editing" : "event-reading")} defaultValue={safeSubstring(event.date, 0, 16)} name="date"
                 readOnly={!editing} min={today} onKeyDown={e => e.key === "Enter" && e.preventDefault()} />
              <br></br>
            </div>
          </div>

          <div className="event-basic-info-container">
            <div className="event-basic-info-title">
              Capacity
              <div className="event-basic-info-icon">
                <PeopleIcon fontSize="large" />
              </div>

              <input type="number" className={"event-basic-info-number " + (editing ? "event-editing" : "event-reading")} defaultValue={event.capacity || 10} name="capacity"
                 readOnly={!editing} onKeyDown={e => e.key === "Enter" && e.preventDefault()}  min="1" max="999" />
              <div className={"event-basic-info-number-desc"}>
                {(event.capacity === null || event.capacity > 1) ? " people" : " person"}
              </div>
            </div>
          </div>

          <div className="event-basic-info-container event-duration-spacing">
            <div className="event-basic-info-title">
              Event duration
              <div className="event-basic-info-icon">
                <FrequencyIcon fontSize="large" />
              </div>

              
              <input type="number" className={"event-basic-info-number " + (editing ? "event-editing" : "event-reading")} defaultValue={Math.floor(event.duration / 60) || 1} name="durationH"
                readOnly={!editing} onKeyDown={e => e.key === "Enter" && e.preventDefault()}  min="0" max="23" />
              <div className={"event-basic-info-number-desc"}>
                {((event.duration / 60) === null || (event.duration / 60) > 1 || (event.duration / 60) !== 0) ? " hours" : " hour"}
              </div>

              <input type="number" className={"event-basic-info-number event-basic-info-hour-spacing " + (editing ? "event-editing" : "event-reading")} defaultValue={(event.duration % 60) || 0} name="durationM"
                readOnly={!editing} onKeyDown={e => e.key === "Enter" && e.preventDefault()}  min="0" max="59" />
              <div className={"event-basic-info-hour-label-spacing event-basic-info-number-desc"}>
                {(((event.duration % 60)  !== null && (event.duration % 60) !== 1) || (event.duration % 60)  === 0) ? " minutes" : " minute"}
              </div>
              
            </div>
          </div>
          
          <div className="event-image-location-container">
            {/* The Location of the Event - PlaceHolder until I can get location input down / plan with API*/}
            <label className="input-form-text-spacing">
              <p className="event-basic-info-title"> Event Location</p>
              <div className="event-icon-shifter">
                <PlaceIcon fontSize="large" />
              </div>
              <div>
                <label>
                  <input
                    name="latitude"
                    type="hidden"
                    value={position.lat}
                    readOnly
                  />
                </label>
              </div>

              <div>
                <label>
                  <input
                    name="longitude"
                    value={position.lng}
                    readOnly
                    type="hidden"
                  />
                </label>
              </div>
              
              {/* Display the actual map */}
              <div style={{ marginTop: '-40px' }}>
                <LocationPickerMap
                  value={
                    position.lat && position.lng
                      ? { lat: Number(position.lat), lng: Number(position.lng) }
                      : null
                  }
                />
              </div>
            </label> 

            {/* Address auto compeletion testing */}
            <AddressCompletion
              address={address}
              setAddress={setAddress}
              setPosition={setPosition}
              editing={editing}
            />
          </div>
          
          {/* Need to implement image here */}
          <div className="event-image-container">
            <img src="https://images.unsplash.com/photo-1758599667717-27c61bcdd14b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbnZpcm9ubWVudGFsJTIwY2xlYW51cCUyMHZvbHVudGVlcnN8ZW58MXx8fHwxNzY1ODI1NTc4fDA&ixlib=rb-4.1.0&q=80&w=1080" alt={event.title}></img>
          </div>

          {/* Place holder button to reserve*/}
          <button className="event-reserve-button" type="button"> Save Your Spot </button>

          {/* Event Tags */}
          <div className="event-tags-container">
            <div className="event-tags-title">
              Event Tags
            </div>
            <div className="event-tags-icon">
              <StyleIcon fontSize="large" />

              <div> {tags} </div>
            </div>
          </div>
          
        </form>
        
        <div>
    </div>
    </div>
  );
}

export default EventPage;