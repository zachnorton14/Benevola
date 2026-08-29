import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import Shell from '../Shell';
import { Arrow, Btn, Eyebrow, Field, Meta, PasswordInput, TextInput, Tick } from '../parts';
import { useAuth } from '../../../context/AuthContext';
import { API } from '../../../data/api';

const POINTS = {
  login: {
    volunteer: [
      'Every opportunity and hour you have logged, in one place',
      'A verified impact record you can hand to anyone',
      'Matches drawn from your own skills and causes',
    ],
    organization: [
      'Your events and volunteer roster, together',
      'Hours tracked and totalled without a spreadsheet',
      'Reach volunteers who already live nearby',
    ],
  },
  signup: {
    volunteer: [
      'Browse verified opportunities within a radius you set',
      'Log hours and build a portable impact record',
      'Free to join, no card, no trial clock',
    ],
    organization: [
      'List an event in under three minutes',
      'Reach volunteers who are already active in your area',
      'A verified profile that builds trust with donors',
    ],
  },
};

function RoleSwitch({ role, onChange }) {
  return (
    <div className="vsp-roleswitch" role="group" aria-label="Account type">
      <button
        type="button"
        className={role === 'volunteer' ? 'is-on' : ''}
        onClick={() => onChange('volunteer')}
      >
        Volunteer
      </button>
      <button
        type="button"
        className={role === 'organization' ? 'is-on' : ''}
        onClick={() => onChange('organization')}
      >
        Organization
      </button>
    </div>
  );
}

function AuthFrame({ eyebrow, title, points, children }) {
  return (
    <Shell bare>
      <div className="vsp-auth">
        <aside className="vsp-auth-aside">
          <div>
            <Eyebrow tone="clay">{eyebrow}</Eyebrow>
            <h2>{title}</h2>
            <ul className="vsp-auth-points">
              {points.map((p, i) => <li key={i}><Tick /><span>{p}</span></li>)}
            </ul>
          </div>
          <Meta>Benevola · Built for good · 2026</Meta>
        </aside>

        <div className="vsp-auth-main">
          <div className="vsp-auth-form">{children}</div>
        </div>
      </div>
    </Shell>
  );
}

/* ── Log in ─────────────────────────────────────────────────────────── */
export function Login() {
  const { refresh } = useAuth();
  const navigate  = useNavigate();
  const [role,   setRole]   = useState('volunteer');
  const [form,   setForm]   = useState({ identifier: '', password: '' });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [loading,  setLoading]  = useState(false);

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));
  const switchRole = r => { setRole(r); setErrors({}); setApiError(''); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!form.identifier.trim()) errs.identifier = 'Enter your email or username';
    if (!form.password)          errs.password   = 'Enter your password';
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    setApiError('');

    const url = role === 'organization'
      ? `${API}/api/auth/login/org`
      : `${API}/api/auth/login/user`;

    /* Orgs only ever sign in by email; volunteers may type either. */
    const identifier = form.identifier.trim();
    const credentialField = (role !== 'organization' && !identifier.includes('@'))
      ? { username: identifier }
      : { email: identifier };

    try {
      const res  = await fetch(url, {
        method:      'POST',
        headers:     { 'Content-Type': 'application/json' },
        credentials: 'include',
        body:        JSON.stringify({ ...credentialField, password: form.password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setApiError(data.message || data.error || 'That combination did not work. Try again.');
        setLoading(false);
        return;
      }

      /* The session cookie is what actually signs you in, so read the account
         back from the server: it confirms the cookie stuck and returns the full
         record (the login response only echoes a summary). */
      const me = await refresh().catch(() => null);

      if (!me) {
        setApiError('Signed in, but your browser did not keep the session. Check that cookies are enabled for this site.');
        setLoading(false);
        return;
      }

      navigate('/');
    } catch {
      setApiError('Could not reach the server. Check your connection.');
      setLoading(false);
    }
  };

  return (
    <AuthFrame
      eyebrow={role === 'organization' ? 'For organizations' : 'For volunteers'}
      title={role === 'organization' ? 'Run your organization from one page.' : 'Good to see you again.'}
      points={POINTS.login[role]}
    >
      <Eyebrow tone="clay">Welcome back</Eyebrow>
      <h1 className="vsp-h1">Log in</h1>
      <p>Pick up wherever you left off.</p>

      <RoleSwitch role={role} onChange={switchRole} />

      <form onSubmit={handleSubmit} noValidate>
        <Field label="Email or username" error={errors.identifier}>
          <TextInput
            type="text"
            value={form.identifier}
            onChange={set('identifier')}
            error={errors.identifier}
            autoComplete="username"
            placeholder={role === 'organization' ? 'org@example.com' : 'you@example.com'}
          />
        </Field>

        <Field label="Password" error={errors.password}>
          <PasswordInput
            value={form.password}
            onChange={set('password')}
            error={errors.password}
            autoComplete="current-password"
            placeholder="Your password"
          />
        </Field>

        <Link className="vsp-forgot" to="/forgot-password">Forgot your password?</Link>

        {apiError && <div className="vsp-auth-err">{apiError}</div>}

        <Btn type="submit" block disabled={loading}>
          {loading ? 'Logging in…' : <>Log in <Arrow /></>}
        </Btn>
      </form>

      <p className="vsp-auth-foot">
        No account yet? <Link to="/signup">Create one</Link>
      </p>
    </AuthFrame>
  );
}

/* ── Sign up ────────────────────────────────────────────────────────── */
export function Signup() {
  const { refresh } = useAuth();
  const navigate  = useNavigate();
  const [params]  = useSearchParams();

  const [role, setRole] = useState(
    params.get('role') === 'organization' ? 'organization' : 'volunteer'
  );
  const [form, setForm] = useState({
    username: '', email: '', password: '', confirmPassword: '',
    description: '', phone: '', address: '',
  });
  const [errors,   setErrors]   = useState({});
  const [apiError, setApiError] = useState('');
  const [loading,  setLoading]  = useState(false);

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!form.username.trim())                  errs.username        = 'Pick a username';
    if (!form.email.includes('@'))              errs.email           = 'Enter a valid email address';
    if (form.password.length < 8)               errs.password        = 'Use at least 8 characters';
    if (form.password !== form.confirmPassword) errs.confirmPassword = 'These two do not match';
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    setApiError('');

    const url = role === 'organization'
      ? `${API}/api/auth/register/org`
      : `${API}/api/auth/register/user`;

    try {
      const res  = await fetch(url, {
        method:      'POST',
        headers:     { 'Content-Type': 'application/json' },
        credentials: 'include',
        body:        JSON.stringify({
          username: form.username,
          email:    form.email,
          password: form.password,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        const raw = data.message || data.error || '';
        setApiError(/unique constraint/i.test(raw)
          ? 'That username or email is already taken. Try another.'
          : raw || 'Registration failed. Please try again.');
        setLoading(false);
        return;
      }

      /* Registration signs you in via a session cookie — read the account back
         from the server so we store the real record, and so a cookie that never
         stuck is caught here instead of looking signed in but acting logged out. */
      const me = await refresh().catch(() => null);

      if (!me) {
        setApiError('Account created, but your browser did not keep the session. Check that cookies are enabled, then log in.');
        setLoading(false);
        return;
      }

      navigate('/');
    } catch {
      setApiError('Could not reach the server. Check your connection.');
      setLoading(false);
    }
  };

  return (
    <AuthFrame
      eyebrow={role === 'organization' ? 'For organizations' : 'For volunteers'}
      title={role === 'organization' ? 'Grow your volunteer network.' : 'Find your people.'}
      points={POINTS.signup[role]}
    >
      <Eyebrow tone="clay">New here</Eyebrow>
      <h1 className="vsp-h1">Create account</h1>
      <p>Free to join. About a minute of your time.</p>

      <RoleSwitch role={role} onChange={r => { setRole(r); setErrors({}); }} />

      <form onSubmit={handleSubmit} noValidate>
        <Field label="Username" error={errors.username}>
          <TextInput
            value={form.username}
            onChange={set('username')}
            error={errors.username}
            autoComplete="username"
            placeholder={role === 'organization' ? 'green_future' : 'janesmith'}
          />
        </Field>

        <Field label="Email" error={errors.email}>
          <TextInput
            type="email"
            value={form.email}
            onChange={set('email')}
            error={errors.email}
            placeholder="you@example.com"
          />
        </Field>

        <Field label="Password" error={errors.password}>
          <PasswordInput
            value={form.password}
            onChange={set('password')}
            error={errors.password}
            placeholder="8 characters or more"
          />
        </Field>

        <Field label="Confirm password" error={errors.confirmPassword}>
          <PasswordInput
            value={form.confirmPassword}
            onChange={set('confirmPassword')}
            error={errors.confirmPassword}
            placeholder="Type it once more"
          />
        </Field>

        {role === 'organization' && (
          <div>
            <div className="vsp-org-extra-head">
              <Eyebrow>Organization details</Eyebrow>
              <Eyebrow tone="clay">All optional</Eyebrow>
            </div>

            <Field label="Description">
              <textarea
                className="vsp-field"
                rows={4}
                value={form.description}
                onChange={set('description')}
                placeholder="What your organization does, and what you care about."
              />
            </Field>

            <div className="vsp-edit-pair">
              <Field label="Phone">
                <TextInput type="tel" value={form.phone} onChange={set('phone')} placeholder="+1 555 000 0000" />
              </Field>
              <Field label="Address">
                <TextInput value={form.address} onChange={set('address')} placeholder="City, State" />
              </Field>
            </div>
          </div>
        )}

        {apiError && <div className="vsp-auth-err">{apiError}</div>}

        <Btn type="submit" block disabled={loading}>
          {loading ? 'Creating account…' : <>Create account <Arrow /></>}
        </Btn>
      </form>

      <p className="vsp-auth-foot">
        Already have an account? <Link to="/login">Log in</Link>
      </p>
    </AuthFrame>
  );
}
