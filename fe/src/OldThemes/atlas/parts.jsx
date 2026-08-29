import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/* Atlas primitives. One component vocabulary across every screen: same button
   shapes, same field, same chip. Familiarity is the point. */

export const Mark = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M20 4C10 4 4 9 4 16c0 1.6.4 3 1.1 4.2C8 14 13 11 18 10c-4 2.4-7.5 6-9.7 10.8 1 .3 2 .5 3.2.5 6.5 0 9.5-6 8.5-17.3Z"
      fill="var(--atl-accent)"
    />
  </svg>
);

export const Btn = ({ children, variant, sm, block, as: Tag = 'button', className = '', ...rest }) => (
  <Tag
    className={[
      'atl-btn',
      variant === 'ghost' ? 'atl-btn--ghost' : '',
      variant === 'quiet' ? 'atl-btn--quiet' : '',
      sm ? 'atl-btn--sm' : '',
      block ? 'atl-btn--block' : '',
      className,
    ].filter(Boolean).join(' ')}
    {...rest}
  >
    {children}
  </Tag>
);

export const Panel = ({ children, pad, float, className = '', ...rest }) => (
  <div
    className={['atl-panel', pad ? 'atl-panel--pad' : '', float ? 'atl-panel--float' : '', className]
      .filter(Boolean).join(' ')}
    {...rest}
  >
    {children}
  </div>
);

export const Chip = ({ children, tone }) => (
  <span className={'atl-chip' + (tone ? ` atl-chip--${tone}` : '')}>{children}</span>
);

export const Field = ({ label, error, hint, children }) => (
  <div className="atl-row">
    {label && <label className="atl-label">{label}</label>}
    {children}
    {hint && !error && <span className="atl-muted" style={{ display: 'block', marginTop: 5 }}>{hint}</span>}
    {error && <span className="atl-field-err">{error}</span>}
  </div>
);

export const Input = ({ error, className = '', ...rest }) => (
  <input className={['atl-field', error ? 'atl-field--err' : '', className].filter(Boolean).join(' ')} {...rest} />
);

export const Area = ({ error, ...rest }) => (
  <textarea className={'atl-field' + (error ? ' atl-field--err' : '')} {...rest} />
);

export const State = ({ title, error, children }) => (
  <div className={'atl-state' + (error ? ' atl-state--err' : '')}>
    {title && <strong>{title}</strong>}
    {children}
  </div>
);

/** Skeleton rows: the shape of the answer while it loads, not a spinner. */
export const Skeleton = ({ rows = 4 }) => (
  <div aria-busy="true" aria-live="polite">
    {Array.from({ length: rows }).map((_, i) => <div key={i} className="atl-skel atl-skel--row" />)}
  </div>
);

export const Toast = ({ toast }) => (
  <div className={'atl-toast' + (toast.visible ? ' is-on' : '')} role="status" aria-live="polite">
    {toast.message}
  </div>
);

export const Crumbs = ({ items }) => (
  <nav className="atl-crumbs" aria-label="Breadcrumb">
    {items.map((it, i) => (
      <span key={i}>
        {it.to ? <Link to={it.to}>{it.label}</Link> : <span>{it.label}</span>}
        {i < items.length - 1 && <span aria-hidden="true" style={{ marginLeft: 7 }}>/</span>}
      </span>
    ))}
  </nav>
);

export const Meter = ({ value, max }) => {
  const known = value != null && max != null && max > 0;
  const pct = known ? Math.min(100, Math.round(((max - value) / max) * 100)) : 0;
  return (
    <div className="atl-meter" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
      <div className={'atl-meter-fill' + (known && value === 0 ? ' is-full' : '')} style={{ width: `${pct}%` }} />
    </div>
  );
};

export const Avatar = ({ src, name, lg }) => (
  <span className={'atl-avatar' + (lg ? ' atl-avatar--lg' : '')}>
    {src ? <img src={src} alt="" /> : <span>{(name || '?')[0].toUpperCase()}</span>}
  </span>
);

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

export default function Shell({ children, wide }) {
  const { auth, isOrg, logout } = useAuth();
  const navigate = useNavigate();
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const accountId = auth?.user?.id;

  return (
    <div className="atl-root">
      <header className="atl-nav">
        <Link className="atl-brand" to="/"><Mark /> Benevola</Link>

        <nav className="atl-nav-links">
          <NavLink className={({ isActive }) => 'atl-nav-link' + (isActive ? ' is-on' : '')} to="/events">
            Events
          </NavLink>
          <NavLink className={({ isActive }) => 'atl-nav-link' + (isActive ? ' is-on' : '')} to="/organizations">
            Organizations
          </NavLink>
          <NavLink className={({ isActive }) => 'atl-nav-link' + (isActive ? ' is-on' : '')} to="/about">
            About
          </NavLink>
        </nav>

        <div className="atl-nav-right">
          <button
            className="atl-icon-btn"
            onClick={() => setTheme(t => (t === 'light' ? 'dark' : 'light'))}
            aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
          >
            {theme === 'light' ? <MoonIcon /> : <SunIcon />}
          </button>

          {auth ? (
            <>
              {isOrg && (
                <Btn as={Link} sm variant="ghost" to={`/organizations/${accountId}/events/new`}>
                  Post event
                </Btn>
              )}
              <Btn
                as={Link}
                sm
                variant="quiet"
                to={isOrg ? `/organizations/${accountId}` : `/volunteer/${accountId}`}
              >
                {isOrg ? 'Your organization' : 'Your profile'}
              </Btn>
              <Btn sm variant="ghost" onClick={async () => { await logout(); navigate('/'); }}>
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
      </header>

      {children}

      <footer className="atl-foot">
        <div className="atl-foot-inner">
          <span>Benevola · Built for good</span>
          <span style={{ display: 'flex', gap: 16 }}>
            <Link to="/events">Find work</Link>
            <Link to="/organizations">Organizations</Link>
            <Link to="/about">About</Link>
          </span>
        </div>
      </footer>
    </div>
  );
}
