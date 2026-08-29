import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useDesign } from '../../design/DesignContext';

/* Prototype primitives.

   Same rule as the Default theme: no hue is written down here. Everything
   resolves to --brand-primary / --brand-secondary via the tokens in
   prototype.css, so the picker re-skins the whole theme. */

export const Mark = ({ size = 21 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M20 4C10 4 4 9 4 16c0 1.6.4 3 1.1 4.2C8 14 13 11 18 10c-4 2.4-7.5 6-9.7 10.8 1 .3 2 .5 3.2.5 6.5 0 9.5-6 8.5-17.3Z"
      fill="var(--ptp-accent)"
    />
  </svg>
);

export const Btn = ({ children, variant, sm, block, as: Tag = 'button', className = '', ...rest }) => (
  <Tag
    className={[
      'ptp-btn',
      variant === 'ghost'  ? 'ptp-btn--ghost'  : '',
      variant === 'quiet'  ? 'ptp-btn--quiet'  : '',
      variant === 'onfill' ? 'ptp-btn--onfill' : '',
      sm ? 'ptp-btn--sm' : '',
      block ? 'ptp-btn--block' : '',
      className,
    ].filter(Boolean).join(' ')}
    {...rest}
  >
    {children}
  </Tag>
);

export const Eyebrow = ({ children }) => <span className="ptp-eyebrow">{children}</span>;

export const Tick = ({ color }) => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" style={color ? { color } : undefined}>
    <path d="M3 8.4l3.2 3.2L13 5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const Panel = ({ children, pad, float, className = '', ...rest }) => (
  <div
    className={['ptp-panel', pad ? 'ptp-panel--pad' : '', float ? 'ptp-panel--float' : '', className]
      .filter(Boolean).join(' ')}
    {...rest}
  >
    {children}
  </div>
);

export const Chip = ({ children, tone }) => (
  <span className={'ptp-chip' + (tone ? ` ptp-chip--${tone}` : '')}>{children}</span>
);

export const Field = ({ label, error, hint, children }) => (
  <div className="ptp-row">
    {label && <label className="ptp-label">{label}</label>}
    {children}
    {hint && !error && <span className="ptp-hint">{hint}</span>}
    {error && <span className="ptp-field-err">{error}</span>}
  </div>
);

export const Input = ({ error, className = '', ...rest }) => (
  <input className={['ptp-field', error ? 'ptp-field--err' : '', className].filter(Boolean).join(' ')} {...rest} />
);

export const Area = ({ error, ...rest }) => (
  <textarea className={'ptp-field' + (error ? ' ptp-field--err' : '')} {...rest} />
);

export const State = ({ title, error, children }) => (
  <div className={'ptp-state' + (error ? ' ptp-state--err' : '')}>
    {title && <strong>{title}</strong>}
    {children}
  </div>
);

export const Skeleton = ({ rows = 4 }) => (
  <div aria-busy="true" aria-live="polite">
    {Array.from({ length: rows }).map((_, i) => <div key={i} className="ptp-skel" />)}
  </div>
);

export const Toast = ({ toast }) => (
  <div className={'ptp-toast' + (toast.visible ? ' is-on' : '')} role="status" aria-live="polite">
    {toast.message}
  </div>
);

export const Crumbs = ({ items }) => (
  <nav className="ptp-crumbs" aria-label="Breadcrumb">
    {items.map((it, i) => (
      <span key={i}>
        {it.to ? <Link to={it.to}>{it.label}</Link> : <span>{it.label}</span>}
        {i < items.length - 1 && <span aria-hidden="true" className="ptp-crumb-sep">/</span>}
      </span>
    ))}
  </nav>
);

export const Meter = ({ value, max }) => {
  const known = value != null && max != null && max > 0;
  const pct = known ? Math.min(100, Math.round(((max - value) / max) * 100)) : 0;
  return (
    <div className="ptp-meter" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
      <div className={'ptp-meter-fill' + (known && value === 0 ? ' is-full' : '')} style={{ width: `${pct}%` }} />
    </div>
  );
};

export const Avatar = ({ src, name, lg }) => (
  <span className={'ptp-avatar' + (lg ? ' ptp-avatar--lg' : '')}>
    {src ? <img src={src} alt="" /> : <span>{(name || '?')[0].toUpperCase()}</span>}
  </span>
);

export const DateBlock = ({ iso }) => {
  const d = iso ? new Date(iso) : null;
  return (
    <span className="ptp-date">
      <b>{d ? d.getDate() : '—'}</b>
      <span>{d ? d.toLocaleString('en', { month: 'short' }) : 'TBC'}</span>
    </span>
  );
};

/* ── Shell ──────────────────────────────────────────────────────────── */

const SunIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
    <circle cx="12" cy="12" r="4.2" />
    <path d="M12 2v2.4M12 19.6V22M4.2 4.2l1.7 1.7M18.1 18.1l1.7 1.7M2 12h2.4M19.6 12H22M4.2 19.8l1.7-1.7M18.1 5.9l1.7-1.7" strokeLinecap="round" />
  </svg>
);

const MoonIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
    <path d="M20.5 14.6A8.6 8.6 0 1 1 9.4 3.5a7 7 0 0 0 11.1 11.1Z" strokeLinejoin="round" />
  </svg>
);

export default function Shell({ children }) {
  const { auth, isOrg, logout } = useAuth();
  const { theme, toggleTheme } = useDesign();
  const navigate = useNavigate();

  const accountId = auth?.user?.id;

  return (
    <div className="ptp-root">
      <header className="ptp-nav">
        <div className="ptp-nav-inner">
          <Link className="ptp-brand" to="/"><Mark /> Benevola</Link>

          <nav className="ptp-nav-links">
            <NavLink className={({ isActive }) => 'ptp-nav-link' + (isActive ? ' is-on' : '')} to="/events">
              Events
            </NavLink>
            <NavLink className={({ isActive }) => 'ptp-nav-link' + (isActive ? ' is-on' : '')} to="/organizations">
              Organizations
            </NavLink>
            <NavLink className={({ isActive }) => 'ptp-nav-link' + (isActive ? ' is-on' : '')} to="/about">
              About
            </NavLink>
          </nav>

          <div className="ptp-nav-right">
            <button
              className="ptp-icon-btn"
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

      <footer className="ptp-foot">
        <div className="ptp-foot-inner">
          <div className="ptp-foot-brand">
            <Link className="ptp-brand" to="/"><Mark size={19} /> Benevola</Link>
            <p>Volunteer shifts from local organizations, with real dates and real capacity.</p>
          </div>
          <div className="ptp-foot-cols">
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
        <div className="ptp-foot-base">Benevola · Built for good</div>
      </footer>
    </div>
  );
}
