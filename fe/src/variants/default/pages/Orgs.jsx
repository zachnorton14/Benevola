import React from 'react';
import { Link } from 'react-router-dom';
import Shell, { Avatar, Field, Input, State, Skeleton, useFirstReveal } from '../parts';
import { useOrgList } from '../../../data/hooks';
import { truncate } from '../../../data/format';

export default function Orgs() {
  const o = useOrgList();
  const revealing = useFirstReveal(!o.loading);

  return (
    <Shell>
      <div className="def-shell">
        <div className="def-head">
          <div>
            <h1 className="def-h1">Organizations</h1>
            <p className="def-sub">Every group posting volunteer work on Benevola.</p>
          </div>
        </div>

        <div style={{ maxWidth: 400, marginBottom: 26 }}>
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
          <div className={'def-list def-fade-in' + (revealing ? ' def-stagger' : '')}>
            {o.filtered.map((org, i) => (
              <Link
                key={org.id}
                className="def-item"
                to={`/organizations/${org.id}`}
                style={{ '--i': i }}
              >
                <Avatar src={org.iconImg} name={org.name} />
                <span className="def-item-body">
                  <span className="def-item-title">{org.name}</span>
                  <span className="def-item-meta">
                    {org.address && <span>{org.address}</span>}
                    {org.description && <span>{truncate(org.description, 70)}</span>}
                  </span>
                </span>
                <span className="def-muted">View</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </Shell>
  );
}
