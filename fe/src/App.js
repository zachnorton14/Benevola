// App.js
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from '../src/Pages/LandingPage';
import OppListPage from './Pages/OppListPage';
import NotFoundPage from '../src/Pages/NotFoundPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/myfeed" element={<OppListPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
}

export default App;
