import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ScrollToTop from './Components/ScrollToTop';
import RequireAuth from './Components/RequireAuth';
import { AuthProvider } from './context/AuthContext';
import { DesignProvider } from './design/DesignContext';
import Surface from './design/Surface';
import './styles/App.css';

/* Routes name a surface; the design registry decides which component renders
   it. The site is locked to the 'default' design in src/design/config.js. */

function App() {
  return (
    <AuthProvider>
      <DesignProvider>
        <Router>
          <ScrollToTop />
          <Routes>
            <Route path="/"                  element={<Surface name="Landing" />} />
            <Route path="/login"             element={<Surface name="Login" />} />
            <Route path="/signup"            element={<Surface name="Signup" />} />
            <Route path="/about"             element={<Surface name="About" />} />
            <Route path="/events"            element={<Surface name="Events" />} />
            <Route path="/events/:id"        element={<Surface name="Event" />} />
            <Route path="/organizations"     element={<Surface name="Orgs" />} />
            <Route path="/organizations/:id" element={<Surface name="Org" />} />
            <Route
              path="/organizations/:id/events/new"
              element={
                <RequireAuth role="organization">
                  <Surface name="EventNew" />
                </RequireAuth>
              }
            />
            <Route path="/volunteer/:id"     element={<Surface name="Volunteer" />} />
            <Route path="*"                  element={<Surface name="NotFound" />} />
          </Routes>
        </Router>
      </DesignProvider>
    </AuthProvider>
  );
}

export default App;
