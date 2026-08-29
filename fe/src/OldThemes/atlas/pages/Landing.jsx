import React from 'react';
import { Link } from 'react-router-dom';
import Shell, { Btn, Chip, State, Skeleton } from '../parts';
import { useEventsSearch } from '../../../data/hooks';
import { formatDuration, shortAddress } from '../../../data/format';

/* The landing page answers one question: is there anything near me worth
   doing? So it shows real openings straight away rather than a marketing
   pitch followed by a search box. */

function Row({ event, orgName }) {
  const d = event.date ? new Date(event.date) : null;
  return (
    <Link className="atl-item" to={`/events/${event.id}`}>
      <span className="atl-lead">
        <span className="atl-date">
          <b>{d ? d.getDate() : '—'}</b>
          <span>{d ? d.toLocaleString('en', { month: 'short' }) : 'TBC'}</span>
        </span>
        {event.heroImage && <img className="atl-thumb" src={event.heroImage} alt="" loading="lazy" />}
      </span>
      <span className="atl-item-body">
        <span className="atl-item-title">{event.title}</span>
        <span className="atl-item-meta">
          {orgName && <span>{orgName}</span>}
          {event.address && <span>{shortAddress(event.address)}</span>}
          <span>{formatDuration(event.duration)}</span>
        </span>
      </span>
      <span className="atl-chiprow">
        {event.tags.slice(0, 2).map(t => <Chip key={t}>{t.replace(/-/g, ' ')}</Chip>)}
      </span>
    </Link>
  );
}

export default function Landing() {
  const s = useEventsSearch();
  const soon = s.events.slice(0, 6);

  return (
    <Shell>
      <div className="atl-shell">
        <section className="atl-hero">
          <h1>Find volunteer work that actually fits your week.</h1>
          <p>
            Real openings from local organizations, filtered by cause, distance
            and the hours you can spare.
          </p>
          <div className="atl-hero-actions">
            <Btn as={Link} to="/events">Browse openings</Btn>
            <Btn as={Link} variant="ghost" to="/signup?role=organization">Post an event</Btn>
          </div>
        </section>

        <section className="atl-strip">
          <div><b>{s.total ?? soon.length}</b> open right now</div>
          <div><b>Free</b> for volunteers, always</div>
          <div><b>Local</b> organizations, verified</div>
        </section>

        <section className="atl-section">
          <div className="atl-section-head">
            <div>
              <h2 className="atl-h2">Happening soon</h2>
              <p className="atl-muted">The next few shifts posted near you.</p>
            </div>
            <Link className="atl-link" to="/events">See all openings</Link>
          </div>

          {s.loading ? (
            <Skeleton rows={4} />
          ) : s.error ? (
            <State error title="Could not load openings">
              The API is not answering. Try again in a moment.
            </State>
          ) : soon.length === 0 ? (
            <State title="Nothing posted yet">
              When organizations post shifts, they show up here first.
            </State>
          ) : (
            <div className="atl-list">
              {soon.map(ev => <Row key={ev.id} event={ev} orgName={s.orgNames[ev.organizationId]} />)}
            </div>
          )}
        </section>

        <section className="atl-section" style={{ borderTop: '1px solid var(--atl-line)' }}>
          <h2 className="atl-h2">Running an organization?</h2>
          <p className="atl-sub" style={{ marginBottom: 18 }}>
            Post a shift in about three minutes, then watch your roster fill up.
            You keep the volunteer list, the hours and the history in one place.
          </p>
          <Btn as={Link} to="/signup?role=organization">Create an organization account</Btn>
        </section>
      </div>
    </Shell>
  );
}
