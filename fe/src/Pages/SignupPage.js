import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import '../styles/Auth.css';

import Header from '../Components/Header';
import Footer from '../Components/Footer';
import { LeafLogo, ArrowRight, EyeIcon } from '../Components/Icons';

const VOL_FEATURES = [
  'Browse verified opportunities near you',
  'Log hours and build an impact portfolio',
  'Free to join — no credit card needed',
];

const ORG_FEATURES = [
  'List events in under 3 minutes',
  'Reach active volunteers in your area',
  'Verified profile builds trust with donors',
];

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

function SignupPage() {
  const [searchParams]            = useSearchParams();
  const initialRole               = searchParams.get('role') === 'organization' ? 'organization' : 'volunteer';
  const [role, setRole]           = useState(initialRole);
  const [showPw, setShowPw]       = useState(false);
  const [showCPw, setShowCPw]     = useState(false);
  const [errors, setErrors]       = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm]           = useState({
    displayName: '', email: '', password: '', confirmPassword: '',
    description: '', phone: '', address: '',
  });

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const validate = () => {
    const e = {};
    if (!form.displayName.trim())                   e.displayName      = 'Display name is required';
    if (!form.email.includes('@'))                   e.email            = 'Enter a valid email address';
    if (form.password.length < 8)                   e.password         = 'Minimum 8 characters';
    if (form.password !== form.confirmPassword)      e.confirmPassword  = "Passwords don't match";
    return e;
  };

  const handleSubmit = e => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSubmitted(true);
  };

  const features     = role === 'organization' ? ORG_FEATURES  : VOL_FEATURES;
  const panelTitle   = role === 'organization' ? 'Grow your volunteer network.' : 'Find your impact.';
  const panelEyebrow = role === 'organization' ? '/ For organizations' : '/ For volunteers';

  return (
    <div className="auth-page">
      <Header />
      <main className="auth-main">
        <div className="auth-split-card">

          {/* ── Left panel ── */}
          <div className="auth-panel-left">
            <Link className="auth-logo-wrap" to="/">
              <LeafLogo size={40} gradId="leaf-grad-signup" />
              <span className="auth-logo-name">Benevola</span>
            </Link>
            <div className="auth-panel-copy">
              <div className="auth-panel-eyebrow">{panelEyebrow}</div>
              <h2 className="auth-panel-title">{panelTitle}</h2>
              <ul className="auth-panel-features">
                {features.map((f, i) => <CheckItem key={i} text={f} />)}
              </ul>
            </div>
          </div>

          {/* ── Right panel ── */}
          <div className="auth-panel-right">
            {submitted ? (
              <div className="auth-success">
                <div className="success-circle">✓</div>
                <h2>You're in.</h2>
                <p>Account created as a <strong>{role}</strong>. Head to login to get started.</p>
                <Link className="auth-success-btn" to="/login">
                  Log in now <ArrowRight />
                </Link>
              </div>
            ) : (
              <>
                <div className="auth-form-head">
                  <h1 className="auth-title">Create account</h1>
                  <p className="auth-sub">Free to join. Takes about a minute.</p>
                </div>

                <div className="role-toggle" role="group" aria-label="Account type">
                  <button
                    type="button"
                    className={'role-btn' + (role === 'volunteer' ? ' active' : '')}
                    onClick={() => { setRole('volunteer'); setErrors({}); }}
                  >
                    Volunteer
                  </button>
                  <button
                    type="button"
                    className={'role-btn' + (role === 'organization' ? ' active' : '')}
                    onClick={() => { setRole('organization'); setErrors({}); }}
                  >
                    Organization
                  </button>
                </div>

                <form onSubmit={handleSubmit} noValidate>
                  <Field label="Display Name" required error={errors.displayName}>
                    <input
                      className={'form-input' + (errors.displayName ? ' err' : '')}
                      type="text"
                      placeholder={role === 'organization' ? 'e.g. Green Future Society' : 'e.g. Jane Smith'}
                      value={form.displayName}
                      onChange={set('displayName')}
                    />
                  </Field>

                  <Field label="Email" required error={errors.email}>
                    <input
                      className={'form-input' + (errors.email ? ' err' : '')}
                      type="email"
                      placeholder="you@example.com"
                      value={form.email}
                      onChange={set('email')}
                    />
                  </Field>

                  <Field label="Password" required error={errors.password}>
                    <div className="pw-wrap">
                      <input
                        className={'form-input' + (errors.password ? ' err' : '')}
                        type={showPw ? 'text' : 'password'}
                        placeholder="8+ characters"
                        value={form.password}
                        onChange={set('password')}
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

                  <Field label="Confirm Password" required error={errors.confirmPassword}>
                    <div className="pw-wrap">
                      <input
                        className={'form-input' + (errors.confirmPassword ? ' err' : '')}
                        type={showCPw ? 'text' : 'password'}
                        placeholder="Repeat your password"
                        value={form.confirmPassword}
                        onChange={set('confirmPassword')}
                      />
                      <button
                        type="button"
                        className="pw-eye"
                        onClick={() => setShowCPw(v => !v)}
                        aria-label={showCPw ? 'Hide password' : 'Show password'}
                      >
                        <EyeIcon show={showCPw} />
                      </button>
                    </div>
                  </Field>

                  {role === 'organization' && (
                    <div className="org-extra">
                      <div className="org-divider">
                        <span>Organization details</span>
                        <div className="opt-badge">all optional</div>
                      </div>
                      <Field label="Description">
                        <textarea
                          className="form-input form-textarea"
                          placeholder="Tell volunteers what your organization does and what you care about…"
                          value={form.description}
                          onChange={set('description')}
                        />
                      </Field>
                      <div className="two-col">
                        <Field label="Phone">
                          <input
                            className="form-input"
                            type="tel"
                            placeholder="+1 (555) 000-0000"
                            value={form.phone}
                            onChange={set('phone')}
                          />
                        </Field>
                        <Field label="Address">
                          <input
                            className="form-input"
                            type="text"
                            placeholder="City, State"
                            value={form.address}
                            onChange={set('address')}
                          />
                        </Field>
                      </div>
                    </div>
                  )}

                  <button type="submit" className="auth-submit">
                    Create Account <ArrowRight />
                  </button>
                </form>

                <p className="auth-switch">
                  Already have an account? <Link to="/login">Log in →</Link>
                </p>
              </>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default SignupPage;
