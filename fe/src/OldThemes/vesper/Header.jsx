import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useDesign } from '../../design/DesignContext';
import { useClickOutside } from '../../data/hooks';
import { IconSun, IconMoon } from '../Components/Icons';
import { Caret, Eyebrow } from './parts';

function Dropdown({ id, label, open, onToggle, onClose, heading, children }) {
  const ref = useClickOutside(() => open && onClose());
  return (
    <div className="vsp-drop-wrap" ref={ref}>
      <button
        className={'vsp-nav-link' + (open ? ' is-open' : '')}
        onClick={() => onToggle(id)}
        aria-expanded={open}
      >
        {label} <Caret open={open} />
      </button>
      {open && (
        <div className="vsp-drop" role="menu" onClick={onClose}>
          <div className="vsp-drop-head"><Eyebrow>{heading}</Eyebrow></div>
          {children}
        </div>
      )}
    </div>
  );
}

const DropLink = ({ to, children }) => (
  <Link to={to}><span className="vsp-drop-dot" />{children}</Link>
);

export default function Header() {
  const { auth, logout }       = useAuth();
  const { theme, toggleTheme } = useDesign();
  const navigate               = useNavigate();
  const [menu, setMenu]        = useState(null);
  const [mobile, setMobile]    = useState(false);

  const toggle = id => setMenu(m => (m === id ? null : id));
  const close  = () => setMenu(null);

  const isOrg = auth?.type === 'organization';
  const isVol = auth != null && !isOrg;
  const orgId = auth?.user?.organizationId ?? auth?.user?.id;
  const volId = auth?.user?.id;

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <header className="vsp-nav">
      <div className="vsp-shell vsp-nav-inner">
        <Link className="vsp-brand" to="/" onClick={() => setMobile(false)}>
          <span className="vsp-brand-name">Benevola</span>
          <span className="vsp-brand-dot" />
        </Link>

        <button
          className="vsp-nav-link vsp-nav-toggle"
          onClick={() => setMobile(o => !o)}
          aria-expanded={mobile}
        >
          Menu <Caret open={mobile} />
        </button>

        <nav className={'vsp-nav-links' + (mobile ? ' is-open' : '')}>
          <Dropdown
            id="org"
            label="Organizations"
            heading="For organizations"
            open={menu === 'org'}
            onToggle={toggle}
            onClose={close}
          >
            {isOrg
              ? <DropLink to={`/organizations/${orgId}`}>Your organization</DropLink>
              : <DropLink to="/signup?role=organization">Register your organization</DropLink>}
            <DropLink to={isOrg ? `/organizations/${orgId}/events/new` : '/login?role=organization'}>
              Post a volunteer event
            </DropLink>
            <DropLink to="/organizations">Browse organizations</DropLink>
          </Dropdown>

          <Dropdown
            id="vol"
            label="Volunteers"
            heading="For volunteers"
            open={menu === 'vol'}
            onToggle={toggle}
            onClose={close}
          >
            {isVol
              ? <DropLink to={`/volunteer/${volId}`}>Your profile</DropLink>
              : <DropLink to="/signup">Create your profile</DropLink>}
            <DropLink to="/events">Find opportunities</DropLink>
          </Dropdown>

          <Link className="vsp-nav-link" to="/about">About</Link>

          <button
            className="vsp-nav-link"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Switch to daylight' : 'Switch to night'}
          >
            {theme === 'dark' ? <IconSun size={16} /> : <IconMoon size={16} />}
          </button>

          {auth ? (
            <>
              <Link
                className="vsp-nav-link"
                to={isOrg ? `/organizations/${orgId}` : `/volunteer/${volId}`}
              >
                {isOrg ? 'Your organization' : 'My profile'}
              </Link>
              <button className="vsp-nav-link vsp-nav-cta" onClick={handleLogout}>Log out</button>
            </>
          ) : (
            <>
              <Link className="vsp-nav-link" to="/login">Log in</Link>
              <Link className="vsp-nav-link vsp-nav-cta" to="/signup">Join Benevola</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
