import React from 'react';
import { Link } from 'react-router-dom';
import Shell, { Btn } from '../parts';

export default function About() {
  return (
    <Shell>
      <div className="atl-shell" style={{ maxWidth: 720 }}>
        <span className="atl-eyebrow">About</span>
        <h1 className="atl-h1">Volunteering, without the runaround.</h1>

        <div className="atl-prose" style={{ marginTop: 20 }}>
          <p>
            Most volunteering falls apart in the gap between wanting to help and
            finding something concrete to turn up to. Listings go stale, contact
            details bounce, and nobody knows how many people are actually coming.
          </p>
          <p>
            Benevola keeps that gap small. Organizations post a shift with a real
            date, a real place and a real capacity. Volunteers sign on, and both
            sides can see the roster fill.
          </p>
          <p>
            Free for volunteers. Free for the organizations doing the work.
          </p>
        </div>

        <div className="atl-hero-actions" style={{ marginTop: 28 }}>
          <Btn as={Link} to="/events">Browse openings</Btn>
          <Btn as={Link} variant="ghost" to="/signup?role=organization">Post an event</Btn>
        </div>
      </div>
    </Shell>
  );
}
