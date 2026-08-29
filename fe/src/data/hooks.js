/* Headless hooks: all page behaviour, zero markup.

   Design variants import these and render whatever they like. Adding a third
   look means writing JSX only — no fetching, no state machines, no drift
   between designs when an endpoint changes. */

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  fetchEvent, fetchOrg, fetchUser, fetchOrgs, fetchTags,
  fetchOrgEvents, fetchUserEvents, fetchOrgName,
  searchEvents, geocode,
  updateEvent, updateOrg, updateUser,
  deleteEvent, deleteOrg, deleteUser,
  fetchEventAttendees, joinEvent, leaveEvent,
  describeApiError,
} from './api';
import { useAuth } from '../context/AuthContext';

/* ── Toast ───────────────────────────────────────────────────────── */
export function useToast(duration = 2400) {
  const [message, setMessage] = useState('');
  const [visible, setVisible] = useState(false);
  const timer = useRef(null);

  const show = useCallback((msg) => {
    setMessage(msg);
    setVisible(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setVisible(false), duration);
  }, [duration]);

  useEffect(() => () => clearTimeout(timer.current), []);

  return { message, visible, show };
}

/* ── Click-outside ───────────────────────────────────────────────── */
export function useClickOutside(onOutside) {
  const ref = useRef(null);
  useEffect(() => {
    function handle(e) {
      if (ref.current && !ref.current.contains(e.target)) onOutside();
    }
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [onOutside]);
  return ref;
}

/* ── Tags ────────────────────────────────────────────────────────── */
export function useTags() {
  const [tags,    setTags]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(false);

  useEffect(() => {
    let alive = true;
    fetchTags()
      .then(t => { if (alive) { setTags(t); setLoading(false); } })
      .catch(() => { if (alive) { setError(true); setLoading(false); } });
    return () => { alive = false; };
  }, []);

  const nameOf = useCallback(
    slug => tags.find(t => t.slug === slug)?.name ?? slug,
    [tags]
  );

  return { tags, loading, error, nameOf };
}

/* ── Address autocomplete ────────────────────────────────────────── */
export function useAddressSuggestions(delay = 400) {
  const [suggestions, setSuggestions] = useState([]);
  const [open,        setOpen]        = useState(false);
  const timer = useRef(null);

  const query = useCallback((q) => {
    clearTimeout(timer.current);
    if (q.length < 3) { setSuggestions([]); setOpen(false); return; }
    timer.current = setTimeout(async () => {
      const results = await geocode(q);
      setSuggestions(results);
      setOpen(results.length > 0);
    }, delay);
  }, [delay]);

  const dismiss = useCallback(() => setOpen(false), []);
  const reopen  = useCallback(() => setOpen(suggestions.length > 0), [suggestions]);
  const clear   = useCallback(() => { setSuggestions([]); setOpen(false); }, []);

  useEffect(() => () => clearTimeout(timer.current), []);

  return { suggestions, open, query, dismiss, reopen, clear };
}

/* ── Org names, cached across renders and pages ──────────────────── */
const orgNameCache = {};

function useOrgNames(events) {
  const [names, setNames] = useState(orgNameCache);

  useEffect(() => {
    if (events.length === 0) return;
    const needed = [...new Set(events.map(e => e.organizationId))]
      .filter(id => id != null && !(id in orgNameCache));
    if (needed.length === 0) return;

    let alive = true;
    Promise.all(needed.map(id => fetchOrgName(id).then(name => [id, name])))
      .then(pairs => {
        Object.assign(orgNameCache, Object.fromEntries(pairs));
        if (alive) setNames({ ...orgNameCache });
      });
    return () => { alive = false; };
  }, [events]);

  return names;
}

/* ── Events search page ──────────────────────────────────────────── */

const BLANK_FILTERS = {
  keyword: '', limit: 8, selectedTags: [],
  dateFrom: '', dateTo: '', timeFrom: '', timeTo: '',
  locationLat: '', locationLng: '', radiusMi: 25,
  sort: 'date', order: 'asc',
};

/** A message when the draft contradicts itself, otherwise an empty string. */
function describeFilterConflict(d) {
  if (d.dateFrom && d.dateTo && d.dateFrom > d.dateTo) {
    return 'The "from" date has to come before the "to" date.';
  }
  if (d.timeFrom && d.timeTo && d.timeFrom > d.timeTo) {
    return 'The "from" time has to come before the "to" time.';
  }
  return '';
}

/**
 * @param {object}  [opts]
 * @param {boolean} [opts.live]  Apply filters as they are edited rather than
 *                               waiting for search(). Off by default so the
 *                               designs that render a submit button keep the
 *                               behaviour their layout promises.
 * @param {number}  [opts.delay] Debounce for live mode, in milliseconds.
 */
export function useEventsSearch({ live = false, delay = 280 } = {}) {
  const [events,  setEvents]  = useState([]);
  const [total,   setTotal]   = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(false);
  const [page,    setPage]    = useState(0);

  /* Live search re-queries on almost every keystroke. Flipping `loading` each
     time would swap the whole list out for skeletons and make the page strobe
     under the cursor, so the first query owns `loading` and every later one
     reports through `refreshing` instead: results stay on screen, slightly
     stale, while the next set is on its way. */
  const [refreshing, setRefreshing] = useState(false);
  const settled = useRef(false);

  /* Draft filter state — what the user is editing right now. */
  const [draft, setDraft] = useState(BLANK_FILTERS);
  /* Applied filter state — what the last search actually ran with. */
  const [applied, setApplied] = useState(BLANK_FILTERS);
  const [locationLabel, setLocationLabel] = useState('');
  const [validationError, setValidationError] = useState('');

  const setField = useCallback((key, value) => {
    setDraft(d => ({ ...d, [key]: value }));
  }, []);

  useEffect(() => {
    let alive = true;
    if (settled.current) setRefreshing(true); else setLoading(true);
    setError(false);
    searchEvents(applied, page)
      .then(({ rows, total: apiTotal }) => {
        if (!alive) return;
        setEvents(rows);
        setTotal(apiTotal);
        setHasMore(
          apiTotal !== null
            ? (page * applied.limit + rows.length) < apiTotal
            : rows.length === applied.limit
        );
        settled.current = true;
        setLoading(false);
        setRefreshing(false);
      })
      .catch(() => {
        if (!alive) return;
        setError(true);
        setLoading(false);
        setRefreshing(false);
      });
    return () => { alive = false; };
  }, [applied, page]);

  /* Live mode: promote the draft once editing pauses. Discrete controls (a
     cause, a date) go through the same timer, so ticking three causes in
     quick succession still costs one request rather than three.

     On mount this schedules setApplied(BLANK_FILTERS) while `applied` is
     already that exact object, so React bails out on identity and no second
     request goes out behind the initial one. */
  useEffect(() => {
    if (!live) return undefined;
    const conflict = describeFilterConflict(draft);
    setValidationError(conflict);
    // A contradictory range would return nothing; hold the last good results
    // and let the message explain why the list stopped moving.
    if (conflict) return undefined;
    const timer = setTimeout(() => {
      setApplied(draft);
      setPage(0);
    }, delay);
    return () => clearTimeout(timer);
  }, [live, delay, draft]);

  const orgNames = useOrgNames(events);

  /* Still wired up in live mode: submitting the form (Enter in the keyword
     field) skips the debounce instead of doing nothing. */
  const search = useCallback(() => {
    const conflict = describeFilterConflict(draft);
    setValidationError(conflict);
    if (conflict) return;
    setApplied(draft);
    setPage(0);
  }, [draft]);

  const reset = useCallback(() => {
    setDraft(BLANK_FILTERS);
    setApplied(BLANK_FILTERS);
    setLocationLabel('');
    setValidationError('');
    setPage(0);
  }, []);

  const setLocation = useCallback((label, lat, lng) => {
    setLocationLabel(label);
    setDraft(d => ({ ...d, locationLat: lat, locationLng: lng }));
  }, []);

  const clearLocation = useCallback(() => {
    setLocationLabel('');
    setDraft(d => ({ ...d, locationLat: '', locationLng: '' }));
  }, []);

  /* Page size changes feel broken behind a Search button, so apply at once. */
  const setLimit = useCallback((limit) => {
    setDraft(d => ({ ...d, limit }));
    setApplied(a => ({ ...a, limit }));
    setPage(0);
  }, []);

  const toggleTag = useCallback((slug) => {
    setDraft(d => ({
      ...d,
      selectedTags: d.selectedTags.includes(slug)
        ? d.selectedTags.filter(s => s !== slug)
        : [...d.selectedTags, slug],
    }));
  }, []);

  const hasFilters = useMemo(() => Boolean(
    draft.keyword || draft.selectedTags.length || draft.dateFrom || draft.dateTo ||
    draft.timeFrom || draft.timeTo || draft.locationLat
  ), [draft]);

  const limit      = applied.limit;
  const totalPages = total !== null ? Math.max(1, Math.ceil(total / limit)) : null;
  const rangeStart = page * limit + 1;
  const rangeEnd   = page * limit + events.length;

  return {
    events, total, hasMore, loading, refreshing, error, orgNames,
    page, setPage, totalPages, rangeStart, rangeEnd, limit,
    draft, setField, setLimit, toggleTag,
    locationLabel, setLocationLabel, setLocation, clearLocation,
    search, reset, hasFilters, validationError,
  };
}

/* ── Editable record (event / org / user share this shape) ───────── */

function useEditableRecord(id, loader, saver) {
  const [record,    setRecord]    = useState(null);
  const [draft,     setDraft]     = useState(null);
  const [editing,   setEditing]   = useState(false);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState(false);
  const [saving,    setSaving]    = useState(false);
  const [saveError, setSaveError] = useState('');

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError(false);
    setEditing(false);
    setSaveError('');
    loader(id)
      .then(data => {
        if (!alive) return;
        setRecord(data);
        setDraft(data);
        setLoading(false);
      })
      .catch(() => { if (alive) { setError(true); setLoading(false); } });
    return () => { alive = false; };
  }, [id, loader]);

  const setValue = useCallback((key, value) => setDraft(d => ({ ...d, [key]: value })), []);
  const patch    = useCallback(values => setDraft(d => ({ ...d, ...values })), []);

  const startEdit = () => { setDraft({ ...record }); setEditing(true); setSaveError(''); };
  const cancel    = () => { setDraft({ ...record }); setEditing(false); setSaveError(''); };

  /* Persist to the API and adopt whatever the server says the record now is.
     Resolves true on success so callers can decide whether to toast/navigate. */
  const save = useCallback(async () => {
    if (!saver) return false;
    setSaving(true);
    setSaveError('');
    try {
      const saved = await saver(id, draft);
      setRecord(saved);
      setDraft(saved);
      setEditing(false);
      return true;
    } catch (err) {
      setSaveError(describeApiError(err));
      return false;
    } finally {
      setSaving(false);
    }
  }, [id, draft, saver]);

  return {
    record, draft, editing, loading, error, saving, saveError,
    setValue, patch, startEdit, cancel, save, setRecord, setSaveError,
  };
}

/* Ids arrive from the URL as strings but come back from the API as numbers. */
const sameId = (a, b) => a != null && b != null && String(a) === String(b);

/* ── Single event ────────────────────────────────────────────────── */
export function useEventDetail(id) {
  const base = useEditableRecord(id, fetchEvent, updateEvent);
  const { auth, isOrg, isVolunteer, userId } = useAuth();
  const [orgName, setOrgName] = useState(null);
  const [rsvped,  setRsvped]  = useState(false);
  const [rsvpBusy, setRsvpBusy] = useState(false);
  const [roster,  setRoster]  = useState([]);
  const [rosterLoading, setRosterLoading] = useState(false);
  const [removing, setRemoving] = useState(false);
  const toast = useToast();

  const orgId = base.record?.organizationId;
  useEffect(() => {
    if (orgId == null) { setOrgName(null); return; }
    let alive = true;
    fetchOrgName(orgId).then(name => { if (alive) setOrgName(name); });
    return () => { alive = false; };
  }, [orgId]);

  /* Only the organization that owns this event may edit it — the API enforces
     this too, this just keeps the affordance from showing when it would 403. */
  const canEdit = isOrg && sameId(userId, orgId);

  /* Am I signed up? Derived from my own attendance rather than the event
     roster, which is readable only by the organizer. */
  useEffect(() => {
    if (!isVolunteer || userId == null) { setRsvped(false); return; }
    let alive = true;
    fetchUserEvents(userId)
      .then(list => { if (alive) setRsvped(list.some(ev => sameId(ev.id, id))); })
      .catch(() => { if (alive) setRsvped(false); });
    return () => { alive = false; };
  }, [id, isVolunteer, userId]);

  /* The roster is the organizer's view of who turned up. Fetched only for the
     owning org, because that is the only principal the API will serve it to. */
  useEffect(() => {
    if (!canEdit) { setRoster([]); return; }
    let alive = true;
    setRosterLoading(true);
    fetchEventAttendees(id)
      .then(list => { if (alive) setRoster(list); })
      .catch(() => { if (alive) setRoster([]); })
      .finally(() => { if (alive) setRosterLoading(false); });
    return () => { alive = false; };
  }, [id, canEdit]);

  /* Keep the capacity meter honest the moment attendance changes, instead of
     waiting for a reload. */
  const shiftAttendance = (delta) => base.setRecord(r => {
    if (!r) return r;
    const count = Math.max(0, (r.attendeeCount ?? 0) + delta);
    return {
      ...r,
      attendeeCount: count,
      spotsLeft: r.capacity == null ? null : Math.max(0, r.capacity - count),
    };
  });

  const toggleRsvp = async () => {
    if (!auth) { toast.show('Log in as a volunteer to sign up for events.'); return; }
    if (isOrg)  { toast.show('Organization accounts cannot sign up for events.'); return; }
    setRsvpBusy(true);
    try {
      if (rsvped) {
        await leaveEvent(id);
        setRsvped(false);
        shiftAttendance(-1);
        toast.show('RSVP cancelled.');
      } else {
        await joinEvent(id);
        setRsvped(true);
        shiftAttendance(1);
        toast.show("You're signed up. Details are in your profile.");
      }
    } catch (err) {
      toast.show(describeApiError(err));
    } finally {
      setRsvpBusy(false);
    }
  };

  const save = async () => {
    const ok = await base.save();
    if (ok) toast.show('Event saved.');
    return ok;
  };

  /* Deleting is permanent and takes the RSVPs with it, so callers are expected
     to confirm first. Resolves true once the event is gone. */
  const remove = async () => {
    setRemoving(true);
    try {
      await deleteEvent(id);
      return true;
    } catch (err) {
      toast.show(describeApiError(err));
      return false;
    } finally {
      setRemoving(false);
    }
  };

  return {
    ...base, save, canEdit, orgName,
    rsvped, rsvpBusy, toggleRsvp,
    roster, rosterLoading,
    remove, removing,
    toast,
  };
}

/* ── Single organization + its events ────────────────────────────── */
export function useOrgDetail(id) {
  const base  = useEditableRecord(id, fetchOrg, updateOrg);
  const { isOrg, userId } = useAuth();
  const toast = useToast();
  const [events,        setEvents]        = useState([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [removing,      setRemoving]      = useState(false);

  useEffect(() => {
    let alive = true;
    setEventsLoading(true);
    fetchOrgEvents(id)
      .then(list => { if (alive) setEvents(list); })
      .catch(() => { if (alive) setEvents([]); })
      .finally(() => { if (alive) setEventsLoading(false); });
    return () => { alive = false; };
  }, [id]);

  /* You may only edit the organization you are signed in as. */
  const canEdit = isOrg && sameId(userId, id);

  const save = async () => {
    const ok = await base.save();
    if (ok) toast.show('Organization saved.');
    return ok;
  };

  /* Closing the organization cascades to its events in the database, so the
     caller should make that consequence clear before calling this. */
  const remove = async () => {
    setRemoving(true);
    try {
      await deleteOrg(id);
      return true;
    } catch (err) {
      toast.show(describeApiError(err));
      return false;
    } finally {
      setRemoving(false);
    }
  };

  return { ...base, save, canEdit, remove, removing, events, eventsLoading, toast };
}

/* ── Single volunteer + their events ─────────────────────────────── */
export function useUserDetail(id) {
  const base  = useEditableRecord(id, fetchUser, updateUser);
  const { isVolunteer, userId } = useAuth();
  const toast = useToast();
  const [events,        setEvents]        = useState([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [removing,      setRemoving]      = useState(false);

  useEffect(() => {
    let alive = true;
    setEventsLoading(true);
    fetchUserEvents(id)
      .then(list => { if (alive) setEvents(list); })
      .catch(() => { if (alive) setEvents([]); })
      .finally(() => { if (alive) setEventsLoading(false); });
    return () => { alive = false; };
  }, [id]);

  /* You may only edit your own profile. */
  const canEdit = isVolunteer && sameId(userId, id);

  const save = async () => {
    const ok = await base.save();
    if (ok) toast.show('Profile saved.');
    return ok;
  };

  const remove = async () => {
    setRemoving(true);
    try {
      await deleteUser(id);
      return true;
    } catch (err) {
      toast.show(describeApiError(err));
      return false;
    } finally {
      setRemoving(false);
    }
  };

  return { ...base, save, canEdit, remove, removing, events, eventsLoading, toast };
}

/* ── Organization directory ──────────────────────────────────────── */
export function useOrgList() {
  const [orgs,    setOrgs]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(false);
  const [query,   setQuery]   = useState('');

  useEffect(() => {
    let alive = true;
    fetchOrgs()
      .then(list => { if (alive) { setOrgs(list); setLoading(false); } })
      .catch(() => { if (alive) { setError(true); setLoading(false); } });
    return () => { alive = false; };
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return orgs;
    return orgs.filter(o =>
      (o.name ?? '').toLowerCase().includes(q) ||
      (o.description ?? '').toLowerCase().includes(q) ||
      (o.address ?? '').toLowerCase().includes(q)
    );
  }, [orgs, query]);

  return { orgs, filtered, loading, error, query, setQuery };
}
