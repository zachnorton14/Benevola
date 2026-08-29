import React from 'react';
import { Link } from 'react-router-dom';
import Shell, { ArrowLink, Btn, Eyebrow } from '../parts';

export default function NotFound() {
  return (
    <Shell>
      <div className="def-shell def-shell--narrow" style={{ paddingTop: 88, maxWidth: 560 }}>
        <Eyebrow>404</Eyebrow>
        <h1 className="def-h1">That page is not here.</h1>
        <p className="def-sub">
          The link may be out of date, or the event may have been taken down.
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 22, marginTop: 28, flexWrap: 'wrap' }}>
          <Btn as={Link} to="/events">Browse openings</Btn>
          <ArrowLink to="/">Back home</ArrowLink>
        </div>
      </div>
    </Shell>
  );
}
