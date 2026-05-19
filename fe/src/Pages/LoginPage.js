import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/Auth.css';

import Header from '../Components/Header';
import Footer from '../Components/Footer';
import { LeafLogo, ArrowRight, EyeIcon } from '../Components/Icons';
import { useAuth } from '../context/AuthContext';

const FEATURES = {
  volunteer: [
    'All your opportunities and hours in one place',
    'Verified impact history, ready to share',
    'Matches based on your skills and causes',
  ],
  organization: [
    'Manage your events and volunteer roster',
    'Track hours and measure your impact',
    'Reach active volunteers in your area',
  ],
};

function CheckItem({ text }) {
  return (
    <li>
      <svg viewBox="0 0 18 18" width="16" height="16" fill="none" style={{ flexShrink: 0, marginTop: 2 }}>
        <circle cx="9" cy="9" r="8" fill="rgba(149,213,88,0.22)" />
        <path d="M5.5 9L7.5 11L12.5 6.5" stroke="#95d558" strokeWidth="1.5"
              strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span>{text}</span>
    </li>
  );
}

function Field({ label, required, error, children }) {
  return (
    <div className="form-field">
      <label className="form-label">
        {label}{required && <span className="req-star"> *</span>}
      </label>
      {children}
      {error && <span className="field-error">{error}</span>}
    </div>
  );
}

function LoginPage() {
  const { login }           = useAuth();
  const navigate            = useNavigate();
  const [role, setRole]     = useState('volunteer');
  const [form, setForm]     = useState({ identifier: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading]   = useState(false);

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const switchRole = (r) => { setRole(r); setErrors({}); setApiError(''); };

  const validate = () => {
    const e = {};
    if (!form.identifier.trim()) e.identifier = 'Email or username is required';
    if (!form.password)          e.password   = 'Password is required';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    setApiError('');

    const url = role === 'organization'
      ? `${process.env.REACT_APP_API_URL}/api/auth/login/org`
      : `${process.env.REACT_APP_API_URL}/api/auth/login/user`;

    try {
      const res  = await fetch(url, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email: form.identifier, password: form.password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setApiError(data.message || data.error || 'Invalid credentials. Please try again.');
        setLoading(false);
        return;
      }

      let userData = data.user ?? data.org ?? data;

      /* For orgs, fetch /api/auth/me to get the organization ID */
      if (role === 'organization') {
        try {
          const meRes  = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/me`);
          const meData = await meRes.json();
          userData = { ...userData, ...(meData.user ?? meData.org ?? meData) };
        } catch { /* non-fatal — org link just won't work */ }
      }

      login(role, userData);
      navigate('/');
    } catch {
      setApiError('Could not reach the server. Check your connection.');
      setLoading(false);
    }
  };

  const panelTitle   = role === 'organization' ? 'Manage your organization.' : 'Good to see you again.';
  const panelEyebrow = role === 'organization' ? '/ For organizations' : '/ For volunteers';

  return (
    <div className="auth-page">
      <Header />
      <main className="auth-main">
        <div className="auth-split-card login-card">

          {/* ── Left panel ── */}
          <div className="auth-panel-left">
            <Link className="auth-logo-wrap" to="/">
              <LeafLogo size={40} gradId="leaf-grad-login" />
              <span className="auth-logo-name">Benevola</span>
            </Link>
            <div className="auth-panel-copy">
              <div className="auth-panel-eyebrow">{panelEyebrow}</div>
              <h2 className="auth-panel-title">{panelTitle}</h2>
              <ul className="auth-panel-features">
                {FEATURES[role].map((f, i) => <CheckItem key={i} text={f} />)}
              </ul>
            </div>
          </div>

          {/* ── Right panel ── */}
          <div className="auth-panel-right">
            <div className="auth-form-head">
              <h1 className="auth-title">Log in</h1>
              <p className="auth-sub">Welcome back to Benevola.</p>
            </div>

            {/* Role toggle */}
            <div className="role-toggle" role="group" aria-label="Account type">
              <button
                type="button"
                className={'role-btn' + (role === 'volunteer' ? ' active' : '')}
                onClick={() => switchRole('volunteer')}
              >
                Volunteer
              </button>
              <button
                type="button"
                className={'role-btn' + (role === 'organization' ? ' active' : '')}
                onClick={() => switchRole('organization')}
              >
                Organization
              </button>
            </div>

            <form onSubmit={handleSubmit} noValidate>
              <Field label="Email or username" required error={errors.identifier}>
                <input
                  className={'form-input' + (errors.identifier ? ' err' : '')}
                  type="text"
                  placeholder={role === 'organization' ? 'org@example.com' : 'you@example.com or username'}
                  value={form.identifier}
                  onChange={set('identifier')}
                  autoComplete="username"
                />
              </Field>

              <Field label="Password" required error={errors.password}>
                <div className="pw-wrap">
                  <input
                    className={'form-input' + (errors.password ? ' err' : '')}
                    type={showPw ? 'text' : 'password'}
                    placeholder="Your password"
                    value={form.password}
                    onChange={set('password')}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="pw-eye"
                    onClick={() => setShowPw(v => !v)}
                    aria-label={showPw ? 'Hide password' : 'Show password'}
                  >
                    <EyeIcon show={showPw} />
                  </button>
                </div>
              </Field>

              <div className="forgot-pw">
                <a href="#forgot">Forgot your password?</a>
              </div>

              {apiError && (
                <div className="auth-api-error">{apiError}</div>
              )}

              <button type="submit" className="auth-submit" disabled={loading}>
                {loading ? 'Logging in…' : <> Log In <ArrowRight /> </>}
              </button>
            </form>

            <p className="auth-switch">
              Don't have an account? <Link to="/signup">Sign up →</Link>
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default LoginPage;
