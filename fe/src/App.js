import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './styles/App.css';
import LandingPage from '../src/Pages/LandingPage';
import NotFoundPage from '../src/Pages/NotFoundPage';
        

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
}

export default App;
