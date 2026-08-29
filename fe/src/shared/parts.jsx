import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import { useAddressSuggestions, useClickOutside } from '../data/hooks';
import { reverseGeocode } from '../data/api';
import './ui.css';

/* Primitives for the surfaces that are shared across every design.

   They carry no design-specific classes: every colour, radius and typeface
   comes from the --ui-* bridge in ui.css, which each theme maps onto its own
   tokens. That way one implementation looks at home in all of them. */

/* ── Frame ──────────────────────────────────────────────────────────── */

export function PageFrame({ narrow, children }) {
  return (
    <div className="ui-page">
      <header className="ui-bar">
        <Link className="ui-brand" to="/">
          <LeafMark />
          Benevola
        </Link>
        <nav style={{ display: 'flex', gap: 18 }}>
          <Link className="ui-bar-link" to="/events">Events</Link>
          <Link className="ui-bar-link" to="/organizations">Organizations</Link>
        </nav>
      </header>

      <main className="ui-main">
        <div className={'ui-wrap' + (narrow ? ' ui-wrap--narrow' : '')}>{children}</div>
      </main>

      <footer className="ui-foot">Benevola · Built for good</footer>
    </div>
  );
}

export function LeafMark({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M20 4C10 4 4 9 4 16c0 1.6.4 3 1.1 4.2C8 14 13 11 18 10c-4 2.4-7.5 6-9.7 10.8 1 .3 2 .5 3.2.5 6.5 0 9.5-6 8.5-17.3Z"
        fill="var(--ui-accent)"
      />
    </svg>
  );
}

/* ── Form ───────────────────────────────────────────────────────────── */

export const Field = ({ label, error, hint, children }) => (
  <div className="ui-row">
    {label && <label className="ui-label">{label}</label>}
    {children}
    {hint && !error && <span className="ui-note">{hint}</span>}
    {error && <span className="ui-err">{error}</span>}
  </div>
);

export const TextInput = ({ error, className = '', ...rest }) => (
  <input className={['ui-field', error ? 'ui-field--err' : '', className].filter(Boolean).join(' ')} {...rest} />
);

export const TextArea = ({ error, ...rest }) => (
  <textarea className={'ui-field' + (error ? ' ui-field--err' : '')} {...rest} />
);

export const Btn = ({ children, variant, block, className = '', ...rest }) => (
  <button
    className={[
      'ui-btn',
      variant === 'ghost' ? 'ui-btn--ghost' : '',
      block ? 'ui-btn--block' : '',
      className,
    ].filter(Boolean).join(' ')}
    {...rest}
  >
    {children}
  </button>
);

export const Banner = ({ tone, children }) => (
  <div className={'ui-banner' + (tone === 'info' ? ' ui-banner--info' : '')}>{children}</div>
);

export const StateBlock = ({ title, error, children }) => (
  <div className={'ui-state' + (error ? ' ui-state--err' : '')}>
    {title && <strong>{title}</strong>}
    {children}
  </div>
);

export function RoleSwitch({ value, onChange, options }) {
  return (
    <div className="ui-switch" role="group" aria-label="Account type">
      {options.map(o => (
        <button
          key={o.value}
          type="button"
          className={value === o.value ? 'is-on' : ''}
          onClick={() => onChange(o.value)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function PasswordInput({ value, onChange, placeholder, error, autoComplete }) {
  const [show, setShow] = useState(false);
  return (
    <div className="ui-pw">
      <TextInput
        type={show ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        error={error}
        autoComplete={autoComplete}
      />
      <button
        type="button"
        className="ui-pw-eye"
        onClick={() => setShow(s => !s)}
        aria-label={show ? 'Hide password' : 'Show password'}
      >
        <svg viewBox="0 0 24 24" width="17" height="17" fill="none">
          {show
            ? <>
                <path d="M1.5 12S5.5 4.8 12 4.8 22.5 12 22.5 12 18.5 19.2 12 19.2 1.5 12 1.5 12Z" stroke="currentColor" strokeWidth="1.5" />
                <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" />
              </>
            : <path d="M17.9 17.9A10 10 0 0 1 12 19.8C5.5 19.8 1.5 12 1.5 12a18.4 18.4 0 0 1 5.1-5.9M9.9 4.4A9.1 9.1 0 0 1 12 4.2c6.5 0 10.5 7.8 10.5 7.8a18.5 18.5 0 0 1-2.2 3.2m-6.7-1.1a3 3 0 1 1-4.2-4.2M1.5 1.5l21 21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />}
        </svg>
      </button>
    </div>
  );
}

/* ── Address autocomplete ───────────────────────────────────────────── */

export function AddressField({ value, onTextChange, onPick, placeholder = 'City, address, or place' }) {
  const { suggestions, open, query, dismiss, reopen } = useAddressSuggestions();
  const wrapRef = useClickOutside(dismiss);

  return (
    <div className="ui-suggest-wrap" ref={wrapRef}>
      <input
        className="ui-field"
        value={value ?? ''}
        placeholder={placeholder}
        autoComplete="off"
        onChange={e => { onTextChange(e.target.value); query(e.target.value); }}
        onFocus={reopen}
      />
      {open && (
        <div className="ui-suggest">
          {suggestions.map((s, i) => (
            <button
              key={i}
              type="button"
              onMouseDown={() => { onPick(s.display_name, parseFloat(s.lat), parseFloat(s.lon)); dismiss(); }}
            >
              {s.display_name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Tags ───────────────────────────────────────────────────────────── */

export function TagPicker({ tags, loading, selected, onToggle }) {
  const [query, setQuery] = useState('');

  const available = tags.filter(t =>
    !selected.includes(t.slug) && t.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <>
      {selected.length > 0 && (
        <div className="ui-taglist">
          {selected.map(slug => {
            const name = tags.find(t => t.slug === slug)?.name ?? slug;
            return (
              <span key={slug} className="ui-chip ui-chip--on">
                {name}
                <button
                  type="button"
                  className="ui-chip-x"
                  onClick={() => onToggle(slug)}
                  aria-label={`Remove ${name}`}
                >
                  ×
                </button>
              </span>
            );
          })}
        </div>
      )}

      {loading ? (
        <span className="ui-note">Loading causes…</span>
      ) : (
        <>
          <TextInput
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Filter causes"
            style={{ marginBottom: 10 }}
          />
          <div className="ui-tagpick">
            {available.slice(0, 40).map(t => (
              <button key={t.slug} type="button" onClick={() => onToggle(t.slug)}>
                {t.name}
              </button>
            ))}
            {available.length === 0 && <span className="ui-note">No causes match.</span>}
          </div>
        </>
      )}
    </>
  );
}

/* ── Map ────────────────────────────────────────────────────────────── */

const PIN = L.divIcon({
  className: '',
  html: `<svg width="24" height="32" viewBox="0 0 24 32" xmlns="http://www.w3.org/2000/svg">
           <path d="M12 31V15" stroke="currentColor" stroke-width="1.6"/>
           <circle cx="12" cy="9" r="7.6" fill="none" stroke="#c2410c" stroke-width="2.2"/>
           <circle cx="12" cy="9" r="2.4" fill="#c2410c"/>
         </svg>`,
  iconSize: [24, 32],
  iconAnchor: [12, 32],
});

const FALLBACK_CENTER = [39.5, -98.35];

function MapMover({ lat, lng }) {
  const map = useMap();
  React.useEffect(() => {
    if (lat != null && lng != null) map.setView([lat, lng], map.getZoom());
  }, [lat, lng, map]);
  return null;
}

function MapClicks({ onPick }) {
  useMapEvents({
    click: async (e) => {
      const label = await reverseGeocode(e.latlng.lat, e.latlng.lng);
      onPick(label, e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export function MapPicker({ lat, lng, address, onPick }) {
  const has = lat != null && lng != null;

  return (
    <div className="ui-map">
      <div className="ui-map-head">
        <span>Location</span>
        <span>{address || 'No pin dropped yet'}</span>
      </div>
      <div className="ui-map-canvas">
        <MapContainer
          center={has ? [lat, lng] : FALLBACK_CENTER}
          zoom={has ? 14 : 4}
          style={{ width: '100%', height: '100%' }}
          scrollWheelZoom={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {has && <Marker position={[lat, lng]} icon={PIN} />}
          <MapClicks onPick={onPick} />
          <MapMover lat={lat} lng={lng} />
        </MapContainer>
      </div>
      <div className="ui-map-hint">Click the map to drop a pin, or pick a suggestion above.</div>
    </div>
  );
}
