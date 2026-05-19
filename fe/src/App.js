import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ScrollToTop from './Components/ScrollToTop';
import { AuthProvider } from './context/AuthContext';
import './styles/App.css';
import LandingPage  from './Pages/LandingPage';
import LoginPage    from './Pages/LoginPage';
import SignupPage   from './Pages/SignupPage';
import AboutPage    from './Pages/AboutPage';
import EventPage    from './Pages/EventPage';
import EventsPage   from './Pages/EventsPage';
import OrgPage      from './Pages/OrgPage';
import OrgsPage     from './Pages/OrgsPage';
import NotFoundPage from './Pages/NotFoundPage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <ScrollToTop />
        <Routes>
          <Route path="/"                  element={<LandingPage />} />
          <Route path="/login"             element={<LoginPage />} />
          <Route path="/signup"            element={<SignupPage />} />
          <Route path="/about"             element={<AboutPage />} />
          <Route path="/events"            element={<EventsPage />} />
          <Route path="/events/:id"        element={<EventPage />} />
          <Route path="/organizations"     element={<OrgsPage />} />
          <Route path="/organizations/:id" element={<OrgPage />} />
          <Route path="*"                  element={<NotFoundPage />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
