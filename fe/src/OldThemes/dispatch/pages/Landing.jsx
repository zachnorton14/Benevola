import React from 'react';
import { Link } from 'react-router-dom';
import Shell, { Btn, Kicker, State, Skeleton, TagChip } from '../parts';
import { useEventsSearch } from '../../../data/hooks';
import { formatDuration, shortAddress } from '../../../data/format';

/* The board itself: what is posted, in date order, above the fold. */

function Notice({ event, orgName }) {
  const d = event.date ? new Date(event.date) : null;
  return (
    <Link className="dsp-item" to={`/events/${event.id}`}>
      <span className="dsp-lead">
        <span className="dsp-date">
          <b>{d ? d.getDate() : '—'}</b>
          <span>{d ? d.toLocaleString('en', { month: 'short' }) : 'TBC'}</span>
        </span>
        {event.heroImage && <img className="dsp-thumb" src={event.heroImage} alt="" loading="lazy" />}
      </span>
      <span className="dsp-item-body">
        <span className="dsp-item-title">{event.title}</span>
        <span className="dsp-item-meta">
          {orgName && <span>{orgName}</span>}
          {event.address && <span>{shortAddress(event.address)}</span>}
          <span>{formatDuration(event.duration)}</span>
        </span>
      </span>
      <span className="dsp-tagrow">
        {event.tags.slice(0, 2).map(t => <TagChip key={t}>{t.replace(/-/g, ' ')}</TagChip>)}
      </span>
    </Link>
  );
}

export default function Landing() {
  const s = useEventsSearch();
  const soon = s.events.slice(0, 6);

  return (
    <Shell>
      <div className="dsp-shell">
        <section className="dsp-hero">
          <Kicker>Public notice</Kicker>
          <h1 className="dsp-h1">Work that needs doing.<br />Near you. This week.</h1>
          <p>
            Real shifts posted by local organizations, with a date, a place and a
            number of places left.
          </p>
          <div className="dsp-hero-actions">
            <Btn as={Link} to="/events">See all openings</Btn>
            <Btn as={Link} variant="ghost" to="/signup?role=organization">Post an event</Btn>
          </div>
        </section>

        <section className="dsp-stats">
          <div><b>{s.total ?? soon.length}</b><span>Open now</span></div>
          <div><b>Free</b><span>For volunteers</span></div>
          <div><b>Local</b><span>Verified orgs</span></div>
        </section>

        <section className="dsp-section">
          <div className="dsp-sec-head">
            <h2 className="dsp-h2">Posted this week</h2>
            <Link className="dsp-link" to="/events">All openings</Link>
          </div>

          {s.loading ? (
            <div style={{ marginTop: 18 }}><Skeleton rows={4} /></div>
          ) : s.error ? (
            <div style={{ marginTop: 18 }}>
              <State error title="Could not load openings">
                The API is not answering. Try again shortly.
              </State>
            </div>
          ) : soon.length === 0 ? (
            <div style={{ marginTop: 18 }}>
              <State title="Board is empty">
                When organizations post shifts, they appear here first.
              </State>
            </div>
          ) : (
            <div className="dsp-list">
              {soon.map(ev => <Notice key={ev.id} event={ev} orgName={s.orgNames[ev.organizationId]} />)}
            </div>
          )}
        </section>

        <section className="dsp-section" style={{ borderTop: 'var(--dsp-rule-thick) solid var(--dsp-ink)' }}>
          <h2 className="dsp-h2">Running an organization?</h2>
          <p className="dsp-lede" style={{ margin: '12px 0 20px' }}>
            Post a shift in about three minutes. Keep the roster, the hours and
            the history in one place.
          </p>
          <Btn as={Link} to="/signup?role=organization">Create an organization account</Btn>
        </section>
      </div>
    </Shell>
  );
}
