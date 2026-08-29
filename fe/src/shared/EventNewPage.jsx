import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  PageFrame, Field, TextInput, TextArea, Btn, Banner, StateBlock,
  AddressField, TagPicker, MapPicker,
} from './parts';
import ImageField from './ImageField';
import { useAuth } from '../context/AuthContext';
import { useTags } from '../data/hooks';
import { createEvent, describeApiError } from '../data/api';

/* Posting an event. Shared across designs: the form is the same job whichever
   theme is mounted, and it picks up that theme's colour and type from ui.css. */

const BLANK = {
  title: '', description: '', address: '', tags: [],
  duration: 2, capacity: 10, date: '',
  lat: null, lng: null, heroImage: '',
};

export default function EventNewPage() {
  const { id }   = useParams();
  const navigate = useNavigate();
  const tags     = useTags();
  const { auth, ready, isOrg, userId } = useAuth();

  const [draft,    setDraft]    = useState(BLANK);
  const [errors,   setErrors]   = useState({});
  const [apiError, setApiError] = useState('');
  const [saving,   setSaving]   = useState(false);

  const set   = (key, value) => setDraft(d => ({ ...d, [key]: value }));
  const patch = values       => setDraft(d => ({ ...d, ...values }));

  /* Wait for the session check, otherwise a signed-in organizer is told to log
     in for a moment on every refresh. */
  if (!ready) {
    return <PageFrame><StateBlock title="One moment">Checking your session.</StateBlock></PageFrame>;
  }

  if (!auth) {
    return (
      <PageFrame>
        <StateBlock title="Not signed in">
          You need an organization account to post an event.
        </StateBlock>
        <div className="ui-actions">
          <Link to="/login"><Btn>Log in</Btn></Link>
        </div>
      </PageFrame>
    );
  }

  if (!isOrg || String(userId) !== String(id)) {
    return (
      <PageFrame>
        <StateBlock error title="You cannot post for this organization">
          Events can only be posted by the organization that owns them.
        </StateBlock>
        <div className="ui-actions">
          <Link to={`/organizations/${id}`}><Btn variant="ghost">Back to the organization</Btn></Link>
        </div>
      </PageFrame>
    );
  }

  const validate = () => {
    const e = {};
    if (!draft.title.trim())                    e.title   = 'Give the event a title';
    if (draft.lat == null || draft.lng == null) e.address = 'Pick a location from the suggestions, or tap the map';
    if (!draft.date)                            e.date    = 'Choose when it happens';
    return e;
  };

  const submit = async (ev) => {
    ev.preventDefault();
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length) return;

    setSaving(true);
    setApiError('');
    try {
      const created = await createEvent(id, draft);
      navigate(`/events/${created.id}`);
    } catch (err) {
      setApiError(describeApiError(err));
      setSaving(false);
    }
  };

  return (
    <PageFrame>
      <span className="ui-eyebrow">New posting</span>
      <h1 className="ui-h1">Post an event</h1>
      <p className="ui-lede">Volunteers will find this in search once it is live.</p>

      <form onSubmit={submit} noValidate>
        <Field label="Event title" error={errors.title}>
          <TextInput
            value={draft.title}
            onChange={e => set('title', e.target.value)}
            error={errors.title}
            placeholder="Riverside clean-up"
          />
        </Field>

        <Field label="Description" hint="What volunteers will do, what to bring, who to ask for.">
          <TextArea
            rows={6}
            value={draft.description}
            onChange={e => set('description', e.target.value)}
          />
        </Field>

        <Field label="Location" error={errors.address}>
          <AddressField
            value={draft.address}
            onTextChange={val => set('address', val)}
            onPick={(label, plat, plng) => patch({ address: label, lat: plat, lng: plng })}
          />
        </Field>

        <MapPicker
          lat={draft.lat}
          lng={draft.lng}
          address={draft.address}
          onPick={(label, plat, plng) => patch({
            lat: plat,
            lng: plng,
            ...(label ? { address: label } : {}),
          })}
        />

        <Field label="Causes">
          <TagPicker
            tags={tags.tags}
            loading={tags.loading}
            selected={draft.tags}
            onToggle={slug => set(
              'tags',
              draft.tags.includes(slug)
                ? draft.tags.filter(s => s !== slug)
                : [...draft.tags, slug]
            )}
          />
        </Field>

        <div className="ui-pair">
          <Field label="Duration (hours)">
            <TextInput
              type="number"
              min={0.5}
              step={0.5}
              value={draft.duration}
              onChange={e => set('duration', Number(e.target.value))}
            />
          </Field>
          <Field label="Capacity (volunteers)" hint="Leave empty for no limit.">
            <TextInput
              type="number"
              min={1}
              value={draft.capacity}
              onChange={e => set('capacity', Number(e.target.value))}
            />
          </Field>
        </div>

        <Field label="Date and time" error={errors.date}>
          <TextInput
            type="datetime-local"
            value={draft.date ? draft.date.slice(0, 16) : ''}
            onChange={e => set('date', e.target.value ? new Date(e.target.value).toISOString() : '')}
            error={errors.date}
          />
        </Field>

        <ImageField
          label="Event photo"
          kind="event-image"
          value={draft.heroImage}
          onChange={url => set('heroImage', url)}
          hint="Optional. A photo helps volunteers picture the day."
        />

        {apiError && <Banner>{apiError}</Banner>}

        <div className="ui-actions">
          <Btn type="submit" disabled={saving}>{saving ? 'Posting…' : 'Post event'}</Btn>
          <Link to={`/organizations/${id}`}><Btn type="button" variant="ghost">Cancel</Btn></Link>
        </div>
      </form>
    </PageFrame>
  );
}
