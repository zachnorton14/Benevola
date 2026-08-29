import React from 'react';
import { Link } from 'react-router-dom';
import Shell, { Block, BlockHead, Btn, Field, Input, Kicker, Meta, State, Skeleton, TagChip } from '../parts';
import { useEventsSearch, useTags } from '../../../data/hooks';
import { formatDuration, shortAddress } from '../../../data/format';

function Notice({ event, orgName }) {
  const d = event.date ? new Date(event.date) : null;
  const full = event.spotsLeft === 0;

  return (
    <Link className="dsp-item" to={`/events/${event.id}`}>
      <span className="dsp-lead">
        <span className="dsp-date">
          <b>{d ? d.getDate() : '—'}</b>
          <span>{d ? d.toLocaleString('en', { month: 'short' }) : 'TBC'}</span>
        </span>
        {event.heroImage && <img className="dsp-thumb" src={event.heroImage} alt="" loading="lazy" />}
      </span>
      <span className="dsp-item-body">
        <span className="dsp-item-title">{event.title}</span>
        <span className="dsp-item-meta">
          {orgName && <span>{orgName}</span>}
          {event.address && <span>{shortAddress(event.address)}</span>}
          <span>{formatDuration(event.duration)}</span>
        </span>
      </span>
      <span className="dsp-tagrow">
        {full
          ? <TagChip tone="on">Full</TagChip>
          : event.tags.slice(0, 2).map(t => <TagChip key={t}>{t.replace(/-/g, ' ')}</TagChip>)}
      </span>
    </Link>
  );
}

export default function Events() {
  const s    = useEventsSearch();
  const tags = useTags();

  return (
    <Shell>
      <div className="dsp-shell">
        <div className="dsp-head">
          <div>
            <Kicker>The board</Kicker>
            <h1 className="dsp-h1">Openings</h1>
          </div>
          <Meta>
            {s.total != null ? `${s.total} posted` : 'Volunteer shifts'}
          </Meta>
        </div>

        <div className="dsp-cols">
          <div>
            {s.loading ? (
              <Skeleton rows={6} />
            ) : s.error ? (
              <State error title="Could not load openings">
                The API is not answering. Try again shortly.
              </State>
            ) : s.events.length === 0 ? (
              <State title="Nothing matches">
                Widen the dates, clear a cause, or try a different week.
                {s.hasFilters && (
                  <div style={{ marginTop: 16 }}>
                    <Btn sm variant="ghost" onClick={s.reset}>Clear filters</Btn>
                  </div>
                )}
              </State>
            ) : (
              <>
                <div className="dsp-list">
                  {s.events.map(ev => (
                    <Notice key={ev.id} event={ev} orgName={s.orgNames[ev.organizationId]} />
                  ))}
                </div>

                <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginTop: 22 }}>
                  <Btn sm variant="ghost" disabled={s.page === 0} onClick={() => s.setPage(p => p - 1)}>
                    Prev
                  </Btn>
                  <Meta>
                    {s.rangeStart}–{s.rangeEnd}{s.total != null ? ` of ${s.total}` : ''}
                  </Meta>
                  <Btn sm variant="ghost" disabled={!s.hasMore} onClick={() => s.setPage(p => p + 1)}>
                    Next
                  </Btn>
                </div>
              </>
            )}
          </div>

          <aside className="dsp-aside">
            <Block>
              <BlockHead right={s.hasFilters ? <button onClick={s.reset} style={{ background: 'none', border: 0, color: 'inherit', font: 'inherit', cursor: 'pointer' }}>Clear</button> : null}>
                Filter
              </BlockHead>

              <form style={{ padding: 16 }} onSubmit={e => { e.preventDefault(); s.search(); }}>
                <Field label="Keyword">
                  <Input
                    value={s.draft.keyword}
                    onChange={e => s.setField('keyword', e.target.value)}
                    placeholder="Clean-up, food bank"
                  />
                </Field>

                <div className="dsp-pair">
                  <Field label="From">
                    <Input type="date" value={s.draft.dateFrom} onChange={e => s.setField('dateFrom', e.target.value)} />
                  </Field>
                  <Field label="To">
                    <Input type="date" value={s.draft.dateTo} onChange={e => s.setField('dateTo', e.target.value)} />
                  </Field>
                </div>

                <Field label="Causes">
                  {tags.loading ? (
                    <Meta>Loading</Meta>
                  ) : (
                    <div className="dsp-tagrow" style={{ maxHeight: 150, overflowY: 'auto' }}>
                      {tags.tags.slice(0, 24).map(t => {
                        const on = s.draft.selectedTags.includes(t.slug);
                        return (
                          <button
                            key={t.slug}
                            type="button"
                            className={'dsp-tag' + (on ? ' dsp-tag--on' : '')}
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

                {s.validationError && <span className="dsp-field-err">{s.validationError}</span>}

                <Btn block type="submit" style={{ marginTop: 8 }}>Apply</Btn>
              </form>
            </Block>
          </aside>
        </div>
      </div>
    </Shell>
  );
}
