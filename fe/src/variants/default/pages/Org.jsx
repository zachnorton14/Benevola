import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Shell, {
  Avatar, Btn, Chip, Crumbs, DateBlock, Field, Input, Area, Panel, State, Skeleton, Toast,
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
    return <Shell><div className="def-shell"><Skeleton rows={4} /></div></Shell>;
  }

  if (o.error || !o.record) {
    return (
      <Shell>
        <div className="def-shell">
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
        <div className="def-editbar">
          <span>{o.saveError || 'Editing this organization. Changes are not saved yet.'}</span>
          <div className="def-editbar-actions">
            <Btn sm variant="ghost" onClick={o.cancel} disabled={o.saving}>Discard</Btn>
            <Btn sm onClick={o.save} disabled={o.saving}>{o.saving ? 'Saving…' : 'Save changes'}</Btn>
          </div>
        </div>
      )}

      <div className="def-shell">
        <Crumbs items={[
          { label: 'Home', to: '/' },
          { label: 'Organizations', to: '/organizations' },
          { label: editing ? (draft.name || 'Unnamed') : org.name },
        ]} />

        {/* Banner is editable below, so it has to be shown here too. */}
        {org.bannerImg && (
          <div className="def-banner">
            <img src={org.bannerImg} alt="" />
          </div>
        )}

        <div className="def-profile">
          <Avatar lg src={org.iconImg} name={org.name} />
          <div style={{ minWidth: 0 }}>
            {editing ? (
              <Input
                value={draft.name ?? ''}
                onChange={e => o.setValue('name', e.target.value)}
                placeholder="Organization name"
              />
            ) : (
              <h1 className="def-h1" style={{ marginBottom: 2 }}>{org.name}</h1>
            )}
            <p className="def-muted">
              On Benevola since {new Date(org.createdAt).getFullYear()}
              {!o.eventsLoading && ` · ${o.events.length} posted`}
            </p>
          </div>

          {/* Only the signed-in owner gets these; the API rejects anyone else. */}
          {!editing && o.canEdit && (
            <div className="def-profile-actions">
              <Btn as={Link} sm to={`/organizations/${org.id}/events/new`}>Post an event</Btn>
              <Btn sm variant="ghost" onClick={o.startEdit}>Edit</Btn>
            </div>
          )}
        </div>

        <div className="def-cols">
          <div>
            <h2 className="def-h2" style={{ marginBottom: 14 }}>About</h2>
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
              <div className="def-prose" style={{ marginBottom: 36 }}>
                {(org.description || 'This organization has not written a description yet.')
                  .split('\n').filter(Boolean).map((p, i) => <p key={i}>{p}</p>)}
              </div>
            )}

            <h2 className="def-h2" style={{ marginBottom: 14 }}>Posted events</h2>
            {o.eventsLoading ? (
              <Skeleton rows={3} />
            ) : o.events.length === 0 ? (
              <State title="Nothing posted yet">
                When this organization posts a shift, it shows up here.
              </State>
            ) : (
              <div className="def-list">
                {o.events.map(ev => (
                  <Link key={ev.id} className="def-item" to={`/events/${ev.id}`}>
                    <span className="def-lead"><DateBlock iso={ev.date} /></span>
                    <span className="def-item-body">
                      <span className="def-item-title">{ev.title}</span>
                      <span className="def-item-meta">
                        {ev.address && <span>{shortAddress(ev.address)}</span>}
                        <span>{formatDuration(ev.duration)}</span>
                      </span>
                    </span>
                    <span className="def-chiprow">
                      {ev.tags.slice(0, 2).map(t => <Chip key={t}>{t.replace(/-/g, ' ')}</Chip>)}
                    </span>
                  </Link>
                ))}
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

          <aside className="def-aside">
            <Panel pad float>
              <h3 className="def-h3" style={{ marginBottom: 14 }}>Contact</h3>

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
                  <div className="def-kv"><dt>Email</dt><dd>{org.email || '—'}</dd></div>
                  <div className="def-kv"><dt>Phone</dt><dd>{org.phone || '—'}</dd></div>
                  <div className="def-kv"><dt>Address</dt><dd>{org.address || '—'}</dd></div>
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
