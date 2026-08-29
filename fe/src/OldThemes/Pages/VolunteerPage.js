import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import Header from '../Components/Header';
import Footer from '../Components/Footer';
import Breadcrumb from '../Components/Breadcrumb';
import {
  IconEdit, IconCheck, IconX, IconMail, IconUser, IconCalendar,
  IconClock, IconUsers, IconPin,
} from '../Components/Icons';
import { useAuth } from '../../context/AuthContext';
import { updateUser, describeApiError } from '../../data/api';
import '../styles/VolunteerPage.css';

const PIN_ICON = L.divIcon({
  className: '',
  html: `<svg width="25" height="41" viewBox="0 0 25 41" xmlns="http://www.w3.org/2000/svg">
    <path d="M12.5 0C5.6 0 0 5.6 0 12.5C0 22 12.5 41 12.5 41C12.5 41 25 22 25 12.5C25 5.6 19.4 0 12.5 0Z" fill="#2d6a4f"/>
    <circle cx="12.5" cy="12.5" r="5" fill="white"/>
  </svg>`,
  iconSize:   [25, 41],
  iconAnchor: [12, 41],
});

function formatDateTime(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: 'numeric', minute: '2-digit',
  });
}

function formatFullDate(iso) {
  if (!iso) return 'Date TBD';
  return new Date(iso).toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric',
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

/* ── UserEventCard ───────────────────────────────────────────────── */
function UserEventCard({ event }) {
  const hasCoords = event.lat != null && event.lng != null;
  const shortAddr = event.address
    ? event.address.split(',').slice(0, 2).join(',').trim()
    : null;

  const dayNum = event.date
    ? new Date(event.date).toLocaleDateString('en-US', { day: 'numeric' })
    : '?';
  const monthStr = event.date
    ? new Date(event.date).toLocaleDateString('en-US', { month: 'short' })
    : 'TBD';

  return (
    <Link to={`/events/${event.id}`} className="vol-event-card">

      <div className="vol-event-img">
        {event.image
          ? <img src={event.image} alt={event.title} />
          : <div className="vol-event-img-placeholder" />}
        <div className="vol-event-date-badge">
          <span className="vol-event-date-day">{dayNum}</span>
          <span className="vol-event-date-mon">{monthStr}</span>
        </div>
      </div>

      <div className="vol-event-body">
        <div className="vol-event-when">
          <IconCalendar size={13} />
          {formatFullDate(event.date)}
        </div>
        <h3 className="vol-event-title">{event.title}</h3>
        {event.description && (
          <p className="vol-event-desc">
            {event.description.length > 130
              ? event.description.slice(0, 130).trimEnd() + '…'
              : event.description}
          </p>
        )}
        <div className="vol-event-pills">
          <span className="vol-event-pill"><IconClock size={13} /> {formatDuration(event.duration)}</span>
          <span className="vol-event-pill"><IconUsers size={13} /> {event.capacity} volunteers</span>
          {shortAddr && <span className="vol-event-pill"><IconPin size={13} /> {shortAddr}</span>}
        </div>
        {event.tags.length > 0 && (
          <div className="vol-event-tags">
            {event.tags.map(t => <span key={t} className="vol-event-tag">{t}</span>)}
          </div>
        )}
      </div>

      <div className="vol-event-map" style={{ pointerEvents: 'none' }}>
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

      <div className="vol-event-footer">
        <span className="vol-event-cta">View event →</span>
      </div>

    </Link>
  );
}

async function getUser(id) {
  const res = await fetch(`${process.env.REACT_APP_API_URL}/api/users/${id}`);
  if (!res.ok) throw new Error(res.status);
  const { data } = await res.json();
  return {
    id:          data.id,
    username:    data.username,
    email:       data.email,
    displayName: data.displayName,
    profilePic:  data.profilePic,
    role:        data.role,
    createdAt:   data.createdAt,
    updatedAt:   data.updatedAt,
  };
}

function FieldLabel({ children }) {
  return <span className="vol-label">{children}</span>;
}

function VolInput({ value, onChange, placeholder, type = 'text' }) {
  return (
    <input
      type={type}
      className="vol-field-input"
      value={value ?? ''}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
    />
  );
}

function VolunteerPage() {
  const { id } = useParams();

  const [user,          setUser]          = useState(null);
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
  const { auth, isVolunteer } = useAuth();

  useEffect(() => {
    setLoading(true);
    setLoadError(false);
    setEditing(false);
    getUser(id)
      .then(data => { setUser(data); setDraft(data); setLoading(false); })
      .catch(() => { setLoadError(true); setLoading(false); });
  }, [id]);

  useEffect(() => {
    setEventsLoading(true);
    fetch(`${process.env.REACT_APP_API_URL}/api/users/${id}/events`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(res => {
        const list = Array.isArray(res.data) ? res.data
                   : Array.isArray(res.events) ? res.events
                   : [];
        setEvents(list.map(e => ({
          id:          e.id,
          title:       e.title,
          description: e.description ?? '',
          date:        e.date,
          duration:    (e.duration ?? 0) / 60,
          capacity:    e.capacity,
          address:     e.address,
          lat:         e.latitude,
          lng:         e.longitude,
          image:       e.image ?? null,
          tags:        (e.Tags ?? []).map(t => t.name),
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

  /* You may only edit your own profile. The API enforces this as well; hiding
     the control just avoids offering a guaranteed 403. */
  const canEdit = isVolunteer && auth?.user?.id != null && String(auth.user.id) === String(id);

  const startEdit  = () => { setDraft({ ...user }); setEditing(true); };
  const cancelEdit = () => setEditing(false);
  const saveEdit   = async () => {
    setSaving(true);
    try {
      const saved = await updateUser(id, draft);
      setUser(saved);
      setDraft(saved);
      setEditing(false);
      showToast('Profile saved.');
    } catch (err) {
      showToast(describeApiError(err));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="vol-page">
      <Header />
      <div className="vol-state">Loading profile…</div>
      <Footer />
    </div>
  );

  if (loadError) return (
    <div className="vol-page">
      <Header />
      <div className="vol-state vol-state--error">
        Could not load this profile. Check your connection or the ID.
      </div>
      <Footer />
    </div>
  );

  const displayName = user.displayName || user.username;
  const initial     = displayName?.[0]?.toUpperCase() ?? '?';

  return (
    <div className="vol-page">
      <Header />

      {editing && (
        <div className="vol-edit-banner" role="status">
          <div className="vol-edit-banner-label">
            <span className="vol-edit-banner-dot" />
            Editing profile
          </div>
          <div className="vol-edit-banner-actions">
            <button className="vol-btn vol-btn--sm vol-btn--danger" onClick={cancelEdit}>
              <IconX /> Discard
            </button>
            <button className="vol-btn vol-btn--sm" onClick={saveEdit} disabled={saving}>
              <IconCheck /> {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </div>
      )}

      <div className="vol-content">
        <Breadcrumb crumbs={[
          { label: 'Home', to: '/' },
          { label: displayName },
        ]} />

        {/* Avatar banner */}
        <div className="vol-banner">
          <div className="vol-avatar">
            {user.profilePic
              ? <img src={user.profilePic} alt={displayName} />
              : <span className="vol-avatar-initial">{initial}</span>}
          </div>
        </div>

        {/* Profile header */}
        <div className="vol-profile-row">
          <div className="vol-profile-meta">
            {editing ? (
              <div style={{ marginBottom: 4 }}>
                <FieldLabel>Display Name</FieldLabel>
                <VolInput
                  value={draft.displayName}
                  onChange={set('displayName')}
                  placeholder="Your display name"
                />
              </div>
            ) : (
              <h1 className="vol-name">{displayName}</h1>
            )}
            <div className="vol-since">
              <IconCalendar size={13} />
              Member since {new Date(user.createdAt).getFullYear()}
            </div>
          </div>

          {!editing && canEdit && (
            <button className="vol-btn vol-btn--ghost vol-btn--sm" onClick={startEdit}>
              <IconEdit /> Edit
            </button>
          )}
        </div>

        {/* Cards */}
        <div className="vol-body">

          <div className="vol-card">
            <h2 className="vol-card-title">Login</h2>
            <div className="vol-info-list">

              <div className="vol-info-item">
                <span className="vol-info-icon"><IconMail /></span>
                <div className="vol-info-text">
                  <FieldLabel>Email</FieldLabel>
                  {editing
                    ? <VolInput value={draft.email} onChange={set('email')} placeholder="you@example.com" type="email" />
                    : <span className="vol-info-value">{user.email || '—'}</span>}
                </div>
              </div>

              <div className="vol-info-item">
                <span className="vol-info-icon"><IconUser /></span>
                <div className="vol-info-text">
                  <FieldLabel>Username</FieldLabel>
                  {editing
                    ? <VolInput value={draft.username} onChange={set('username')} placeholder="username" />
                    : <span className="vol-info-value">{user.username || '—'}</span>}
                </div>
              </div>

            </div>
          </div>

          <div className="vol-card">
            <h2 className="vol-card-title">Profile</h2>
            <div className="vol-info-list">

              <div className="vol-info-item">
                <span className="vol-info-icon"><IconUser /></span>
                <div className="vol-info-text">
                  <FieldLabel>Display Name</FieldLabel>
                  {editing
                    ? <VolInput value={draft.displayName} onChange={set('displayName')} placeholder="Your display name" />
                    : <span className="vol-info-value">{user.displayName || <em className="vol-empty">Not set</em>}</span>}
                </div>
              </div>

              <div className="vol-info-item">
                <span className="vol-info-icon"><IconCalendar /></span>
                <div className="vol-info-text">
                  <FieldLabel>Role</FieldLabel>
                  <span className="vol-role-badge">{user.role}</span>
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* Timestamps */}
        <div className="vol-timestamps">
          <div className="vol-ts-item">
            <span className="vol-label">Created</span>
            <span className="vol-ts-value">{formatDateTime(user.createdAt)}</span>
          </div>
          <div className="vol-ts-item">
            <span className="vol-label">Last Updated</span>
            <span className="vol-ts-value">{formatDateTime(user.updatedAt)}</span>
          </div>
        </div>

        {/* Events */}
        <div className="vol-events-section">
          <div className="vol-events-header">
            <h2 className="vol-events-title">Upcoming Events</h2>
            {!eventsLoading && events.length > 0 && (
              <span className="vol-events-count">{events.length} registered</span>
            )}
          </div>

          {eventsLoading ? (
            <div className="vol-events-state">Loading events…</div>
          ) : events.length === 0 ? (
            <div className="vol-events-state">No upcoming events.</div>
          ) : (
            <div className="vol-events-grid">
              {events.map(ev => <UserEventCard key={ev.id} event={ev} />)}
            </div>
          )}
        </div>

      </div>

      <Footer />
      <div className={'vol-toast' + (toastShow ? ' show' : '')}>{toastMsg}</div>
    </div>
  );
}

export default VolunteerPage;
