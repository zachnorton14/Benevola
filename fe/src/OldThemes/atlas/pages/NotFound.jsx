import React from 'react';
import { Link } from 'react-router-dom';
import Shell, { Btn } from '../parts';

export default function NotFound() {
  return (
    <Shell>
      <div className="atl-shell" style={{ maxWidth: 520, paddingTop: 80 }}>
        <span className="atl-eyebrow">404</span>
        <h1 className="atl-h1">That page is not here.</h1>
        <p className="atl-sub">
          The link may be out of date, or the event may have been taken down.
        </p>
        <div className="atl-hero-actions" style={{ marginTop: 24 }}>
          <Btn as={Link} to="/events">Browse openings</Btn>
          <Btn as={Link} variant="ghost" to="/">Back home</Btn>
        </div>
      </div>
    </Shell>
  );
}
