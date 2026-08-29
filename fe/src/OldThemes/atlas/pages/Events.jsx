import React from 'react';
import { Link } from 'react-router-dom';
import Shell, { Btn, Chip, Field, Input, Panel, State, Skeleton } from '../parts';
import { useEventsSearch, useTags } from '../../../data/hooks';
import { formatDuration, shortAddress } from '../../../data/format';

/* Browse and filter. Filters sit in a sidebar and apply on submit rather than
   on every keystroke, so the results list does not thrash while you type. */

function Row({ event, orgName }) {
  const d = event.date ? new Date(event.date) : null;
  const full = event.spotsLeft === 0;

  return (
    <Link className="atl-item" to={`/events/${event.id}`}>
      <span className="atl-lead">
        <span className="atl-date">
          <b>{d ? d.getDate() : '—'}</b>
          <span>{d ? d.toLocaleString('en', { month: 'short' }) : 'TBC'}</span>
        </span>
        {event.heroImage && <img className="atl-thumb" src={event.heroImage} alt="" loading="lazy" />}
      </span>
      <span className="atl-item-body">
        <span className="atl-item-title">{event.title}</span>
        <span className="atl-item-meta">
          {orgName && <span>{orgName}</span>}
          {event.address && <span>{shortAddress(event.address)}</span>}
          <span>{formatDuration(event.duration)}</span>
        </span>
      </span>
      <span className="atl-chiprow">
        {full
          ? <Chip tone="accent">Full</Chip>
          : event.tags.slice(0, 2).map(t => <Chip key={t}>{t.replace(/-/g, ' ')}</Chip>)}
      </span>
    </Link>
  );
}

export default function Events() {
  const s    = useEventsSearch();
  const tags = useTags();

  return (
    <Shell>
      <div className="atl-shell atl-shell--wide">
        <div className="atl-head">
          <div>
            <h1 className="atl-h1">Openings</h1>
            <p className="atl-sub">
              {s.total != null
                ? `${s.total} shift${s.total === 1 ? '' : 's'} posted`
                : 'Volunteer shifts posted by local organizations'}
            </p>
          </div>
        </div>

        <div className="atl-cols">
          {/* Results */}
          <div>
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
                  <div style={{ marginTop: 14 }}>
                    <Btn sm variant="ghost" onClick={s.reset}>Clear all filters</Btn>
                  </div>
                )}
              </State>
            ) : (
              <>
                <div className="atl-list">
                  {s.events.map(ev => (
                    <Row key={ev.id} event={ev} orgName={s.orgNames[ev.organizationId]} />
                  ))}
                </div>

                <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginTop: 22 }}>
                  <Btn sm variant="ghost" disabled={s.page === 0} onClick={() => s.setPage(p => p - 1)}>
                    Previous
                  </Btn>
                  <span className="atl-muted">
                    {s.rangeStart}–{s.rangeEnd}{s.total != null ? ` of ${s.total}` : ''}
                  </span>
                  <Btn sm variant="ghost" disabled={!s.hasMore} onClick={() => s.setPage(p => p + 1)}>
                    Next
                  </Btn>
                </div>
              </>
            )}
          </div>

          {/* Filters */}
          <aside className="atl-aside">
            <Panel>
              <div className="atl-panel-head">
                <h3 className="atl-h3">Filter</h3>
                {s.hasFilters && (
                  <Btn sm variant="quiet" onClick={s.reset}>Clear</Btn>
                )}
              </div>

              <form
                style={{ padding: 17 }}
                onSubmit={e => { e.preventDefault(); s.search(); }}
              >
                <Field label="Keyword">
                  <Input
                    value={s.draft.keyword}
                    onChange={e => s.setField('keyword', e.target.value)}
                    placeholder="Clean-up, food bank…"
                  />
                </Field>

                <div className="atl-pair">
                  <Field label="From">
                    <Input type="date" value={s.draft.dateFrom} onChange={e => s.setField('dateFrom', e.target.value)} />
                  </Field>
                  <Field label="To">
                    <Input type="date" value={s.draft.dateTo} onChange={e => s.setField('dateTo', e.target.value)} />
                  </Field>
                </div>

                <Field label="Causes">
                  {tags.loading ? (
                    <span className="atl-muted">Loading…</span>
                  ) : (
                    <div className="atl-chiprow" style={{ maxHeight: 150, overflowY: 'auto' }}>
                      {tags.tags.slice(0, 24).map(t => {
                        const on = s.draft.selectedTags.includes(t.slug);
                        return (
                          <button
                            key={t.slug}
                            type="button"
                            className={'atl-chip' + (on ? ' atl-chip--accent' : '')}
                            style={{ cursor: 'pointer' }}
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

                {s.validationError && <span className="atl-field-err">{s.validationError}</span>}

                <Btn block type="submit" style={{ marginTop: 6 }}>Apply filters</Btn>
              </form>
            </Panel>
          </aside>
        </div>
      </div>
    </Shell>
  );
}
