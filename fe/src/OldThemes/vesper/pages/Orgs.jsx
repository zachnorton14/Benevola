import React from 'react';
import { Link } from 'react-router-dom';
import Shell, { Crumbs } from '../Shell';
import { Arrow, Eyebrow, Meta, StateBlock } from '../parts';
import { useOrgList } from '../../../data/hooks';
import { truncate } from '../../../data/format';
import { IconMail, IconPin } from '../../Components/Icons';

function OrgRow({ org }) {
  const initial = org.name?.[0]?.toUpperCase() ?? '?';
  return (
    <Link className="vsp-orgrow" to={`/organizations/${org.id}`}>
      <span className="vsp-orgmark">
        {org.iconImg ? <img src={org.iconImg} alt="" /> : initial}
      </span>

      <div>
        <h3>{org.name}</h3>
        <p>{org.description || 'No description posted yet.'}</p>
        {(org.email || org.address) && (
          <div className="vsp-orgrow-meta">
            {org.email && <span><IconMail size={13} /> {org.email}</span>}
            {org.address && <span><IconPin size={13} /> {truncate(org.address, 48)}</span>}
          </div>
        )}
      </div>

      <span className="vsp-dest-go"><Arrow size={17} /></span>
    </Link>
  );
}

export default function Orgs() {
  const { filtered, loading, error, query, setQuery, orgs } = useOrgList();

  return (
    <Shell>
      <div className="vsp-shell">
        <Crumbs items={[{ label: 'Home', to: '/' }, { label: 'Organizations' }]} />

        <div className="vsp-page-head">
          <div>
            <Eyebrow tone="clay">The register</Eyebrow>
            <h1 className="vsp-h1">Organizations</h1>
            <p>Verified nonprofits and community groups looking for volunteers.</p>
          </div>

          <div className="vsp-searchbar">
            <input
              type="search"
              placeholder="Filter by name, place, or cause"
              value={query}
              onChange={e => setQuery(e.target.value)}
              aria-label="Filter organizations"
            />
          </div>
        </div>

        {loading ? (
          <StateBlock>Loading the register…</StateBlock>
        ) : error ? (
          <StateBlock error note="The API is not answering right now.">
            Could not load organizations
          </StateBlock>
        ) : filtered.length === 0 ? (
          <StateBlock note={query ? 'Try a shorter search term.' : undefined}>
            {query ? 'Nothing matches that' : 'No organizations listed yet'}
          </StateBlock>
        ) : (
          <>
            <div className="vsp-results-bar" style={{ marginTop: 30 }}>
              <Meta>
                {filtered.length} of {orgs.length} organization{orgs.length !== 1 ? 's' : ''}
              </Meta>
            </div>
            <div className="vsp-orglist">
              {filtered.map(org => <OrgRow key={org.id} org={org} />)}
            </div>
          </>
        )}
      </div>
    </Shell>
  );
}
