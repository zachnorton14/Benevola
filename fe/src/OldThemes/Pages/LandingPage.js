import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/LandingPage.css';

import Header from '../Components/Header';
import Footer from '../Components/Footer';
import {
  ArrowRight,
  IconSearch,
  IconCalendar,
  IconHands,
} from '../Components/Icons';

const HERO_IMG = {
  src: 'https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=1800&q=85&auto=format&fit=crop',
  alt: 'Volunteers gathered outdoors at a community event',
};

const PLATFORM_IMG = {
  src: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=900&q=80&auto=format&fit=crop',
  alt: 'Diverse group of smiling community volunteers',
};

const DARK_BG_IMG = {
  src: 'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=1400&q=70&auto=format&fit=crop',
  alt: '',
};

const FEATURES = [
  {
    num: '01',
    icon: <IconSearch size={16} />,
    title: 'Match by cause, not algorithm guesswork',
    body: 'Filter by skill, distance, time commitment, and the causes you actually care about. No infinite scroll.',
  },
  {
    num: '02',
    icon: <IconCalendar size={16} />,
    title: 'One-tap sign up, calendar handled',
    body: 'Verified events sync to your calendar with directions, contact info, and what to bring.',
  },
  {
    num: '03',
    icon: <IconHands size={16} />,
    title: 'Hours that count beyond the day',
    body: 'Verified hour logs you can hand to schools, employers, or boards. Build a portfolio of impact, not just shifts.',
  },
];

/* ── Hero ──────────────────────────────────────────────────────── */
function Hero() {
  return (
    <section className="lp-hero">
      <img className="lp-hero-img" src={HERO_IMG.src} alt={HERO_IMG.alt} />
      <div className="lp-hero-overlay" />
      <div className="lp-hero-content">
        <p className="lp-hero-kicker">/ Volunteer opportunities near you</p>
        <h1 className="lp-hero-title">Find where<br />you belong.</h1>
        <Link to="/events" className="lp-btn-primary">
          Explore Opportunities <ArrowRight />
        </Link>
      </div>
    </section>
  );
}

/* ── Platform ──────────────────────────────────────────────────── */
function Platform() {
  return (
    <section className="lp-platform">
      <div className="lp-platform-inner">
        <div className="lp-platform-img-col">
          <img src={PLATFORM_IMG.src} alt={PLATFORM_IMG.alt} />
        </div>
        <div className="lp-platform-text-col">
          <p className="lp-eyebrow">/ What we do</p>
          <h2 className="lp-platform-title">A platform for what's possible.</h2>
          <p className="lp-platform-lede">
            Benevola connects volunteers with vetted local organizations, without the
            paperwork, cold emails, or gatekeeping.
          </p>
          <ol className="lp-feature-list">
            {FEATURES.map((f) => (
              <li key={f.num} className="lp-feature-item">
                <span className="lp-feature-num">{f.num}</span>
                <div className="lp-feature-body">
                  <h3>{f.title}</h3>
                  <p>{f.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

/* ── Action card ───────────────────────────────────────────────── */
function ActionCard({ eyebrow, title, body, action, accent, to }) {
  return (
    <Link to={to} className={'lp-action-card' + (accent ? ' accent' : '')}>
      <div className="lp-action-card-eyebrow">{eyebrow}</div>
      <h3>{title}</h3>
      <p>{body}</p>
      <div className="lp-action-card-foot">
        <span>{action}</span><ArrowRight />
      </div>
    </Link>
  );
}

/* ── Org CTA ───────────────────────────────────────────────────── */
function OrgCTA() {
  return (
    <section className="lp-org-cta">
      <div className="lp-cta-inner">
        <div className="lp-cta-head">
          <div>
            <p className="lp-eyebrow">/ For organizations</p>
            <h2 className="lp-cta-title">Are you an organization?</h2>
          </div>
          <p className="lp-cta-lede">
            List a one-off event or build a full volunteer page in minutes,
            verified, searchable, and free to start.
          </p>
        </div>
        <div className="lp-cta-grid two">
          <ActionCard
            eyebrow="01 · QUICK POST"
            title="Create an event"
            body="Post a single shift, recurring need, or campaign in under three minutes. Volunteers find it, sign up, and show up."
            action="Create Event"
            to="/signup?role=organization"
          />
          <ActionCard
            eyebrow="02 · FULL PROFILE"
            title="Register your organization"
            body="Claim a verified profile, manage your team, track impact hours, and unlock recurring partnerships with local volunteers."
            action="Register Organization"
            accent
            to="/signup?role=organization"
          />
        </div>
      </div>
    </section>
  );
}

/* ── Volunteer CTA ─────────────────────────────────────────────── */
function VolunteerCTA() {
  return (
    <section className="lp-vol-cta">
      <img className="lp-vol-cta-bg" src={DARK_BG_IMG.src} alt="" aria-hidden="true" />
      <div className="lp-vol-cta-inner">
        <div className="lp-cta-head">
          <div>
            <p className="lp-eyebrow light">/ For volunteers</p>
            <h2 className="lp-cta-title light">Ready to find your fit?</h2>
          </div>
          <p className="lp-cta-lede light">
            Browse organizations doing work you care about, find events happening this week,
            or set up a profile and let the right opportunities come to you.
          </p>
        </div>
        <div className="lp-cta-grid three">
          <ActionCard
            eyebrow="01 · EXPLORE"
            title="Browse organizations"
            body="See verified nonprofits and groups working on the causes you care about, filtered by city and category."
            action="Browse Organizations"
            to="/organizations"
          />
          <ActionCard
            eyebrow="02 · SHOW UP"
            title="Find events near you"
            body="One-off shifts and pop-up campaigns happening this week, sortable by distance, date, and hours available."
            action="Find Events"
            to="/events"
          />
          <ActionCard
            eyebrow="03 · GET MATCHED"
            title="Register with Benevola"
            body="Create a free profile, save your skills and causes, log verified hours, and get matched automatically."
            action="Create Profile"
            accent
            to="/signup"
          />
        </div>
      </div>
    </section>
  );
}

/* ── Page ──────────────────────────────────────────────────────── */
function LandingPage() {
  return (
    <div className="page">
      <Header />
      <Hero />
      <Platform />
      <OrgCTA />
      <VolunteerCTA />
      <Footer />
    </div>
  );
}

export default LandingPage;
