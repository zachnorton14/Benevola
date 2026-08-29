import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import Shell, { Btn, Field, Input, Panel } from '../parts';
import { PasswordInput } from '../../../shared/parts';
import { useAuth } from '../../../context/AuthContext';
import { API } from '../../../data/api';

/* Log in and sign up. Both post to the API, then read the account back from
   the server: that confirms the session cookie actually stuck, rather than
   trusting the response body and looking signed in while acting logged out. */

function Switch({ role, onChange }) {
  return (
    <div className="atl-chiprow" style={{ marginBottom: 20 }}>
      {[['volunteer', 'Volunteer'], ['organization', 'Organization']].map(([value, label]) => (
        <button
          key={value}
          type="button"
          className={'atl-chip' + (role === value ? ' atl-chip--accent' : '')}
          style={{ cursor: 'pointer', padding: '6px 13px' }}
          onClick={() => onChange(value)}
          aria-pressed={role === value}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

function Frame({ title, sub, children }) {
  return (
    <Shell>
      <div className="atl-shell" style={{ maxWidth: 440 }}>
        <h1 className="atl-h1" style={{ marginTop: 18 }}>{title}</h1>
        <p className="atl-sub" style={{ marginBottom: 26 }}>{sub}</p>
        <Panel pad float>{children}</Panel>
      </div>
    </Shell>
  );
}

export function Login() {
  const { refresh } = useAuth();
  const navigate    = useNavigate();
  const [role, setRole]         = useState('volunteer');
  const [form, setForm]         = useState({ identifier: '', password: '' });
  const [errors, setErrors]     = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading]   = useState(false);

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!form.identifier.trim()) errs.identifier = 'Enter your email or username';
    if (!form.password)          errs.password   = 'Enter your password';
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setLoading(true);
    setApiError('');

    const url = role === 'organization'
      ? `${API}/api/auth/login/org`
      : `${API}/api/auth/login/user`;

    /* Organizations only ever sign in by email; volunteers may type either. */
    const identifier = form.identifier.trim();
    const credential = (role !== 'organization' && !identifier.includes('@'))
      ? { username: identifier }
      : { email: identifier };

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ ...credential, password: form.password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setApiError(data.message || data.error || 'That combination did not work.');
        setLoading(false);
        return;
      }

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
    <Frame title="Log in" sub="Pick up wherever you left off.">
      <Switch role={role} onChange={r => { setRole(r); setErrors({}); setApiError(''); }} />

      <form onSubmit={submit} noValidate>
        <Field label="Email or username" error={errors.identifier}>
          <Input
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

        <Link className="atl-link" style={{ fontSize: '0.84rem' }} to="/forgot-password">
          Forgot your password?
        </Link>

        {apiError && (
          <p className="atl-field-err" style={{ marginTop: 14 }}>{apiError}</p>
        )}

        <Btn block type="submit" disabled={loading} style={{ marginTop: 18 }}>
          {loading ? 'Logging in…' : 'Log in'}
        </Btn>
      </form>

      <p className="atl-muted" style={{ marginTop: 18, textAlign: 'center' }}>
        No account yet? <Link className="atl-link" to="/signup">Create one</Link>
      </p>
    </Frame>
  );
}

export function Signup() {
  const { refresh } = useAuth();
  const navigate    = useNavigate();
  const [params]    = useSearchParams();

  const [role, setRole] = useState(
    params.get('role') === 'organization' ? 'organization' : 'volunteer'
  );
  const [form, setForm] = useState({ username: '', email: '', password: '', confirmPassword: '' });
  const [errors, setErrors]     = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading]   = useState(false);

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!form.username.trim())                  errs.username        = 'Pick a name';
    if (!form.email.includes('@'))              errs.email           = 'Enter a valid email address';
    if (form.password.length < 8)               errs.password        = 'Use at least 8 characters';
    if (form.password !== form.confirmPassword) errs.confirmPassword = 'These two do not match';
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setLoading(true);
    setApiError('');

    const url = role === 'organization'
      ? `${API}/api/auth/register/org`
      : `${API}/api/auth/register/user`;

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          username: form.username,
          email: form.email,
          password: form.password,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        const raw = data.message || data.error || '';
        setApiError(/unique constraint/i.test(raw)
          ? 'That name or email is already taken. Try another.'
          : raw || 'Registration failed. Please try again.');
        setLoading(false);
        return;
      }

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
    <Frame
      title="Create account"
      sub={role === 'organization'
        ? 'Post shifts and manage your volunteer roster.'
        : 'Free to join. About a minute of your time.'}
    >
      <Switch role={role} onChange={r => { setRole(r); setErrors({}); }} />

      <form onSubmit={submit} noValidate>
        <Field
          label={role === 'organization' ? 'Organization name' : 'Username'}
          error={errors.username}
          hint={role === 'organization' ? 'Shown to volunteers on your postings.' : 'Letters, numbers and underscores.'}
        >
          <Input
            value={form.username}
            onChange={set('username')}
            error={errors.username}
            autoComplete="username"
            placeholder={role === 'organization' ? 'green_future' : 'janesmith'}
          />
        </Field>

        <Field label="Email" error={errors.email}>
          <Input
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
            autoComplete="new-password"
          />
        </Field>

        <Field label="Confirm password" error={errors.confirmPassword}>
          <PasswordInput
            value={form.confirmPassword}
            onChange={set('confirmPassword')}
            error={errors.confirmPassword}
            placeholder="Type it once more"
            autoComplete="new-password"
          />
        </Field>

        {apiError && <p className="atl-field-err">{apiError}</p>}

        <Btn block type="submit" disabled={loading} style={{ marginTop: 8 }}>
          {loading ? 'Creating account…' : 'Create account'}
        </Btn>
      </form>

      <p className="atl-muted" style={{ marginTop: 18, textAlign: 'center' }}>
        Already have an account? <Link className="atl-link" to="/login">Log in</Link>
      </p>
    </Frame>
  );
}
