/* Thin API layer. Every variant talks to the backend through here, so a
   change to an endpoint is a one-file change rather than a per-design one. */

/* Empty by default, which makes every URL below relative — the frontend and
   the API are served from one origin in production (see vercel.json), so the
   session cookie stays first-party and there is no CORS in play. Set
   REACT_APP_API_URL only to point at an API on some other host, e.g. when
   running the two apart in development. */
export const API = process.env.REACT_APP_API_URL || '';

/* ── Request plumbing ────────────────────────────────────────────────
   The API authenticates with a session cookie, so every request to our own
   backend must send credentials — a plain fetch() drops the cookie on a
   cross-origin call and the server sees an anonymous request. Successful
   payloads come back wrapped as { message, data }. */

/** Non-2xx response from our API, carrying the status and parsed body. */
export class ApiError extends Error {
  constructor(status, body) {
    super(body?.message || body?.error || `Request failed (${status})`);
    this.name   = 'ApiError';
    this.status = status;
    this.body   = body;
  }
}

async function request(url, { method = 'GET', body } = {}) {
  const res = await fetch(url, {
    method,
    credentials: 'include',
    ...(body !== undefined
      ? { headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }
      : {}),
  });

  if (res.status === 204) return null;

  let payload = null;
  try { payload = await res.json(); } catch { /* empty or non-JSON body */ }

  if (!res.ok) throw new ApiError(res.status, payload);
  return payload;
}

/** Turn a failed request into something worth showing a person. */
export function describeApiError(err, fallback = 'Something went wrong. Please try again.') {
  if (!(err instanceof ApiError)) {
    return 'Could not reach the server. Check your connection.';
  }
  if (err.status === 401) return 'Your session has expired. Please log in again.';
  if (err.status === 403) return 'You do not have permission to do that.';
  if (err.status === 404) return 'That record could not be found.';
  if (err.status === 409) {
    // Sequelize reports these as "Unique constraint violation", which means
    // nothing to a person — name the field that actually clashed.
    const clash = err.body?.details?.[0]?.path;
    if (clash) return `That ${clash} is already taken. Try another.`;
    return err.body?.message || 'That conflicts with something that already exists.';
  }

  // Zod failures come back as { bodyValidationError: [ { path, message } ] }
  const issue = err.body?.bodyValidationError?.[0] ?? err.body?.details?.[0];
  if (issue?.message) {
    const field = Array.isArray(issue.path) ? issue.path.join('.') : issue.path;
    return field ? `${field}: ${issue.message}` : issue.message;
  }
  return err.message || fallback;
}

/** Peel the { message, data } envelope the API wraps successful payloads in. */
function unwrap(payload) {
  return payload && typeof payload === 'object' && 'data' in payload
    ? payload.data
    : payload;
}

async function getJson(url) {
  return request(url);
}

/* ── Mappers ─────────────────────────────────────────────────────── */

export function mapEvent(d) {
  /* attendeeCount only rides along on the single-event endpoint. Where it is
     absent (list rows) we cannot know how many signed up, so leave spotsLeft
     null rather than claiming the event is empty. */
  const attendees = d.attendeeCount;
  const spotsLeft = d.capacity == null || attendees == null
    ? null
    : Math.max(0, d.capacity - attendees);

  return {
    id:             d.id,
    organizationId: d.organizationId,
    title:          d.title,
    description:    d.description ?? '',
    capacity:       d.capacity,
    attendeeCount:  attendees ?? null,
    spotsLeft,
    duration:       (d.duration ?? 0) / 60,
    date:           d.date,
    address:        d.address,
    lat:            d.latitude,
    lng:            d.longitude,
    heroImage:      d.image ?? null,
    tags:           (d.Tags ?? []).map(t => t.slug),
    tagObjects:     d.Tags ?? [],
    createdAt:      d.createdAt,
    updatedAt:      d.updatedAt,
  };
}

export function mapOrg(d) {
  return {
    id:          d.id,
    name:        d.name,
    description: d.description,
    email:       d.email,
    phone:       d.phone,
    address:     d.address,
    bannerImg:   d.bannerImg,
    iconImg:     d.iconImg,
    createdAt:   d.createdAt,
    updatedAt:   d.updatedAt,
  };
}

export function mapUser(d) {
  return {
    id:          d.id,
    username:    d.username,
    email:       d.email,
    displayName: d.displayName,
    profilePic:  d.profilePic,
    role:        d.role,
    createdAt:   d.createdAt,
    updatedAt:   d.updatedAt,
  };
}

/* ── Reads ───────────────────────────────────────────────────────── */

export async function fetchEvent(id) {
  const { data } = await getJson(`${API}/api/events/${id}`);
  return mapEvent(data);
}

export async function fetchOrg(id) {
  const { data } = await getJson(`${API}/api/orgs/${id}`);
  return mapOrg(data);
}

export async function fetchUser(id) {
  const { data } = await getJson(`${API}/api/users/${id}`);
  return mapUser(data);
}

export async function fetchOrgs() {
  const data = await getJson(`${API}/api/orgs/`);
  return (data.data ?? []).map(mapOrg);
}

export async function fetchTags() {
  const data = await getJson(`${API}/api/events/tags`);
  return data.tags ?? [];
}

function listOf(res) {
  if (Array.isArray(res.data))   return res.data;
  if (Array.isArray(res.events)) return res.events;
  return [];
}

export async function fetchOrgEvents(id) {
  return listOf(await getJson(`${API}/api/orgs/${id}/events`)).map(mapEvent);
}

export async function fetchUserEvents(id) {
  return listOf(await getJson(`${API}/api/users/${id}/events`)).map(mapEvent);
}

/** Org name only, tolerant of both response shapes. Never throws. */
export async function fetchOrgName(id) {
  try {
    const res = await getJson(`${API}/api/orgs/${id}`);
    return res.data?.name ?? res.name ?? null;
  } catch {
    return null;
  }
}

/* ── Event search ────────────────────────────────────────────────── */

export function buildSearchUrl(filters, page) {
  const params = new URLSearchParams();

  if (filters.keyword) params.set('q', filters.keyword);
  filters.selectedTags.forEach(slug => params.append('tags', slug));

  if (filters.dateFrom) params.set('afterDate',  filters.dateFrom);
  if (filters.dateTo)   params.set('beforeDate', filters.dateTo);
  if (filters.timeFrom) params.set('afterTime',  filters.timeFrom);
  if (filters.timeTo)   params.set('beforeTime', filters.timeTo);

  /* The API takes lat/lng/radius, and its radius is in miles — the same unit
     the slider already uses, so no conversion. All three or none: sending a
     partial set is a 400. */
  if (filters.locationLat && filters.locationLng) {
    params.set('lat',    filters.locationLat);
    params.set('lng',    filters.locationLng);
    params.set('radius', filters.radiusMi);
  }

  params.set('sort',   filters.sort);
  params.set('order',  filters.order);
  params.set('limit',  filters.limit);
  params.set('offset', page * filters.limit);

  const base = filters.keyword ? `${API}/api/events/search` : `${API}/api/events/`;
  return `${base}?${params.toString()}`;
}

export async function searchEvents(filters, page) {
  const data  = await getJson(buildSearchUrl(filters, page));
  const rows  = (data.data ?? []).map(mapEvent);
  const total = data.total ?? data.count ?? null;
  return { rows, total };
}

/* ── Session ─────────────────────────────────────────────────────── */

/** The logged-in principal, or null when the session is gone/expired.
    Returns { kind: 'user' | 'org', info: {...} }. */
export async function fetchMe() {
  try {
    return unwrap(await request(`${API}/api/auth/me`));
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) return null;
    throw err;
  }
}

/* ── Image uploads ───────────────────────────────────────────────────
   Two steps: ask the API to sign a URL, then PUT the file straight to
   storage. The file never travels through our API. */

/** Is a storage bucket wired up on this server? */
export async function uploadsEnabled() {
  try {
    return Boolean(unwrap(await getJson(`${API}/api/uploads/status`))?.enabled);
  } catch {
    return false;
  }
}

/**
 * Upload one image and resolve to its public URL, ready to save on a record.
 * `kind` is one of: event-image, org-banner, org-icon, profile-pic.
 */
export async function uploadImage(file, kind) {
  const { uploadUrl, publicUrl } = unwrap(await request(`${API}/api/uploads/sign`, {
    method: 'POST',
    body: { kind, contentType: file.type, contentLength: file.size },
  }));

  // Straight to the bucket. Content-Type must match what was signed exactly,
  // or the signature check fails; the browser sets Content-Length itself.
  const put = await fetch(uploadUrl, {
    method: 'PUT',
    headers: { 'Content-Type': file.type },
    body: file,
  });

  if (!put.ok) {
    throw new ApiError(put.status, {
      message: 'The image could not be uploaded. Check the bucket CORS rules and try again.',
    });
  }

  return publicUrl;
}

/* ── Writes ──────────────────────────────────────────────────────────
   The event endpoints validate with a .strict() schema, so the payload has
   to use the API's field names exactly — our UI shape (lat/lng/heroImage,
   duration in hours) has to be translated back on the way out. */

/** UI draft -> event API payload. Only includes keys the draft actually has. */
export function toEventPayload(draft) {
  const out = {};
  const has = k => Object.prototype.hasOwnProperty.call(draft, k);

  if (has('title'))       out.title       = draft.title;
  if (has('description')) out.description = draft.description || null;
  if (has('address'))     out.address     = draft.address || null;
  if (has('tags'))        out.tags        = draft.tags ?? [];
  // capacity/duration are .positive() server-side, so 0 and '' must go as null
  if (has('capacity'))    out.capacity    = Number(draft.capacity) > 0 ? Number(draft.capacity) : null;
  if (has('duration'))    out.duration    = Number(draft.duration) > 0 ? Math.round(Number(draft.duration) * 60) : null;
  if (has('date'))        out.date        = draft.date ? new Date(draft.date).toISOString() : null;
  if (has('lat'))         out.latitude    = Number(draft.lat);
  if (has('lng'))         out.longitude   = Number(draft.lng);
  // image must be a valid URL or null — an empty string fails validation
  if (has('heroImage'))   out.image       = draft.heroImage || null;

  return out;
}

/** The event write endpoints answer with { event, tags } rather than a row.
    They also omit attendeeCount, so it has to be supplied by the caller. */
function mapWrittenEvent(payload, attendeeCount) {
  const { event, tags } = unwrap(payload) ?? {};
  return mapEvent({ ...event, Tags: tags ?? [], attendeeCount });
}

export async function createEvent(orgId, draft) {
  // Brand new event: nobody has signed up yet.
  return mapWrittenEvent(
    await request(`${API}/api/orgs/${orgId}/events`, { method: 'POST', body: toEventPayload(draft) }),
    0
  );
}

export async function updateEvent(id, draft) {
  await request(`${API}/api/events/${id}`, { method: 'PATCH', body: toEventPayload(draft) });
  // Read the event back so the caller keeps a complete record — the PATCH
  // response has no attendeeCount, which would blank out the capacity meter.
  return fetchEvent(id);
}

export async function deleteEvent(id) {
  await request(`${API}/api/events/${id}`, { method: 'DELETE' });
}

export async function updateOrg(id, draft) {
  const body = {
    name:        draft.name,
    description: draft.description || null,
    phone:       draft.phone || null,
    address:     draft.address || null,
    // Blank means "no image": null clears it, '' would fail z.url().
    bannerImg:   draft.bannerImg || null,
    iconImg:     draft.iconImg || null,
  };
  // Email is the organization's login credential, so only send it when it has
  // actually been given a value — never blank it out by accident.
  if (draft.email) body.email = draft.email.trim();

  return mapOrg(unwrap(await request(`${API}/api/orgs/${id}`, { method: 'PATCH', body })));
}

/** Closing an organization also removes its events (cascade in the database). */
export async function deleteOrg(id) {
  await request(`${API}/api/orgs/${id}`, { method: 'DELETE' });
}

export async function deleteUser(id) {
  await request(`${API}/api/users/${id}`, { method: 'DELETE' });
}

export async function updateUser(id, draft) {
  const body = {
    displayName: draft.displayName || null,
    profilePic:  draft.profilePic || null,
  };
  // Username and email are both login credentials, so only send them when they
  // actually hold a value — never blank one out by accident.
  if (draft.username) body.username = draft.username.trim();
  if (draft.email)    body.email    = draft.email.trim();

  return mapUser(unwrap(await request(`${API}/api/users/${id}`, { method: 'PATCH', body })));
}

/* ── Attendance ──────────────────────────────────────────────────── */

export async function fetchEventAttendees(id) {
  return unwrap(await getJson(`${API}/api/events/${id}/attendees`)) ?? [];
}

export async function joinEvent(id) {
  await request(`${API}/api/events/${id}/attendees`, { method: 'POST' });
}

export async function leaveEvent(id) {
  await request(`${API}/api/events/${id}/attendees/me`, { method: 'DELETE' });
}

/* ── Geocoding (OpenStreetMap Nominatim) ─────────────────────────── */

export async function geocode(query) {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`,
    { headers: { 'Accept-Language': 'en' } }
  );
  if (!res.ok) return [];
  return res.json();
}

export async function reverseGeocode(lat, lng) {
  try {
    const res  = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
    );
    const data = await res.json();
    return data.display_name ?? '';
  } catch {
    return '';
  }
}
