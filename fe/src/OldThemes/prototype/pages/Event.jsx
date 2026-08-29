import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Shell, {
  Avatar, Btn, Chip, Crumbs, Field, Input, Area, Meter, Panel, State, Skeleton, Toast,
} from '../parts';
import DangerZone from '../../../Components/DangerZone';
import { useEventDetail, useTags } from '../../../data/hooks';
import { formatDate, formatDateTime, formatDuration, formatTime } from '../../../data/format';

export default function Event() {
  const { id }   = useParams();
  const navigate = useNavigate();
  const e        = useEventDetail(id);
  const tags     = useTags();

  const handleDelete = async () => {
    const orgId = e.record?.organizationId;
    if (await e.remove()) navigate(orgId ? `/organizations/${orgId}` : '/events', { replace: true });
  };

  if (e.loading) {
    return <Shell><div className="ptp-shell"><Skeleton rows={5} /></div></Shell>;
  }

  if (e.error || !e.record) {
    return (
      <Shell>
        <div className="ptp-shell">
          <State error title="Could not load this event">
            Check the link, or try again once the API is back.
          </State>
        </div>
      </Shell>
    );
  }

  const event   = e.record;
  const draft   = e.draft;
  const editing = e.editing;
  const known   = event.spotsLeft != null && event.capacity != null;
  const full    = known && event.spotsLeft === 0 && !e.rsvped;

  return (
    <Shell>
      {editing && (
        <div className="ptp-editbar">
          <span>{e.saveError || 'Editing this event. Changes are not saved yet.'}</span>
          <div className="ptp-editbar-actions">
            <Btn sm variant="ghost" onClick={e.cancel} disabled={e.saving}>Discard</Btn>
            <Btn sm onClick={e.save} disabled={e.saving}>{e.saving ? 'Saving…' : 'Save changes'}</Btn>
          </div>
        </div>
      )}

      <div className="ptp-shell">
        <Crumbs items={[
          { label: 'Home', to: '/' },
          { label: 'Openings', to: '/events' },
          { label: editing ? (draft.title || 'Untitled') : event.title },
        ]} />

        <div className="ptp-head">
          <div style={{ minWidth: 0 }}>
            <Link className="ptp-eyebrow" to={`/organizations/${event.organizationId}`}>
              {e.orgName ?? `Organization ${event.organizationId}`}
            </Link>
            {editing ? (
              <Input
                value={draft.title ?? ''}
                onChange={ev => e.setValue('title', ev.target.value)}
                placeholder="Event title"
              />
            ) : (
              <h1 className="ptp-h1">{event.title}</h1>
            )}
          </div>
          {!editing && e.canEdit && (
            <Btn sm variant="ghost" onClick={e.startEdit}>Edit event</Btn>
          )}
        </div>

        <div className="ptp-cols">
          <div>
            {editing ? (
              <>
                <Field label="Description">
                  <Area rows={7} value={draft.description ?? ''} onChange={ev => e.setValue('description', ev.target.value)} />
                </Field>
                <div className="ptp-pair">
                  <Field label="Duration (hours)">
                    <Input type="number" min={0.5} step={0.5} value={draft.duration ?? ''} onChange={ev => e.setValue('duration', Number(ev.target.value))} />
                  </Field>
                  <Field label="Capacity">
                    <Input type="number" min={1} value={draft.capacity ?? ''} onChange={ev => e.setValue('capacity', Number(ev.target.value))} />
                  </Field>
                </div>
                <Field label="Date and time">
                  <Input
                    type="datetime-local"
                    value={draft.date ? draft.date.slice(0, 16) : ''}
                    onChange={ev => e.setValue('date', ev.target.value ? new Date(ev.target.value).toISOString() : '')}
                  />
                </Field>
                <Field label="Address">
                  <Input value={draft.address ?? ''} onChange={ev => e.setValue('address', ev.target.value)} />
                </Field>
              </>
            ) : (
              <>
                {event.tags.length > 0 && (
                  <div className="ptp-chiprow" style={{ marginBottom: 24 }}>
                    {event.tags.map(slug => <Chip key={slug} tone="accent">{tags.nameOf(slug)}</Chip>)}
                  </div>
                )}

                <div className="ptp-prose">
                  {(event.description || 'No description was posted for this event.')
                    .split('\n').filter(Boolean).map((p, i) => <p key={i}>{p}</p>)}
                </div>

                {event.heroImage && (
                  <img
                    src={event.heroImage}
                    alt=""
                    style={{ width: '100%', borderRadius: 'var(--ptp-r-lg)', marginTop: 26 }}
                  />
                )}

                <p className="ptp-muted" style={{ marginTop: 30 }}>
                  Posted {formatDateTime(event.createdAt)} · Updated {formatDateTime(event.updatedAt)}
                </p>

                {e.canEdit && (
                  <DangerZone
                    title="Delete this event"
                    description={
                      e.roster.length > 0
                        ? `${e.roster.length} volunteer${e.roster.length === 1 ? ' has' : 's have'} signed on. Deleting removes the event and their RSVPs.`
                        : 'The event and any RSVPs will be removed for good.'
                    }
                    actionLabel="Delete event"
                    confirmLabel="Yes, delete this event"
                    busy={e.removing}
                    onConfirm={handleDelete}
                  />
                )}
              </>
            )}
          </div>

          <aside className="ptp-aside">
            <Panel pad float>
              <dl style={{ margin: 0 }}>
                <div className="ptp-kv"><dt>Date</dt><dd>{event.date ? formatDate(event.date) : 'Not set'}</dd></div>
                <div className="ptp-kv"><dt>Starts</dt><dd>{event.date ? formatTime(event.date) : '—'}</dd></div>
                <div className="ptp-kv"><dt>Duration</dt><dd>{formatDuration(event.duration)}</dd></div>
                {event.address && <div className="ptp-kv"><dt>Where</dt><dd>{event.address}</dd></div>}
              </dl>

              <div style={{ margin: '20px 0 8px', display: 'flex', justifyContent: 'space-between', fontSize: '0.86rem' }}>
                <span className="ptp-muted">Capacity</span>
                <span style={{ fontWeight: 640 }}>{known ? `${event.spotsLeft} of ${event.capacity} left` : 'No limit'}</span>
              </div>
              <Meter value={event.spotsLeft} max={event.capacity} />

              <Btn
                block
                variant={e.rsvped ? 'ghost' : undefined}
                onClick={e.toggleRsvp}
                disabled={full || e.rsvpBusy}
                style={{ marginTop: 20 }}
              >
                {e.rsvped ? 'Cancel RSVP' : full ? 'Event is full' : 'Sign up'}
              </Btn>

              {e.rsvped && (
                <p className="ptp-muted" style={{ marginTop: 12, textAlign: 'center' }}>
                  You are on the roster.
                </p>
              )}
            </Panel>

            {/* The roster is the organizer's view; the API serves it to them alone. */}
            {e.canEdit && (
              <Panel>
                <div className="ptp-panel-head">
                  <h3 className="ptp-h3">Roster</h3>
                  <span className="ptp-muted">
                    {e.rosterLoading ? '—' : `${e.roster.length}${event.capacity ? ` / ${event.capacity}` : ''}`}
                  </span>
                </div>
                {e.rosterLoading ? (
                  <p className="ptp-muted" style={{ padding: 22 }}>Loading the roster…</p>
                ) : e.roster.length === 0 ? (
                  <p className="ptp-muted" style={{ padding: 22 }}>
                    Nobody has signed on yet. Volunteers appear here as they RSVP.
                  </p>
                ) : (
                  <ul className="ptp-roster">
                    {e.roster.map(p => (
                      <li key={p.id}>
                        <Link to={`/volunteer/${p.id}`}>
                          <Avatar src={p.profilePic} name={p.displayName || p.username} />
                          <span style={{ minWidth: 0 }}>
                            <span style={{ display: 'block', fontWeight: 660 }}>
                              {p.displayName || p.username}
                            </span>
                            {p.displayName && <span className="ptp-muted">@{p.username}</span>}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </Panel>
            )}
          </aside>
        </div>
      </div>

      <Toast toast={e.toast} />
    </Shell>
  );
}
