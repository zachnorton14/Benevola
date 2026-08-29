import React from 'react';
import { Link } from 'react-router-dom';
import { LeafMark, Meta } from './parts';

const COLUMNS = [
  {
    heading: 'Volunteers',
    links: [
      { label: 'Browse opportunities', to: '/events' },
      { label: 'Browse organizations', to: '/organizations' },
      { label: 'Create your profile',  to: '/signup' },
    ],
  },
  {
    heading: 'Organizations',
    links: [
      { label: 'Register your organization', to: '/signup?role=organization' },
      { label: 'Post an event',              to: '/login?role=organization' },
    ],
  },
  {
    heading: 'Company',
    links: [
      { label: 'About us', to: '/about' },
      { label: 'Contact',  href: 'mailto:benevolacorp@gmail.com' },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="vsp-foot">
      <div className="vsp-shell">
        <div className="vsp-foot-grid">
          <div className="vsp-foot-brand-col">
            <Link className="vsp-brand" to="/">
              <span className="vsp-brand-name">Benevola</span>
              <span className="vsp-brand-dot" />
            </Link>
            <p className="vsp-foot-blurb">
              Willing hands, paired with the people and places that need them.
              An evening's work is still work that counts.
            </p>
          </div>

          {COLUMNS.map(col => (
            <div className="vsp-foot-col" key={col.heading}>
              <h4>{col.heading}</h4>
              <ul>
                {col.links.map(link => (
                  <li key={link.label}>
                    {link.to
                      ? <Link to={link.to}>{link.label}</Link>
                      : <a href={link.href} target="_blank" rel="noreferrer">{link.label}</a>}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="vsp-foot-bar">
          <Meta>
            <LeafMark size={14} /> © 2026 Benevola · Built for good
          </Meta>
          <Meta>Privacy · Terms</Meta>
        </div>

        <div className="vsp-foot-mark" aria-hidden="true">Benevola</div>
      </div>
    </footer>
  );
}
