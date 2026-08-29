import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LeafLogo, CaretIcon, IconSun, IconMoon } from './Icons';
import { useAuth } from '../../context/AuthContext';
import '../styles/Header.css';

function Header() {
  const { auth, logout }        = useAuth();
  const navigate                 = useNavigate();
  const [openMenu, setOpenMenu]  = useState(null); // null | 'org' | 'vol'
  const [theme, setTheme]        = useState(() => localStorage.getItem('theme') || 'light');
  const orgRef                   = useRef(null);
  const volRef                   = useRef(null);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    function handleOutside(e) {
      if (!orgRef.current?.contains(e.target) && !volRef.current?.contains(e.target)) {
        setOpenMenu(null);
      }
    }
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  const toggle = menu => setOpenMenu(o => o === menu ? null : menu);
  const close  = ()   => setOpenMenu(null);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const postEventTo = auth?.type === 'organization'
    ? `/organizations/${auth.user?.organizationId ?? auth.user?.id}/events/new`
    : '/login?role=organization';

  const orgId  = auth?.user?.organizationId ?? auth?.user?.id;
  const volId  = auth?.user?.id;
  const isOrg  = auth?.type === 'organization';
  const isVol  = auth != null && !isOrg;

  return (
    <header className="nav">
      <Link className="brand" to="/">
        <LeafLogo size={36} gradId="leaf-grad-nav" />
        <span className="brand-name">Benevola</span>
      </Link>

      <nav className="nav-links">

        {/* Organizations dropdown */}
        <div className="nav-dropdown-wrap" ref={orgRef}>
          <button className="nav-link has-caret" onClick={() => toggle('org')}>
            Organizations <CaretIcon open={openMenu === 'org'} />
          </button>
          {openMenu === 'org' && (
            <div className="dropdown" role="menu">
              {isOrg ? (
                <Link to={`/organizations/${orgId}`} onClick={close}>
                  <span className="dot" />Your Organization
                </Link>
              ) : (
                <Link to="/signup?role=organization" onClick={close}>
                  <span className="dot" />Register your organization
                </Link>
              )}
              <Link to={postEventTo} onClick={close}>
                <span className="dot" />Post a volunteer event
              </Link>
              <Link to="/organizations" onClick={close}>
                <span className="dot" />Browse organizations
              </Link>
            </div>
          )}
        </div>

        {/* Volunteers dropdown */}
        <div className="nav-dropdown-wrap" ref={volRef}>
          <button className="nav-link has-caret" onClick={() => toggle('vol')}>
            Volunteers <CaretIcon open={openMenu === 'vol'} />
          </button>
          {openMenu === 'vol' && (
            <div className="dropdown" role="menu">
              {isVol ? (
                <Link to={`/volunteer/${volId}`} onClick={close}>
                  <span className="dot" />Your Profile
                </Link>
              ) : (
                <Link to="/signup" onClick={close}>
                  <span className="dot" />Create your profile
                </Link>
              )}
              <Link to="/events" onClick={close}>
                <span className="dot" />Find opportunities
              </Link>
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
              <Link
                to={`/volunteer/${auth.user?.id}`}
                className="nav-link"
              >
                My Profile
              </Link>
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
