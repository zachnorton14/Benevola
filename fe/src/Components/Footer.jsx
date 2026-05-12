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
          <li><a href="#browse">Browse opportunities</a></li>
          <li><a href="#causes">Causes</a></li>
          <li><a href="#matching">Skill matching</a></li>
          <li><a href="#transcripts">Hour transcripts</a></li>
        </ul>
      </div>

      <div>
        <h4>For organizations</h4>
        <ul>
          <li><a href="#register">Register</a></li>
          <li><a href="#pricing">Pricing</a></li>
          <li><a href="#corporate">Corporate partners</a></li>
          <li><a href="#resources">Resource library</a></li>
        </ul>
      </div>

      <div>
        <h4>Company</h4>
        <ul>
          <li><a href="#about">About</a></li>
          <li><a href="#impact">Impact report</a></li>
          <li><a href="#careers">Careers</a></li>
          <li><a href="#contact">Contact</a></li>
        </ul>
      </div>

      <div className="legal">
        <span>© 2026 Benevola, PBC</span>
        <span>Built for good · Privacy · Terms</span>
      </div>
    </footer>
  );
}

export default Footer;
