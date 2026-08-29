import React from 'react';
import { Link } from 'react-router-dom';
import Shell, { Btn, Kicker } from '../parts';

export default function NotFound() {
  return (
    <Shell>
      <div className="dsp-shell" style={{ maxWidth: 560, paddingTop: 70 }}>
        <Kicker>Error 404</Kicker>
        <h1 className="dsp-h1">No such notice.</h1>
        <div className="dsp-rule dsp-rule--thick" />
        <p className="dsp-lede">
          The link may be out of date, or the event may have been taken down.
        </p>
        <div className="dsp-hero-actions" style={{ marginTop: 26 }}>
          <Btn as={Link} to="/events">See openings</Btn>
          <Btn as={Link} variant="ghost" to="/">Back home</Btn>
        </div>
      </div>
    </Shell>
  );
}
