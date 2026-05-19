import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import '../styles/EventPage.css';

import Header from '../Components/Header';
import Footer from '../Components/Footer';
import Breadcrumb from '../Components/Breadcrumb';
import {
  LeafLogo,
  IconCalendar, IconClock, IconUsers, IconPin,
  IconEdit, IconCheck, IconX, IconCheckCircle,
} from '../Components/Icons';

/* Custom pin — avoids the leaflet/CRA icon URL issue */
const PIN_ICON = L.divIcon({
  className: '',
  html: `<svg width="25" height="41" viewBox="0 0 25 41" xmlns="http://www.w3.org/2000/svg">
    <path d="M12.5 0C5.6 0 0 5.6 0 12.5C0 22 12.5 41 12.5 41C12.5 41 25 22 25 12.5C25 5.6 19.4 0 12.5 0Z" fill="#2d6a4f"/>
    <circle cx="12.5" cy="12.5" r="5" fill="white"/>
  </svg>`,
  iconSize:   [25, 41],
  iconAnchor: [12, 41],
});

/* ── Helpers ─────────────────────────────────────────────────────── */
function formatDate(iso) {
  if (!iso) return 'TBD';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatDateTime(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: 'numeric', minute: '2-digit',
  });
}

function formatDuration(hours) {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h} ${h === 1 ? 'hr' : 'hrs'}`;
  return `${h} hr ${m} min`;
}

/* ── getEvent ────────────────────────────────────────────────────── */
export async function getEvent(id) {
  const res = await fetch(`${process.env.REACT_APP_API_URL}/api/events/${id}`);
  if (!res.ok) throw new Error(res.status);
  const { data } = await res.json();
  return {
    id:             data.id,
    organizationId: data.organizationId,
    title:          data.title,
    description:    data.description,
    capacity:       data.capacity,
    spotsLeft:      data.capacity,
    duration:       data.duration / 60,
    date:           data.date,
    address:        data.address,
    lat:            data.latitude,
    lng:            data.longitude,
    heroImage:      data.image,
    tags:           (data.Tags ?? []).map(t => t.slug),
    createdAt:      data.createdAt,
    updatedAt:      data.updatedAt,
  };
}

/* ── Map sub-components ──────────────────────────────────────────── */
function MapClickHandler({ editing, onMapClick }) {
  useMapEvents({
    click: (e) => { if (editing) onMapClick(e.latlng.lat, e.latlng.lng); },
  });
  return null;
}

function MapMover({ lat, lng }) {
  const map = useMap();
  useEffect(() => {
    if (lat != null && lng != null) map.setView([lat, lng], map.getZoom());
  }, [lat, lng, map]);
  return null;
}

/* ── EventMap ────────────────────────────────────────────────────── */
function EventMap({ lat, lng, editing, onLocationChange }) {
  const hasCoords = lat != null && lng != null;
  const center    = hasCoords ? [lat, lng] : [39.5, -98.35];

  const handleMapClick = async (clat, clng) => {
    try {
      const res  = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${clat}&lon=${clng}&format=json`
      );
      const data = await res.json();
      onLocationChange(data.display_name ?? '', clat, clng);
    } catch {
      onLocationChange('', clat, clng);
    }
  };

  return (
    <div className={`event-map-container${editing ? ' event-map-container--edit' : ''}`}>
      <MapContainer
        center={center}
        zoom={hasCoords ? 14 : 4}
        style={{ width: '100%', height: '100%' }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {hasCoords && <Marker position={[lat, lng]} icon={PIN_ICON} />}
        <MapClickHandler editing={editing} onMapClick={handleMapClick} />
        <MapMover lat={lat} lng={lng} />
      </MapContainer>
      {editing && (
        <div className="event-map-edit-hint">Click the map to set location</div>
      )}
    </div>
  );
}

/* ── AddressAutocomplete ─────────────────────────────────────────── */
function AddressAutocomplete({ value, onAddressChange, onSelect }) {
  const [suggestions, setSuggestions] = useState([]);
  const [open, setOpen]               = useState(false);
  const debounceRef = useRef(null);
  const wrapRef     = useRef(null);

  useEffect(() => {
    function handleOutside(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  const search = (q) => {
    clearTimeout(debounceRef.current);
    if (q.length < 3) { setSuggestions([]); setOpen(false); return; }
    debounceRef.current = setTimeout(async () => {
      try {
        const res  = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=5`
        );
        const data = await res.json();
        setSuggestions(data);
        setOpen(data.length > 0);
      } catch { /* ignore */ }
    }, 400);
  };

  return (
    <div className="evt-address-wrap" ref={wrapRef}>
      <input
        className="evt-field-input"
        value={value}
        onChange={e => { onAddressChange(e.target.value); search(e.target.value); }}
        placeholder="Search an address…"
      />
      {open && (
        <div className="evt-address-dropdown">
          {suggestions.map((s, i) => (
            <button
              key={i}
              className="evt-address-option"
              onMouseDown={() => {
                onSelect(s.display_name, parseFloat(s.lat), parseFloat(s.lon));
                setOpen(false);
                setSuggestions([]);
              }}
            >
              {s.display_name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Tag chip (view) ─────────────────────────────────────────────── */
function TagChip({ label }) {
  return <span className="evt-tag-chip">{label}</span>;
}

/* ── Tag editor (edit mode) ──────────────────────────────────────── */
function TagEditor({ allTags, tagsLoading, tagsError, selected, onChange }) {
  const MAX = 5;
  const [query, setQuery] = useState('');

  const remove = slug => onChange(selected.filter(s => s !== slug));
  const add    = slug => { if (selected.length < MAX) onChange([...selected, slug]); };

  const available = allTags.filter(t =>
    !selected.includes(t.slug) &&
    t.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="evt-tag-editor">
      <div className="evt-tag-editor-header">
        <span className="evt-label">Tags</span>
        <span className={'evt-tag-count' + (selected.length >= MAX ? ' maxed' : '')}>
          {selected.length}/{MAX}
        </span>
      </div>

      {selected.length > 0 && (
        <div className="evt-tag-selected">
          {selected.map(slug => {
            const name = allTags.find(t => t.slug === slug)?.name ?? slug;
            return (
              <span key={slug} className="evt-tag-chip evt-tag-chip--removable">
                {name}
                <button className="evt-tag-chip-x" onClick={() => remove(slug)} aria-label={`Remove ${name}`}>
                  <IconX size={10} />
                </button>
              </span>
            );
          })}
        </div>
      )}

      {selected.length < MAX && (
        <div className="evt-tag-picker">
          <input
            className="evt-field-input evt-tag-search"
            placeholder="Search tags…"
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          <div className="evt-tag-options">
            {tagsLoading ? (
              <div className="evt-tag-empty">Loading tags…</div>
            ) : tagsError ? (
              <div className="evt-tag-empty evt-tag-empty--error">Could not load tags.</div>
            ) : available.length === 0 ? (
              <div className="evt-tag-empty">{query ? 'No tags match' : 'All tags added'}</div>
            ) : (
              available.map(tag => (
                <button
                  key={tag.id}
                  className="evt-tag-option"
                  onClick={() => { add(tag.slug); setQuery(''); }}
                >
                  {tag.name}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Field helpers ───────────────────────────────────────────────── */
function FieldLabel({ children }) {
  return <span className="evt-label">{children}</span>;
}

function EvtInput({ value, onChange, placeholder, className = '' }) {
  return (
    <input
      className={`evt-field-input ${className}`}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
    />
  );
}

function EvtTextarea({ value, onChange, rows = 6 }) {
  return (
    <textarea
      className="evt-field-input"
      value={value}
      onChange={e => onChange(e.target.value)}
      rows={rows}
      style={{ lineHeight: 1.65 }}
    />
  );
}

function EvtNumberInput({ value, onChange, min = 0, suffix }) {
  return (
    <div className="evt-number-wrap">
      <input
        type="number"
        className="evt-field-input"
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        min={min}
      />
      {suffix && <span className="evt-number-suffix">{suffix}</span>}
    </div>
  );
}

/* ── RSVP card ───────────────────────────────────────────────────── */
function RSVPCard({ event, draft, editing, rsvped, onRsvp }) {
  const cap   = editing ? draft.capacity : event.capacity;
  const dur   = editing ? draft.duration : event.duration;
  const date  = editing ? draft.date     : event.date;
  const taken = event.capacity - event.spotsLeft;
  const pct   = Math.min(100, Math.round((taken / Math.max(1, cap)) * 100));

  return (
    <div className="event-rsvp-card">
      {/* Date */}
      <div className="event-rsvp-row">
        <FieldLabel>Date</FieldLabel>
        <div className={'event-rsvp-value' + (!date ? ' muted' : '')}>
          {date ? formatDate(date) : 'TBD — date not yet set'}
        </div>
      </div>

      {/* Duration */}
      <div className="event-rsvp-row">
        <FieldLabel>Duration</FieldLabel>
        {editing ? (
          <div style={{ marginTop: 6 }}>
            <EvtNumberInput value={dur} onChange={() => {}} min={0.5} suffix="hours" />
          </div>
        ) : (
          <div className="event-rsvp-value">{dur} {dur === 1 ? 'hour' : 'hours'}</div>
        )}
      </div>

      {/* Capacity */}
      <div style={{ marginBottom: 20 }}>
        <FieldLabel>Capacity</FieldLabel>
        {editing ? (
          <div style={{ marginTop: 6 }}>
            <EvtNumberInput value={cap} onChange={() => {}} min={1} suffix="volunteers" />
          </div>
        ) : (
          <>
            <div className="event-capacity-header">
              <span className="event-rsvp-value">{cap} volunteers</span>
              <span className="event-capacity-spots">{event.spotsLeft} spots left</span>
            </div>
            <div className="event-progress-track">
              <div
                className={'event-progress-fill' + (pct > 85 ? ' warn' : '')}
                style={{ width: `${pct}%` }}
              />
            </div>
            <div className="event-progress-pct">{pct}% filled</div>
          </>
        )}
      </div>

      <button
        className={'evt-btn evt-btn--full' + (rsvped ? ' evt-btn--ghost' : '')}
        onClick={onRsvp}
      >
        {rsvped ? <><IconX /> Cancel RSVP</> : <><IconCheckCircle /> RSVP for this Event</>}
      </button>

      {rsvped && <div className="event-rsvp-confirmed">✓ You're registered</div>}
    </div>
  );
}

/* ── Event page ──────────────────────────────────────────────────── */
function EventPage() {
  const { id } = useParams();

  const [event,     setEvent]     = useState(null);
  const [draft,     setDraft]     = useState(null);
  const [editing,   setEditing]   = useState(false);
  const [rsvped,    setRsvped]    = useState(false);
  const [loading,   setLoading]   = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [toastMsg,  setToastMsg]  = useState('');
  const [toastShow, setToastShow] = useState(false);
  const [allTags,     setAllTags]     = useState([]);
  const [tagsLoading, setTagsLoading] = useState(true);
  const [tagsError,   setTagsError]   = useState(false);
  const toastTimer = useRef(null);

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/api/events/tags`)
      .then(r => { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(data => { setAllTags(data.tags ?? []); setTagsLoading(false); })
      .catch(() => { setTagsError(true); setTagsLoading(false); });
  }, []);

  useEffect(() => {
    setLoading(true);
    setLoadError(false);
    setEditing(false);
    setRsvped(false);
    getEvent(id)
      .then(data => { setEvent(data); setDraft(data); setLoading(false); })
      .catch(() => { setLoadError(true); setLoading(false); });
  }, [id]);

  const showToast = useCallback((msg) => {
    setToastMsg(msg);
    setToastShow(true);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastShow(false), 2000);
  }, []);

  const set = key => val => setDraft(d => ({ ...d, [key]: val }));
  const setLocation = (address, lat, lng) => setDraft(d => ({ ...d, address, lat, lng }));

  const startEdit  = () => { setDraft({ ...event }); setEditing(true); };
  const cancelEdit = () => setEditing(false);
  const saveEdit   = () => {
    setEvent({ ...draft, updatedAt: new Date().toISOString() });
    setEditing(false);
    showToast('Event saved.');
  };

  const handleRsvp = () => {
    setRsvped(r => !r);
    showToast(rsvped ? 'RSVP cancelled.' : "You're signed up!");
  };

  if (loading) return (
    <div className="event-page">
      <Header />
      <div className="event-loading">Loading event…</div>
      <Footer />
    </div>
  );

  if (loadError) return (
    <div className="event-page">
      <Header />
      <div className="event-loading">Could not load event. Check your connection or the event ID.</div>
      <Footer />
    </div>
  );

  const displayTitle = editing ? (draft.title || 'Untitled event') : event.title;
  const mapLat = editing ? draft.lat : event.lat;
  const mapLng = editing ? draft.lng : event.lng;

  return (
    <div className="event-page">
      <Header />

      {editing && (
        <div className="event-edit-banner" role="status">
          <div className="event-edit-banner-label">
            <span className="event-edit-banner-dot" />
            Editing event
          </div>
          <div className="event-edit-banner-actions">
            <button className="evt-btn evt-btn--sm evt-btn--danger" onClick={cancelEdit}>
              <IconX /> Discard
            </button>
            <button className="evt-btn evt-btn--sm" onClick={saveEdit}>
              <IconCheck /> Save Changes
            </button>
          </div>
        </div>
      )}

      <div className="event-content">
        <Breadcrumb crumbs={[
          { label: 'Home',   to: '/' },
          { label: 'Events', to: '/events' },
          { label: displayTitle },
        ]} />

        {/* Hero */}
        <div className="event-hero">
          {event.heroImage
            ? <img src={event.heroImage} alt={event.title} />
            : <div className="event-hero-placeholder" />}
          <div className="event-org-badge">
            <LeafLogo size={20} gradId="leaf-grad-event" />
            Org #{event.organizationId}
          </div>
        </div>

        {/* Two-column body */}
        <div className="event-body">

          {/* ─── Left column ─── */}
          <div>
            <div className="event-title-row">
              {editing ? (
                <div style={{ flex: 1 }}>
                  <FieldLabel>Event Title</FieldLabel>
                  <EvtInput value={draft.title} onChange={set('title')} placeholder="Event name" className="large" />
                </div>
              ) : (
                <h1 className="event-title">{event.title}</h1>
              )}
              {!editing && (
                <button className="evt-btn evt-btn--ghost evt-btn--sm" onClick={startEdit} style={{ flexShrink: 0, marginTop: 8 }}>
                  <IconEdit /> Edit Event
                </button>
              )}
            </div>

            {!editing && (
              <>
                <div className="event-meta-pills">
                  <span className="evt-pill evt-pill--muted">
                    <IconCalendar size={16} /> {formatDate(event.date)}
                  </span>
                  <span className="evt-pill evt-pill--outline">
                    <IconClock /> {formatDuration(event.duration)}
                  </span>
                  <span className="evt-pill evt-pill--filled">
                    <IconUsers /> {event.spotsLeft} spots left of {event.capacity}
                  </span>
                </div>
                {event.tags && event.tags.length > 0 && (
                  <div className="event-tags">
                    {event.tags.map(slug => {
                      const label = allTags.find(t => t.slug === slug)?.name ?? slug;
                      return <TagChip key={slug} label={label} />;
                    })}
                  </div>
                )}
              </>
            )}

            <div className="event-description" style={{ marginBottom: 28 }}>
              {editing ? (
                <>
                  <FieldLabel>Description</FieldLabel>
                  <EvtTextarea value={draft.description} onChange={set('description')} rows={7} />
                </>
              ) : (
                (event.description || '').split('\n\n').map((para, i) => <p key={i}>{para}</p>)
              )}
            </div>

            <div className="event-location" style={{ marginBottom: editing ? 20 : 0 }}>
              <div className="event-location-icon"><IconPin /></div>
              <div className="event-location-text">
                <FieldLabel>Location</FieldLabel>
                {editing ? (
                  <AddressAutocomplete
                    value={draft.address ?? ''}
                    onAddressChange={val => setDraft(d => ({ ...d, address: val }))}
                    onSelect={setLocation}
                  />
                ) : (
                  <div className="event-location-address">{event.address}</div>
                )}
              </div>
            </div>

            <div className="event-meta-timestamps">
              <div className="event-meta-ts-item">
                <span className="evt-label">Created</span>
                <span className="event-meta-ts-value">{formatDateTime(event.createdAt)}</span>
              </div>
              <div className="event-meta-ts-item">
                <span className="evt-label">Last Updated</span>
                <span className="event-meta-ts-value">{formatDateTime(event.updatedAt)}</span>
              </div>
            </div>

            {editing && (
              <>
                <div style={{ marginTop: 24, marginBottom: 24 }}>
                  <TagEditor
                    allTags={allTags}
                    tagsLoading={tagsLoading}
                    tagsError={tagsError}
                    selected={draft.tags || []}
                    onChange={val => setDraft(d => ({ ...d, tags: val }))}
                  />
                </div>

                <div className="event-edit-two-col" style={{ marginBottom: 20 }}>
                  <div>
                    <FieldLabel>Duration</FieldLabel>
                    <EvtNumberInput value={draft.duration} onChange={set('duration')} min={0.5} suffix="hours" />
                  </div>
                  <div>
                    <FieldLabel>Capacity</FieldLabel>
                    <EvtNumberInput value={draft.capacity} onChange={set('capacity')} min={1} suffix="volunteers" />
                  </div>
                </div>

                <div>
                  <FieldLabel>Date &amp; Time</FieldLabel>
                  <input
                    type="datetime-local"
                    className="evt-field-input"
                    value={draft.date ? draft.date.slice(0, 16) : ''}
                    onChange={e => set('date')(e.target.value ? new Date(e.target.value).toISOString() : '')}
                  />
                </div>
              </>
            )}
          </div>

          {/* ─── Right column ─── */}
          <div className="event-sidebar">
            <RSVPCard
              event={event}
              draft={draft}
              editing={editing}
              rsvped={rsvped}
              onRsvp={handleRsvp}
            />

            <div className="event-map-card">
              <span className="evt-label">Map</span>
              <EventMap
                lat={mapLat}
                lng={mapLng}
                editing={editing}
                onLocationChange={setLocation}
              />
              <div className="event-map-address">
                <span className="event-map-address-icon"><IconPin /></span>
                <span>{editing ? (draft.address || 'No address set') : (event.address || 'No address')}</span>
              </div>
              {(mapLat != null && mapLng != null) && (
                <div className="event-map-coords">
                  <span>lat {typeof mapLat === 'number' ? mapLat.toFixed(5) : mapLat}</span>
                  <span>lng {typeof mapLng === 'number' ? mapLng.toFixed(5) : mapLng}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
      <div className={'event-toast' + (toastShow ? ' show' : '')}>{toastMsg}</div>
    </div>
  );
}

export default EventPage;
