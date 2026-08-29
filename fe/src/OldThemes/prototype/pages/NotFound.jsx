import React from 'react';
import { Link } from 'react-router-dom';
import Shell, { Btn, Eyebrow } from '../parts';

export default function NotFound() {
  return (
    <Shell>
      <div className="ptp-shell ptp-shell--narrow" style={{ paddingTop: 92, maxWidth: 580 }}>
        <Eyebrow>404</Eyebrow>
        <h1 className="ptp-h1">That page is not here.</h1>
        <p className="ptp-sub">
          The link may be out of date, or the event may have been taken down.
        </p>
        <div style={{ display: 'flex', gap: 12, marginTop: 30, flexWrap: 'wrap' }}>
          <Btn as={Link} to="/events">Browse openings</Btn>
          <Btn as={Link} variant="ghost" to="/">Back home</Btn>
        </div>
      </div>
    </Shell>
  );
}
