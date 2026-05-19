import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Header from '../Components/Header';
import Footer from '../Components/Footer';
import { IconCalendar, IconClock, IconSearch, IconX } from '../Components/Icons';
import Breadcrumb from '../Components/Breadcrumb';
import '../styles/EventsPage.css';

const API = process.env.REACT_APP_API_URL;

/* ── Helpers ─────────────────────────────────────────────────────── */
function formatDate(iso) {
  if (!iso) return 'TBD';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatDuration(hours) {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h} ${h === 1 ? 'hr' : 'hrs'}`;
  return `${h} hr ${m} min`;
}

function mapEvent(d) {
  return {
    id:             d.id,
    organizationId: d.organizationId,
    title:          d.title,
    description:    d.description,
    capacity:       d.capacity,
    duration:       d.duration / 60,
    date:           d.date,
    address:        d.address,
    heroImage:      d.image,
    tags:           (d.Tags ?? []).map(t => t.slug),
    tagObjects:     d.Tags ?? [],
  };
}

function buildUrl(filters, page) {
  const params = new URLSearchParams();

  if (filters.keyword) params.set('q', filters.keyword);

  filters.selectedTags.forEach(slug => params.append('tags', slug));

  if (filters.dateFrom)  params.set('afterDate',  filters.dateFrom);
  if (filters.dateTo)    params.set('beforeDate',  filters.dateTo);
  if (filters.timeFrom)  params.set('afterTime',   filters.timeFrom);
  if (filters.timeTo)    params.set('beforeTime',  filters.timeTo);

  if (filters.locationLat && filters.locationLng) {
    params.set('nearLat',  filters.locationLat);
    params.set('nearLng',  filters.locationLng);
    params.set('radiusM',  Math.round(filters.radiusMi * 1609.344));
  }

  params.set('sort',   filters.sort);
  params.set('order',  filters.order);
  params.set('limit',  filters.limit);
  params.set('offset', page * filters.limit);

  const base = filters.keyword ? `${API}/api/events/search` : `${API}/api/events/`;
  return `${base}?${params.toString()}`;
}

/* ── Address autocomplete ────────────────────────────────────────── */
function AddressAutocomplete({ value, onChange, onSelect }) {
  const [suggestions, setSuggestions] = useState([]);
  const [open, setOpen]               = useState(false);
  const timerRef                      = useRef(null);
  const wrapRef                       = useRef(null);

  useEffect(() => {
    function handleOutside(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  const handleChange = e => {
    const q = e.target.value;
    onChange(q);
    clearTimeout(timerRef.current);
    if (q.length < 3) { setSuggestions([]); setOpen(false); return; }
    timerRef.current = setTimeout(async () => {
      try {
        const res  = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=5`,
          { headers: { 'Accept-Language': 'en' } }
        );
        const data = await res.json();
        setSuggestions(data);
        setOpen(data.length > 0);
      } catch { /* ignore */ }
    }, 400);
  };

  const pick = item => {
    onSelect(item.display_name, parseFloat(item.lat), parseFloat(item.lon));
    setSuggestions([]);
    setOpen(false);
  };

  return (
    <div className="evts-address-wrap" ref={wrapRef}>
      <input
        className="evts-field-input"
        placeholder="City, address, or place…"
        value={value}
        onChange={handleChange}
        onFocus={() => suggestions.length > 0 && setOpen(true)}
        autoComplete="off"
      />
      {open && (
        <div className="evts-address-dropdown">
          {suggestions.map((s, i) => (
            <button
              key={i}
              className="evts-address-option"
              onMouseDown={() => pick(s)}
            >
              {s.display_name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Tag filter ──────────────────────────────────────────────────── */
function TagFilter({ allTags, tagsLoading, selected, onChange }) {
  const [query, setQuery] = useState('');

  const remove = slug => onChange(selected.filter(s => s !== slug));
  const add    = slug => { if (!selected.includes(slug)) onChange([...selected, slug]); };

  const available = allTags.filter(t =>
    !selected.includes(t.slug) &&
    t.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="evts-filter-section">
      <span className="evts-filter-label">Tags</span>

      {selected.length > 0 && (
        <div className="evts-tag-selected">
          {selected.map(slug => {
            const name = allTags.find(t => t.slug === slug)?.name ?? slug;
            return (
              <span key={slug} className="evts-tag-chip evts-tag-chip--active">
                {name}
                <button className="evts-tag-chip-x" onClick={() => remove(slug)} aria-label={`Remove ${name}`}>
                  <IconX size={10} />
                </button>
              </span>
            );
          })}
        </div>
      )}

      <div className="evts-tag-picker">
        <input
          className="evts-field-input evts-tag-search"
          placeholder="Search tags…"
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
        <div className="evts-tag-options">
          {tagsLoading ? (
            <div className="evts-tag-empty">Loading tags…</div>
          ) : available.length === 0 ? (
            <div className="evts-tag-empty">
              {query ? 'No tags match' : 'All tags selected'}
            </div>
          ) : (
            available.map(tag => (
              <button
                key={tag.id}
                className="evts-tag-option"
                onClick={() => { add(tag.slug); setQuery(''); }}
              >
                {tag.name}
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Event card ──────────────────────────────────────────────────── */
function EventCard({ event }) {
  const visibleTags   = event.tagObjects.slice(0, 3);
  const overflowCount = event.tagObjects.length - visibleTags.length;

  return (
    <Link to={`/events/${event.id}`} className="evts-card">
      <div className="evts-card-img">
        {event.heroImage
          ? <img src={event.heroImage} alt={event.title} />
          : <div className="evts-card-img-placeholder" />}
      </div>
      <div className="evts-card-body">
        <div className="evts-card-org">Org #{event.organizationId}</div>
        <h3 className="evts-card-title">{event.title}</h3>

        {event.description && (
          <p className="evts-card-desc">{event.description}</p>
        )}

        <div className="evts-card-pills">
          <span className="evts-card-pill evts-card-pill--muted">
            <IconCalendar size={13} /> {formatDate(event.date)}
          </span>
          <span className="evts-card-pill evts-card-pill--outline">
            <IconClock size={13} /> {formatDuration(event.duration)}
          </span>
        </div>

        {event.tagObjects.length > 0 && (
          <div className="evts-card-tags">
            {visibleTags.map(t => (
              <span key={t.id} className="evts-tag-chip">{t.name}</span>
            ))}
            {overflowCount > 0 && (
              <span className="evts-tag-chip evts-tag-chip--more">+{overflowCount}</span>
            )}
          </div>
        )}

        <div className="evts-card-footer">
          {event.address && <span className="evts-card-address">{event.address}</span>}
          <span className="evts-card-cta">View event →</span>
        </div>
      </div>
    </Link>
  );
}

/* ── Events page ─────────────────────────────────────────────────── */
function EventsPage() {
  const [events,        setEvents]        = useState([]);
  const [total,         setTotal]         = useState(null);
  const [hasMore,       setHasMore]       = useState(false);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [eventsError,   setEventsError]   = useState(false);
  const [page,          setPage]          = useState(0);

  const [allTags,     setAllTags]     = useState([]);
  const [tagsLoading, setTagsLoading] = useState(true);

  /* Filter state */
  const [keyword,       setKeyword]       = useState('');
  const [limit,         setLimit]         = useState(8);
  const [selectedTags,  setSelectedTags]  = useState([]);
  const [dateFrom,      setDateFrom]      = useState('');
  const [dateTo,        setDateTo]        = useState('');
  const [timeFrom,      setTimeFrom]      = useState('');
  const [timeTo,        setTimeTo]        = useState('');
  const [locationLabel, setLocationLabel] = useState('');
  const [locationLat,   setLocationLat]   = useState('');
  const [locationLng,   setLocationLng]   = useState('');
  const [radiusMi,      setRadiusMi]      = useState(25);
  const [sort,          setSort]          = useState('date');
  const [order,         setOrder]         = useState('asc');
  const [filterError,   setFilterError]   = useState('');

  /* Applied filters — only updated when Search is triggered */
  const [appliedFilters, setAppliedFilters] = useState({
    keyword: '', limit: 8, selectedTags: [], dateFrom: '', dateTo: '', timeFrom: '', timeTo: '',
    locationLat: '', locationLng: '', radiusMi: 25, sort: 'date', order: 'asc',
  });

  /* Fetch tags */
  useEffect(() => {
    fetch(`${API}/api/events/tags`)
      .then(r => { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(data => { setAllTags(data.tags ?? []); setTagsLoading(false); })
      .catch(() => setTagsLoading(false));
  }, []);

  /* Fetch events whenever appliedFilters or page changes */
  const runFetch = useCallback((filters, pg) => {
    setEventsLoading(true);
    setEventsError(false);
    fetch(buildUrl(filters, pg))
      .then(r => { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(data => {
        const rows    = (data.data ?? []).map(mapEvent);
        const apiTotal = data.total ?? data.count ?? null;
        setEvents(rows);
        setTotal(apiTotal);
        setHasMore(apiTotal !== null ? (pg * filters.limit + rows.length) < apiTotal : rows.length === filters.limit);
        setEventsLoading(false);
      })
      .catch(() => { setEventsError(true); setEventsLoading(false); });
  }, []);

  useEffect(() => { runFetch(appliedFilters, page); }, [appliedFilters, page, runFetch]);

  /* Validate + apply filters */
  const handleSearch = () => {
    if (dateFrom && dateTo && dateFrom > dateTo) {
      setFilterError('Date "From" must be before or equal to "To".');
      return;
    }
    if (timeFrom && timeTo && timeFrom > timeTo) {
      setFilterError('Time "From" must be before or equal to "To".');
      return;
    }
    setFilterError('');
    const filters = {
      keyword, limit, selectedTags, dateFrom, dateTo, timeFrom, timeTo,
      locationLat, locationLng, radiusMi, sort, order,
    };
    setAppliedFilters(filters);
    setPage(0);
  };

  const hasFilters = keyword || selectedTags.length > 0 || dateFrom || dateTo ||
    timeFrom || timeTo || locationLat || locationLng;

  const handleKeywordSearch = () => handleSearch();

  const clearFilters = () => {
    setKeyword('');
    setLimit(10);
    setSelectedTags([]);
    setDateFrom('');
    setDateTo('');
    setTimeFrom('');
    setTimeTo('');
    setLocationLabel('');
    setLocationLat('');
    setLocationLng('');
    setRadiusMi(25);
    setSort('date');
    setOrder('asc');
    setFilterError('');
    const blank = {
      keyword: '', limit: 8, selectedTags: [], dateFrom: '', dateTo: '', timeFrom: '', timeTo: '',
      locationLat: '', locationLng: '', radiusMi: 25, sort: 'date', order: 'asc',
    };
    setAppliedFilters(blank);
    setPage(0);
  };

  const handleSelectLocation = (label, lat, lng) => {
    setLocationLabel(label);
    setLocationLat(lat);
    setLocationLng(lng);
  };

  const clearLocation = () => {
    setLocationLabel('');
    setLocationLat('');
    setLocationLng('');
  };

  const lim         = appliedFilters.limit;
  const totalPages  = total !== null ? Math.ceil(total / lim) : null;
  const start       = page * lim + 1;
  const end         = page * lim + events.length;
  const resultsRef  = useRef(null);

  /* Change per-page limit immediately without requiring Search click */
  const handleLimitChange = newLimit => {
    setLimit(newLimit);
    setAppliedFilters(f => ({ ...f, limit: newLimit }));
    setPage(0);
  };

  /* Scroll to top of results when page changes */
  useEffect(() => {
    if (resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [page]);

  return (
    <div className="evts-page">
      <Header />

      <div className="evts-content">
        <Breadcrumb crumbs={[
          { label: 'Home',   to: '/' },
          { label: 'Events' },
        ]} />

        <div className="evts-page-header">
          <div>
            <h1 className="evts-page-title">Find Opportunities</h1>
            <p className="evts-page-subtitle">Browse volunteer events in your area</p>
          </div>
          <div className="evts-keyword-bar">
            <input
              className="evts-keyword-input"
              type="search"
              placeholder="Search events by keyword…"
              value={keyword}
              autoComplete="off"
              onChange={e => setKeyword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleKeywordSearch()}
            />
            <button className="evts-keyword-btn" onClick={handleKeywordSearch}>
              <IconSearch size={16} /> Search
            </button>
          </div>
        </div>

        <div className="evts-layout">

          {/* ── Filters sidebar ── */}
          <aside className="evts-sidebar">
            <div className="evts-filter-card">

              <div className="evts-filter-card-header">
                <span className="evts-filter-card-title">Filters</span>
                {hasFilters && (
                  <button className="evts-clear-btn" onClick={clearFilters}>Clear all</button>
                )}
              </div>

              {/* Tags */}
              <TagFilter
                allTags={allTags}
                tagsLoading={tagsLoading}
                selected={selectedTags}
                onChange={setSelectedTags}
              />

              {/* Date */}
              <div className="evts-filter-section">
                <span className="evts-filter-label">Date</span>
                <div className="evts-range-row">
                  <div className="evts-range-field">
                    <label className="evts-field-sublabel">From</label>
                    <input
                      type="date"
                      className="evts-field-input"
                      value={dateFrom}
                      onChange={e => setDateFrom(e.target.value)}
                    />
                  </div>
                  <span className="evts-range-sep">–</span>
                  <div className="evts-range-field">
                    <label className="evts-field-sublabel">To</label>
                    <input
                      type="date"
                      className="evts-field-input"
                      value={dateTo}
                      onChange={e => setDateTo(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Time of day */}
              <div className="evts-filter-section">
                <span className="evts-filter-label">Time of Day</span>
                <div className="evts-range-row">
                  <div className="evts-range-field">
                    <label className="evts-field-sublabel">From</label>
                    <input
                      type="time"
                      className="evts-field-input"
                      value={timeFrom}
                      onChange={e => setTimeFrom(e.target.value)}
                    />
                  </div>
                  <span className="evts-range-sep">–</span>
                  <div className="evts-range-field">
                    <label className="evts-field-sublabel">To</label>
                    <input
                      type="time"
                      className="evts-field-input"
                      value={timeTo}
                      onChange={e => setTimeTo(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Location */}
              <div className="evts-filter-section">
                <span className="evts-filter-label">Location</span>
                {locationLat ? (
                  <div className="evts-location-selected">
                    <span className="evts-location-label">{locationLabel}</span>
                    <button className="evts-tag-chip-x evts-location-clear" onClick={clearLocation} aria-label="Clear location">
                      <IconX size={11} />
                    </button>
                  </div>
                ) : (
                  <AddressAutocomplete
                    value={locationLabel}
                    onChange={setLocationLabel}
                    onSelect={handleSelectLocation}
                  />
                )}

                {locationLat && (
                  <div className="evts-radius-row">
                    <div className="evts-radius-label-row">
                      <label className="evts-field-sublabel">Radius</label>
                      <span className="evts-radius-value">{radiusMi} mi</span>
                    </div>
                    <input
                      type="range"
                      className="evts-radius-slider"
                      min="1"
                      max="100"
                      step="1"
                      value={radiusMi}
                      style={{ '--pct': `${((radiusMi - 1) / 99) * 100}%` }}
                      onChange={e => setRadiusMi(Number(e.target.value))}
                    />
                    <div className="evts-radius-ticks">
                      <span>1 mi</span>
                      <span>100 mi</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Sort */}
              <div className="evts-filter-section">
                <span className="evts-filter-label">Sort</span>
                <div className="evts-sort-row">
                  <select
                    className="evts-field-input evts-select"
                    value={sort}
                    onChange={e => setSort(e.target.value)}
                  >
                    <option value="date">Date</option>
                    <option value="createdAt">Created</option>
                  </select>
                  <select
                    className="evts-field-input evts-select"
                    value={order}
                    onChange={e => setOrder(e.target.value)}
                  >
                    <option value="asc">Ascending</option>
                    <option value="desc">Descending</option>
                  </select>
                </div>
              </div>

              {filterError && (
                <div className="evts-filter-error">{filterError}</div>
              )}

              {/* Search button */}
              <button className="evts-search-btn" onClick={handleSearch}>
                <IconSearch size={15} /> Search
              </button>

            </div>
          </aside>

          {/* ── Results ── */}
          <main className="evts-main" ref={resultsRef}>
            {eventsLoading ? (
              <div className="evts-state">Loading events…</div>
            ) : eventsError ? (
              <div className="evts-state evts-state--error">
                Could not load events. Check your connection.
              </div>
            ) : events.length === 0 ? (
              <div className="evts-state">No events found. Try adjusting your filters.</div>
            ) : (
              <>
                <div className="evts-results-header">
                  <span className="evts-results-count">
                    {total !== null
                      ? (total > lim ? `Showing ${start}–${end} of ${total} events` : `${total} event${total !== 1 ? 's' : ''}`)
                      : `Page ${page + 1}`}
                  </span>
                  <label className="evts-per-page">
                    Per page
                    <select
                      className="evts-select evts-per-page-select"
                      value={limit}
                      onChange={e => handleLimitChange(Number(e.target.value))}
                    >
                      <option value={4}>4</option>
                      <option value={8}>8</option>
                      <option value={12}>12</option>
                      <option value={16}>16</option>
                      <option value={20}>20</option>
                    </select>
                  </label>
                </div>
                <div className="evts-grid">
                  {events.map(evt => (
                    <EventCard key={evt.id} event={evt} />
                  ))}
                </div>
              </>
            )}
          </main>

        </div>

        {/* ── Pagination bar — full width below layout ── */}
        {!eventsLoading && !eventsError && events.length > 0 && (page > 0 || hasMore) && (
          <div className="evts-pagination">
            <button
              className="evts-page-btn"
              disabled={page === 0}
              onClick={() => setPage(p => p - 1)}
            >
              ← Prev
            </button>

            <div className="evts-page-numbers">
              {totalPages !== null
                ? Array.from({ length: totalPages }, (_, i) => (
                    <button
                      key={i}
                      className={'evts-page-num' + (i === page ? ' active' : '')}
                      onClick={() => setPage(i)}
                    >
                      {i + 1}
                    </button>
                  ))
                : <span className="evts-page-info">Page {page + 1}</span>
              }
            </div>

            <button
              className="evts-page-btn"
              disabled={!hasMore}
              onClick={() => setPage(p => p + 1)}
            >
              Next →
            </button>
          </div>
        )}

      </div>

      <Footer />
    </div>
  );
}

export default EventsPage;
