import { useLocation} from "react-router-dom";
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import NavBar from "../Components/NavBar";

// icons from material UI
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import DeleteIcon from '@mui/icons-material/Delete';
import ContactPhoneIcon from '@mui/icons-material/LocalPhone';
import EmailIcon from '@mui/icons-material/Email';
import PlaceIcon from '@mui/icons-material/Place';
import CheckIcon from '@mui/icons-material/Check';

import LockIcon from '@mui/icons-material/Lock';

// leaflet for the map
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import LocationPickerMap from '../Components/LocationPickerMap.jsx';

// auto address completion component
import AddressCompletion from "../Components/AddressCompletion.js";
import { photonReverse } from "../Components/photonHelper.js"

const API_URL = process.env.REACT_APP_API_URL;

// minimum and maximum length of a password
const PASSWORD_MIN_LENGTH = 5;
const PASSWORD_MAX_LENGTH = 25;

// NotFoundPage.js
function OrgProfilePage() {
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
  const id = Number(location.pathname.substring(14));

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
  const [org, setOrg] = useState(null);

  // is the page loading or is there an error
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // does this person have editing permissions
  const canEdit = true;
  //////////////////////////////////////////////////////

  // fetch event function, used for refreshing the page / discarding changes
  const fetchOrg = () => {
    setLoading(true);

    fetch(`${API_URL}/api/orgs/${id}`)
      .then(res => {
        if (!res.ok) throw new Error("Organization not found");
        return res.json();
      })
      .then(data => {
        setOrg(data.data);
        setLoading(false);
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
      fetchOrg();
    }

    // toggle editing
    setEditing(prev => !prev);
  };

  // For deleting event
  const deleteOrg = () => {
    fetch(`${API_URL}/api/orgs/${org.id}`, {
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
        alert("Error changing organization");
        console.error("Error:", err);
      });

    // bring the user to the home screen after deleting the event
    navigate("/");
  };

  // discard the current changes
  const discardChanges = () => {
    // always reload event data from backend
    fetchOrg();

    // toggle editing
    setEditing(prev => !prev);
  };

  const safeSubstring = (value, start, end) => {
    return typeof value === "string" ? value.substring(start, end) : "2026-01-01T13:00:00.000";
  }

useEffect(() => {
  fetchOrg();
}, [id]);


  if (loading) {
    return (
      <div className="App">
        <NavBar/>
        <hr></hr>
        <div className="event-page-title">
          Loading Organization
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
          Error loading organization
        </div>
      </div>
    );
  }  
  if (!org) {
    return (
      <div className="App">
        <NavBar/>
        <hr></hr>
        <div className="event-page-title">
          Organization not found
        </div>
      </div>
    );
  }  

// hashes the password given
function hash(pass) {
    return pass;
}


// Handles the submit of the form, we plan to submit a put request for everything
function handleSubmit(e) {
  e.preventDefault(); // stop browser navigation

  // only submit the form if we are editing
  if(editing) {
    // title is always required
    const name = e.target.name.value;

    // next get a varify description
    let description = null;
    if(e.target.description !== null) {
      description = e.target.description.value;
    }

    // next verify email, its either null or valid since the form handles it for us
    let email = null;
    if(e.target.email !== null) {
      email = e.target.email.value;
    }

    // then phone number
    let phone = null;
    if(e.target.phone !== null) {
        phone = e.target.phone.value;
    }

    // address is always required
    const address = e.target.address.value;
    var latitude = position.lat;
    var longitude = position.lng;

    // if all inputs are valid, upload the profile picture to the amazon bucket
    const iconImg = null;
    const bannerImg = null;
    
    
    fetch(`${API_URL}/api/orgs/${org.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name,
        description,
        email,
        phone,
        address,
        bannerImg,
        iconImg,
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
        <form method="POST" action={`${API_URL}/api/orgs/${org.id}`} onSubmit={handleSubmit}>
          <div className="">
            <div className="event-page-title"> 
              
              <input className={"event-page-title " + (editing ? "event-editing" : "event-reading")} defaultValue={org.name} name="name" required
                 readOnly={!editing} onKeyDown={e => e.key === "Enter" && e.preventDefault()} />
            </div>
          </div>

          {/* Only display the edit button if this user can edit */}
          {canEdit ? <button type="submit" className="event-edit-button" >
            {editing ? <div className="event-save-button">Save Changes<div className="event-save-button-icon"><SaveIcon/></div></div> : <div>Edit Profile<div className="event-edit-button-icon"><EditIcon/></div></div>}
          </button> : <></>}

          {/* Discard button just discards changes, no form submission needed */}
          {editing ? <button type="button" className="event-discard-button" onClick={discardChanges}> Cancel <div className="event-discard-icon"> <CancelIcon/> </div> </button> : <></>}

          {/* Only Display the delete button if this user can edit this event*/}
          {(canEdit && editing) ? <button type="button" className="event-delete-button" onDoubleClick={deleteOrg} > Delete Profile  <div className="event-delete-icon"> <DeleteIcon/> </div></button> : <></>}
          
          <div className="event-about-container">
            About this organization:
            <input className={"event-about-text " + (editing ? "event-editing" : "event-reading")} defaultValue={org.description || "A description about this event"} name="description"
                 readOnly={!editing} onKeyDown={e => e.key === "Enter" && e.preventDefault()} />
          </div>

          {/* Need to implement organization logos here */}
          
          <div className="event-basic-info-container event-duration-spacing">
            <div className="event-basic-info-title">
              Email Address
              <div className="event-basic-info-icon">
                <EmailIcon fontSize="large" />
              </div>
              <input type="email" className={"event-basic-info-text " + (editing ? "event-editing" : "event-reading")} defaultValue={org.email} name="email"
                 readOnly={!editing} onKeyDown={e => e.key === "Enter" && e.preventDefault()} />
            </div>
          </div>

          <div className="event-basic-info-container event-duration-spacing">
            <div className="event-basic-info-title">
              Phone Number
              <div className="event-basic-info-icon">
                <ContactPhoneIcon fontSize="large" />
              </div>
              <input type="tel" className={"event-basic-info-text " + (editing ? "event-editing" : "event-reading")} defaultValue={org.phone} name="phone"
                 readOnly={!editing} onKeyDown={e => e.key === "Enter" && e.preventDefault()} />
            </div>
          </div>

          
            
          
          <div className="event-image-location-container orgs-map-container-spacing">
            {/* The Location of the Event - PlaceHolder until I can get location input down / plan with API*/}
            <label className="input-form-text-spacing">
              <p className="event-basic-info-title"> Organization Location</p>
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
            <img src="https://images.unsplash.com/photo-1758599667717-27c61bcdd14b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbnZpcm9ubWVudGFsJTIwY2xlYW51cCUyMHZvbHVudGVlcnN8ZW58MXx8fHwxNzY1ODI1NTc4fDA&ixlib=rb-4.1.0&q=80&w=1080" alt={org.title}></img>
          </div>

        </form>
        
        <div>
      </div>
    </div>
  );
}

export default OrgProfilePage;