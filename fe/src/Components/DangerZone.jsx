import React, { useState, useEffect, useRef } from 'react';
import './DangerZone.css';

/* A destructive action that asks twice.

   The first click arms it, the second carries it out, and it disarms itself
   after a few seconds of hesitation — so an irreversible action is never one
   stray click away, without resorting to a browser confirm() dialog.

   Design-agnostic on purpose: every variant shares this one component, since
   "are you sure" should not drift between designs. */

export default function DangerZone({
  title,
  description,
  actionLabel,
  confirmLabel = 'Yes, delete permanently',
  busyLabel = 'Deleting…',
  busy = false,
  onConfirm,
  disarmAfter = 6000,
}) {
  const [armed, setArmed] = useState(false);
  const timer = useRef(null);

  useEffect(() => () => clearTimeout(timer.current), []);

  const arm = () => {
    setArmed(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setArmed(false), disarmAfter);
  };

  const disarm = () => {
    clearTimeout(timer.current);
    setArmed(false);
  };

  return (
    <section className="danger-zone" aria-label={title}>
      <div className="danger-zone-copy">
        <h3 className="danger-zone-title">{title}</h3>
        {description && <p className="danger-zone-desc">{description}</p>}
      </div>

      {!armed ? (
        <button type="button" className="danger-zone-btn" onClick={arm} disabled={busy}>
          {actionLabel}
        </button>
      ) : (
        <div className="danger-zone-confirm" role="alertdialog" aria-live="assertive">
          <span className="danger-zone-warn">This cannot be undone.</span>
          <div className="danger-zone-actions">
            <button type="button" className="danger-zone-cancel" onClick={disarm} disabled={busy}>
              Cancel
            </button>
            <button
              type="button"
              className="danger-zone-btn danger-zone-btn--solid"
              onClick={onConfirm}
              disabled={busy}
              autoFocus
            >
              {busy ? busyLabel : confirmLabel}
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
