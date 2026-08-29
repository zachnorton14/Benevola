import React from 'react';
import { Link } from 'react-router-dom';
import Shell, { ArrowLink, Avatar, Btn, Eyebrow } from '../parts';

/* The people on the project.

   `photo` points at a file in fe/public/team/, which is served from the site's
   own origin. LinkedIn's own image URLs cannot be used directly: media.licdn.com
   serves time-limited signed URLs that expire within days and blocks hotlinking,
   so save each headshot into public/team/ under the name below instead.

   Until a file exists the avatar falls back to the person's initial, so a
   missing headshot reads as a placeholder rather than a broken image.

   `linkedin` is the full profile URL, e.g. 'https://www.linkedin.com/in/some-slug'.
   A name with no URL renders as plain text, so filling these in one at a time
   is fine. */
const TEAM = [
  { name: 'Zachary Norton', role: 'Backend',  photo: '/team/zachary-norton.jpg', linkedin: 'https://www.linkedin.com/in/zachary-norton-url/' },
  { name: 'Talha Djibril',  role: 'Backend',  photo: '/team/talha-djibril.jpg',  linkedin: 'https://www.linkedin.com/in/talha-djibril-7a0393181/' },
  { name: 'Owen Voorhees',  role: 'Frontend', photo: '/team/owen-voorhees.jpg',  linkedin: 'https://www.linkedin.com/in/owen-voorhees-a62b97266/' },
];

/* LinkedIn's "in" mark. Inherits currentColor so it tracks the link's hover
   and focus states without a second rule. */
const LinkedInMark = () => (
  <svg
    className="def-team-mark"
    viewBox="0 0 24 24"
    width="20"
    height="20"
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.63-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.72V1.72C24 .77 23.2 0 22.22 0z" />
  </svg>
);

export default function About() {
  return (
    <Shell>
      <div className="def-shell def-shell--narrow">
        <Eyebrow>About</Eyebrow>
        <h1 className="def-h1">Volunteering, without the runaround.</h1>

        <div className="def-prose" style={{ marginTop: 22 }}>
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
          <p>
            Free for volunteers. Free for the organizations doing the work.
          </p>
        </div>

        <p className="def-note">
          Benevola is a university project — three of us built it at NC State to
          learn on, not to run as a service. Every organization and event on the
          site is sample data we wrote ourselves, so nothing here is a real
          opportunity you can sign up for.
        </p>

        <div style={{ display: 'flex', alignItems: 'center', gap: 22, marginTop: 32, flexWrap: 'wrap' }}>
          <Btn as={Link} to="/events">Browse openings</Btn>
          <ArrowLink to="/signup?role=organization">Post an event</ArrowLink>
        </div>

        <section className="def-team">
          <h2 className="def-h2">Our team</h2>

          <ul className="def-team-grid">
            {TEAM.map(member => (
              <li className="def-team-card" key={member.name}>
                <Avatar src={member.photo} name={member.name} lg />
                <span className="def-team-name">{member.name}</span>
                <span className="def-team-role">{member.role}</span>
                {member.linkedin && (
                  <a
                    className="def-team-social"
                    href={member.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    /* The mark is the whole link, so the accessible name has to
                       come from here — and it has to say who, since every card
                       carries the same icon. */
                    aria-label={`${member.name} on LinkedIn`}
                  >
                    <LinkedInMark />
                  </a>
                )}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </Shell>
  );
}
