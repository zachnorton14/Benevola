import { useNavigate } from 'react-router-dom';
import '../App.css';
import Home from "../Components/Home"

function LandingPage() {
  const navigate = useNavigate();

  const handleVolunteer = () => {
    navigate('/myfeed');
  };

  return (
    <div>
      <div className="App">
        <Home/>
      </div>
    </div>
  );
}

export default LandingPage;