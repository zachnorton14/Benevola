import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../Components/Header';
import Footer from '../Components/Footer';
import Breadcrumb from '../Components/Breadcrumb';
import { IconPin, IconMail } from '../Components/Icons';
import '../styles/OrgsPage.css';

/* ── Map raw API org ─────────────────────────────────────────────── */
function mapOrg(d) {
  return {
    id:          d.id,
    name:        d.name,
    description: d.description,
    email:       d.email,
    address:     d.address,
    bannerImg:   d.bannerImg,
    iconImg:     d.iconImg,
  };
}

/* ── Org card ────────────────────────────────────────────────────── */
function OrgCard({ org }) {
  const initial = org.name?.[0]?.toUpperCase() ?? '?';

  return (
    <Link to={`/organizations/${org.id}`} className="orgs-card">
      <div className="orgs-card-banner">
        {org.bannerImg
          ? <img src={org.bannerImg} alt="" />
          : <div className="orgs-card-banner-placeholder" />}
      </div>

      <div className="orgs-card-icon">
        {org.iconImg
          ? <img src={org.iconImg} alt={org.name} />
          : <span className="orgs-card-icon-initial">{initial}</span>}
      </div>

      <div className="orgs-card-body">
        <h3 className="orgs-card-name">{org.name}</h3>

        {org.description && (
          <p className="orgs-card-desc">{org.description}</p>
        )}

        <div className="orgs-card-meta">
          {org.email && (
            <span className="orgs-card-meta-item">
              <IconMail size={13} /> {org.email}
            </span>
          )}
          {org.address && (
            <span className="orgs-card-meta-item">
              <IconPin size={13} /> {org.address}
            </span>
          )}
        </div>

        <div className="orgs-card-footer">
          <span className="orgs-card-cta">View organization →</span>
        </div>
      </div>
    </Link>
  );
}

/* ── Orgs page ───────────────────────────────────────────────────── */
function OrgsPage() {
  const [orgs,    setOrgs]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(false);

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/api/orgs/`)
      .then(r => { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(data => { setOrgs((data.data ?? []).map(mapOrg)); setLoading(false); })
      .catch(() => { setError(true); setLoading(false); });
  }, []);

  return (
    <div className="orgs-page">
      <Header />

      <div className="orgs-content">
        <Breadcrumb crumbs={[
          { label: 'Home',          to: '/' },
          { label: 'Organizations' },
        ]} />

        <div className="orgs-page-header">
          <h1 className="orgs-page-title">Organizations</h1>
          <p className="orgs-page-subtitle">Verified nonprofits and community groups looking for volunteers</p>
        </div>

        {loading ? (
          <div className="orgs-state">Loading organizations…</div>
        ) : error ? (
          <div className="orgs-state orgs-state--error">
            Could not load organizations. Check your connection.
          </div>
        ) : orgs.length === 0 ? (
          <div className="orgs-state">No organizations found.</div>
        ) : (
          <>
            <div className="orgs-results-count">
              {orgs.length} organization{orgs.length !== 1 ? 's' : ''}
            </div>
            <div className="orgs-grid">
              {orgs.map(org => (
                <OrgCard key={org.id} org={org} />
              ))}
            </div>
          </>
        )}
      </div>

      <Footer />
    </div>
  );
}

export default OrgsPage;
