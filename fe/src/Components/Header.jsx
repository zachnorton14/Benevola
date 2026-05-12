import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LeafLogo, CaretIcon } from './Icons';
import '../styles/Header.css';

function Header() {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleOutsideClick(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

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
        <a href="#signup" className="nav-link">Sign Up</a>
        <a href="#login" className="nav-link nav-link-accent">Log In</a>
      </nav>
    </header>
  );
}

export default Header;
