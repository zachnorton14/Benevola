import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/* Dispatch primitives. Flat blocks, hard rules, one vermilion for anything
   you can act on. Nothing here uses rounding, shadow or gradient. */

export const Mark = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <rect x="2.5" y="2.5" width="19" height="19" stroke="currentColor" strokeWidth="2.5" />
    <path d="M7 12.4l3.4 3.4L17 8.6" stroke="var(--dsp-signal)" strokeWidth="2.8" />
  </svg>
);

export const Btn = ({ children, variant, sm, block, as: Tag = 'button', className = '', ...rest }) => (
  <Tag
    className={[
      'dsp-btn',
      variant === 'ghost' ? 'dsp-btn--ghost' : '',
      sm ? 'dsp-btn--sm' : '',
      block ? 'dsp-btn--block' : '',
      className,
    ].filter(Boolean).join(' ')}
    {...rest}
  >
    {children}
  </Tag>
);

export const Block = ({ children, pad, fill, className = '', ...rest }) => (
  <div
    className={['dsp-block', pad ? 'dsp-block--pad' : '', fill ? 'dsp-block--fill' : '', className]
      .filter(Boolean).join(' ')}
    {...rest}
  >
    {children}
  </div>
);

export const BlockHead = ({ children, right }) => (
  <div className="dsp-block-head">
    <span>{children}</span>
    {right && <span>{right}</span>}
  </div>
);

export const TagChip = ({ children, tone }) => (
  <span className={'dsp-tag' + (tone ? ` dsp-tag--${tone}` : '')}>{children}</span>
);

export const Kicker = ({ children, plain }) => (
  <span className={'dsp-kicker' + (plain ? ' dsp-kicker--plain' : '')}>{children}</span>
);

export const Meta = ({ children }) => <span className="dsp-meta">{children}</span>;

export const Field = ({ label, error, hint, children }) => (
  <div className="dsp-row">
    {label && <label className="dsp-label">{label}</label>}
    {children}
    {hint && !error && <span className="dsp-meta" style={{ display: 'block', marginTop: 5 }}>{hint}</span>}
    {error && <span className="dsp-field-err">{error}</span>}
  </div>
);

export const Input = ({ error, className = '', ...rest }) => (
  <input className={['dsp-field', error ? 'dsp-field--err' : '', className].filter(Boolean).join(' ')} {...rest} />
);

export const Area = ({ error, ...rest }) => (
  <textarea className={'dsp-field' + (error ? ' dsp-field--err' : '')} {...rest} />
);

export const State = ({ title, error, children }) => (
  <div className={'dsp-state' + (error ? ' dsp-state--err' : '')}>
    {title && <strong>{title}</strong>}
    {children}
  </div>
);

export const Skeleton = ({ rows = 4 }) => (
  <div aria-busy="true" aria-live="polite">
    {Array.from({ length: rows }).map((_, i) => <div key={i} className="dsp-skel" />)}
  </div>
);

export const Toast = ({ toast }) => (
  <div className={'dsp-toast' + (toast.visible ? ' is-on' : '')} role="status" aria-live="polite">
    {toast.message}
  </div>
);

export const Crumbs = ({ items }) => (
  <nav className="dsp-crumbs" aria-label="Breadcrumb">
    {items.map((it, i) => (
      <span key={i}>
        {it.to ? <Link to={it.to}>{it.label}</Link> : <span>{it.label}</span>}
        {i < items.length - 1 && <span aria-hidden="true" style={{ marginLeft: 8 }}>/</span>}
      </span>
    ))}
  </nav>
);

/** Capacity as a tally of boxes: countable at a glance, no gradient bar. */
export const Tally = ({ taken, capacity }) => {
  if (capacity == null) return <Meta>No limit set</Meta>;
  const shown = Math.min(capacity, 40);
  const full = taken >= capacity;
  return (
    <div className="dsp-tally" role="img" aria-label={`${taken} of ${capacity} places taken`}>
      {Array.from({ length: shown }).map((_, i) => (
        <i key={i} className={i < taken ? (full ? 'is-full' : 'is-taken') : ''} />
      ))}
      {capacity > shown && <Meta>+{capacity - shown}</Meta>}
    </div>
  );
};

export const Avatar = ({ src, name, lg }) => (
  <span className={'dsp-avatar' + (lg ? ' dsp-avatar--lg' : '')}>
    {src ? <img src={src} alt="" /> : <span>{(name || '?')[0].toUpperCase()}</span>}
  </span>
);

/* ── Shell ──────────────────────────────────────────────────────────── */

export default function Shell({ children }) {
  const { auth, isOrg, logout } = useAuth();
  const navigate = useNavigate();
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const accountId = auth?.user?.id;

  return (
    <div className="dsp-root">
      <header className="dsp-nav">
        <div className="dsp-nav-inner">
          <Link className="dsp-brand" to="/"><Mark /> Benevola</Link>

          <NavLink className={({ isActive }) => 'dsp-nav-link' + (isActive ? ' is-on' : '')} to="/events">
            Openings
          </NavLink>
          <NavLink className={({ isActive }) => 'dsp-nav-link' + (isActive ? ' is-on' : '')} to="/organizations">
            Orgs
          </NavLink>
          <NavLink className={({ isActive }) => 'dsp-nav-link' + (isActive ? ' is-on' : '')} to="/about">
            About
          </NavLink>

          <div className="dsp-nav-right">
            <button
              className="dsp-nav-link"
              style={{ background: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
              onClick={() => setTheme(t => (t === 'light' ? 'dark' : 'light'))}
            >
              {theme === 'light' ? 'Dark' : 'Light'}
            </button>

            {auth ? (
              <>
                {isOrg && (
                  <Link className="dsp-nav-link" to={`/organizations/${accountId}/events/new`}>
                    Post
                  </Link>
                )}
                <Link
                  className="dsp-nav-link"
                  to={isOrg ? `/organizations/${accountId}` : `/volunteer/${accountId}`}
                >
                  {isOrg ? 'Your org' : 'Your profile'}
                </Link>
                <button
                  className="dsp-nav-link"
                  style={{ background: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
                  onClick={async () => { await logout(); navigate('/'); }}
                >
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link className="dsp-nav-link" to="/login">Log in</Link>
                <Link className="dsp-nav-link is-on" to="/signup">Sign up</Link>
              </>
            )}
          </div>
        </div>
      </header>

      {children}

      <footer className="dsp-foot">
        <div className="dsp-foot-inner">
          <span>Benevola · Built for good</span>
          <span>Edition 2026</span>
        </div>
      </footer>
    </div>
  );
}
