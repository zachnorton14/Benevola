import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Shell, {
  Avatar, Block, BlockHead, Btn, Crumbs, Field, Input, Area, Kicker, Meta,
  State, Skeleton, TagChip, Toast,
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
    return <Shell><div className="dsp-shell"><Skeleton rows={4} /></div></Shell>;
  }

  if (o.error || !o.record) {
    return (
      <Shell>
        <div className="dsp-shell">
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
        <div className="dsp-editbar">
          <span>{o.saveError || 'Editing · not saved'}</span>
          <div style={{ display: 'flex', gap: 8 }}>
            <Btn sm variant="ghost" onClick={o.cancel} disabled={o.saving}>Discard</Btn>
            <Btn sm variant="ghost" onClick={o.save} disabled={o.saving}>{o.saving ? 'Saving' : 'Save'}</Btn>
          </div>
        </div>
      )}

      <div className="dsp-shell">
        <Crumbs items={[
          { label: 'Home', to: '/' },
          { label: 'Orgs', to: '/organizations' },
          { label: editing ? (draft.name || 'Unnamed') : org.name },
        ]} />

        {/* Banner is editable below, so it has to be shown here too. */}
        {org.bannerImg && (
          <div className="dsp-banner">
            <img src={org.bannerImg} alt="" />
          </div>
        )}

        <div className="dsp-profile">
          <Avatar lg src={org.iconImg} name={org.name} />
          <div style={{ minWidth: 0 }}>
            <Kicker plain>Organization</Kicker>
            {editing ? (
              <Input value={draft.name ?? ''} onChange={e => o.setValue('name', e.target.value)} placeholder="Organization name" />
            ) : (
              <h1 className="dsp-h1" style={{ fontSize: '2.1rem' }}>{org.name}</h1>
            )}
            <Meta>
              Since {new Date(org.createdAt).getFullYear()}
              {!o.eventsLoading && ` · ${o.events.length} posted`}
            </Meta>
          </div>

          {!editing && o.canEdit && (
            <div className="dsp-profile-actions">
              <Btn as={Link} sm to={`/organizations/${org.id}/events/new`}>Post an event</Btn>
              <Btn sm variant="ghost" onClick={o.startEdit}>Edit</Btn>
            </div>
          )}
        </div>

        <div className="dsp-cols">
          <div>
            <div className="dsp-sec-head"><h2 className="dsp-h2">About</h2></div>
            {editing ? (
              <div style={{ marginTop: 16 }}>
                <Field label="Description">
                  <Area
                    rows={6}
                    value={draft.description ?? ''}
                    onChange={e => o.setValue('description', e.target.value)}
                    placeholder="What your organization does, and what you care about."
                  />
                </Field>
              </div>
            ) : (
              <div className="dsp-prose" style={{ margin: '16px 0 34px' }}>
                {(org.description || 'This organization has not written a description yet.')
                  .split('\n').filter(Boolean).map((p, i) => <p key={i}>{p}</p>)}
              </div>
            )}

            <div className="dsp-sec-head"><h2 className="dsp-h2">Posted events</h2></div>
            {o.eventsLoading ? (
              <div style={{ marginTop: 16 }}><Skeleton rows={3} /></div>
            ) : o.events.length === 0 ? (
              <div style={{ marginTop: 16 }}>
                <State title="Nothing posted yet">
                  When this organization posts a shift, it appears here.
                </State>
              </div>
            ) : (
              <div className="dsp-list">
                {o.events.map(ev => {
                  const d = ev.date ? new Date(ev.date) : null;
                  return (
                    <Link key={ev.id} className="dsp-item" to={`/events/${ev.id}`}>
                      <span className="dsp-date">
                        <b>{d ? d.getDate() : '—'}</b>
                        <span>{d ? d.toLocaleString('en', { month: 'short' }) : 'TBC'}</span>
                      </span>
                      <span className="dsp-item-body">
                        <span className="dsp-item-title">{ev.title}</span>
                        <span className="dsp-item-meta">
                          {ev.address && <span>{shortAddress(ev.address)}</span>}
                          <span>{formatDuration(ev.duration)}</span>
                        </span>
                      </span>
                      <span className="dsp-tagrow">
                        {ev.tags.slice(0, 2).map(t => <TagChip key={t}>{t.replace(/-/g, ' ')}</TagChip>)}
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

          <aside className="dsp-aside">
            <Block>
              <BlockHead>Contact</BlockHead>
              <div style={{ padding: '10px 14px 14px' }}>
                {editing ? (
                  <>
                    <Field
                      label="Email"
                      hint={draft.email !== org.email ? 'You log in with this address. The old one stops working.' : undefined}
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
                    <div className="dsp-kv"><dt>Email</dt><dd>{org.email || '—'}</dd></div>
                    <div className="dsp-kv"><dt>Phone</dt><dd>{org.phone || '—'}</dd></div>
                    <div className="dsp-kv"><dt>Address</dt><dd>{org.address || '—'}</dd></div>
                  </dl>
                )}
              </div>
            </Block>
          </aside>
        </div>
      </div>

      <Toast toast={o.toast} />
    </Shell>
  );
}
