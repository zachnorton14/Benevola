import React from 'react';
import { Link } from 'react-router-dom';
import Shell, { Btn, Chip, DateBlock, Eyebrow, State, Skeleton, Tick } from '../parts';
import { useEventsSearch } from '../../../data/hooks';
import { formatDuration, shortAddress } from '../../../data/format';

/* One colour block, three routes in, then the objections. The routes are a
   comparison, not decoration, so they earn being a row of panels: the middle
   one is the recommended path and is built differently to say so. */

function Row({ event, orgName }) {
  return (
    <Link className="ptp-item" to={`/events/${event.id}`}>
      <span className="ptp-lead">
        <DateBlock iso={event.date} />
        {event.heroImage && <img className="ptp-thumb" src={event.heroImage} alt="" loading="lazy" />}
      </span>
      <span className="ptp-item-body">
        <span className="ptp-item-title">{event.title}</span>
        <span className="ptp-item-meta">
          {orgName && <span>{orgName}</span>}
          {event.address && <span>{shortAddress(event.address)}</span>}
          <span>{formatDuration(event.duration)}</span>
        </span>
      </span>
      <span className="ptp-chiprow">
        {event.tags.slice(0, 2).map(t => <Chip key={t}>{t.replace(/-/g, ' ')}</Chip>)}
      </span>
    </Link>
  );
}

export default function Landing() {
  const s = useEventsSearch();
  const soon = s.events.slice(0, 5);

  return (
    <Shell>
      <div className="ptp-wrap">
        <section className="ptp-hero">
          <span className="ptp-hero-eyebrow">Free, always</span>
          <h1>Give a Saturday. Get it back tenfold.</h1>
          <p className="ptp-hero-lede">
            Real volunteer shifts from local organizations, with a date, a place
            and a capacity you can count on. Sign on in one click.
          </p>
          <div className="ptp-hero-actions">
            <Btn as={Link} variant="onfill" to="/events">Browse openings</Btn>
            <Btn as={Link} variant="ghost" to="/signup" style={{ color: 'inherit', borderColor: 'currentColor' }}>
              Create an account
            </Btn>
          </div>
        </section>
      </div>

      <section className="ptp-section">
        <div className="ptp-wrap">
          <div className="ptp-section-head">
            <Eyebrow>Pick a lane</Eyebrow>
            <h2 className="ptp-h2">Three ways to take part.</h2>
          </div>

          <div className="ptp-routes">
            <div className="ptp-route">
              <h3>Browse</h3>
              <p className="ptp-route-meta">No account needed</p>
              <ul className="ptp-route-list">
                <li><Tick /> See every open shift</li>
                <li><Tick /> Filter by cause and date</li>
                <li><Tick /> Check capacity before you commit</li>
              </ul>
              <Btn as={Link} variant="ghost" block to="/events">Start looking</Btn>
            </div>

            <div className="ptp-route ptp-route--featured">
              <span className="ptp-route-badge">Most people</span>
              <h3>Volunteer</h3>
              <p className="ptp-route-meta">Free account, about a minute</p>
              <ul className="ptp-route-list">
                <li><Tick /> Sign on to shifts in one click</li>
                <li><Tick /> Keep every booking in your profile</li>
                <li><Tick /> Cancel just as easily</li>
              </ul>
              <Btn as={Link} variant="onfill" block to="/signup">Create an account</Btn>
            </div>

            <div className="ptp-route">
              <h3>Organize</h3>
              <p className="ptp-route-meta">For groups posting work</p>
              <ul className="ptp-route-list">
                <li><Tick /> Post a shift in three minutes</li>
                <li><Tick /> Set a capacity, stop overbooking</li>
                <li><Tick /> See your roster as it fills</li>
              </ul>
              <Btn as={Link} variant="ghost" block to="/signup?role=organization">Post an event</Btn>
            </div>
          </div>
        </div>
      </section>

      <section className="ptp-section" style={{ paddingTop: 0 }}>
        <div className="ptp-wrap">
          <div className="ptp-section-head" style={{ marginBottom: 24 }}>
            <Eyebrow>Open right now</Eyebrow>
            <h2 className="ptp-h2">Happening soon</h2>
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
            <>
              <div className="ptp-list">
                {soon.map(ev => <Row key={ev.id} event={ev} orgName={s.orgNames[ev.organizationId]} />)}
              </div>
              <div style={{ marginTop: 26 }}>
                <Btn as={Link} variant="ghost" to="/events">See every opening</Btn>
              </div>
            </>
          )}
        </div>
      </section>

      <section className="ptp-section" style={{ paddingTop: 0 }}>
        <div className="ptp-wrap">
          <div className="ptp-section-head">
            <h2 className="ptp-h2">Questions people actually ask.</h2>
          </div>

          <div className="ptp-faq">
            <details>
              <summary>Does it cost anything?<span className="ptp-faq-sign" aria-hidden="true" /></summary>
              <p>
                No. It is free for volunteers and free for the organizations
                posting the work. There is no paid tier holding anything back.
              </p>
            </details>
            <details>
              <summary>What if I sign up and cannot make it?<span className="ptp-faq-sign" aria-hidden="true" /></summary>
              <p>
                Cancel from the event page and your spot reopens immediately.
                The organizer sees the roster change straight away, which is the
                whole point of tracking capacity.
              </p>
            </details>
            <details>
              <summary>Who can see my profile?<span className="ptp-faq-sign" aria-hidden="true" /></summary>
              <p>
                Organizers see the volunteers on their own rosters. Nobody else
                gets a list. You can delete your account, and its bookings, at
                any time from your profile.
              </p>
            </details>
            <details>
              <summary>Can my organization post without an account?<span className="ptp-faq-sign" aria-hidden="true" /></summary>
              <p>
                No, because someone has to own the listing and the roster behind
                it. Creating an organization account takes about a minute.
              </p>
            </details>
          </div>
        </div>
      </section>

      <section className="ptp-section" style={{ paddingTop: 0 }}>
        <div className="ptp-wrap">
          <div className="ptp-band">
            <div>
              <h3>Somebody nearby needs a hand this weekend.</h3>
              <p>Browse what is open, no account required.</p>
            </div>
            <Btn as={Link} to="/events">Find something to do</Btn>
          </div>
        </div>
      </section>
    </Shell>
  );
}
