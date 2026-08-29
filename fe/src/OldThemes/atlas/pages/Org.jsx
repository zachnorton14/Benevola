import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Shell, {
  Avatar, Btn, Chip, Crumbs, Field, Input, Area, Panel, State, Skeleton, Toast,
} from '../parts';
import DangerZone from '../../../Components/DangerZone';
import ImageField from '../../../shared/ImageField';
import { useAuth } from '../../../context/AuthContext';
import { useOrgDetail } from '../../../data/hooks';
import { formatDuration, shortAddress } from '../../../data/format';

export default function Org() {
  const { id }     = useParams();
  const navigate   = useNavigate();
  const { logout } = useAuth();
  const o          = useOrgDetail(id);

  /* Closing the account you are signed in as leaves the session pointing at a
     row that no longer exists, so clear it locally on the way out. */
  const handleDelete = async () => {
    if (await o.remove()) {
      await logout();
      navigate('/', { replace: true });
    }
  };

  if (o.loading) {
    return <Shell><div className="atl-shell"><Skeleton rows={4} /></div></Shell>;
  }

  if (o.error || !o.record) {
    return (
      <Shell>
        <div className="atl-shell">
          <State error title="Could not load this organization">
            Check the link, or try again once the API is back.
          </State>
        </div>
      </Shell>
    );
  }

  const org     = o.record;
  const draft   = o.draft;
  const editing = o.editing;

  return (
    <Shell>
      {editing && (
        <div className="atl-editbar">
          <span>{o.saveError || 'Editing this organization. Changes are not saved yet.'}</span>
          <div className="atl-editbar-actions">
            <Btn sm variant="ghost" onClick={o.cancel} disabled={o.saving}>Discard</Btn>
            <Btn sm onClick={o.save} disabled={o.saving}>{o.saving ? 'Saving…' : 'Save changes'}</Btn>
          </div>
        </div>
      )}

      <div className="atl-shell">
        <Crumbs items={[
          { label: 'Home', to: '/' },
          { label: 'Organizations', to: '/organizations' },
          { label: editing ? (draft.name || 'Unnamed') : org.name },
        ]} />

        {/* Banner is editable below, so it has to be shown here too. */}
        {org.bannerImg && (
          <div className="atl-banner">
            <img src={org.bannerImg} alt="" />
          </div>
        )}

        <div className="atl-profile">
          <Avatar lg src={org.iconImg} name={org.name} />
          <div style={{ minWidth: 0 }}>
            {editing ? (
              <Input
                value={draft.name ?? ''}
                onChange={e => o.setValue('name', e.target.value)}
                placeholder="Organization name"
              />
            ) : (
              <h1 className="atl-h1" style={{ marginBottom: 2 }}>{org.name}</h1>
            )}
            <p className="atl-muted">
              On Benevola since {new Date(org.createdAt).getFullYear()}
              {!o.eventsLoading && ` · ${o.events.length} posted`}
            </p>
          </div>

          {/* Only the signed-in owner gets these; the API rejects anyone else. */}
          {!editing && o.canEdit && (
            <div className="atl-profile-actions">
              <Btn as={Link} sm to={`/organizations/${org.id}/events/new`}>Post an event</Btn>
              <Btn sm variant="ghost" onClick={o.startEdit}>Edit</Btn>
            </div>
          )}
        </div>

        <div className="atl-cols">
          <div>
            <h2 className="atl-h2" style={{ marginBottom: 12 }}>About</h2>
            {editing ? (
              <Field label="Description">
                <Area
                  rows={6}
                  value={draft.description ?? ''}
                  onChange={e => o.setValue('description', e.target.value)}
                  placeholder="What your organization does, and what you care about."
                />
              </Field>
            ) : (
              <div className="atl-prose" style={{ marginBottom: 34 }}>
                {(org.description || 'This organization has not written a description yet.')
                  .split('\n').filter(Boolean).map((p, i) => <p key={i}>{p}</p>)}
              </div>
            )}

            <h2 className="atl-h2" style={{ marginBottom: 12 }}>Posted events</h2>
            {o.eventsLoading ? (
              <Skeleton rows={3} />
            ) : o.events.length === 0 ? (
              <State title="Nothing posted yet">
                When this organization posts a shift, it shows up here.
              </State>
            ) : (
              <div className="atl-list">
                {o.events.map(ev => {
                  const d = ev.date ? new Date(ev.date) : null;
                  return (
                    <Link key={ev.id} className="atl-item" to={`/events/${ev.id}`}>
                      <span className="atl-date">
                        <b>{d ? d.getDate() : '—'}</b>
                        <span>{d ? d.toLocaleString('en', { month: 'short' }) : 'TBC'}</span>
                      </span>
                      <span className="atl-item-body">
                        <span className="atl-item-title">{ev.title}</span>
                        <span className="atl-item-meta">
                          {ev.address && <span>{shortAddress(ev.address)}</span>}
                          <span>{formatDuration(ev.duration)}</span>
                        </span>
                      </span>
                      <span className="atl-chiprow">
                        {ev.tags.slice(0, 2).map(t => <Chip key={t}>{t.replace(/-/g, ' ')}</Chip>)}
                      </span>
                    </Link>
                  );
                })}
              </div>
            )}

            {o.canEdit && (
              <DangerZone
                title="Close this organization"
                description={
                  o.events.length > 0
                    ? `This deletes the account and all ${o.events.length} posted event${o.events.length === 1 ? '' : 's'}, along with every volunteer RSVP on them.`
                    : 'This deletes the organization account for good. Any events posted later would go with it.'
                }
                actionLabel="Close organization"
                confirmLabel="Yes, close this organization"
                busy={o.removing}
                onConfirm={handleDelete}
              />
            )}
          </div>

          <aside className="atl-aside">
            <Panel pad>
              <h3 className="atl-h3" style={{ marginBottom: 12 }}>Contact</h3>

              {editing ? (
                <>
                  <Field
                    label="Email"
                    hint={draft.email !== org.email ? 'You log in with this address. You will need the new one next time.' : undefined}
                  >
                    <Input
                      type="email"
                      value={draft.email ?? ''}
                      onChange={e => o.setValue('email', e.target.value)}
                      placeholder="hello@example.org"
                    />
                  </Field>
                  <Field label="Phone">
                    <Input value={draft.phone ?? ''} onChange={e => o.setValue('phone', e.target.value)} placeholder="+1 555 000 0000" />
                  </Field>
                  <Field label="Address">
                    <Input value={draft.address ?? ''} onChange={e => o.setValue('address', e.target.value)} placeholder="City, State" />
                  </Field>
                  <ImageField
                    label="Logo"
                    kind="org-icon"
                    value={draft.iconImg ?? ''}
                    onChange={url => o.setValue('iconImg', url)}
                  />
                  <ImageField
                    label="Banner"
                    kind="org-banner"
                    value={draft.bannerImg ?? ''}
                    onChange={url => o.setValue('bannerImg', url)}
                  />
                </>
              ) : (
                <dl style={{ margin: 0 }}>
                  <div className="atl-kv"><dt>Email</dt><dd>{org.email || '—'}</dd></div>
                  <div className="atl-kv"><dt>Phone</dt><dd>{org.phone || '—'}</dd></div>
                  <div className="atl-kv"><dt>Address</dt><dd>{org.address || '—'}</dd></div>
                </dl>
              )}
            </Panel>
          </aside>
        </div>
      </div>

      <Toast toast={o.toast} />
    </Shell>
  );
}
