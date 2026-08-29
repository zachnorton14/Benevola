import React, { useState, useEffect, useRef } from 'react';
import { uploadImage, uploadsEnabled, describeApiError } from '../data/api';
import './ui.css';

/* An image field that accepts either an upload or a pasted URL.

   Both end up as the same thing on the record: a URL string. That keeps the
   API unchanged and means the field still works when no storage bucket is
   configured, which is how the project runs by default.

   Styled from the --ui-* bridge, so it looks at home in every design. */

const MAX_MB = 5;

export default function ImageField({ value, onChange, kind, label = 'Image', hint }) {
  const [enabled, setEnabled] = useState(false);
  const [busy, setBusy]       = useState(false);
  const [error, setError]     = useState('');
  const inputRef              = useRef(null);

  useEffect(() => {
    let alive = true;
    uploadsEnabled().then(on => { if (alive) setEnabled(on); });
    return () => { alive = false; };
  }, []);

  const pick = async (e) => {
    const file = e.target.files?.[0];
    // Let the same file be chosen again after a failure.
    e.target.value = '';
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Choose an image file.');
      return;
    }
    if (file.size > MAX_MB * 1024 * 1024) {
      setError(`That image is ${(file.size / 1024 / 1024).toFixed(1)}MB. The limit is ${MAX_MB}MB.`);
      return;
    }

    setBusy(true);
    setError('');
    try {
      onChange(await uploadImage(file, kind));
    } catch (err) {
      setError(describeApiError(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="ui-row">
      <label className="ui-label">{label}</label>

      {value && (
        <div className="ui-imgpreview">
          <img src={value} alt="" />
          <button
            type="button"
            className="ui-imgpreview-x"
            onClick={() => onChange('')}
            aria-label="Remove image"
          >
            Remove
          </button>
        </div>
      )}

      {enabled && (
        <div className="ui-imgactions">
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
            onChange={pick}
            style={{ display: 'none' }}
          />
          <button
            type="button"
            className="ui-btn ui-btn--ghost"
            onClick={() => inputRef.current?.click()}
            disabled={busy}
          >
            {busy ? 'Uploading…' : value ? 'Replace image' : 'Upload an image'}
          </button>
          <span className="ui-note">JPEG, PNG, WebP, GIF or AVIF. Up to {MAX_MB}MB.</span>
        </div>
      )}

      <input
        className="ui-field"
        value={value ?? ''}
        onChange={e => onChange(e.target.value)}
        placeholder={enabled ? '…or paste an image URL' : 'https://…'}
        style={{ marginTop: enabled ? 10 : 0 }}
      />

      {error && <span className="ui-err">{error}</span>}
      {!error && hint && <span className="ui-note">{hint}</span>}
    </div>
  );
}
