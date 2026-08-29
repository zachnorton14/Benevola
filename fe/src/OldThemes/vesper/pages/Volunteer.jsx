import React from 'react';
import { useParams, Link } from 'react-router-dom';
import Shell, { Crumbs } from '../Shell';
import {
  Btn, Duo, Eyebrow, Field, Label, Meta, MiniMap, StateBlock, Tag, TextInput, Toast,
} from '../parts';
import { useUserDetail } from '../../../data/hooks';
import {
  formatDateTime, formatFullDate, formatDuration, shortAddress, truncate,
} from '../../../data/format';
import {
  IconCalendar, IconClock, IconUsers, IconPin, IconMail, IconUser,
  IconEdit, IconCheck, IconX,
} from '../../Components/Icons';

function DefRow({ icon, label, children }) {
  return (
    <div className="vsp-defrow">
      <span className="vsp-defrow-icon">{icon}</span>
      <div>
        <Label>{label}</Label>
        <span className="vsp-defrow-val">{children}</span>
      </div>
    </div>
  );
}

function BookedEvent({ event }) {
  const addr = shortAddress(event.address);
  return (
    <Link className="vsp-prog-item" to={`/events/${event.id}`}>
      <div className="vsp-maprow-media">
        {event.heroImage && <Duo src={event.heroImage} alt="" />}
        <MiniMap lat={event.lat} lng={event.lng} />
      </div>

      <div>
        <span className="vsp-prog-day">{formatFullDate(event.date)}</span>
        <h3 style={{ marginTop: 10 }}>{event.title}</h3>
        {event.description && (
          <p className="vsp-prog-desc">{truncate(event.description, 150)}</p>
        )}
        <div className="vsp-prog-meta">
          <Tag fill><IconClock size={13} /> {formatDuration(event.duration)}</Tag>
          <Tag fill><IconUsers size={13} /> {event.capacity} volunteers</Tag>
          {addr && <Tag fill><IconPin size={13} /> {addr}</Tag>}
        </div>
      </div>
    </Link>
  );
}

export default function Volunteer() {
  const { id } = useParams();
  const u = useUserDetail(id);

  if (u.loading) {
    return <Shell><div className="vsp-shell"><StateBlock>Loading profile…</StateBlock></div></Shell>;
  }

  if (u.error || !u.record) {
    return (
      <Shell>
        <div className="vsp-shell">
          <StateBlock error note="Check the profile id, or try again once the API is back up.">
            Could not load this profile
          </StateBlock>
        </div>
      </Shell>
    );
  }

  const user    = u.record;
  const draft   = u.draft;
  const editing = u.editing;
  const name    = user.displayName || user.username;
  const initial = name?.[0]?.toUpperCase() ?? '?';
  const hours   = u.events.reduce((sum, ev) => sum + (ev.duration || 0), 0);

  return (
    <Shell>
      {editing && (
        <div className="vsp-edit-bar">
          <Eyebrow><span className="vsp-edit-dot" /> Editing profile · unsaved</Eyebrow>
          <div style={{ display: 'flex', gap: 10 }}>
            <Btn sm variant="outline" onClick={u.cancel}><IconX size={14} /> Discard</Btn>
            <Btn sm onClick={u.save}><IconCheck size={14} /> Save changes</Btn>
          </div>
        </div>
      )}

      <div className="vsp-shell">
        <Crumbs items={[{ label: 'Home', to: '/' }, { label: name }]} />

        <div className="vsp-cover">
          <div className="vsp-cover-blank" />
          <div className="vsp-avatar">
            {user.profilePic ? <img src={user.profilePic} alt={name} /> : <span>{initial}</span>}
          </div>
          {!u.eventsLoading && u.events.length > 0 && (
            <div className="vsp-cover-stat">
              <b>{formatDuration(hours)}</b>
              <span>Booked ahead</span>
            </div>
          )}
        </div>

        <div className="vsp-profile-head">
          <div>
            {editing ? (
              <Field label="Display name">
                <TextInput
                  large
                  value={draft.displayName ?? ''}
                  onChange={ev => u.setValue('displayName', ev.target.value)}
                  placeholder="Your display name"
                />
              </Field>
            ) : (
              <h1 className="vsp-h1">{name}</h1>
            )}
            <Meta className="vsp-since">
              <IconCalendar size={13} /> On Benevola since {new Date(user.createdAt).getFullYear()}
            </Meta>
          </div>

          {!editing && (
            <div className="vsp-profile-actions">
              <Btn sm variant="outline" onClick={u.startEdit}><IconEdit size={14} /> Edit profile</Btn>
            </div>
          )}
        </div>

        <div className="vsp-cols">
          <div>
            <Eyebrow tone="clay">Account</Eyebrow>
            <div style={{ marginTop: 18 }} className="vsp-deflist">
              <DefRow icon={<IconMail size={15} />} label="Email">
                {editing
                  ? <TextInput
                      type="email"
                      value={draft.email ?? ''}
                      onChange={ev => u.setValue('email', ev.target.value)}
                      placeholder="you@example.com"
                    />
                  : (user.email || <em>Not set</em>)}
              </DefRow>
              <DefRow icon={<IconUser size={15} />} label="Username">
                {editing
                  ? <TextInput
                      value={draft.username ?? ''}
                      onChange={ev => u.setValue('username', ev.target.value)}
                      placeholder="username"
                    />
                  : (user.username || <em>Not set</em>)}
              </DefRow>
            </div>
          </div>

          <div>
            <Eyebrow tone="clay">Profile</Eyebrow>
            <div style={{ marginTop: 18 }} className="vsp-deflist">
              <DefRow icon={<IconUser size={15} />} label="Display name">
                {editing
                  ? <TextInput
                      value={draft.displayName ?? ''}
                      onChange={ev => u.setValue('displayName', ev.target.value)}
                      placeholder="Your display name"
                    />
                  : (user.displayName || <em>Not set</em>)}
              </DefRow>
              <DefRow icon={<IconCheck size={15} />} label="Role">
                <span className="vsp-role">{user.role}</span>
              </DefRow>
            </div>

            <div className="vsp-ts">
              <div>
                <Label>Joined</Label>
                <span className="vsp-ts-val">{formatDateTime(user.createdAt)}</span>
              </div>
              <div>
                <Label>Last updated</Label>
                <span className="vsp-ts-val">{formatDateTime(user.updatedAt)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="vsp-listing-head">
          <div>
            <Eyebrow tone="clay">Roster</Eyebrow>
            <h2 className="vsp-h2" style={{ marginTop: 12 }}>Upcoming events</h2>
          </div>
          {!u.eventsLoading && u.events.length > 0 && (
            <Meta>{u.events.length} booked · {formatDuration(hours)} total</Meta>
          )}
        </div>

        {u.eventsLoading ? (
          <StateBlock>Loading roster…</StateBlock>
        ) : u.events.length === 0 ? (
          <div className="vsp-state">
            <p className="vsp-state-title">Nothing booked yet</p>
            <span className="vsp-state-note">
              <Link className="vsp-link" to="/events">Find something happening this week</Link>
            </span>
          </div>
        ) : (
          <div className="vsp-prog">
            {u.events.map(ev => <BookedEvent key={ev.id} event={ev} />)}
          </div>
        )}
      </div>

      <Toast toast={u.toast} />
    </Shell>
  );
}
