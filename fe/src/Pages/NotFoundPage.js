import { Link } from 'react-router-dom';
import NavBar from "../Components/NavBar";

// NotFoundPage.js
function NotFoundPage() {
  return (
    <div className="App">
        <div className="home-container">
            <NavBar/>
            <hr></hr>
            <div className="home-text-section" >
                <h1 className="primary-heading" >
                    You are lost! </h1>
                <p className="primary-text" >This is the error 404 page. (Page Not Found) <br></br> Go back to home sweet home. <br></br> Use the Navigation bar to the right of the logo.</p>
            {/* Link back to home */}
            <Link to="/"></Link>
            </div>
        </div>
    </div>
  );
}

export default NotFoundPage;