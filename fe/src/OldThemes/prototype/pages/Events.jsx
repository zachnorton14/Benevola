import React from 'react';
import { Link } from 'react-router-dom';
import Shell, { Btn, Chip, DateBlock, Field, Input, Panel, State, Skeleton } from '../parts';
import { useEventsSearch, useTags } from '../../../data/hooks';
import { formatDuration, shortAddress } from '../../../data/format';

/* Browse and filter. Filters apply as you type: the hook debounces, and
   re-queries report through `refreshing` rather than `loading`, so the list
   stays on screen instead of collapsing into skeletons between keystrokes. */

function Row({ event, orgName }) {
  const full = event.spotsLeft === 0;

  return (
    <Link className="ptp-item" to={`/events/${event.id}`}>
      <span className="ptp-lead">
        <DateBlock iso={event.date} />
        {event.heroImage && <img className="ptp-thumb" src={event.heroImage} alt="" loading="lazy" />}
      </span>
      <span className="ptp-item-body">
        <span className="ptp-item-title">{event.title}</span>
        <span className="ptp-item-meta">
          {orgName && <span>{orgName}</span>}
          {event.address && <span>{shortAddress(event.address)}</span>}
          <span>{formatDuration(event.duration)}</span>
        </span>
      </span>
      <span className="ptp-chiprow">
        {full
          ? <Chip tone="sec">Full</Chip>
          : event.tags.slice(0, 2).map(t => <Chip key={t}>{t.replace(/-/g, ' ')}</Chip>)}
      </span>
    </Link>
  );
}

export default function Events() {
  const s    = useEventsSearch({ live: true });
  const tags = useTags();

  return (
    <Shell>
      <div className="ptp-shell">
        <div className="ptp-head">
          <div>
            <h1 className="ptp-h1">Openings</h1>
            {/* The count is the confirmation that typing did something, so it
                is also the live region rather than a second hidden one. */}
            <p className="ptp-sub" aria-live="polite">
              {s.total != null
                ? `${s.total} shift${s.total === 1 ? '' : 's'} posted by local organizations`
                : 'Volunteer shifts posted by local organizations'}
            </p>
          </div>
        </div>

        <div className="ptp-cols">
          <div aria-busy={s.refreshing || undefined}>
            {s.loading ? (
              <Skeleton rows={6} />
            ) : s.error ? (
              <State error title="Could not load openings">
                The API is not answering. Try again in a moment.
              </State>
            ) : s.events.length === 0 ? (
              <State title="Nothing matches those filters">
                Widen the radius, clear a cause, or try a different week.
                {s.hasFilters && (
                  <div style={{ marginTop: 18 }}>
                    <Btn sm variant="ghost" onClick={s.reset}>Clear all filters</Btn>
                  </div>
                )}
              </State>
            ) : (
              <>
                <div className="ptp-list">
                  {s.events.map(ev => (
                    <Row key={ev.id} event={ev} orgName={s.orgNames[ev.organizationId]} />
                  ))}
                </div>

                <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginTop: 28 }}>
                  <Btn sm variant="ghost" disabled={s.page === 0} onClick={() => s.setPage(p => p - 1)}>
                    Previous
                  </Btn>
                  <span className="ptp-muted">
                    {s.rangeStart}–{s.rangeEnd}{s.total != null ? ` of ${s.total}` : ''}
                  </span>
                  <Btn sm variant="ghost" disabled={!s.hasMore} onClick={() => s.setPage(p => p + 1)}>
                    Next
                  </Btn>
                </div>
              </>
            )}
          </div>

          <aside className="ptp-aside">
            <Panel>
              <div className="ptp-panel-head">
                <h3 className="ptp-h3">Filter</h3>
                <span className="ptp-panel-head-right">
                  {/* Only feedback that a query is in flight; the results
                      themselves deliberately do not move or dim. */}
                  {s.refreshing && <span className="ptp-spin" aria-hidden="true" />}
                  {s.hasFilters && <Btn sm variant="quiet" onClick={s.reset}>Clear</Btn>}
                </span>
              </div>

              {/* Submitting skips the debounce; it is not the only way to search. */}
              <form style={{ padding: 22 }} onSubmit={e => { e.preventDefault(); s.search(); }}>
                <Field label="Keyword">
                  <Input
                    type="search"
                    value={s.draft.keyword}
                    onChange={e => s.setField('keyword', e.target.value)}
                    placeholder="Clean-up, food bank…"
                  />
                </Field>

                <div className="ptp-pair">
                  <Field label="From">
                    <Input type="date" value={s.draft.dateFrom} onChange={e => s.setField('dateFrom', e.target.value)} />
                  </Field>
                  <Field label="To">
                    <Input type="date" value={s.draft.dateTo} onChange={e => s.setField('dateTo', e.target.value)} />
                  </Field>
                </div>

                <Field label="Causes">
                  {tags.loading ? (
                    <span className="ptp-muted">Loading…</span>
                  ) : (
                    <div className="ptp-chiprow" style={{ maxHeight: 160, overflowY: 'auto' }}>
                      {tags.tags.slice(0, 24).map(t => {
                        const on = s.draft.selectedTags.includes(t.slug);
                        return (
                          <button
                            key={t.slug}
                            type="button"
                            className={'ptp-chip' + (on ? ' ptp-chip--accent' : '')}
                            onClick={() => s.toggleTag(t.slug)}
                            aria-pressed={on}
                          >
                            {t.name}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </Field>

                {s.validationError && <span className="ptp-field-err">{s.validationError}</span>}
              </form>
            </Panel>
          </aside>
        </div>
      </div>
    </Shell>
  );
}
