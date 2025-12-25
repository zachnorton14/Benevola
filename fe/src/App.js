// App.js
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from '../src/Pages/LandingPage';
import OppListPage from './Pages/OppListPage';
import NotFoundPage from '../src/Pages/NotFoundPage';
import CreateEventPage from '../src/Pages/CreateEventPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/opp-list" element={<OppListPage />} />
        <Route path="/create-event" element={<CreateEventPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
}

export default App;
