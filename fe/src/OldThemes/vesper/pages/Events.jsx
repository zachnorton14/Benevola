import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import Shell, { Crumbs } from '../Shell';
import {
  AddressField, Btn, Duo, Eyebrow, Label, Meta, StateBlock, Tag, TagPicker,
} from '../parts';
import { useEventsSearch, useTags } from '../../../data/hooks';
import { formatDuration, formatFullDate, shortAddress } from '../../../data/format';
import { IconClock, IconSearch, IconX, IconUsers, IconPin } from '../../Components/Icons';

/* ── One line of the programme ──────────────────────────────────────── */
function ProgrammeItem({ event, orgName }) {
  const visible  = event.tagObjects.slice(0, 4);
  const overflow = event.tagObjects.length - visible.length;
  const addr     = shortAddress(event.address);

  return (
    <Link className="vsp-prog-item" to={`/events/${event.id}`}>
      <Duo className="vsp-prog-art" src={event.heroImage} alt="" />

      <div>
        <div className="vsp-prog-when">
          <span className="vsp-prog-day">{formatFullDate(event.date)}</span>
        </div>

        <Eyebrow tone="lichen">{orgName ?? `Organization ${event.organizationId}`}</Eyebrow>
        <h3 style={{ marginTop: 10 }}>{event.title}</h3>

        {event.description && <p className="vsp-prog-desc">{event.description}</p>}

        <div className="vsp-prog-meta">
          <Tag fill><IconClock size={13} /> {formatDuration(event.duration)}</Tag>
          <Tag fill><IconUsers size={13} /> {event.capacity} needed</Tag>
          {addr && <Tag fill><IconPin size={13} /> {addr}</Tag>}
          {visible.map(t => <Tag key={t.id} tone="clay">{t.name}</Tag>)}
          {overflow > 0 && <Tag>+{overflow}</Tag>}
        </div>
      </div>
    </Link>
  );
}

/* ── Page ───────────────────────────────────────────────────────────── */
export default function Events() {
  const s    = useEventsSearch();
  const tags = useTags();
  const resultsRef = useRef(null);

  useEffect(() => {
    if (s.page > 0 && resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [s.page]);

  const countLabel = s.total !== null
    ? (s.total > s.limit
        ? `Showing ${s.rangeStart}–${s.rangeEnd} of ${s.total}`
        : `${s.total} event${s.total !== 1 ? 's' : ''}`)
    : `Page ${s.page + 1}`;

  return (
    <Shell>
      <div className="vsp-shell">
        <Crumbs items={[{ label: 'Home', to: '/' }, { label: 'Events' }]} />

        <div className="vsp-page-head">
          <div>
            <Eyebrow tone="clay">The programme</Eyebrow>
            <h1 className="vsp-h1">Find opportunities</h1>
            <p>Volunteer shifts posted by verified organizations near you.</p>
          </div>

          <div className="vsp-searchbar">
            <input
              type="search"
              placeholder="Search events by keyword"
              value={s.draft.keyword}
              autoComplete="off"
              onChange={e => s.setField('keyword', e.target.value)}
              onKeyDown={e => e.key === 'Enter' && s.search()}
              aria-label="Search events"
            />
            <Btn sm onClick={s.search}><IconSearch size={15} /> Search</Btn>
          </div>
        </div>

        <div className="vsp-layout">
          {/* ── Filters ── */}
          <aside className="vsp-rail">
            <div className="vsp-rail-head">
              <Eyebrow>Refine</Eyebrow>
              {s.hasFilters && <button className="vsp-rail-clear" onClick={s.reset}>Clear all</button>}
            </div>

            <div className="vsp-rail-group">
              <Label>Causes</Label>
              <TagPicker
                tags={tags.tags}
                loading={tags.loading}
                selected={s.draft.selectedTags}
                onToggle={s.toggleTag}
              />
            </div>

            <div className="vsp-rail-group">
              <Label>Date</Label>
              <div className="vsp-pair">
                <div>
                  <span className="vsp-sublabel">From</span>
                  <input
                    type="date"
                    className="vsp-field"
                    value={s.draft.dateFrom}
                    onChange={e => s.setField('dateFrom', e.target.value)}
                  />
                </div>
                <div>
                  <span className="vsp-sublabel">To</span>
                  <input
                    type="date"
                    className="vsp-field"
                    value={s.draft.dateTo}
                    onChange={e => s.setField('dateTo', e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="vsp-rail-group">
              <Label>Time of day</Label>
              <div className="vsp-pair">
                <div>
                  <span className="vsp-sublabel">From</span>
                  <input
                    type="time"
                    className="vsp-field"
                    value={s.draft.timeFrom}
                    onChange={e => s.setField('timeFrom', e.target.value)}
                  />
                </div>
                <div>
                  <span className="vsp-sublabel">To</span>
                  <input
                    type="time"
                    className="vsp-field"
                    value={s.draft.timeTo}
                    onChange={e => s.setField('timeTo', e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="vsp-rail-group">
              <Label>Near</Label>
              {s.draft.locationLat ? (
                <div className="vsp-picked">
                  <span className="vsp-picked-text">{s.locationLabel}</span>
                  <button className="vsp-tag-x" onClick={s.clearLocation} aria-label="Clear location">
                    <IconX size={13} />
                  </button>
                </div>
              ) : (
                <AddressField
                  value={s.locationLabel}
                  onTextChange={s.setLocationLabel}
                  onPick={s.setLocation}
                />
              )}

              {s.draft.locationLat && (
                <div className="vsp-radius">
                  <div className="vsp-radius-head">
                    <span className="vsp-sublabel">Within</span>
                    <Eyebrow tone="clay">{s.draft.radiusMi} mi</Eyebrow>
                  </div>
                  <input
                    type="range"
                    className="vsp-range"
                    min="1" max="100" step="1"
                    value={s.draft.radiusMi}
                    style={{ '--pct': `${((s.draft.radiusMi - 1) / 99) * 100}%` }}
                    onChange={e => s.setField('radiusMi', Number(e.target.value))}
                  />
                  <div className="vsp-radius-ticks"><span>1 mi</span><span>100 mi</span></div>
                </div>
              )}
            </div>

            <div className="vsp-rail-group">
              <Label>Order</Label>
              <div className="vsp-pair">
                <select
                  className="vsp-field"
                  value={s.draft.sort}
                  onChange={e => s.setField('sort', e.target.value)}
                  aria-label="Sort field"
                >
                  <option value="date">By date</option>
                  <option value="createdAt">By newest</option>
                </select>
                <select
                  className="vsp-field"
                  value={s.draft.order}
                  onChange={e => s.setField('order', e.target.value)}
                  aria-label="Sort direction"
                >
                  <option value="asc">Ascending</option>
                  <option value="desc">Descending</option>
                </select>
              </div>
            </div>

            {s.validationError && <div className="vsp-rail-error">{s.validationError}</div>}

            <Btn block onClick={s.search}><IconSearch size={15} /> Apply filters</Btn>
          </aside>

          {/* ── Results ── */}
          <div ref={resultsRef}>
            {s.loading ? (
              <StateBlock>Looking for something near you…</StateBlock>
            ) : s.error ? (
              <StateBlock error note="The API is not answering right now. Filters and layout still work.">
                Could not load events
              </StateBlock>
            ) : s.events.length === 0 ? (
              <StateBlock note="Widen the radius, or drop a filter or two.">
                Nothing matches that yet
              </StateBlock>
            ) : (
              <>
                <div className="vsp-results-bar">
                  <Meta>{countLabel}</Meta>
                  <label className="vsp-perpage">
                    <Meta>Per page</Meta>
                    <select
                      className="vsp-field"
                      value={s.draft.limit}
                      onChange={e => s.setLimit(Number(e.target.value))}
                    >
                      {[4, 8, 12, 16, 20].map(n => <option key={n} value={n}>{n}</option>)}
                    </select>
                  </label>
                </div>

                <div className="vsp-prog">
                  {s.events.map(evt => (
                    <ProgrammeItem
                      key={evt.id}
                      event={evt}
                      orgName={s.orgNames[evt.organizationId] ?? null}
                    />
                  ))}
                </div>

                {(s.page > 0 || s.hasMore) && (
                  <div className="vsp-pager">
                    <Btn
                      sm
                      variant="outline"
                      disabled={s.page === 0}
                      onClick={() => s.setPage(p => p - 1)}
                    >
                      ← Previous
                    </Btn>

                    <div className="vsp-pager-nums">
                      {s.totalPages !== null
                        ? Array.from({ length: s.totalPages }, (_, i) => (
                            <button
                              key={i}
                              className={'vsp-pager-num' + (i === s.page ? ' is-on' : '')}
                              onClick={() => s.setPage(i)}
                            >
                              {i + 1}
                            </button>
                          ))
                        : <Meta>Page {s.page + 1}</Meta>}
                    </div>

                    <Btn
                      sm
                      variant="outline"
                      disabled={!s.hasMore}
                      onClick={() => s.setPage(p => p + 1)}
                    >
                      Next →
                    </Btn>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </Shell>
  );
}
