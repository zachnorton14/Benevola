import React from 'react';
import { Link } from 'react-router-dom';
import Shell, {
  Btn, Chip, DateBlock, Field, Input, Panel, State, Skeleton, useFirstReveal,
} from '../parts';
import { useEventsSearch, useTags } from '../../../data/hooks';
import { formatDuration, shortAddress } from '../../../data/format';

/* Browse and filter. Filters apply as you type: the hook debounces, and
   re-queries report through `refreshing` rather than `loading`, so the list
   stays on screen instead of collapsing into skeletons between keystrokes. */

function Row({ event, orgName, index = 0 }) {
  const full = event.spotsLeft === 0;

  return (
    <Link className="def-item" to={`/events/${event.id}`} style={{ '--i': index }}>
      <span className="def-lead">
        <DateBlock iso={event.date} />
        {event.heroImage && <img className="def-thumb" src={event.heroImage} alt="" loading="lazy" />}
      </span>
      <span className="def-item-body">
        <span className="def-item-title">{event.title}</span>
        <span className="def-item-meta">
          {orgName && <span>{orgName}</span>}
          {event.address && <span>{shortAddress(event.address)}</span>}
          <span>{formatDuration(event.duration)}</span>
        </span>
      </span>
      <span className="def-chiprow">
        {full
          ? <Chip tone="accent">Full</Chip>
          : event.tags.slice(0, 2).map(t => <Chip key={t}>{t.replace(/-/g, ' ')}</Chip>)}
      </span>
    </Link>
  );
}

export default function Events() {
  const s    = useEventsSearch({ live: true });
  const tags = useTags();
  /* Stagger the first list only. This page filters as you type, and replaying
     the animation on every keystroke turns the results into a strobe. */
  const revealing = useFirstReveal(!s.loading);

  return (
    <Shell>
      <div className="def-shell">
        <div className="def-head">
          <div>
            <h1 className="def-h1">Openings</h1>
            {/* The count is the confirmation that typing did something, so it
                is also the live region rather than a second hidden one. */}
            <p className="def-sub" aria-live="polite">
              {s.total != null
                ? `${s.total} shift${s.total === 1 ? '' : 's'} posted by local organizations`
                : 'Volunteer shifts posted by local organizations'}
            </p>
          </div>
        </div>

        <div className="def-cols">
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
                  <div style={{ marginTop: 16 }}>
                    <Btn sm variant="ghost" onClick={s.reset}>Clear all filters</Btn>
                  </div>
                )}
              </State>
            ) : (
              <>
                <div className={'def-list def-fade-in' + (revealing ? ' def-stagger' : '')}>
                  {s.events.map((ev, i) => (
                    <Row
                      key={ev.id}
                      event={ev}
                      orgName={s.orgNames[ev.organizationId]}
                      index={i}
                    />
                  ))}
                </div>

                <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginTop: 26 }}>
                  <Btn sm variant="ghost" disabled={s.page === 0} onClick={() => s.setPage(p => p - 1)}>
                    Previous
                  </Btn>
                  <span className="def-muted">
                    {s.rangeStart}–{s.rangeEnd}{s.total != null ? ` of ${s.total}` : ''}
                  </span>
                  <Btn sm variant="ghost" disabled={!s.hasMore} onClick={() => s.setPage(p => p + 1)}>
                    Next
                  </Btn>
                </div>
              </>
            )}
          </div>

          <aside className="def-aside">
            <Panel float>
              <div className="def-panel-head">
                <h3 className="def-h3">Filter</h3>
                <span className="def-panel-head-right">
                  {/* Only feedback that a query is in flight; the results
                      themselves deliberately do not move or dim. */}
                  {s.refreshing && <span className="def-spin" aria-hidden="true" />}
                  {s.hasFilters && <Btn sm variant="quiet" onClick={s.reset}>Clear</Btn>}
                </span>
              </div>

              {/* Submitting skips the debounce; it is not the only way to search. */}
              <form style={{ padding: 18 }} onSubmit={e => { e.preventDefault(); s.search(); }}>
                <Field label="Keyword">
                  <Input
                    type="search"
                    value={s.draft.keyword}
                    onChange={e => s.setField('keyword', e.target.value)}
                    placeholder="Clean-up, food bank…"
                  />
                </Field>

                <div className="def-pair">
                  <Field label="From">
                    <Input type="date" value={s.draft.dateFrom} onChange={e => s.setField('dateFrom', e.target.value)} />
                  </Field>
                  <Field label="To">
                    <Input type="date" value={s.draft.dateTo} onChange={e => s.setField('dateTo', e.target.value)} />
                  </Field>
                </div>

                <Field label="Causes">
                  {tags.loading ? (
                    <span className="def-muted">Loading…</span>
                  ) : (
                    <div className="def-chiprow" style={{ maxHeight: 154, overflowY: 'auto' }}>
                      {tags.tags.slice(0, 24).map(t => {
                        const on = s.draft.selectedTags.includes(t.slug);
                        return (
                          <button
                            key={t.slug}
                            type="button"
                            className={'def-chip' + (on ? ' def-chip--accent' : '')}
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

                {s.validationError && <span className="def-field-err">{s.validationError}</span>}
              </form>
            </Panel>
          </aside>
        </div>
      </div>
    </Shell>
  );
}
