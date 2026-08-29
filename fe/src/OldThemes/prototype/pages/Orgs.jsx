import React from 'react';
import { Link } from 'react-router-dom';
import Shell, { Avatar, Field, Input, State, Skeleton } from '../parts';
import { useOrgList } from '../../../data/hooks';
import { truncate } from '../../../data/format';

export default function Orgs() {
  const o = useOrgList();

  return (
    <Shell>
      <div className="ptp-shell">
        <div className="ptp-head">
          <div>
            <h1 className="ptp-h1">Organizations</h1>
            <p className="ptp-sub">Every group posting volunteer work on Benevola.</p>
          </div>
        </div>

        <div style={{ maxWidth: 420, marginBottom: 28 }}>
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
          <div className="ptp-list">
            {o.filtered.map(org => (
              <Link key={org.id} className="ptp-item" to={`/organizations/${org.id}`}>
                <Avatar src={org.iconImg} name={org.name} />
                <span className="ptp-item-body">
                  <span className="ptp-item-title">{org.name}</span>
                  <span className="ptp-item-meta">
                    {org.address && <span>{org.address}</span>}
                    {org.description && <span>{truncate(org.description, 70)}</span>}
                  </span>
                </span>
                <span className="ptp-muted">View</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </Shell>
  );
}
