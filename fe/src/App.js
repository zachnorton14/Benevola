// App.js
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from '../src/Pages/LandingPage';
import OppListPage from './Pages/OppListPage';
import NotFoundPage from '../src/Pages/NotFoundPage';
import CreateEventPage from '../src/Pages/CreateEventPage';
import BrowseOrgsPage from './Pages/BrowseOrgsPage';
import MyProfilePage from './Pages/MyProfilePage';
import OrgProfilePage from './Pages/OrgProfilePage';
import UserProfilePage from './Pages/UserProfilePage';
import EventPage from './Pages/EventPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/opp-list" element={<OppListPage />} />
        <Route path="/create-event" element={<CreateEventPage />} />
        <Route path="/organizations" element={<BrowseOrgsPage />} />
        <Route path="/my-profile" element={<MyProfilePage />} />
        <Route path="/orgs/profile/:id" element={<OrgProfilePage />} />
        <Route path="/users/profile/:id" element={<UserProfilePage />} />
        <Route path="/event/:id" element={<EventPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
}

export default App;
