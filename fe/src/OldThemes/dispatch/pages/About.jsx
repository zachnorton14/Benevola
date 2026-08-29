import React from 'react';
import { Link } from 'react-router-dom';
import Shell, { Btn, Kicker } from '../parts';

export default function About() {
  return (
    <Shell>
      <div className="dsp-shell" style={{ maxWidth: 760 }}>
        <Kicker>About</Kicker>
        <h1 className="dsp-h1">Volunteering, posted plainly.</h1>
        <div className="dsp-rule dsp-rule--thick" />

        <div className="dsp-prose">
          <p>
            Most volunteering falls apart in the gap between wanting to help and
            finding something concrete to turn up to. Listings go stale, contact
            details bounce, and nobody knows how many people are actually coming.
          </p>
          <p>
            Benevola keeps that gap small. Organizations post a shift with a real
            date, a real place and a real capacity. Volunteers sign on, and both
            sides watch the roster fill.
          </p>
          <p>Free for volunteers. Free for the organizations doing the work.</p>
        </div>

        <div className="dsp-hero-actions" style={{ marginTop: 28 }}>
          <Btn as={Link} to="/events">See openings</Btn>
          <Btn as={Link} variant="ghost" to="/signup?role=organization">Post an event</Btn>
        </div>
      </div>
    </Shell>
  );
}
