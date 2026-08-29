import React, { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useDesign } from '../../design/DesignContext';
import { DEMO_MODE, isSample } from '../../config';

/* Default primitives.

   Every colour here resolves back to --brand-primary / --brand-secondary,
   which the switcher writes onto :root. Nothing hardcodes a hue, so the whole
   theme re-skins the moment someone drags the picker. */

export const Mark = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <defs>
      <linearGradient id="def-mark" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="var(--def-pri)" />
        <stop offset="100%" stopColor="var(--def-sec)" />
      </linearGradient>
    </defs>
    <path
      d="M20 4C10 4 4 9 4 16c0 1.6.4 3 1.1 4.2C8 14 13 11 18 10c-4 2.4-7.5 6-9.7 10.8 1 .3 2 .5 3.2.5 6.5 0 9.5-6 8.5-17.3Z"
      fill="url(#def-mark)"
    />
  </svg>
);

export const Btn = ({ children, variant, sm, block, as: Tag = 'button', className = '', ...rest }) => (
  <Tag
    className={[
      'def-btn',
      variant === 'ghost' ? 'def-btn--ghost' : '',
      variant === 'quiet' ? 'def-btn--quiet' : '',
      sm ? 'def-btn--sm' : '',
      block ? 'def-btn--block' : '',
      className,
    ].filter(Boolean).join(' ')}
    {...rest}
  >
    {children}
  </Tag>
);

/** Text link with a nudging arrow. Stands in for a second button. */
export const ArrowLink = ({ to, children }) => (
  <Link className="def-arrow" to={to}>
    {children}
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M3 8h9M8.5 4l4 4-4 4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  </Link>
);

export const Eyebrow = ({ children }) => <span className="def-eyebrow">{children}</span>;

export const Panel = ({ children, pad, float, className = '', ...rest }) => (
  <div
    className={['def-panel', pad ? 'def-panel--pad' : '', float ? 'def-panel--float' : '', className]
      .filter(Boolean).join(' ')}
    {...rest}
  >
    {children}
  </div>
);

export const Chip = ({ children, tone }) => (
  <span className={'def-chip' + (tone ? ` def-chip--${tone}` : '')}>{children}</span>
);

/* A tick that draws itself. Used wherever something the visitor did has just
   succeeded — the RSVP confirmation, the post-login welcome. */
export const Check = ({ size = 18 }) => (
  <svg
    className="def-check"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="10" fill="currentColor" opacity="0.13" />
    <path
      d="M7.5 12.4l3.1 3.1 6-6.4"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/* True for a beat after data first arrives, false forever after.

   The stagger is worth having once, when a list appears out of nothing. Left
   on, it replays on every filter keystroke and the list strobes — so the class
   comes off as soon as the animation has had time to finish. */
export function useFirstReveal(ready) {
  const played = useRef(false);
  const [revealing, setRevealing] = useState(false);

  useEffect(() => {
    if (!ready || played.current) return undefined;
    played.current = true;
    setRevealing(true);
    const t = setTimeout(() => setRevealing(false), 900);
    return () => clearTimeout(t);
  }, [ready]);

  return revealing;
}

/* Marks one listing as seeded demo content. Renders nothing when the site is
   serving real data, so call sites do not need their own condition — and the
   day a real organization posts, only src/config.js changes. */
export const SampleTag = () => (
  isSample() ? <Chip tone="sample">Sample</Chip> : null
);

export const Field = ({ label, error, hint, children }) => (
  <div className="def-row">
    {label && <label className="def-label">{label}</label>}
    {children}
    {hint && !error && <span className="def-hint">{hint}</span>}
    {error && <span className="def-field-err">{error}</span>}
  </div>
);

export const Input = ({ error, className = '', ...rest }) => (
  <input className={['def-field', error ? 'def-field--err' : '', className].filter(Boolean).join(' ')} {...rest} />
);

export const Area = ({ error, ...rest }) => (
  <textarea className={'def-field' + (error ? ' def-field--err' : '')} {...rest} />
);

export const State = ({ title, error, children }) => (
  <div className={'def-state' + (error ? ' def-state--err' : '')}>
    {title && <strong>{title}</strong>}
    {children}
  </div>
);

/** The shape of the answer while it loads, rather than a spinner. */
export const Skeleton = ({ rows = 4 }) => (
  <div aria-busy="true" aria-live="polite">
    {Array.from({ length: rows }).map((_, i) => <div key={i} className="def-skel" />)}
  </div>
);

export const Toast = ({ toast }) => (
  <div className={'def-toast' + (toast.visible ? ' is-on' : '')} role="status" aria-live="polite">
    {toast.message}
  </div>
);

export const Crumbs = ({ items }) => (
  <nav className="def-crumbs" aria-label="Breadcrumb">
    {items.map((it, i) => (
      <span key={i}>
        {it.to ? <Link to={it.to}>{it.label}</Link> : <span>{it.label}</span>}
        {i < items.length - 1 && <span aria-hidden="true" className="def-crumb-sep">/</span>}
      </span>
    ))}
  </nav>
);

export const Meter = ({ value, max }) => {
  const known = value != null && max != null && max > 0;
  const pct = known ? Math.min(100, Math.round(((max - value) / max) * 100)) : 0;
  return (
    <div className="def-meter" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
      <div className={'def-meter-fill' + (known && value === 0 ? ' is-full' : '')} style={{ width: `${pct}%` }} />
    </div>
  );
};

export const Avatar = ({ src, name, lg }) => {
  /* A stored image can outlive the file it points at — an R2 object gets
     deleted, a headshot has not been added yet — and a dead URL renders the
     browser's broken-image glyph, which looks like a bug rather than an empty
     slot. Fall back to the initial instead. Reset on src so a list that
     re-renders with different people does not keep a stale failure. */
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [src]);

  return (
    <span className={'def-avatar' + (lg ? ' def-avatar--lg' : '')}>
      {src && !failed
        ? <img src={src} alt="" onError={() => setFailed(true)} />
        : <span>{(name || '?')[0].toUpperCase()}</span>}
    </span>
  );
};

/** Date block used down the left of every event row. */
export const DateBlock = ({ iso }) => {
  const d = iso ? new Date(iso) : null;
  return (
    <span className="def-date">
      <b>{d ? d.getDate() : '—'}</b>
      <span>{d ? d.toLocaleString('en', { month: 'short' }) : 'TBC'}</span>
    </span>
  );
};

/* ── Shell ──────────────────────────────────────────────────────────── */

const SunIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <circle cx="12" cy="12" r="4.2" />
    <path d="M12 2v2.4M12 19.6V22M4.2 4.2l1.7 1.7M18.1 18.1l1.7 1.7M2 12h2.4M19.6 12H22M4.2 19.8l1.7-1.7M18.1 5.9l1.7-1.7" strokeLinecap="round" />
  </svg>
);

const MoonIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M20.5 14.6A8.6 8.6 0 1 1 9.4 3.5a7 7 0 0 0 11.1 11.1Z" strokeLinejoin="round" />
  </svg>
);

export default function Shell({ children }) {
  const { auth, isOrg, logout } = useAuth();
  const { theme, toggleTheme } = useDesign();
  const navigate = useNavigate();

  const accountId = auth?.user?.id;

  return (
    <div className="def-root">
      <header className="def-nav">
        <div className="def-nav-inner">
          <Link className="def-brand" to="/"><Mark /> Benevola</Link>

          <nav className="def-nav-links">
            <NavLink className={({ isActive }) => 'def-nav-link' + (isActive ? ' is-on' : '')} to="/events">
              Events
            </NavLink>
            <NavLink className={({ isActive }) => 'def-nav-link' + (isActive ? ' is-on' : '')} to="/organizations">
              Organizations
            </NavLink>
            <NavLink className={({ isActive }) => 'def-nav-link' + (isActive ? ' is-on' : '')} to="/about">
              About
            </NavLink>
          </nav>

          <div className="def-nav-right">
            <button
              className="def-icon-btn"
              onClick={toggleTheme}
              aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
            >
              {theme === 'light' ? <MoonIcon /> : <SunIcon />}
            </button>

            {auth ? (
              <>
                {isOrg && (
                  <Btn as={Link} sm variant="quiet" to={`/organizations/${accountId}/events/new`}>
                    Post event
                  </Btn>
                )}
                <Btn
                  as={Link}
                  sm
                  variant="ghost"
                  to={isOrg ? `/organizations/${accountId}` : `/volunteer/${accountId}`}
                >
                  {isOrg ? 'Your organization' : 'Your profile'}
                </Btn>
                <Btn sm variant="quiet" onClick={async () => { await logout(); navigate('/'); }}>
                  Log out
                </Btn>
              </>
            ) : (
              <>
                <Btn as={Link} sm variant="quiet" to="/login">Log in</Btn>
                <Btn as={Link} sm to="/signup">Sign up</Btn>
              </>
            )}
          </div>
        </div>
      </header>

      {children}

      <footer className="def-foot">
        <div className="def-foot-inner">
          <div className="def-foot-brand">
            <Link className="def-brand" to="/"><Mark size={18} /> Benevola</Link>
            <p>Volunteer shifts from local organizations, with real dates and real capacity.</p>
          </div>
          <div className="def-foot-cols">
            <div>
              <h4>Volunteers</h4>
              <Link to="/events">Browse openings</Link>
              <Link to="/signup">Create an account</Link>
            </div>
            <div>
              <h4>Organizations</h4>
              <Link to="/organizations">Directory</Link>
              <Link to="/signup?role=organization">Post an event</Link>
            </div>
            <div>
              <h4>Benevola</h4>
              <Link to="/about">About</Link>
              <Link to="/login">Log in</Link>
            </div>
          </div>
        </div>
        <div className="def-foot-base">
          {DEMO_MODE && (
            /* Not dismissible on purpose: a banner people can close stops
               framing the site the moment they close it. */
            <p className="def-note def-foot-notice">
              <b>This is a student project, not a running service.</b> Benevola was
              built at NC State to learn on. Every organization and event listed here
              is sample data created by us — none of them are real, and nothing posted
              here is an event you can attend.
            </p>
          )}
          <span>Benevola · Built for good</span>
        </div>
      </footer>
    </div>
  );
}
