import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import { IconX } from '../Components/Icons';
import { useAddressSuggestions, useClickOutside } from '../../data/hooks';
import { reverseGeocode } from '../../data/api';
import { formatCoord } from '../../data/format';

/* ── Marks ──────────────────────────────────────────────────────────
   A single hand-cut leaf, the way a poster would carry one mark. */

export const LeafMark = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M20 3C20 3 15 3.4 11 5.6C7 7.8 4.5 11.3 4.5 14.8C4.5 18.2 6.9 20.5 10.2 20.5C14.2 20.5 18 17 19.4 12.1C20.6 8 20 3 20 3Z"
      fill="currentColor"
    />
    <path d="M6.5 20.5C6.5 20.5 10 14.5 14 11.5C18 8.5 18.8 7.6 18.8 7.6"
          stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.35" />
  </svg>
);

export const Arrow = ({ size = 15 }) => (
  <svg className="vsp-arrow" width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M2.5 8H13M13 8L9 4M13 8L9 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const Caret = ({ open }) => (
  <svg className={'vsp-caret' + (open ? ' is-open' : '')} viewBox="0 0 10 10" fill="none" aria-hidden="true">
    <path d="M2 3.6L5 6.6L8 3.6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const Tick = ({ size = 17 }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none" aria-hidden="true">
    <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="1.3" opacity="0.4" />
    <path d="M6 10.2L8.8 13L14 7.4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/* ── Text primitives ────────────────────────────────────────────────── */

export const Eyebrow = ({ children, tone, as: Tag = 'span', className = '', ...rest }) => (
  <Tag
    className={[
      'vsp-eyebrow',
      tone === 'clay'   ? 'vsp-eyebrow--clay'   : '',
      tone === 'lichen' ? 'vsp-eyebrow--lichen' : '',
      className,
    ].filter(Boolean).join(' ')}
    {...rest}
  >
    {children}
  </Tag>
);

export const Label = ({ children }) => <span className="vsp-label">{children}</span>;

export const Meta = ({ children, className = '', ...rest }) => (
  <span className={`vsp-meta ${className}`} {...rest}>{children}</span>
);

export const SectionHead = ({ num, title, sub }) => (
  <div className="vsp-sechead">
    <span className="vsp-sechead-num">{num}</span>
    <h2 className="vsp-h2">{title}</h2>
    {sub && <p className="vsp-sechead-sub">{sub}</p>}
  </div>
);

/* ── Buttons ────────────────────────────────────────────────────────── */

function btnClass({ variant, sm, block, className }) {
  return [
    'vsp-btn',
    variant === 'outline' ? 'vsp-btn--outline' : '',
    variant === 'danger'  ? 'vsp-btn--danger'  : '',
    sm    ? 'vsp-btn--sm'    : '',
    block ? 'vsp-btn--block' : '',
    className,
  ].filter(Boolean).join(' ');
}

export const Btn = ({ children, variant, sm, block, className = '', ...rest }) => (
  <button className={btnClass({ variant, sm, block, className })} {...rest}>{children}</button>
);

export const BtnLink = ({ children, to, variant, sm, block, className = '', ...rest }) => (
  <Link to={to} className={btnClass({ variant, sm, block, className })} {...rest}>{children}</Link>
);

export const Tag = ({ children, tone, fill, className = '', ...rest }) => (
  <span
    className={[
      'vsp-tag',
      tone === 'clay'   ? 'vsp-tag--clay'   : '',
      tone === 'lichen' ? 'vsp-tag--lichen' : '',
      fill ? 'vsp-tag--fill' : '',
      className,
    ].filter(Boolean).join(' ')}
    {...rest}
  >
    {children}
  </span>
);

/* ── Imagery ────────────────────────────────────────────────────────── */

/** Duotone frame. Photography arrives in the palette, not next to it. */
export const Duo = ({ src, alt = '', className = '', children }) => (
  <div className={`vsp-duo ${src ? '' : 'vsp-noimg'} ${className}`.trim()}>
    {src && <img src={src} alt={alt} />}
    {children}
  </div>
);

/* ── Fields ─────────────────────────────────────────────────────────── */

export const Field = ({ label, error, children }) => (
  <div className="vsp-form-row">
    {label && <Label>{label}</Label>}
    {children}
    {error && <span className="vsp-field-error">{error}</span>}
  </div>
);

export const TextInput = ({ error, large, className = '', ...rest }) => (
  <input
    className={['vsp-field', error ? 'vsp-field--err' : '', large ? 'vsp-field--lg' : '', className]
      .filter(Boolean).join(' ')}
    {...rest}
  />
);

export const NumberInput = ({ value, onChange, min = 0, suffix }) => (
  <div className="vsp-num-wrap">
    <input
      type="number"
      className="vsp-field"
      value={value ?? ''}
      min={min}
      onChange={e => onChange(Number(e.target.value))}
    />
    {suffix && <span className="vsp-num-suffix">{suffix}</span>}
  </div>
);

export const StateBlock = ({ children, note, error }) => (
  <div className={'vsp-state' + (error ? ' vsp-state--error' : '')}>
    <p className="vsp-state-title">{children}</p>
    {note && <span className="vsp-state-note">{note}</span>}
  </div>
);

export const Toast = ({ toast }) => (
  <div className={'vsp-toast' + (toast.visible ? ' is-on' : '')} role="status" aria-live="polite">
    {toast.message}
  </div>
);

export function PasswordInput({ value, onChange, placeholder, error, autoComplete }) {
  const [show, setShow] = useState(false);
  return (
    <div className="vsp-pw">
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
        className="vsp-pw-eye"
        onClick={() => setShow(s => !s)}
        aria-label={show ? 'Hide password' : 'Show password'}
      >
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
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

/* ── Address search ─────────────────────────────────────────────────── */

export function AddressField({ value, onTextChange, onPick, placeholder = 'City, address, or place' }) {
  const { suggestions, open, query, dismiss, reopen } = useAddressSuggestions();
  const wrapRef = useClickOutside(dismiss);

  return (
    <div className="vsp-suggest-wrap" ref={wrapRef}>
      <input
        className="vsp-field"
        value={value ?? ''}
        placeholder={placeholder}
        autoComplete="off"
        onChange={e => { onTextChange(e.target.value); query(e.target.value); }}
        onFocus={reopen}
      />
      {open && (
        <div className="vsp-suggest">
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

/* ── Maps ───────────────────────────────────────────────────────────── */

export const PIN = L.divIcon({
  className: '',
  html: `
    <svg width="26" height="34" viewBox="0 0 26 34" xmlns="http://www.w3.org/2000/svg">
      <path d="M13 33V19" stroke="#e8935a" stroke-width="1.8" stroke-linecap="round"/>
      <circle cx="13" cy="11" r="8" fill="#e8935a"/>
      <circle cx="13" cy="11" r="3" fill="#14302f"/>
    </svg>`,
  iconSize: [26, 34],
  iconAnchor: [13, 34],
});

function MapMover({ lat, lng }) {
  const map = useMap();
  useEffect(() => {
    if (lat != null && lng != null) map.setView([lat, lng], map.getZoom());
  }, [lat, lng, map]);
  return null;
}

function MapClicks({ editing, onPick }) {
  useMapEvents({
    click: async (e) => {
      if (!editing) return;
      const label = await reverseGeocode(e.latlng.lat, e.latlng.lng);
      onPick(label, e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

const FALLBACK_CENTER = [39.5, -98.35];

export function MapPanel({ lat, lng, address, editing, onPick }) {
  const has    = lat != null && lng != null;
  const center = has ? [lat, lng] : FALLBACK_CENTER;

  return (
    <div className="vsp-panel vsp-map">
      <div className="vsp-map-head">
        <Eyebrow>Where</Eyebrow>
        {address && <span className="vsp-map-addr">{address}</span>}
      </div>
      <div className="vsp-map-canvas">
        <MapContainer
          center={center}
          zoom={has ? 14 : 4}
          style={{ width: '100%', height: '100%' }}
          scrollWheelZoom={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {has && <Marker position={[lat, lng]} icon={PIN} />}
          <MapClicks editing={editing} onPick={onPick} />
          <MapMover lat={lat} lng={lng} />
        </MapContainer>
      </div>
      {editing && <div className="vsp-map-hint">Click the map to drop a pin</div>}
      <div className="vsp-map-foot">
        <Meta>{formatCoord(lat, 'lat')}</Meta>
        <Meta>{formatCoord(lng, 'lng')}</Meta>
      </div>
    </div>
  );
}

export function MiniMap({ lat, lng }) {
  const has = lat != null && lng != null;
  return (
    <div className="vsp-minimap">
      <MapContainer
        center={has ? [lat, lng] : FALLBACK_CENTER}
        zoom={has ? 12 : 3}
        style={{ width: '100%', height: '100%' }}
        scrollWheelZoom={false}
        dragging={false}
        zoomControl={false}
        attributionControl={false}
        doubleClickZoom={false}
        keyboard={false}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {has && <Marker position={[lat, lng]} icon={PIN} />}
      </MapContainer>
    </div>
  );
}

/* ── Tag picker ─────────────────────────────────────────────────────── */

export function TagPicker({ tags, loading, selected, onToggle }) {
  const [query, setQuery] = useState('');

  const available = tags.filter(t =>
    !selected.includes(t.slug) && t.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <>
      {selected.length > 0 && (
        <div className="vsp-taglist">
          {selected.map(slug => {
            const name = tags.find(t => t.slug === slug)?.name ?? slug;
            return (
              <span key={slug} className="vsp-tag vsp-tag--clay">
                {name}
                <button className="vsp-tag-x" onClick={() => onToggle(slug)} aria-label={`Remove ${name}`}>
                  <IconX size={11} />
                </button>
              </span>
            );
          })}
        </div>
      )}

      <input
        className="vsp-field"
        placeholder="Filter causes"
        value={query}
        onChange={e => setQuery(e.target.value)}
        style={{ marginBottom: 10 }}
      />

      <div className="vsp-tag-scroll">
        {loading ? (
          <span className="vsp-tag-empty">Loading causes…</span>
        ) : available.length === 0 ? (
          <span className="vsp-tag-empty">{query ? 'Nothing matches' : 'All selected'}</span>
        ) : (
          available.map(tag => (
            <button
              key={tag.id}
              type="button"
              className="vsp-tag"
              onClick={() => { onToggle(tag.slug); setQuery(''); }}
            >
              {tag.name}
            </button>
          ))
        )}
      </div>
    </>
  );
}
