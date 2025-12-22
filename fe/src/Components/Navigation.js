// Navigation.js or within your LandingPage
import { Link } from 'react-router-dom';

function Navigation() {
  return (
    <nav>
      <Link to="/">Home</Link>
      <Link to="/myfeed">Feed</Link>
    </nav>
  );
}