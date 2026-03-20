import NavBar from "../Components/NavBar";
import { List, Alert } from "@mui/material";
import 'leaflet/dist/leaflet.css';

import L from 'leaflet';

import { useState, useEffect } from 'react';
import LocationPickerMap from '../Components/LocationPickerMap.jsx';
import AddressCompletion from '../Components/AddressCompletion';

import { useNavigate } from 'react-router-dom';

delete L.Icon.Default.prototype._getIconUrl;

// env variables
const API_URL = process.env.REACT_APP_API_URL;

function CreateEventPage() {

  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [address, setAddress] = useState('');
  const [tags, setTags] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // used to navigate the user after successful creation
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch available tags
    fetch(`${API_URL}/api/events/tags`)
      .then(res => res.json())
      .then(result => {
        if (result.data) {
          setTags(result.data);
        }
      })
      .catch(err => console.error("Error fetching tags:", err));
  }, []);

  function handleLocationChange({ lat, lng }) {
    setLatitude(lat.toFixed(6));
    setLongitude(lng.toFixed(6));
  }

  // Wrapper for AddressCompletion to set both lat and lng
  function setPosition({ lat, lng }) {
    setLatitude(lat.toFixed(6));
    setLongitude(lng.toFixed(6));
  }

  function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');

    const form = e.target;
    const title = form.title.value;
    const description = form.description.value;
    const capacity = form.capacity.value ? Number(form.capacity.value) : null;
    const date = form.time.value;
    
    // Collect checked tags
    const selectedTags = Array.from(form.elements['tags'] || [])
      .filter(input => input.checked)
      .map(input => input.value);

    const latVal = latitude ? Number(latitude) : null;
    const lngVal = longitude ? Number(longitude) : null;
    
    const h = Number(form.durationH.value || 0);
    const m = Number(form.durationM.value || 0);
    const duration = (h * 60) + m;

    // Basic Validation
    if (capacity !== null && capacity < 1) {
      setError("Capacity must be at least 1");
      return;
    }

    if (duration < 10) {
      setError("Duration must be at least 10 minutes");
      return;
    }

    if (!latVal || !lngVal) {
      setError("Please select a location on the map or enter an address");
      return;
    }

    // In a real app, orgId should come from the logged-in user's context
    const orgId = 1; 

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
        tags: selectedTags,
        address,
        latitude: latVal,
        longitude: lngVal,
        image: null
      })
    })
      .then(async res => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Request failed");
        return data;
      })
      .then(result => {
        setSuccess("Event created successfully!");
        const eid = result.data.event.id;
        setTimeout(() => navigate(`/event/${eid}`), 2000);
      })
      .catch(err => {
        setError(err.message);
        console.error("Error:", err);
      });
  }

  return (
    <div className="App">
      <NavBar/>
      <hr></hr>
      <div className="home-text-section" >
        <h1 className="" >Register your event with Benevola</h1>
        
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

        <form id="eventForm" onSubmit={handleSubmit}>

          <label className="input-form-text-spacing">
            <p className="input-form-text-label"> Event Title: </p>
            <input className="input-form-text-box-medium" type="text" name="title" required /> 
          </label> <br></br>

          <label className="input-form-text-spacing">
            <p className="input-form-text-label"> Event Description: </p>
            <textarea className="input-form-text-box-long" name="description" rows="4" style={{width: '100%', padding: '10px'}} /> 
          </label> <br></br>

          <label className="input-form-text-spacing">
            <p className="input-form-text-label"> Event Capacity: </p>
            <input className="input-form-capacity" type="number" name="capacity" /> 
          </label> <br></br>
          
          <label className="input-form-text-spacing">
            <p className="input-form-text-label"> Event Date and Start Time: </p>
            <input className="input-form-datetime" type="datetime-local" name="time" required /> 
          </label> <br></br>

          <label className="input-form-text-spacing">
            <p className="input-form-text-label"> Event Duration (hours, minutes): </p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input className="input-form-capacity" type="number" name="durationH" placeholder="Hrs" defaultValue={0} /> 
              <input className="input-form-capacity" type="number" name="durationM" placeholder="Mins" defaultValue={0} /> 
            </div>
          </label> <br></br>

          <span className="input-form-text-spacing">
            <p className="input-form-text-label"> Event Tags: </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', padding: '10px', background: '#f5f5f5', borderRadius: '4px' }}>
              {tags.map((item) => (
                  <label key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <input type="checkbox" name="tags" value={item.name}/>
                    {item.name}
                  </label> 
              ))}
            </div>
          </span> <br></br>
          
          <label className="input-form-text-spacing">
            <p className="input-form-text-label"> Event Location (Address search or click on map):</p>
            <div style={{ marginBottom: '10px' }}>
              <AddressCompletion 
                address={address} 
                setAddress={setAddress} 
                setPosition={setPosition} 
                editing={true} 
              />
            </div>
            <div style={{ marginTop: '1rem' }}>
              <LocationPickerMap
                value={
                  latitude && longitude
                    ? { lat: Number(latitude), lng: Number(longitude) }
                    : null
                }
                onChange={handleLocationChange}
              />
              <p style={{ fontSize: '0.8rem', color: '#666' }}>
                Coordinates: {latitude ? `${latitude}, ${longitude}` : 'None'}
              </p>
            </div>
          </label> 

          <button type="submit" className="input-form-submit-button" style={{ marginTop: '20px' }}> 
            Register Event 
          </button>
        </form>
      </div>
    </div>
  );
}

export default CreateEventPage;