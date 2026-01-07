import NavBar from "../Components/NavBar";
import { useNavigate } from 'react-router-dom';

import { useEffect } from 'react';

function MyProfilePage() {
  const navigate = useNavigate();

  // automatically navigate user
   useEffect(() => {
    // code runs on page load 
    navigate('/orgs/profile/3');
  }, []); 

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

export default MyProfilePage;