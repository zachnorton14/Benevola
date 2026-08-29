import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Shell, {
  Avatar, Btn, Chip, Crumbs, DateBlock, Field, Input, Panel, State, Skeleton, Toast,
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
    return <Shell><div className="ptp-shell"><Skeleton rows={4} /></div></Shell>;
  }

  if (u.error || !u.record) {
    return (
      <Shell>
        <div className="ptp-shell">
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
        <div className="ptp-editbar">
          <span>{u.saveError || 'Editing your profile. Changes are not saved yet.'}</span>
          <div className="ptp-editbar-actions">
            <Btn sm variant="ghost" onClick={u.cancel} disabled={u.saving}>Discard</Btn>
            <Btn sm onClick={u.save} disabled={u.saving}>{u.saving ? 'Saving…' : 'Save changes'}</Btn>
          </div>
        </div>
      )}

      <div className="ptp-shell">
        <Crumbs items={[{ label: 'Home', to: '/' }, { label: name }]} />

        <div className="ptp-profile">
          <Avatar lg src={user.profilePic} name={name} />
          <div style={{ minWidth: 0 }}>
            {editing ? (
              <Input
                value={draft.displayName ?? ''}
                onChange={e => u.setValue('displayName', e.target.value)}
                placeholder="Your display name"
              />
            ) : (
              <h1 className="ptp-h1" style={{ marginBottom: 2 }}>{name}</h1>
            )}
            <p className="ptp-muted">
              Volunteering since {new Date(user.createdAt).getFullYear()}
              {u.events.length > 0 && ` · ${formatDuration(hours)} booked ahead`}
            </p>
          </div>

          {/* Your own profile only; the API rejects edits to anyone else's. */}
          {!editing && u.canEdit && (
            <div className="ptp-profile-actions">
              <Btn sm variant="ghost" onClick={u.startEdit}>Edit profile</Btn>
            </div>
          )}
        </div>

        <div className="ptp-cols">
          <div>
            <h2 className="ptp-h2" style={{ marginBottom: 14 }}>Upcoming shifts</h2>
            {u.eventsLoading ? (
              <Skeleton rows={3} />
            ) : u.events.length === 0 ? (
              <State title="Nothing booked yet">
                <Link className="ptp-link" to="/events">Find something happening this week</Link>
              </State>
            ) : (
              <div className="ptp-list">
                {u.events.map(ev => (
                  <Link key={ev.id} className="ptp-item" to={`/events/${ev.id}`}>
                    <span className="ptp-lead"><DateBlock iso={ev.date} /></span>
                    <span className="ptp-item-body">
                      <span className="ptp-item-title">{ev.title}</span>
                      <span className="ptp-item-meta">
                        {ev.address && <span>{shortAddress(ev.address)}</span>}
                        <span>{formatDuration(ev.duration)}</span>
                      </span>
                    </span>
                    <span className="ptp-chiprow">
                      {ev.tags.slice(0, 2).map(t => <Chip key={t}>{t.replace(/-/g, ' ')}</Chip>)}
                    </span>
                  </Link>
                ))}
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

          <aside className="ptp-aside">
            <Panel pad float>
              <h3 className="ptp-h3" style={{ marginBottom: 16 }}>Account</h3>

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
                  <div className="ptp-kv"><dt>Username</dt><dd>@{user.username}</dd></div>
                  <div className="ptp-kv"><dt>Email</dt><dd>{user.email || '—'}</dd></div>
                  <div className="ptp-kv"><dt>Shifts booked</dt><dd>{u.events.length}</dd></div>
                </dl>
              )}
            </Panel>
          </aside>
        </div>
      </div>

      <Toast toast={u.toast} />
    </Shell>
  );
}
