import NavBar from "../Components/NavBar";

function LoginPage() {

  return (
    <div className="App">
        <div className="home-container">
            <NavBar/>
            <hr></hr>
            <div className="home-text-section" >
                <h1 className="primary-heading" >
                    Login Page
                </h1>
            </div>
        </div>
    </div>
  );
}

export default LoginPage;