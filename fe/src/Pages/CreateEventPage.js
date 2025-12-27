import NavBar from "../Components/NavBar";
import {List} from "@mui/material";
import 'leaflet/dist/leaflet.css';

import L from 'leaflet';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

import { useState } from 'react';
import LocationPickerMap from '../Components/LocationPickerMap.jsx';


delete L.Icon.Default.prototype._getIconUrl;



//import './leafletIconFix';

// When creating an event:
//   we have the user logged in, so thats the creation organization
//   the number of attendees is alreayd known


// What we need to ask the user
// *** Required
// BASIC
// done 1. The title of the event 
// done 2. The description of the event
// done 3. the capacity of the event
// done 4. the duration of the event
// done 5. The start time of the event ( in military time )
// done 6. the date of the event
// done 7. Tags of the event
// done 8. an image of the event.
// done 9. the location of the event (longitude and Latitude)

function CreateEventPage() {

  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');

  function handleLocationChange({ lat, lng }) {
    setLatitude(lat.toFixed(6));
    setLongitude(lng.toFixed(6));
  }

  // will be deleted later
  const tags = [
    {
      name: "Outside",
    },
    {
      name: "Inside",
    },
    {
      name: "Virtual",
    },
    {
      name: "In Person",
    },
    {
      name: "Super Long Tag for testing",
    },
  ]

function handleSubmit(e) {
  e.preventDefault(); // stop browser navigation
  // e.target.title.value
  const title = e.target.title.value;
  const description = e.target.description.value;
  const duration = e.target.durationH.value + ":" + e.target.durationM.value;


  // Optional frontend validation
  if (!title || !description) {
    alert("Both title and description are required");
    return;
  }

  fetch("http://localhost:3000/api/events", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      title,
      description,
      duration
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
        
        <form id="eventForm" method="POST" action="http://localhost:3000/api/events/" onSubmit={handleSubmit}>

          {/* The title of the event */}
          <label className="input-form-text-spacing">
            <p className="input-form-text-label"> Event Title: </p>
            <input className="input-form-text-box-medium" type="text" name="title" required /> 
          </label> <br></br>

          {/* The Description of the event */}
          <label className="input-form-text-spacing">
            <p className="input-form-text-label"> Event Description: </p>
            <input className="input-form-text-box-long" type="text" name="description" required /> 
          </label> <br></br>

          {/* The capacity of the event */}
          <label className="input-form-text-spacing">
            <p className="input-form-text-label"> Event Capacity: </p>
            <input className="input-form-capacity" type="number" name="capacity" required /> 
          </label> <br></br>
          
            {/* The day and time of the event */}
          <label className="input-form-text-spacing">
            <p className="input-form-text-label"> Event Date and Start Time: </p>
            <input className="input-form-datetime" type="datetime-local" name="time" required /> 
          </label> <br></br>

          {/* The duration of the event */}
          <label className="input-form-text-spacing">
            <p className="input-form-text-label"> Event Duration (hours, minutes): </p>
            <input className="input-form-capacity" type="number" name="durationH" required /> 
            <input className="input-form-capacity" type="number" name="durationM" required /> 
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
                  required
                />
              </label>
            </div>

            <div>
              <label>
                <input
                  name="longitude"
                  value={longitude}
                  readOnly
                  required
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
            <input className="input-form-text-box-long" type="file"  accept="image/png, image/jpeg"  name="image" required /> 
          </label> <br></br>

          {/* The submit button */}
          <button type="submit" className="input-form-submit-button" > Register Event </button>
        </form>
      </div>
    </div>
  );
}

export default CreateEventPage;