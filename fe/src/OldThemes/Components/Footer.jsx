import React from 'react';
import { Link } from 'react-router-dom';
import { LeafLogo } from './Icons';
import '../styles/Footer.css';

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-brand-col">
        <Link className="brand" to="/">
          <LeafLogo size={32} gradId="leaf-grad-footer" />
          <span className="brand-name" style={{ fontSize: 20 }}>Benevola</span>
        </Link>
        <p className="foot-brand-blurb">
          A platform for what's possible — pairing willing hands with the people
          and places that need them.
        </p>
      </div>

      <div>
        <h4>For volunteers</h4>
        <ul>
          <li><a href="/events/">Browse opportunities</a></li>
          <li><a href="/organizations/">Browse organizations</a></li>
          <li><a href="/signup/">Create your profile</a></li>
        </ul>
      </div>

      <div>
        <h4>For organizations</h4>
        <ul>
          <li><a href="/signup?role=organization">Register your organization</a></li>
          <li><a href="/events/new">Create an event</a></li>
        </ul>
      </div>

      <div>
        <h4>Company</h4>
        <ul>
          <li><Link to="/about">About Us</Link></li>
          <li><a href="mailto:benevolacorp@gmail.com" target="_blank" rel="noreferrer">Contact us</a></li>
        </ul>
      </div>

      <div className="legal">
        <span>© 2026 Benevola</span>
        <span>Built for good · Privacy · Terms</span>
      </div>
    </footer>
  );
}

export default Footer;
