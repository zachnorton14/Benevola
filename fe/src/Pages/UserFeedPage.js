import { Link } from 'react-router-dom';
import NavBar from "../Components/NavBar";
// UserFeedPage.js
function UserFeedPage() {
  return (
    <div className="App">
      <div className="home-container">
        <NavBar/>
        <hr></hr>
        <h1>Your personalized feed</h1>
        <p>This is the finding opportunities page.</p>
      </div>
    </div>
  );
}

export default UserFeedPage;