import { Link } from 'react-router-dom';
import NavBar from "../Components/NavBar";
import '../App.css';
import HandshakeBanner from "../Assets/handshake-banner.jpg";
import React, { useState, useEffect } from 'react';


// UserFeedPage.js
function UserFeedPage() {
  const [items, setItems] = useState([]);
  //const [loading, setLoading] = useState(false);
  const [newItem, setNewItem] = useState({ name: '', description: '' });

  const handleAddItem = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newItem),
      });
      const addedItem = await response.json();
      
      // Add the new item to our local state
      setItems([...items, addedItem]);
      setNewItem({ name: '', description: '' });
    } catch (error) {
      console.error('Error adding item:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewItem(prev => ({
      ...prev,
      [name]: value
    }));
  };



  return (
    <div className="App">
      <div className="home-container">
        <NavBar/>
        <hr></hr>
        

        {/* Personalized Feed Image and banner */}
        <div className="agent-image-container">

          <img src={HandshakeBanner} class="user-feed-banner-opacity"></img>
          <hr></hr>
          <h1>Your personalized feed</h1>

        </div>

        {/* Adding the AI prompter in the middle */}
        <div className = "agent-input-container">
          
          <h1> Find Opportunities - For you.</h1>
          <div className = "agent-input-box">
            <form className = "" onSubmit={handleAddItem}>
              <input className="agent-auto-grow"
                type="text"
                name="name"
                placeholder="What opportunities are you looking to find? (Agent Prompt Placeholder)"
                value={newItem.name}
                onChange={handleInputChange}
                required
              />
              <button className="agent-execute-button" type="submit">Add Item</button>

              
            </form>
          </div>
        </div>

        

        
      </div>
    </div>
  );
}

export default UserFeedPage;