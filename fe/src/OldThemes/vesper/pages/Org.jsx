import React from 'react';
import { useParams, Link } from 'react-router-dom';
import Shell, { Crumbs } from '../Shell';
import {
  Btn, Duo, Eyebrow, Field, Label, Meta, MiniMap, StateBlock, Tag, TextInput, Toast,
} from '../parts';
import { useOrgDetail } from '../../../data/hooks';
import { formatDateTime, formatFullDate, formatDuration, shortAddress } from '../../../data/format';
import {
  IconCalendar, IconClock, IconUsers, IconPin, IconMail, IconPhone,
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

function PostedEvent({ event }) {
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
        <div className="vsp-prog-meta">
          <Tag fill><IconClock size={13} /> {formatDuration(event.duration)}</Tag>
          <Tag fill><IconUsers size={13} /> {event.capacity} volunteers</Tag>
          {addr && <Tag fill><IconPin size={13} /> {addr}</Tag>}
          {event.tagObjects?.map(t => <Tag key={t.id} tone="clay">{t.name}</Tag>)}
        </div>
      </div>
    </Link>
  );
}

export default function Org() {
  const { id } = useParams();
  const o = useOrgDetail(id);

  if (o.loading) {
    return <Shell><div className="vsp-shell"><StateBlock>Loading organization…</StateBlock></div></Shell>;
  }

  if (o.error || !o.record) {
    return (
      <Shell>
        <div className="vsp-shell">
          <StateBlock error note="Check the organization id, or try again once the API is back up.">
            Could not load this organization
          </StateBlock>
        </div>
      </Shell>
    );
  }

  const org     = o.record;
  const draft   = o.draft;
  const editing = o.editing;
  const name    = editing ? (draft.name || 'Unnamed organization') : org.name;
  const initial = org.name?.[0]?.toUpperCase() ?? '?';

  return (
    <Shell>
      {editing && (
        <div className="vsp-edit-bar">
          <Eyebrow><span className="vsp-edit-dot" /> Editing organization · unsaved</Eyebrow>
          <div style={{ display: 'flex', gap: 10 }}>
            <Btn sm variant="outline" onClick={o.cancel}><IconX size={14} /> Discard</Btn>
            <Btn sm onClick={o.save}><IconCheck size={14} /> Save changes</Btn>
          </div>
        </div>
      )}

      <div className="vsp-shell">
        <Crumbs items={[
          { label: 'Home',          to: '/' },
          { label: 'Organizations', to: '/organizations' },
          { label: name },
        ]} />

        <div className="vsp-cover">
          {org.bannerImg
            ? <Duo className="vsp-cover-art" src={org.bannerImg} alt="" />
            : <div className="vsp-cover-blank" />}
          <div className="vsp-avatar">
            {org.iconImg ? <img src={org.iconImg} alt={org.name} /> : <span>{initial}</span>}
          </div>
          {!o.eventsLoading && (
            <div className="vsp-cover-stat">
              <b>{o.events.length}</b>
              <span>Open posts</span>
            </div>
          )}
        </div>

        <div className="vsp-profile-head">
          <div>
            {editing ? (
              <Field label="Organization name">
                <TextInput
                  large
                  value={draft.name ?? ''}
                  onChange={ev => o.setValue('name', ev.target.value)}
                  placeholder="Organization name"
                />
              </Field>
            ) : (
              <h1 className="vsp-h1">{org.name}</h1>
            )}
            <Meta className="vsp-since">
              <IconCalendar size={13} /> On Benevola since {new Date(org.createdAt).getFullYear()}
            </Meta>
          </div>

          {!editing && (
            <div className="vsp-profile-actions">
              <Btn sm><IconCalendar size={14} /> Create event</Btn>
              <Btn sm variant="outline" onClick={o.startEdit}><IconEdit size={14} /> Edit</Btn>
            </div>
          )}
        </div>

        <div className="vsp-cols">
          <div>
            <Eyebrow tone="clay">About</Eyebrow>
            <div style={{ marginTop: 18 }}>
              {editing ? (
                <Field label="Description">
                  <textarea
                    className="vsp-field"
                    rows={7}
                    value={draft.description ?? ''}
                    onChange={ev => o.setValue('description', ev.target.value)}
                  />
                </Field>
              ) : (
                <div className="vsp-prose">
                  <p>{org.description || 'This organization has not written a description yet.'}</p>
                </div>
              )}
            </div>

            <div className="vsp-ts">
              <div>
                <Label>Registered</Label>
                <span className="vsp-ts-val">{formatDateTime(org.createdAt)}</span>
              </div>
              <div>
                <Label>Last updated</Label>
                <span className="vsp-ts-val">{formatDateTime(org.updatedAt)}</span>
              </div>
            </div>
          </div>

          <div>
            <Eyebrow tone="clay">Contact</Eyebrow>
            <div style={{ marginTop: 18 }} className="vsp-deflist">
              <DefRow icon={<IconMail size={15} />} label="Email">
                {editing
                  ? <TextInput
                      type="email"
                      value={draft.email ?? ''}
                      onChange={ev => o.setValue('email', ev.target.value)}
                      placeholder="email@example.com"
                    />
                  : (org.email || <em>Not listed</em>)}
              </DefRow>
              <DefRow icon={<IconPhone size={15} />} label="Phone">
                {editing
                  ? <TextInput
                      type="tel"
                      value={draft.phone ?? ''}
                      onChange={ev => o.setValue('phone', ev.target.value)}
                      placeholder="555-000-0000"
                    />
                  : (org.phone || <em>Not listed</em>)}
              </DefRow>
              <DefRow icon={<IconPin size={15} />} label="Address">
                {editing
                  ? <TextInput
                      value={draft.address ?? ''}
                      onChange={ev => o.setValue('address', ev.target.value)}
                      placeholder="Street address"
                    />
                  : (org.address || <em>Not listed</em>)}
              </DefRow>
            </div>
          </div>
        </div>

        <div className="vsp-listing-head">
          <div>
            <Eyebrow tone="clay">Programme</Eyebrow>
            <h2 className="vsp-h2" style={{ marginTop: 12 }}>Events</h2>
          </div>
          {!o.eventsLoading && <Meta>{o.events.length} posted</Meta>}
        </div>

        {o.eventsLoading ? (
          <StateBlock>Loading events…</StateBlock>
        ) : o.events.length === 0 ? (
          <StateBlock note="When this organization posts a shift, it shows up here.">
            Nothing posted yet
          </StateBlock>
        ) : (
          <div className="vsp-prog">
            {o.events.map(ev => <PostedEvent key={ev.id} event={ev} />)}
          </div>
        )}
      </div>

      <Toast toast={o.toast} />
    </Shell>
  );
}
