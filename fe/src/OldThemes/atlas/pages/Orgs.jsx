import React from 'react';
import { Link } from 'react-router-dom';
import Shell, { Avatar, Field, Input, State, Skeleton } from '../parts';
import { useOrgList } from '../../../data/hooks';
import { truncate } from '../../../data/format';

export default function Orgs() {
  const o = useOrgList();

  return (
    <Shell>
      <div className="atl-shell">
        <div className="atl-head">
          <div>
            <h1 className="atl-h1">Organizations</h1>
            <p className="atl-sub">Every group posting volunteer work on Benevola.</p>
          </div>
        </div>

        <div style={{ maxWidth: 380, marginBottom: 24 }}>
          <Field label="Search">
            <Input
              value={o.query}
              onChange={e => o.setQuery(e.target.value)}
              placeholder="Name, cause, or place"
            />
          </Field>
        </div>

        {o.loading ? (
          <Skeleton rows={5} />
        ) : o.error ? (
          <State error title="Could not load organizations">
            The API is not answering. Try again in a moment.
          </State>
        ) : o.filtered.length === 0 ? (
          <State title="No organizations match">
            Try a shorter search, or clear it to see everyone.
          </State>
        ) : (
          <div className="atl-list">
            {o.filtered.map(org => (
              <Link key={org.id} className="atl-item" to={`/organizations/${org.id}`}>
                <Avatar src={org.iconImg} name={org.name} />
                <span className="atl-item-body">
                  <span className="atl-item-title">{org.name}</span>
                  <span className="atl-item-meta">
                    {org.address && <span>{org.address}</span>}
                    {org.description && <span>{truncate(org.description, 70)}</span>}
                  </span>
                </span>
                <span className="atl-muted">View</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </Shell>
  );
}
