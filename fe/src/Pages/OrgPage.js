import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import Header from '../Components/Header';
import Footer from '../Components/Footer';
import Breadcrumb from '../Components/Breadcrumb';
import {
  IconEdit, IconCheck, IconX,
  IconPin, IconMail, IconPhone, IconCalendar,
} from '../Components/Icons';
import '../styles/OrgPage.css';

/* ── Helpers ─────────────────────────────────────────────────────── */
function formatDateTime(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: 'numeric', minute: '2-digit',
  });
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

  const [org,       setOrg]       = useState(null);
  const [draft,     setDraft]     = useState(null);
  const [editing,   setEditing]   = useState(false);
  const [loading,   setLoading]   = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [toastMsg,  setToastMsg]  = useState('');
  const [toastShow, setToastShow] = useState(false);
  const toastTimer = useRef(null);

  useEffect(() => {
    setLoading(true);
    setLoadError(false);
    setEditing(false);
    getOrg(id)
      .then(data => { setOrg(data); setDraft(data); setLoading(false); })
      .catch(() => { setLoadError(true); setLoading(false); });
  }, [id]);

  const showToast = useCallback((msg) => {
    setToastMsg(msg);
    setToastShow(true);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastShow(false), 2000);
  }, []);

  const set = key => val => setDraft(d => ({ ...d, [key]: val }));

  const startEdit  = () => { setDraft({ ...org }); setEditing(true); };
  const cancelEdit = () => setEditing(false);
  const saveEdit   = () => {
    setOrg({ ...draft, updatedAt: new Date().toISOString() });
    setEditing(false);
    showToast('Organization saved.');
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
            <button className="org-btn org-btn--sm org-btn--danger" onClick={cancelEdit}>
              <IconX /> Discard
            </button>
            <button className="org-btn org-btn--sm" onClick={saveEdit}>
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

        {/* Banner */}
        <div className="org-banner">
          {org.bannerImg
            ? <img src={org.bannerImg} alt="" />
            : <div className="org-banner-placeholder" />}
        </div>

        {/* Profile row */}
        <div className="org-profile-row">
          <div className="org-icon">
            {org.iconImg
              ? <img src={org.iconImg} alt={org.name} />
              : <span className="org-icon-initial">{initial}</span>}
          </div>

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

          {!editing && (
            <button className="org-btn org-btn--ghost org-btn--sm" onClick={startEdit}>
              <IconEdit /> Edit
            </button>
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

      </div>

      <Footer />

      <div className={'org-toast' + (toastShow ? ' show' : '')}>{toastMsg}</div>
    </div>
  );
}

export default OrgPage;
