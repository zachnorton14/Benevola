import { useLocation} from "react-router-dom";
import { useState, useEffect } from 'react';
import NavBar from "../Components/NavBar";


const API_URL = process.env.REACT_APP_API_URL;

// NotFoundPage.js
function EventPage() {
  const location = useLocation();

  // /event/idnumber -> idnumber
  const id = Number(location.pathname.substring(7));

  if(id === NaN) {
    id = "Invalid event"
  }

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`${API_URL}/api/events/${id}`)
      .then(res => {
        if (!res.ok) {
          throw new Error("Event not found");
        }
        return res.json();
      })
      .then(data => {
        setEvent(data.data); // 👈 important
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [id]);

  if (loading) return <p>Loading event...</p>;
  if (error) return <p>{error}</p>;
  if (!event) return <p>No event found</p>;

  return (
    <div className="App">
        <NavBar/>
        <hr></hr>
        <div className="event-page-title">
            {id} Title.
        </div>
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