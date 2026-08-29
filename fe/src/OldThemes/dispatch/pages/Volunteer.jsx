import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Shell, {
  Avatar, Block, BlockHead, Btn, Crumbs, Field, Input, Kicker, Meta,
  State, Skeleton, TagChip, Toast,
} from '../parts';
import DangerZone from '../../../Components/DangerZone';
import ImageField from '../../../shared/ImageField';
import { useAuth } from '../../../context/AuthContext';
import { useUserDetail } from '../../../data/hooks';
import { formatDuration, shortAddress } from '../../../data/format';

export default function Volunteer() {
  const { id }     = useParams();
  const navigate   = useNavigate();
  const { logout } = useAuth();
  const u          = useUserDetail(id);

  const handleDelete = async () => {
    if (await u.remove()) {
      await logout();
      navigate('/', { replace: true });
    }
  };

  if (u.loading) {
    return <Shell><div className="dsp-shell"><Skeleton rows={4} /></div></Shell>;
  }

  if (u.error || !u.record) {
    return (
      <Shell>
        <div className="dsp-shell">
          <State error title="Could not load this profile">
            Check the link, or try again once the API is back.
          </State>
        </div>
      </Shell>
    );
  }

  const user    = u.record;
  const draft   = u.draft;
  const editing = u.editing;
  const name    = user.displayName || user.username;
  const hours   = u.events.reduce((sum, ev) => sum + (ev.duration || 0), 0);

  return (
    <Shell>
      {editing && (
        <div className="dsp-editbar">
          <span>{u.saveError || 'Editing · not saved'}</span>
          <div style={{ display: 'flex', gap: 8 }}>
            <Btn sm variant="ghost" onClick={u.cancel} disabled={u.saving}>Discard</Btn>
            <Btn sm variant="ghost" onClick={u.save} disabled={u.saving}>{u.saving ? 'Saving' : 'Save'}</Btn>
          </div>
        </div>
      )}

      <div className="dsp-shell">
        <Crumbs items={[{ label: 'Home', to: '/' }, { label: name }]} />

        <div className="dsp-profile">
          <Avatar lg src={user.profilePic} name={name} />
          <div style={{ minWidth: 0 }}>
            <Kicker plain>Volunteer</Kicker>
            {editing ? (
              <Input
                value={draft.displayName ?? ''}
                onChange={e => u.setValue('displayName', e.target.value)}
                placeholder="Your display name"
              />
            ) : (
              <h1 className="dsp-h1" style={{ fontSize: '2.1rem' }}>{name}</h1>
            )}
            <Meta>
              Since {new Date(user.createdAt).getFullYear()}
              {u.events.length > 0 && ` · ${formatDuration(hours)} booked`}
            </Meta>
          </div>

          {!editing && u.canEdit && (
            <div className="dsp-profile-actions">
              <Btn sm variant="ghost" onClick={u.startEdit}>Edit profile</Btn>
            </div>
          )}
        </div>

        <div className="dsp-cols">
          <div>
            <div className="dsp-sec-head"><h2 className="dsp-h2">Upcoming shifts</h2></div>

            {u.eventsLoading ? (
              <div style={{ marginTop: 16 }}><Skeleton rows={3} /></div>
            ) : u.events.length === 0 ? (
              <div style={{ marginTop: 16 }}>
                <State title="Nothing booked yet">
                  <Link className="dsp-link" to="/events">Find something happening this week</Link>
                </State>
              </div>
            ) : (
              <div className="dsp-list">
                {u.events.map(ev => {
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

            {u.canEdit && (
              <DangerZone
                title="Delete your account"
                description={
                  u.events.length > 0
                    ? `Your profile and your ${u.events.length} upcoming RSVP${u.events.length === 1 ? '' : 's'} will be removed. Organizers will no longer see you on their rosters.`
                    : 'Your profile and volunteering history will be removed for good.'
                }
                actionLabel="Delete account"
                confirmLabel="Yes, delete my account"
                busy={u.removing}
                onConfirm={handleDelete}
              />
            )}
          </div>

          <aside className="dsp-aside">
            <Block>
              <BlockHead>Account</BlockHead>
              <div style={{ padding: '10px 14px 14px' }}>
                {editing ? (
                  <>
                    <Field
                      label="Username"
                      hint={draft.username !== user.username ? 'You can log in with this. The old one stops working.' : undefined}
                    >
                      <Input
                        value={draft.username ?? ''}
                        onChange={e => u.setValue('username', e.target.value)}
                        placeholder="janesmith"
                      />
                    </Field>
                    <Field
                      label="Email"
                      hint={draft.email !== user.email ? 'You can log in with this too. The old address stops working.' : undefined}
                    >
                      <Input
                        type="email"
                        value={draft.email ?? ''}
                        onChange={e => u.setValue('email', e.target.value)}
                        placeholder="you@example.com"
                      />
                    </Field>
                    <ImageField
                      label="Profile picture"
                      kind="profile-pic"
                      value={draft.profilePic ?? ''}
                      onChange={url => u.setValue('profilePic', url)}
                    />
                  </>
                ) : (
                  <dl style={{ margin: 0 }}>
                    <div className="dsp-kv"><dt>Username</dt><dd>@{user.username}</dd></div>
                    <div className="dsp-kv"><dt>Email</dt><dd>{user.email || '—'}</dd></div>
                    <div className="dsp-kv"><dt>Booked</dt><dd>{u.events.length}</dd></div>
                  </dl>
                )}
              </div>
            </Block>
          </aside>
        </div>
      </div>

      <Toast toast={u.toast} />
    </Shell>
  );
}
