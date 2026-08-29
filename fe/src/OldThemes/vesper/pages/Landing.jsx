import React from 'react';
import { Link } from 'react-router-dom';
import Shell from '../Shell';
import { Arrow, BtnLink, Duo, Eyebrow, SectionHead, Tick } from '../parts';

const HERO_IMG = 'https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=1400&q=85&auto=format&fit=crop';
const WORK_IMG = 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1000&q=85&auto=format&fit=crop';

const CAUSES = [
  'Food security', 'Shoreline clean-ups', 'Tutoring', 'Animal rescue',
  'Elder companionship', 'Habitat builds', 'Trail maintenance', 'Community gardens',
  'Warming centres', 'Disaster relief', 'Literacy', 'Youth sports',
];

const ENTRIES = [
  {
    num: 'I',
    title: 'Say when you are free',
    body: 'An evening, a Saturday morning, one week in March. Availability is a filter here, not an afterthought buried in a profile nobody reads.',
  },
  {
    num: 'II',
    title: 'See what is actually near you',
    body: 'Set a radius and every listing collapses to what you could reach without rearranging your day. Distance is the first thing we tell you, not the last.',
  },
  {
    num: 'III',
    title: 'Turn up, and have it count',
    body: 'Sign on and the organizer knows to expect you. Afterwards the hours sit in your profile, verified, ready to hand to a school or an employer or a board.',
  },
];

const PROMISES = [
  'Every organization is verified before it can post',
  'No cold emails and no waiting to hear back',
  'Free for volunteers, always, with no trial clock',
  'Your hours export cleanly whenever you need them',
];

const DESTINATIONS = [
  {
    num: '01',
    to: '/organizations',
    title: 'Browse organizations',
    body: 'Nonprofits and community groups working on causes you already care about.',
  },
  {
    num: '02',
    to: '/events',
    title: 'Find events near you',
    body: 'One-off shifts and pop-up campaigns this week, sorted by distance and hours.',
  },
  {
    num: '03',
    to: '/signup',
    title: 'Create a free profile',
    body: 'Save your skills and causes, log verified hours, get matched automatically.',
  },
];

export default function Landing() {
  return (
    <Shell>
      {/* ── Hero ── */}
      <section className="vsp-hero">
        <div className="vsp-shell">
          <div className="vsp-hero-grid">
            <div>
              <Eyebrow tone="clay">Volunteer with your neighbours</Eyebrow>
              <h1 className="vsp-display">
                Give an<br />
                evening.<br />
                <span className="vsp-em">Change a week.</span>
              </h1>
              <p className="vsp-lede">
                Benevola pairs the hours you can actually spare with the organizations
                near you that need them. No cold emails, no gatekeeping, no waiting
                to hear back.
              </p>
              <div className="vsp-hero-actions">
                <BtnLink to="/events">Find an opportunity <Arrow /></BtnLink>
                <Link className="vsp-link" to="/signup?role=organization">
                  Or post a shift for your organization
                </Link>
              </div>
            </div>

            <Duo className="vsp-hero-art" src={HERO_IMG} alt="Volunteers gathered outdoors at a community event" />
          </div>
        </div>

        {/* Live causes, running like a poster's bottom band */}
        <div className="vsp-ticker" aria-hidden="true">
          <div className="vsp-ticker-track">
            {[...CAUSES, ...CAUSES].map((cause, i) => (
              <span className="vsp-ticker-item" key={i}>{cause}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="vsp-section">
        <div className="vsp-shell">
          <SectionHead
            num="01"
            title="How it works"
            sub="Three steps, and none of them involve introducing yourself to a stranger over email."
          />
          <div className="vsp-entries">
            {ENTRIES.map(entry => (
              <article className="vsp-entry" key={entry.num}>
                <span className="vsp-entry-num">{entry.num}</span>
                <h3 className="vsp-h3">{entry.title}</h3>
                <p>{entry.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── What we promise ── */}
      <section className="vsp-band">
        <div className="vsp-shell">
          <div className="vsp-two">
            <div>
              <Eyebrow tone="clay">What we do</Eyebrow>
              <h2 className="vsp-h1" style={{ margin: '18px 0 20px' }}>
                A platform for what is possible.
              </h2>
              <p className="vsp-lede">
                We work with nonprofits, community groups, and civic organizations to
                surface real opportunities that are verified, searchable, and matched
                to what you actually care about.
              </p>
              <ul className="vsp-checks">
                {PROMISES.map(p => (
                  <li key={p}><Tick /><span>{p}</span></li>
                ))}
              </ul>
            </div>
            <Duo className="vsp-band-art" src={WORK_IMG} alt="Community volunteers working together" />
          </div>
        </div>
      </section>

      {/* ── For organizations ── */}
      <section className="vsp-section">
        <div className="vsp-shell">
          <SectionHead
            num="02"
            title="Are you an organization?"
            sub="List a one-off event or build a full volunteer page. Verified, searchable, free to start."
          />
          <div className="vsp-offers">
            <Link className="vsp-offer" to="/signup?role=organization">
              <Eyebrow>Quick post</Eyebrow>
              <h3>Create an event</h3>
              <p>
                A single shift, a recurring need, or a whole campaign, posted in under
                three minutes. Volunteers find it, sign on, and show up.
              </p>
              <span className="vsp-offer-go">Create event <Arrow /></span>
            </Link>

            <Link className="vsp-offer vsp-offer--clay" to="/signup?role=organization">
              <Eyebrow>Full profile</Eyebrow>
              <h3>Register your organization</h3>
              <p>
                Claim a verified profile, manage your team, track impact hours, and build
                the kind of recurring partnerships that outlast a single weekend.
              </p>
              <span className="vsp-offer-go">Register organization <Arrow /></span>
            </Link>
          </div>
        </div>
      </section>

      {/* ── For volunteers ── */}
      <section className="vsp-section">
        <div className="vsp-shell">
          <SectionHead
            num="03"
            title="Ready to find your fit?"
            sub="Three ways in, depending on how much you already know about where you want to help."
          />
          <div className="vsp-dests">
            {DESTINATIONS.map(d => (
              <Link className="vsp-dest" to={d.to} key={d.num}>
                <span className="vsp-dest-num">{d.num}</span>
                <div>
                  <h3>{d.title}</h3>
                  <p>{d.body}</p>
                </div>
                <span className="vsp-dest-go"><Arrow size={17} /></span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </Shell>
  );
}
