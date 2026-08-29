import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import Header from '../Components/Header';
import Footer from '../Components/Footer';
import Breadcrumb from '../Components/Breadcrumb';
import {
  IconEdit, IconCheck, IconX,
  IconPin, IconMail, IconPhone, IconCalendar,
  IconClock, IconUsers,
} from '../Components/Icons';
import { useAuth } from '../../context/AuthContext';
import { updateOrg, describeApiError } from '../../data/api';
import '../styles/OrgPage.css';

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
function formatDateTime(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: 'numeric', minute: '2-digit',
  });
}

function formatDate(iso) {
  if (!iso) return 'Date TBD';
  return new Date(iso).toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
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

/* ── OrgEventCard ────────────────────────────────────────────────── */
function OrgEventCard({ event }) {
  const hasCoords = event.lat != null && event.lng != null;
  const shortAddr = event.address
    ? event.address.split(',').slice(0, 2).join(',').trim()
    : null;

  return (
    <Link to={`/events/${event.id}`} className="org-event-row">
      <div className="org-event-content">
        <div className="org-event-date">
          <IconCalendar size={13} />
          {formatDate(event.date)}
        </div>
        <h3 className="org-event-title">{event.title}</h3>
        <div className="org-event-pills">
          <span className="org-event-pill">
            <IconClock size={13} /> {formatDuration(event.duration)}
          </span>
          <span className="org-event-pill">
            <IconUsers size={13} /> {event.capacity} volunteers
          </span>
          {shortAddr && (
            <span className="org-event-pill">
              <IconPin size={13} /> {shortAddr}
            </span>
          )}
        </div>
        {event.tags.length > 0 && (
          <div className="org-event-tags">
            {event.tags.map(t => <span key={t} className="org-event-tag">{t}</span>)}
          </div>
        )}
        <span className="org-event-cta">View event →</span>
      </div>

      <div className="org-event-right">
        {event.image && (
          <div className="org-event-img">
            <img src={event.image} alt={event.title} />
          </div>
        )}
        <div className="org-event-map" style={{ pointerEvents: 'none' }}>
          <MapContainer
            center={hasCoords ? [event.lat, event.lng] : [39.5, -98.35]}
            zoom={hasCoords ? 13 : 4}
            style={{ width: '100%', height: '100%' }}
            scrollWheelZoom={false}
            dragging={false}
            zoomControl={false}
            attributionControl={false}
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            {hasCoords && <Marker position={[event.lat, event.lng]} icon={PIN_ICON} />}
          </MapContainer>
        </div>
      </div>
    </Link>
  );
}

/* ── getOrg ──────────────────────────────────────────────────────── */
export async function getOrg(id) {
  const res = await fetch(`${process.env.REACT_APP_API_URL}/api/orgs/${id}`);
  if (!res.ok) throw new Error(res.status);
  const { data } = await res.json();
  return {
    id:          data.id,
    name:        data.name,
    description: data.description,
    email:       data.email,
    phone:       data.phone,
    address:     data.address,
    bannerImg:   data.bannerImg,
    iconImg:     data.iconImg,
    createdAt:   data.createdAt,
    updatedAt:   data.updatedAt,
  };
}

/* ── Field helpers ───────────────────────────────────────────────── */
function FieldLabel({ children }) {
  return <span className="org-label">{children}</span>;
}

function OrgInput({ value, onChange, placeholder, type = 'text' }) {
  return (
    <input
      type={type}
      className="org-field-input"
      value={value ?? ''}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
    />
  );
}

function OrgTextarea({ value, onChange, rows = 5 }) {
  return (
    <textarea
      className="org-field-input"
      value={value ?? ''}
      onChange={e => onChange(e.target.value)}
      rows={rows}
    />
  );
}

/* ── Org page ────────────────────────────────────────────────────── */
function OrgPage() {
  const { id } = useParams();

  const [org,           setOrg]           = useState(null);
  const [draft,         setDraft]         = useState(null);
  const [editing,       setEditing]       = useState(false);
  const [loading,       setLoading]       = useState(true);
  const [loadError,     setLoadError]     = useState(false);
  const [toastMsg,      setToastMsg]      = useState('');
  const [toastShow,     setToastShow]     = useState(false);
  const [events,        setEvents]        = useState([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [saving,        setSaving]        = useState(false);
  const toastTimer = useRef(null);
  const { auth, isOrg } = useAuth();

  useEffect(() => {
    setLoading(true);
    setLoadError(false);
    setEditing(false);
    getOrg(id)
      .then(data => { setOrg(data); setDraft(data); setLoading(false); })
      .catch(() => { setLoadError(true); setLoading(false); });
  }, [id]);

  useEffect(() => {
    setEventsLoading(true);
    fetch(`${process.env.REACT_APP_API_URL}/api/orgs/${id}/events`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(res => {
        const list = Array.isArray(res.data) ? res.data
                   : Array.isArray(res.events) ? res.events
                   : [];
        setEvents(list.map(e => ({
          id:       e.id,
          title:    e.title,
          date:     e.date,
          duration: (e.duration ?? 0) / 60,
          capacity: e.capacity,
          address:  e.address,
          lat:      e.latitude,
          lng:      e.longitude,
          image:    e.image ?? null,
          tags:     (e.Tags ?? []).map(t => t.name),
        })));
      })
      .catch(() => setEvents([]))
      .finally(() => setEventsLoading(false));
  }, [id]);

  const showToast = useCallback((msg) => {
    setToastMsg(msg);
    setToastShow(true);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastShow(false), 2000);
  }, []);

  const set = key => val => setDraft(d => ({ ...d, [key]: val }));

  /* You may only edit the organization you are signed in as. The API enforces
     this as well; hiding the control just avoids offering a guaranteed 403. */
  const canEdit = isOrg && auth?.user?.id != null && String(auth.user.id) === String(id);

  const startEdit  = () => { setDraft({ ...org }); setEditing(true); };
  const cancelEdit = () => setEditing(false);
  const saveEdit   = async () => {
    setSaving(true);
    try {
      const saved = await updateOrg(id, draft);
      setOrg(saved);
      setDraft(saved);
      setEditing(false);
      showToast('Organization saved.');
    } catch (err) {
      showToast(describeApiError(err));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="org-page">
        <Header />
        <div className="org-state">Loading organization…</div>
        <Footer />
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="org-page">
        <Header />
        <div className="org-state org-state--error">
          Could not load organization. Check your connection or the ID.
        </div>
        <Footer />
      </div>
    );
  }

  const displayName = editing ? (draft.name || 'Unnamed organization') : org.name;
  const initial     = org.name?.[0]?.toUpperCase() ?? '?';

  return (
    <div className="org-page">
      <Header />

      {/* Edit banner */}
      {editing && (
        <div className="org-edit-banner" role="status">
          <div className="org-edit-banner-label">
            <span className="org-edit-banner-dot" />
            Editing organization
          </div>
          <div className="org-edit-banner-actions">
            <button className="org-btn org-btn--sm org-btn--danger" onClick={cancelEdit} disabled={saving}>
              <IconX /> Discard
            </button>
            <button className="org-btn org-btn--sm" onClick={saveEdit} disabled={saving}>
              <IconCheck /> Save Changes
            </button>
          </div>
        </div>
      )}

      <div className="org-content">
        <Breadcrumb crumbs={[
          { label: 'Home',          to: '/' },
          { label: 'Organizations', to: '/organizations' },
          { label: displayName },
        ]} />

        {/* Banner + profile icon */}
        <div className="org-banner">
          {org.bannerImg
            ? <img src={org.bannerImg} alt="" />
            : <div className="org-banner-placeholder" />}
          <div className="org-icon">
            {org.iconImg
              ? <img src={org.iconImg} alt={org.name} />
              : <span className="org-icon-initial">{initial}</span>}
          </div>
          {!eventsLoading && (
            <div className="org-banner-stat">
              <span className="org-banner-stat-num">{events.length}</span>
              <span className="org-banner-stat-label">active posts</span>
            </div>
          )}
        </div>

        {/* Profile header: name + buttons */}
        <div className="org-profile-row">
          <div className="org-profile-meta">
            {editing ? (
              <div className="org-name-edit">
                <FieldLabel>Organization Name</FieldLabel>
                <OrgInput
                  value={draft.name}
                  onChange={set('name')}
                  placeholder="Organization name"
                />
              </div>
            ) : (
              <h1 className="org-name">{org.name}</h1>
            )}
            <div className="org-since">
              <IconCalendar size={13} />
              Member since {new Date(org.createdAt).getFullYear()}
            </div>
          </div>

          {!editing && canEdit && (
            <div className="org-profile-actions">
              <Link className="org-btn org-btn--sm" to={`/organizations/${org.id}/events/new`}>
                <IconCalendar size={14} /> Create Event
              </Link>
              <button className="org-btn org-btn--ghost org-btn--sm" onClick={startEdit}>
                <IconEdit /> Edit
              </button>
            </div>
          )}
        </div>

        {/* Body: about + contact */}
        <div className="org-body">

          <div className="org-card">
            <h2 className="org-card-title">About</h2>
            {editing ? (
              <>
                <FieldLabel>Description</FieldLabel>
                <OrgTextarea value={draft.description} onChange={set('description')} rows={6} />
              </>
            ) : (
              <p className="org-description">{org.description || 'No description provided.'}</p>
            )}
          </div>

          <div className="org-card">
            <h2 className="org-card-title">Contact</h2>
            <div className="org-contact-list">

              <div className="org-contact-item">
                <span className="org-contact-icon"><IconMail /></span>
                <div className="org-contact-text">
                  <FieldLabel>Email</FieldLabel>
                  {editing
                    ? <OrgInput value={draft.email} onChange={set('email')} placeholder="email@example.com" type="email" />
                    : <span className="org-contact-value">{org.email || '—'}</span>}
                </div>
              </div>

              <div className="org-contact-item">
                <span className="org-contact-icon"><IconPhone /></span>
                <div className="org-contact-text">
                  <FieldLabel>Phone</FieldLabel>
                  {editing
                    ? <OrgInput value={draft.phone} onChange={set('phone')} placeholder="555-000-0000" type="tel" />
                    : <span className="org-contact-value">{org.phone || '—'}</span>}
                </div>
              </div>

              <div className="org-contact-item">
                <span className="org-contact-icon"><IconPin /></span>
                <div className="org-contact-text">
                  <FieldLabel>Address</FieldLabel>
                  {editing
                    ? <OrgInput value={draft.address} onChange={set('address')} placeholder="Street address" />
                    : <span className="org-contact-value">{org.address || '—'}</span>}
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* Timestamps */}
        <div className="org-timestamps">
          <div className="org-ts-item">
            <span className="org-label">Created</span>
            <span className="org-ts-value">{formatDateTime(org.createdAt)}</span>
          </div>
          <div className="org-ts-item">
            <span className="org-label">Last Updated</span>
            <span className="org-ts-value">{formatDateTime(org.updatedAt)}</span>
          </div>
        </div>

        {/* Events */}
        <div className="org-events-section">
          <div className="org-events-header">
            <h2 className="org-events-title">Events</h2>
            {!eventsLoading && (
              <span className="org-events-count">{events.length} posted</span>
            )}
          </div>

          {eventsLoading ? (
            <div className="org-events-loading">Loading events…</div>
          ) : events.length === 0 ? (
            <div className="org-events-empty">No events posted yet.</div>
          ) : (
            <div className="org-events-list">
              {events.map(ev => <OrgEventCard key={ev.id} event={ev} />)}
            </div>
          )}
        </div>

      </div>

      <Footer />

      <div className={'org-toast' + (toastShow ? ' show' : '')}>{toastMsg}</div>
    </div>
  );
}

export default OrgPage;
