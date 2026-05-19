import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LeafLogo, CaretIcon, IconSun, IconMoon } from './Icons';
import { useAuth } from '../context/AuthContext';
import '../styles/Header.css';

function Header() {
  const { auth, logout }  = useAuth();
  const navigate          = useNavigate();
  const [open, setOpen]   = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
  const dropdownRef       = useRef(null);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    function handleOutsideClick(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  /* Volunteer display name — email or display name from API response */
  const displayName = auth?.user?.name
    ?? auth?.user?.displayName
    ?? auth?.user?.email
    ?? 'Volunteer';

  return (
    <header className="nav">
      <Link className="brand" to="/">
        <LeafLogo size={36} gradId="leaf-grad-nav" />
        <span className="brand-name">Benevola</span>
      </Link>

      <nav className="nav-links">
        <div className="nav-dropdown-wrap" ref={dropdownRef}>
          <button className="nav-link has-caret" onClick={() => setOpen(o => !o)}>
            Organizations <CaretIcon open={open} />
          </button>
          {open && (
            <div className="dropdown" role="menu">
              <a href="#register"><span className="dot" />Register your organization</a>
              <a href="#post"><span className="dot" />Post a volunteer event</a>
              <a href="#corporate"><span className="dot" />For corporate partners</a>
              <a href="#directory"><span className="dot" />Verified directory</a>
            </div>
          )}
        </div>

        <button
          className="nav-link nav-theme-toggle"
          onClick={() => setTheme(t => t === 'light' ? 'dark' : 'light')}
          aria-label="Toggle dark mode"
        >
          {theme === 'light' ? <IconMoon size={18} /> : <IconSun size={18} />}
        </button>

        {auth ? (
          <>
            {auth.type === 'organization' ? (
              <Link
                to={`/organizations/${auth.user?.organizationId ?? auth.user?.id}`}
                className="nav-link"
              >
                Your Organization
              </Link>
            ) : (
              <span className="nav-user-name">{displayName}</span>
            )}
            <button className="nav-link nav-link-accent" onClick={handleLogout}>
              Log Out
            </button>
          </>
        ) : (
          <>
            <Link to="/signup" className="nav-link">Sign Up</Link>
            <Link to="/login" className="nav-link nav-link-accent">Log In</Link>
          </>
        )}
      </nav>
    </header>
  );
}

export default Header;
