import NavBar from "../Components/NavBar";
import {List} from "@mui/material";
import 'leaflet/dist/leaflet.css';

import L from 'leaflet';

import { useState } from 'react';
import LocationPickerMap from '../Components/LocationPickerMap.jsx';

import { useNavigate } from 'react-router-dom';

delete L.Icon.Default.prototype._getIconUrl;

// env variables
const API_URL = process.env.REACT_APP_API_URL;

function CreateEventPage() {

  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');

  // used to navigate the user after successful creation
  const navigate = useNavigate();

  function handleLocationChange({ lat, lng }) {
    setLatitude(lat.toFixed(6));
    setLongitude(lng.toFixed(6));
  }

  // will be deleted later
  const [tags, setTags] = useState('');


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
    .then(() => {
        navigate("/success"); // indicate a successful creation
    })
    .catch(err => {
      alert("Error creating event");
      console.error("Error:", err);
    });
}

  return (
    <div className="App">
      <NavBar/>
      <hr></hr>
      <div className="home-text-section" >
        <h1 className="" >
            Register your event with Benevola</h1>
        
        <form id="eventForm" method="POST" action={`${API_URL}/api/events/`} onSubmit={handleSubmit}>

          {/* The title of the event */}
          <label className="input-form-text-spacing">
            <p className="input-form-text-label"> Event Title: </p>
            <input className="input-form-text-box-medium" type="text" name="title" required /> 
          </label> <br></br>

          {/* The Description of the event */}
          <label className="input-form-text-spacing">
            <p className="input-form-text-label"> Event Description: </p>
            <input className="input-form-text-box-long" type="text" name="description"  /> 
          </label> <br></br>

          {/* The capacity of the event */}
          <label className="input-form-text-spacing">
            <p className="input-form-text-label"> Event Capacity: </p>
            <input className="input-form-capacity" type="number" name="capacity"  /> 
          </label> <br></br>
          
            {/* The day and time of the event */}
          <label className="input-form-text-spacing">
            <p className="input-form-text-label"> Event Date and Start Time: </p>
            <input className="input-form-datetime" type="datetime-local" name="time" /> 
          </label> <br></br>

          {/* The duration of the event */}
          <label className="input-form-text-spacing">
            <p className="input-form-text-label"> Event Duration (hours, minutes): </p>
            <input className="input-form-capacity" type="number" name="durationH"  /> 
            <input className="input-form-capacity" type="number" name="durationM" /> 
          </label> <br></br>

          {/* The tags of the event */}
          <span className="input-form-text-spacing">
            <p className="input-form-text-label"> Event Tags: </p>
            <List className="input-form-tags-list">
              {tags.map((item) => (
                  <p className="tags-format">
                    <input className="checkbox-format" type="checkbox" name="tags" value={item.name}/>
                    {" " + item.name}
                  </p> 
              ))}
            </List>
          </span> <br></br>
          
          {/* The Location of the Event - PlaceHolder until I can get location input down / plan with API*/}
          <label className="input-form-text-spacing">
            <p className="input-form-text-label"> Click on the map to choose the location of the event:</p>
            <div>
              <label>
                <input
                  name="latitude"
                  type="hidden"
                  value={latitude}
                  readOnly
                />
              </label>
            </div>

            <div>
              <label>
                <input
                  name="longitude"
                  value={longitude}
                  readOnly
                  type="hidden"
                />
              </label>
            </div>
            
            {/* Display the actual map */}
            <div style={{ marginTop: '1rem' }}>
              <LocationPickerMap
                value={
                  latitude && longitude
                    ? { lat: Number(latitude), lng: Number(longitude) }
                    : null
                }
                onChange={handleLocationChange}
              />
            </div>
          </label> 

          {/* An image of the event */}
          <label className="input-form-text-spacing">
            <p className="input-form-text-label"> Event Image: </p>
            <input className="input-form-text-box-long" type="file"  accept="image/png, image/jpeg"  name="image" /> 
          </label> <br></br>

          {/* The submit button */}
          <button type="submit" className="input-form-submit-button" > Register Event </button>
        </form>
      </div>
    </div>
  );
}

export default CreateEventPage;