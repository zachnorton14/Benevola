/* global React, ReactDOM */
const { useState, useEffect, useRef } = React;
const { LeafLogo, CaretIcon, ArrowRight, Header, Footer } = window;

/* ─── Icons ───────────────────────────────────────────────── */
const IconCalendar = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none">
    <rect x="4" y="5" width="16" height="15" rx="2" stroke="currentColor" strokeWidth="1.8"/>
    <path d="M4 10H20M8 3V6M16 3V6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
  </svg>
);
const IconClock = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none">
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8"/>
    <path d="M12 7V12L15 14.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
  </svg>
);
const IconUsers = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none">
    <circle cx="9" cy="8" r="3" stroke="currentColor" strokeWidth="1.6"/>
    <path d="M3 21C3 17.5 5.5 15 9 15C12.5 15 15 17.5 15 21" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
    <circle cx="17" cy="8" r="2.5" stroke="currentColor" strokeWidth="1.6"/>
    <path d="M16 15C18.2 15 21 16.5 21 19.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
  </svg>
);
const IconPin = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none">
    <path d="M12 21C12 21 5 14 5 9C5 5.7 8.1 3 12 3C15.9 3 19 5.7 19 9C19 14 12 21 12 21Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/>
    <circle cx="12" cy="9" r="2.5" stroke="currentColor" strokeWidth="1.6"/>
  </svg>
);
const IconEdit = () => (
  <svg viewBox="0 0 24 24" width="15" height="15" fill="none">
    <path d="M11 4H4C2.9 4 2 4.9 2 6V20C2 21.1 2.9 22 4 22H18C19.1 22 20 21.1 20 20V13" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/>
    <path d="M18.5 2.5C19.3 1.7 20.7 1.7 21.5 2.5C22.3 3.3 22.3 4.7 21.5 5.5L12 15L8 16L9 12L18.5 2.5Z" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const IconCheck = () => (
  <svg viewBox="0 0 24 24" width="15" height="15" fill="none">
    <path d="M5 13L9 17L19 7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const IconX = () => (
  <svg viewBox="0 0 24 24" width="15" height="15" fill="none">
    <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);
const IconCheckCircle = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8"/>
    <path d="M8 12L11 15L16 9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

/* ─── Tag catalogue ──────────────────────────────────────── */
const ALL_TAGS = [
  'Outdoors', 'Indoor', 'Online', 'Community', 'Environment',
  'Education', 'Children', 'Seniors', 'Animals', 'Arts',
  'Sports', 'Health', 'Food', 'Construction', 'Advocacy',
];

/* ─── Sample data ─────────────────────────────────────────── */
const INITIAL_EVENT = {
  title: "Community River Cleanup",
  organization: "Springfield Green Initiative",
  description: "Join us for a morning of hands-on environmental stewardship along the Millbrook River trail. We'll collect debris, remove invasive plants, and log data for the city's annual watershed report.\n\nNo experience necessary — all equipment is provided. Wear clothes you don't mind getting muddy, and bring a water bottle. Families are welcome; children 12+ with a guardian.",
  capacity: 40,
  spotsLeft: 12,
  duration: 3,
  address: "Millbrook River Trail Access · Elm St Parking Lot, Springfield, MA 01103",
  lat: 42.1015,
  lng: -72.5898,
  tags: ['Outdoors', 'Environment', 'Community'],
};

/* ─── Toast ───────────────────────────────────────────────── */
function showToast(msg) {
  const el = document.getElementById('toast');
  if (!el) return;
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(window.__toastTimer);
  window.__toastTimer = setTimeout(() => el.classList.remove('show'), 2000);
}

/* ─── Map placeholder ─────────────────────────────────────── */
function MapPlaceholder() {
  return (
    <div style={{
      width: '100%', height: 300, borderRadius: 12,
      overflow: 'hidden', position: 'relative',
      border: '1px solid var(--line)',
    }}>
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block' }}>
        <defs>
          <pattern id="evt-grid" width="28" height="28" patternUnits="userSpaceOnUse">
            <path d="M28 0L0 0 0 28" fill="none" stroke="#d8dbe0" strokeWidth="0.8"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="#eff1f4"/>
        <rect width="100%" height="100%" fill="url(#evt-grid)"/>
        {/* suggestive road lines */}
        <line x1="0" y1="150" x2="100%" y2="150" stroke="white" strokeWidth="10" opacity="0.7"/>
        <line x1="0" y1="150" x2="100%" y2="150" stroke="#d8dbe0" strokeWidth="0.8" opacity="1"/>
        <line x1="220" y1="0" x2="220" y2="100%" stroke="white" strokeWidth="7" opacity="0.6"/>
        <line x1="380" y1="0" x2="360" y2="100%" stroke="white" strokeWidth="5" opacity="0.45"/>
        <line x1="0" y1="70" x2="100%" y2="95" stroke="white" strokeWidth="4" opacity="0.35"/>
        <line x1="0" y1="220" x2="100%" y2="240" stroke="white" strokeWidth="3" opacity="0.25"/>
        {/* pin */}
        <circle cx="50%" cy="50%" r="22" fill="#2d6a4f" opacity="0.12"/>
        <circle cx="50%" cy="50%" r="10" fill="#2d6a4f"/>
        <circle cx="50%" cy="50%" r="4" fill="white"/>
      </svg>
      <div style={{
        position: 'absolute', bottom: 10, left: 10,
        background: 'white', borderRadius: 7, padding: '4px 10px',
        fontSize: 11, fontFamily: "'JetBrains Mono', monospace",
        color: 'var(--ink-500)', boxShadow: '0 2px 8px rgba(0,0,0,.08)',
        letterSpacing: '0.04em',
      }}>map · location preview</div>
    </div>
  );
}

/* ─── Tag chip (view) ────────────────────────────────────── */
function TagChip({ label }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '5px 12px',
      borderRadius: 999,
      fontSize: 12.5, fontWeight: 500,
      background: 'var(--surface-2)',
      border: '1px solid var(--line)',
      color: 'var(--ink-700)',
      letterSpacing: '0.01em',
    }}>{label}</span>
  );
}

/* ─── Tag editor (edit mode) ──────────────────────────────── */
function TagEditor({ selected, onChange }) {
  const MAX = 5;
  const toggle = tag => {
    if (selected.includes(tag)) {
      onChange(selected.filter(t => t !== tag));
    } else if (selected.length < MAX) {
      onChange([...selected, tag]);
    }
  };
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 8 }}>
        <FieldLabel>Tags</FieldLabel>
        <span style={{
          fontSize: 11, fontFamily: "'JetBrains Mono', monospace",
          color: selected.length >= MAX ? 'var(--green-700)' : 'var(--ink-300)',
        }}>{selected.length}/{MAX}</span>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
        {ALL_TAGS.map(tag => {
          const active = selected.includes(tag);
          const disabled = !active && selected.length >= MAX;
          return (
            <button
              key={tag}
              onClick={() => toggle(tag)}
              disabled={disabled}
              style={{
                padding: '6px 13px', borderRadius: 999,
                fontSize: 13, fontWeight: 500, cursor: disabled ? 'not-allowed' : 'pointer',
                border: active ? '1.5px solid var(--green-700)' : '1.5px solid var(--line)',
                background: active ? 'var(--green-700)' : 'white',
                color: active ? 'white' : disabled ? 'var(--ink-300)' : 'var(--ink-700)',
                transition: 'all .14s ease',
                opacity: disabled ? 0.45 : 1,
              }}
            >{tag}</button>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Field helpers ───────────────────────────────────────── */
function FieldLabel({ children }) {
  return <span className="section-label">{children}</span>;
}

function Input({ value, onChange, placeholder, className = '' }) {
  return (
    <input
      className={`field-input ${className}`}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
    />
  );
}

function Textarea({ value, onChange, rows = 6 }) {
  return (
    <textarea
      className="field-input"
      value={value}
      onChange={e => onChange(e.target.value)}
      rows={rows}
      style={{ lineHeight: 1.65 }}
    />
  );
}

function NumberInput({ value, onChange, min = 0, suffix }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <input
        type="number"
        className="field-input"
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        min={min}
        style={{ width: 110 }}
      />
      {suffix && (
        <span style={{ fontSize: 13.5, color: 'var(--ink-500)' }}>{suffix}</span>
      )}
    </div>
  );
}

/* ─── RSVP sidebar card ───────────────────────────────────── */
function RSVPCard({ event, draft, editing, rsvped, onRsvp }) {
  const cap   = editing ? draft.capacity  : event.capacity;
  const dur   = editing ? draft.duration  : event.duration;
  const taken = event.capacity - event.spotsLeft;
  const pct   = Math.min(100, Math.round((taken / Math.max(1, cap)) * 100));

  return (
    <div style={{
      background: 'white', borderRadius: 'var(--radius-card)',
      border: '1px solid var(--line)',
      boxShadow: '0 8px 32px -18px rgba(20,30,25,.15), 0 1px 3px rgba(20,30,25,.04)',
      padding: '26px 24px',
    }}>

      {/* Date */}
      <div style={{ marginBottom: 18, paddingBottom: 18, borderBottom: '1px solid var(--line)' }}>
        <FieldLabel>Date</FieldLabel>
        <div style={{
          fontFamily: "'JetBrains Mono', monospace", fontSize: 13,
          color: 'var(--ink-300)', marginTop: 2,
        }}>TBD — date not yet set</div>
      </div>

      {/* Duration */}
      <div style={{ marginBottom: 18, paddingBottom: 18, borderBottom: '1px solid var(--line)' }}>
        <FieldLabel>Duration</FieldLabel>
        <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink-900)', marginTop: 2 }}>
          {dur} {dur === 1 ? 'hour' : 'hours'}
        </div>
      </div>

      {/* Capacity */}
      <div style={{ marginBottom: 24 }}>
        <FieldLabel>Capacity</FieldLabel>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 2 }}>
          <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink-900)' }}>
            {cap} volunteers
          </span>
          <span style={{ fontSize: 13, color: 'var(--green-700)', fontWeight: 500 }}>
            {event.spotsLeft} spots left
          </span>
        </div>
        {/* Progress bar */}
        <div style={{
          marginTop: 8, height: 5, borderRadius: 99,
          background: 'var(--surface-2)', overflow: 'hidden',
        }}>
          <div style={{
            height: '100%', width: `${pct}%`,
            background: pct > 85 ? '#c0552a' : 'var(--green-700)',
            borderRadius: 99, transition: 'width .4s ease',
          }}/>
        </div>
        <div style={{
          marginTop: 5, fontSize: 11.5, color: 'var(--ink-300)',
          fontFamily: "'JetBrains Mono', monospace",
        }}>{pct}% filled</div>
      </div>

      {/* RSVP button */}
      <button
        className={rsvped ? 'btn ghost' : 'btn'}
        style={{ width: '100%', justifyContent: 'center', fontSize: 14.5 }}
        onClick={onRsvp}
      >
        {rsvped
          ? <><IconX/> Cancel RSVP</>
          : <><IconCheckCircle/> RSVP for this Event</>}
      </button>

      {rsvped && (
        <div style={{
          marginTop: 12, textAlign: 'center',
          fontSize: 12.5, color: 'var(--green-700)', fontWeight: 500,
          fontFamily: "'JetBrains Mono', monospace",
        }}>
          ✓ You're registered
        </div>
      )}
    </div>
  );
}

/* ─── Main page ───────────────────────────────────────────── */
function EventPage() {
  const [editing, setEditing]   = useState(false);
  const [event,   setEvent]     = useState(INITIAL_EVENT);
  const [draft,   setDraft]     = useState(INITIAL_EVENT);
  const [rsvped,  setRsvped]    = useState(false);

  const set = key => val => setDraft(d => ({ ...d, [key]: val }));

  const startEdit  = ()  => { setDraft({ ...event }); setEditing(true); };
  const cancelEdit = ()  => { setEditing(false); };
  const saveEdit   = ()  => { setEvent({ ...draft }); setEditing(false); showToast('Event saved.'); };

  const handleRsvp = () => {
    setRsvped(r => !r);
    showToast(rsvped ? 'RSVP cancelled.' : "You're signed up!");
  };

  return (
    <div className="page">
      <Header/>

      {/* ── Edit mode banner ── */}
      {editing && (
        <div className="edit-banner" role="status">
          <div className="edit-banner-label">
            <span className="edit-banner-dot"/>
            Editing event
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn sm danger-ghost" onClick={cancelEdit}>
              <IconX/> Discard
            </button>
            <button className="btn sm" onClick={saveEdit}>
              <IconCheck/> Save Changes
            </button>
          </div>
        </div>
      )}

      {/* ── Breadcrumb ── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: editing ? '0 0 24px' : '6px 0 24px',
        fontSize: 13, color: 'var(--ink-500)',
      }}>
        <a href="index.html" style={{ color: 'var(--ink-500)' }}>Home</a>
        <span style={{ color: 'var(--ink-300)' }}>/</span>
        <span style={{ color: 'var(--ink-500)' }}>Events</span>
        <span style={{ color: 'var(--ink-300)' }}>/</span>
        <span style={{ color: 'var(--ink-700)', fontWeight: 500 }}>
          {editing ? draft.title || 'Untitled event' : event.title}
        </span>
      </div>

      {/* ── Hero image ── */}
      <div style={{
        width: '100%', height: 420,
        borderRadius: 'var(--radius-card)',
        overflow: 'hidden', marginBottom: 36,
        background: '#d0d4d9', position: 'relative',
      }}>
        <image-slot
          id="event-hero"
          shape="rect"
          placeholder="event hero photo"
          style={{ width: '100%', height: '100%', display: 'block' }}
        ></image-slot>

        {/* Org badge */}
        <div style={{
          position: 'absolute', bottom: 20, left: 24,
          background: 'rgba(255,255,255,0.92)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          borderRadius: 10, padding: '8px 16px',
          display: 'flex', alignItems: 'center', gap: 8,
          fontSize: 13.5, fontWeight: 500, color: 'var(--ink-700)',
          boxShadow: '0 2px 10px rgba(0,0,0,.08)',
        }}>
          <LeafLogo size={20}/>
          {event.organization}
        </div>
      </div>

      {/* ── Two-column layout ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 340px',
        gap: 36,
        alignItems: 'start',
        marginBottom: 80,
      }}>

        {/* ─── LEFT COLUMN ─── */}
        <div>

          {/* Title row */}
          <div style={{
            display: 'flex', alignItems: 'flex-start',
            justifyContent: 'space-between', gap: 20, marginBottom: 20,
          }}>
            {editing ? (
              <div style={{ flex: 1 }}>
                <FieldLabel>Event Title</FieldLabel>
                <Input
                  value={draft.title}
                  onChange={set('title')}
                  placeholder="Event name"
                  className="large"
                />
              </div>
            ) : (
              <h1 style={{
                margin: 0, fontSize: 36, fontWeight: 600,
                lineHeight: 1.15, letterSpacing: '-0.018em',
                color: 'var(--ink-900)', maxWidth: 640,
                textWrap: 'pretty',
              }}>
                {event.title}
              </h1>
            )}

            {!editing && (
              <button
                className="btn ghost sm"
                onClick={startEdit}
                style={{ flexShrink: 0, marginTop: 8 }}
              >
                <IconEdit/> Edit Event
              </button>
            )}
          </div>

          {/* Meta pills + tags — view mode only */}
          {!editing && (
            <>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
                <span className="meta-pill muted">
                  <IconCalendar/> Date TBD
                </span>
                <span className="meta-pill outline">
                  <IconClock/> {event.duration} {event.duration === 1 ? 'hr' : 'hrs'}
                </span>
                <span className="meta-pill filled">
                  <IconUsers/> {event.spotsLeft} spots left of {event.capacity}
                </span>
              </div>
              {event.tags && event.tags.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 28 }}>
                  {event.tags.map(tag => <TagChip key={tag} label={tag}/>)}
                </div>
              )}
            </>
          )}

          {/* Description */}
          <div style={{ marginBottom: 28 }}>
            {editing ? (
              <>
                <FieldLabel>Description</FieldLabel>
                <Textarea value={draft.description} onChange={set('description')} rows={7}/>
              </>
            ) : (
              <div style={{ color: 'var(--ink-700)', fontSize: 15.5, lineHeight: 1.72 }}>
                {event.description.split('\n\n').map((para, i) => (
                  <p key={i} style={{ margin: '0 0 18px' }}>{para}</p>
                ))}
              </div>
            )}
          </div>

          {/* Address block */}
          <div style={{
            background: 'var(--surface-2)', borderRadius: 14,
            padding: '20px 22px',
            display: 'flex', alignItems: 'flex-start', gap: 14,
            marginBottom: editing ? 20 : 0,
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10, flexShrink: 0,
              background: 'white', display: 'grid', placeItems: 'center',
              color: 'var(--green-700)',
              boxShadow: '0 1px 4px rgba(0,0,0,.06)',
            }}>
              <IconPin/>
            </div>
            <div style={{ flex: 1 }}>
              <FieldLabel>Location</FieldLabel>
              {editing ? (
                <Input
                  value={draft.address}
                  onChange={set('address')}
                  placeholder="Full street address"
                />
              ) : (
                <div style={{ fontSize: 15, color: 'var(--ink-700)', fontWeight: 500, marginTop: 3 }}>
                  {event.address}
                </div>
              )}
            </div>
          </div>

          {/* Tags editor — edit mode */}
          {editing && (
            <div style={{ marginTop: 20 }}>
              <TagEditor
                selected={draft.tags || []}
                onChange={val => setDraft(d => ({ ...d, tags: val }))}
              />
            </div>
          )}

          {/* Edit-only fields: duration, capacity, date */}
          {editing && (
            <>
              <div style={{
                display: 'grid', gridTemplateColumns: '1fr 1fr',
                gap: 20, marginBottom: 20,
              }}>
                <div>
                  <FieldLabel>Duration</FieldLabel>
                  <NumberInput
                    value={draft.duration}
                    onChange={set('duration')}
                    min={0.5}
                    suffix="hours"
                  />
                </div>
                <div>
                  <FieldLabel>Capacity</FieldLabel>
                  <NumberInput
                    value={draft.capacity}
                    onChange={set('capacity')}
                    min={1}
                    suffix="volunteers"
                  />
                </div>
              </div>

              <div>
                <FieldLabel>Date &amp; Time</FieldLabel>
                <div
                  className="field-input disabled mono"
                  style={{ pointerEvents: 'none' }}
                >
                  Date picker — coming soon
                </div>
              </div>
            </>
          )}
        </div>

        {/* ─── RIGHT COLUMN ─── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* RSVP card */}
          <RSVPCard
            event={event}
            draft={draft}
            editing={editing}
            rsvped={rsvped}
            onRsvp={handleRsvp}
          />

          {/* Map card */}
          <div style={{
            background: 'white', borderRadius: 'var(--radius-card)',
            border: '1px solid var(--line)',
            boxShadow: '0 4px 16px -10px rgba(20,30,25,.09)',
            padding: '18px 18px 16px',
          }}>
            <FieldLabel>Map</FieldLabel>
            <div style={{ marginBottom: 12 }}>
              <MapPlaceholder/>
            </div>
            <div style={{
              display: 'flex', alignItems: 'flex-start', gap: 6,
              fontSize: 12.5, color: 'var(--ink-500)', lineHeight: 1.5,
            }}>
              <span style={{ flexShrink: 0, marginTop: 1, color: 'var(--green-700)' }}>
                <IconPin/>
              </span>
              <span>
                {editing ? draft.address || 'No address set' : event.address}
              </span>
            </div>

            {/* Coords note */}
            <div style={{
              marginTop: 10, paddingTop: 10,
              borderTop: '1px solid var(--line)',
              display: 'flex', gap: 16,
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 11, color: 'var(--ink-300)',
            }}>
              <span>lat {event.lat}</span>
              <span>lng {event.lng}</span>
            </div>
          </div>
        </div>
      </div>

      <Footer/>
    </div>
  );
}

/* ─── Tweaks ──────────────────────────────────────────────── */
const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "primary": "#2d6a4f",
  "accent": "#95d558",
  "heroHeight": 420
}/*EDITMODE-END*/;

function TweaksUI() {
  if (!window.useTweaks || !window.TweaksPanel) return null;
  const [t, setTweak] = window.useTweaks(TWEAK_DEFAULTS);

  useEffect(() => {
    document.documentElement.style.setProperty('--green-700', t.primary);
    document.documentElement.style.setProperty('--lime-400', t.accent);
    document.documentElement.style.setProperty('--green-900',
      t.primary === '#2d6a4f' ? '#1f4f3a' : t.primary);
    const hero = document.querySelector('[id="event-hero"]')?.parentElement;
    if (hero) hero.style.height = t.heroHeight + 'px';
  }, [t.primary, t.accent, t.heroHeight]);

  const TP     = window.TweaksPanel;
  const TS     = window.TweakSection;
  const TColor = window.TweakColor;
  const TSlider = window.TweakSlider;

  return (
    <TP title="Tweaks">
      <TS title="Color">
        <TColor label="Primary" value={t.primary}
          options={['#2d6a4f','#1d4d6b','#5a3a8a','#8a4a2c']}
          onChange={v => setTweak('primary', v)}/>
        <TColor label="Accent" value={t.accent}
          options={['#95d558','#f5c64f','#6cc7d8','#e89a8a']}
          onChange={v => setTweak('accent', v)}/>
      </TS>
      <TS title="Layout">
        <TSlider label="Hero height" value={t.heroHeight} min={240} max={640} step={20}
          onChange={v => setTweak('heroHeight', v)}/>
      </TS>
    </TP>
  );
}

/* ─── Root ────────────────────────────────────────────────── */
function App() {
  return (
    <>
      <EventPage/>
      <TweaksUI/>
    </>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
