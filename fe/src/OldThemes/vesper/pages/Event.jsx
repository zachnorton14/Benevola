import React from 'react';
import { useParams, Link } from 'react-router-dom';
import Shell, { Crumbs } from '../Shell';
import {
  AddressField, Arrow, Btn, Duo, Eyebrow, Field, Label, LeafMark, MapPanel,
  Meta, NumberInput, StateBlock, Tag, TagPicker, TextInput, Tick, Toast,
} from '../parts';
import { useEventDetail, useTags } from '../../../data/hooks';
import { formatDate, formatDateTime, formatDuration, formatTime } from '../../../data/format';
import {
  IconCalendar, IconClock, IconUsers, IconEdit, IconCheck, IconX,
} from '../../Components/Icons';

function RsvpPanel({ event, rsvped, onRsvp }) {
  const known = event.spotsLeft != null && event.capacity != null;
  const taken = known ? event.capacity - event.spotsLeft : 0;
  const pct   = known ? Math.min(100, Math.round((taken / Math.max(1, event.capacity)) * 100)) : 0;

  return (
    <div className="vsp-panel vsp-rsvp">
      <div className="vsp-rsvp-row">
        <Eyebrow>Date</Eyebrow>
        <span className={'vsp-rsvp-val' + (event.date ? '' : ' is-muted')}>
          {event.date ? formatDate(event.date) : 'Not yet set'}
        </span>
      </div>
      <div className="vsp-rsvp-row">
        <Eyebrow>Starts</Eyebrow>
        <span className={'vsp-rsvp-val' + (event.date ? '' : ' is-muted')}>
          {event.date ? formatTime(event.date) : '—'}
        </span>
      </div>
      <div className="vsp-rsvp-row">
        <Eyebrow>Runs for</Eyebrow>
        <span className="vsp-rsvp-val">{formatDuration(event.duration)}</span>
      </div>

      <div className="vsp-meter-wrap">
        <div className="vsp-meter-head">
          <Eyebrow>Roster</Eyebrow>
          <Meta>{known ? `${event.spotsLeft} of ${event.capacity} spots left` : 'No limit set'}</Meta>
        </div>
        <div className="vsp-meter">
          <div
            className={'vsp-meter-fill' + (pct > 85 ? ' is-tight' : '')}
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="vsp-meter-foot">
          <Meta>{pct}% filled</Meta>
          <Meta>{event.capacity} volunteers needed</Meta>
        </div>
      </div>

      <Btn
        block
        variant={rsvped ? 'outline' : undefined}
        onClick={onRsvp}
        style={{ marginTop: 22 }}
      >
        {rsvped ? <><IconX size={15} /> Cancel my place</> : <>Save me a place <Arrow /></>}
      </Btn>

      {rsvped && (
        <div className="vsp-rsvp-confirm"><Tick size={16} /> You are on the roster</div>
      )}
    </div>
  );
}

export default function Event() {
  const { id } = useParams();
  const e      = useEventDetail(id);
  const tags   = useTags();

  if (e.loading) {
    return <Shell><div className="vsp-shell"><StateBlock>Loading event…</StateBlock></div></Shell>;
  }

  if (e.error || !e.record) {
    return (
      <Shell>
        <div className="vsp-shell">
          <StateBlock error note="Check the event id, or try again once the API is back up.">
            Could not load this event
          </StateBlock>
        </div>
      </Shell>
    );
  }

  const event   = e.record;
  const draft   = e.draft;
  const editing = e.editing;
  const title   = editing ? (draft.title || 'Untitled event') : event.title;
  const lat     = editing ? draft.lat : event.lat;
  const lng     = editing ? draft.lng : event.lng;
  const address = editing ? draft.address : event.address;

  return (
    <Shell>
      {editing && (
        <div className="vsp-edit-bar">
          <Eyebrow><span className="vsp-edit-dot" /> Editing event · unsaved</Eyebrow>
          <div style={{ display: 'flex', gap: 10 }}>
            <Btn sm variant="outline" onClick={e.cancel}><IconX size={14} /> Discard</Btn>
            <Btn sm onClick={e.save}><IconCheck size={14} /> Save changes</Btn>
          </div>
        </div>
      )}

      <div className="vsp-shell">
        <Crumbs items={[
          { label: 'Home',   to: '/' },
          { label: 'Events', to: '/events' },
          { label: title },
        ]} />

        <div className="vsp-masthead">
          <div>
            <Link className="vsp-masthead-org" to={`/organizations/${event.organizationId}`}>
              <LeafMark size={15} />
              {e.orgName ?? `Organization ${event.organizationId}`}
            </Link>
            <h1 className="vsp-h1">{title}</h1>
          </div>
          {!editing && (
            <Btn sm variant="outline" onClick={e.startEdit}><IconEdit size={14} /> Edit</Btn>
          )}
        </div>

        <Duo className="vsp-detail-art" src={event.heroImage} alt={event.title} />

        <div className="vsp-detail-grid">
          {/* ── Main ── */}
          <div>
            {editing ? (
              <>
                <Field label="Event title">
                  <TextInput
                    large
                    value={draft.title ?? ''}
                    onChange={ev => e.setValue('title', ev.target.value)}
                    placeholder="Event name"
                  />
                </Field>

                <Field label="Description">
                  <textarea
                    className="vsp-field"
                    rows={7}
                    value={draft.description ?? ''}
                    onChange={ev => e.setValue('description', ev.target.value)}
                  />
                </Field>

                <Field label="Location">
                  <AddressField
                    value={draft.address ?? ''}
                    onTextChange={val => e.setValue('address', val)}
                    onPick={(label, plat, plng) => e.patch({ address: label, lat: plat, lng: plng })}
                    placeholder="Search an address"
                  />
                </Field>

                <div className="vsp-form-row">
                  <Label>Causes</Label>
                  <TagPicker
                    tags={tags.tags}
                    loading={tags.loading}
                    selected={draft.tags ?? []}
                    onToggle={slug => e.setValue(
                      'tags',
                      (draft.tags ?? []).includes(slug)
                        ? draft.tags.filter(s => s !== slug)
                        : [...(draft.tags ?? []), slug]
                    )}
                  />
                </div>

                <div className="vsp-edit-pair vsp-form-row">
                  <div>
                    <Label>Duration</Label>
                    <NumberInput
                      value={draft.duration}
                      onChange={v => e.setValue('duration', v)}
                      min={0.5}
                      suffix="hours"
                    />
                  </div>
                  <div>
                    <Label>Capacity</Label>
                    <NumberInput
                      value={draft.capacity}
                      onChange={v => e.setValue('capacity', v)}
                      min={1}
                      suffix="volunteers"
                    />
                  </div>
                </div>

                <Field label="Date and time">
                  <TextInput
                    type="datetime-local"
                    value={draft.date ? draft.date.slice(0, 16) : ''}
                    onChange={ev => e.setValue(
                      'date',
                      ev.target.value ? new Date(ev.target.value).toISOString() : ''
                    )}
                  />
                </Field>
              </>
            ) : (
              <>
                {event.tags?.length > 0 && (
                  <div className="vsp-tagrow">
                    {event.tags.map(slug => (
                      <Tag key={slug} tone="clay">{tags.nameOf(slug)}</Tag>
                    ))}
                  </div>
                )}

                <div className="vsp-metarow">
                  <Tag fill><IconCalendar size={14} /> {formatDate(event.date)}</Tag>
                  <Tag fill><IconClock size={14} /> {formatDuration(event.duration)}</Tag>
                  <Tag tone="lichen"><IconUsers size={14} /> {event.spotsLeft} of {event.capacity} spots left</Tag>
                </div>

                <div className="vsp-prose">
                  {(event.description || 'No description was posted for this event.')
                    .split('\n\n')
                    .map((para, i) => <p key={i}>{para}</p>)}
                </div>

                <div className="vsp-ts">
                  <div>
                    <Label>Posted</Label>
                    <span className="vsp-ts-val">{formatDateTime(event.createdAt)}</span>
                  </div>
                  <div>
                    <Label>Last updated</Label>
                    <span className="vsp-ts-val">{formatDateTime(event.updatedAt)}</span>
                  </div>
                </div>

                <div style={{ marginTop: 34 }}>
                  <Link className="vsp-link" to={`/organizations/${event.organizationId}`}>
                    See everything this organization has posted
                  </Link>
                </div>
              </>
            )}
          </div>

          {/* ── Aside ── */}
          <div className="vsp-aside">
            {!editing && <RsvpPanel event={event} rsvped={e.rsvped} onRsvp={e.toggleRsvp} />}
            <MapPanel
              lat={lat}
              lng={lng}
              address={address}
              editing={editing}
              onPick={(label, plat, plng) => e.patch({ address: label, lat: plat, lng: plng })}
            />
          </div>
        </div>
      </div>

      <Toast toast={e.toast} />
    </Shell>
  );
}
