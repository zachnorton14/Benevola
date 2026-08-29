import React from 'react';
import Shell from '../Shell';
import { Arrow, BtnLink, Eyebrow } from '../parts';

export default function NotFound() {
  return (
    <Shell>
      <div className="vsp-shell">
        <div className="vsp-404">
          <Eyebrow tone="clay">Nothing here</Eyebrow>
          <div className="vsp-404-code">404</div>
          <h1 className="vsp-h1">This page has gone quiet.</h1>
          <p>
            The address you followed does not lead anywhere. It may have moved, or it may
            never have existed in the first place.
          </p>
          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', justifyContent: 'center' }}>
            <BtnLink to="/">Back to the start <Arrow /></BtnLink>
            <BtnLink to="/events" variant="outline">Browse opportunities</BtnLink>
          </div>
        </div>
      </div>
    </Shell>
  );
}
