import React from 'react';
import { Link } from 'react-router-dom';
import Shell, { Avatar, Field, Input, Kicker, Meta, State, Skeleton } from '../parts';
import { useOrgList } from '../../../data/hooks';
import { truncate } from '../../../data/format';

export default function Orgs() {
  const o = useOrgList();

  return (
    <Shell>
      <div className="dsp-shell">
        <div className="dsp-head">
          <div>
            <Kicker>Directory</Kicker>
            <h1 className="dsp-h1">Organizations</h1>
          </div>
          <Meta>{o.filtered.length} listed</Meta>
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
            The API is not answering. Try again shortly.
          </State>
        ) : o.filtered.length === 0 ? (
          <State title="No matches">Try a shorter search, or clear it to see everyone.</State>
        ) : (
          <div className="dsp-list">
            {o.filtered.map(org => (
              <Link key={org.id} className="dsp-item" to={`/organizations/${org.id}`}>
                <Avatar src={org.iconImg} name={org.name} />
                <span className="dsp-item-body">
                  <span className="dsp-item-title">{org.name}</span>
                  <span className="dsp-item-meta">
                    {org.address && <span>{org.address}</span>}
                    {org.description && <span>{truncate(org.description, 60)}</span>}
                  </span>
                </span>
                <Meta>View</Meta>
              </Link>
            ))}
          </div>
        )}
      </div>
    </Shell>
  );
}
