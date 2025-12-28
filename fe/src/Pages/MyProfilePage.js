import NavBar from "../Components/NavBar";

// MyProfilePage.js
function MyProfilePage() {
  return (
    <div className="App">
        <div className="home-container">
            <NavBar/>
            <hr></hr>
            <div className="home-text-section" >
                <h1 className="primary-heading" >
                    Your Profile</h1>
                <p className="primary-text"> Placeholder page for the time being </p>
            </div>
        </div>
    </div>
  );
}

export default MyProfilePage;