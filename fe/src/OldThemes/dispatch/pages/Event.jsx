import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Shell, {
  Avatar, Block, BlockHead, Btn, Crumbs, Field, Input, Area, Kicker, Meta,
  State, Skeleton, Tally, TagChip, Toast,
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
    return <Shell><div className="dsp-shell"><Skeleton rows={5} /></div></Shell>;
  }

  if (e.error || !e.record) {
    return (
      <Shell>
        <div className="dsp-shell">
          <State error title="Could not load this notice">
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
  const taken   = known ? event.capacity - event.spotsLeft : 0;
  const full    = known && event.spotsLeft === 0 && !e.rsvped;

  return (
    <Shell>
      {editing && (
        <div className="dsp-editbar">
          <span>{e.saveError || 'Editing · not saved'}</span>
          <div style={{ display: 'flex', gap: 8 }}>
            <Btn sm variant="ghost" onClick={e.cancel} disabled={e.saving}>Discard</Btn>
            <Btn sm variant="ghost" onClick={e.save} disabled={e.saving}>
              {e.saving ? 'Saving' : 'Save'}
            </Btn>
          </div>
        </div>
      )}

      <div className="dsp-shell">
        <Crumbs items={[
          { label: 'Home', to: '/' },
          { label: 'Openings', to: '/events' },
          { label: editing ? (draft.title || 'Untitled') : event.title },
        ]} />

        <div className="dsp-head">
          <div style={{ minWidth: 0 }}>
            <Link to={`/organizations/${event.organizationId}`} style={{ textDecoration: 'none' }}>
              <Kicker>{e.orgName ?? `Organization ${event.organizationId}`}</Kicker>
            </Link>
            {editing ? (
              <Input value={draft.title ?? ''} onChange={ev => e.setValue('title', ev.target.value)} placeholder="Event title" />
            ) : (
              <h1 className="dsp-h1">{event.title}</h1>
            )}
          </div>
          {!editing && e.canEdit && <Btn sm variant="ghost" onClick={e.startEdit}>Edit</Btn>}
        </div>

        <div className="dsp-cols">
          <div>
            {editing ? (
              <>
                <Field label="Description">
                  <Area rows={7} value={draft.description ?? ''} onChange={ev => e.setValue('description', ev.target.value)} />
                </Field>
                <div className="dsp-pair">
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
                  <div className="dsp-tagrow" style={{ marginBottom: 20 }}>
                    {event.tags.map(slug => <TagChip key={slug} tone="stamp">{tags.nameOf(slug)}</TagChip>)}
                  </div>
                )}

                <div className="dsp-prose">
                  {(event.description || 'No description was posted for this event.')
                    .split('\n').filter(Boolean).map((p, i) => <p key={i}>{p}</p>)}
                </div>

                {event.heroImage && (
                  <img src={event.heroImage} alt="" style={{ width: '100%', marginTop: 22, border: 'var(--dsp-rule) solid var(--dsp-ink)' }} />
                )}

                <div className="dsp-rule" />
                <Meta>Posted {formatDateTime(event.createdAt)} · Updated {formatDateTime(event.updatedAt)}</Meta>

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

          <aside className="dsp-aside">
            <Block>
              <BlockHead>Details</BlockHead>
              <div style={{ padding: '4px 14px 14px' }}>
                <dl style={{ margin: 0 }}>
                  <div className="dsp-kv"><dt>Date</dt><dd>{event.date ? formatDate(event.date) : 'Not set'}</dd></div>
                  <div className="dsp-kv"><dt>Starts</dt><dd>{event.date ? formatTime(event.date) : '—'}</dd></div>
                  <div className="dsp-kv"><dt>Runs</dt><dd>{formatDuration(event.duration)}</dd></div>
                </dl>

                <div style={{ marginTop: 14 }}>
                  <span className="dsp-label">
                    {known ? `${event.spotsLeft} of ${event.capacity} places left` : 'Places'}
                  </span>
                  <Tally taken={taken} capacity={event.capacity} />
                </div>

                <Btn
                  block
                  variant={e.rsvped ? 'ghost' : undefined}
                  onClick={e.toggleRsvp}
                  disabled={full || e.rsvpBusy}
                  style={{ marginTop: 14 }}
                >
                  {e.rsvped ? 'Cancel RSVP' : full ? 'Full' : 'Sign on'}
                </Btn>

                {e.rsvped && (
                  <p style={{ marginTop: 10, textAlign: 'center' }}><Meta>You are on the roster</Meta></p>
                )}
              </div>
            </Block>

            {/* Roster is the organizer's view; the API serves it to them alone. */}
            {e.canEdit && (
              <Block>
                <BlockHead right={e.rosterLoading ? '—' : `${e.roster.length}${event.capacity ? `/${event.capacity}` : ''}`}>
                  Roster
                </BlockHead>
                {e.rosterLoading ? (
                  <p style={{ padding: 14 }}><Meta>Loading</Meta></p>
                ) : e.roster.length === 0 ? (
                  <p style={{ padding: 14 }}><Meta>Nobody has signed on yet</Meta></p>
                ) : (
                  <ul className="dsp-roster">
                    {e.roster.map((p, i) => (
                      <li key={p.id}>
                        <Link to={`/volunteer/${p.id}`}>
                          <span className="dsp-roster-num">{String(i + 1).padStart(2, '0')}</span>
                          <Avatar src={p.profilePic} name={p.displayName || p.username} />
                          <span style={{ minWidth: 0 }}>
                            <span style={{ display: 'block', fontWeight: 700 }}>
                              {p.displayName || p.username}
                            </span>
                            {p.displayName && <Meta>@{p.username}</Meta>}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </Block>
            )}
          </aside>
        </div>
      </div>

      <Toast toast={e.toast} />
    </Shell>
  );
}
