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
  IconBuilding,
  IconCompass,
  IconUser,
} from '../Components/Icons';

/* Unsplash images — volunteer / community themed */
const MOSAIC_IMGS = [
  {
    src: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&q=80&auto=format&fit=crop',
    alt: 'Diverse group of volunteers smiling together',
  },
  {
    src: 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=800&q=80&auto=format&fit=crop',
    alt: 'Hands joined in teamwork',
  },
  {
    src: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800&q=80&auto=format&fit=crop',
    alt: 'Community members helping one another',
  },
  {
    src: 'https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=800&q=80&auto=format&fit=crop',
    alt: 'Group outdoor volunteer activity',
  },
  {
    src: 'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=800&q=80&auto=format&fit=crop',
    alt: 'People raising hands at a community event',
  },
  {
    src: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&q=80&auto=format&fit=crop',
    alt: 'Volunteers planting in a community garden',
  },
  {
    src: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80&auto=format&fit=crop',
    alt: 'Group of volunteers laughing together',
  },
];

/* ── Hero ──────────────────────────────────────────────────────── */
function Hero() {
  return (
    <section className="hero-wrap">
      <div className="mosaic">
        <div className="tile t1"><img src={MOSAIC_IMGS[0].src} alt={MOSAIC_IMGS[0].alt} /></div>
        <div className="tile t2"><img src={MOSAIC_IMGS[1].src} alt={MOSAIC_IMGS[1].alt} /></div>
        <div className="tile t3"><img src={MOSAIC_IMGS[2].src} alt={MOSAIC_IMGS[2].alt} /></div>
        <div className="tile t4"><img src={MOSAIC_IMGS[3].src} alt={MOSAIC_IMGS[3].alt} /></div>
        <div className="tile t5"><img src={MOSAIC_IMGS[4].src} alt={MOSAIC_IMGS[4].alt} /></div>
        <div className="tile t6"><img src={MOSAIC_IMGS[5].src} alt={MOSAIC_IMGS[5].alt} /></div>
        <div className="tile t7"><img src={MOSAIC_IMGS[6].src} alt={MOSAIC_IMGS[6].alt} /></div>
      </div>

      <div className="hero-card">
        <h1 className="hero-title">
          Looking to make<br />an impact?
          <em>We've got your<br />back<span className="period">.</span></em>
        </h1>
        <Link to="/events" className="btn">
          Explore Opportunities <ArrowRight />
        </Link>
      </div>
    </section>
  );
}

/* ── Platform ──────────────────────────────────────────────────── */
const FEATURES = [
  {
    num: '01 / DISCOVER',
    icon: <IconSearch />,
    title: 'Match by cause, not algorithm guesswork',
    body: 'Filter by skill, distance, time commitment, and the causes you actually care about. No infinite scroll.',
  },
  {
    num: '02 / SHOW UP',
    icon: <IconCalendar />,
    title: 'One-tap sign up, calendar handled',
    body: 'Verified events sync to your calendar with directions, contact, and what to bring — no email back-and-forth.',
  },
  {
    num: '03 / TRACK',
    icon: <IconHands />,
    title: 'Hours that count, beyond the day',
    body: 'Verified hour logs you can hand to schools, employers, or boards. Build a portfolio of impact, not just shifts.',
  },
];

function Platform() {
  return (
    <section className="platform">
      <div className="platform-eyebrow">/ What we do</div>
      <div className="platform-head">
        <h2>Providing a platform for what's possible.</h2>
        <p className="platform-lede">
          Benevola connects volunteers with vetted local organizations — without the
          paperwork, the cold emails, or the gatekeeping.
        </p>
      </div>

      <div className="feature-grid">
        {FEATURES.map((f, i) => (
          <article className="feature" key={i}>
            <div className="num">{f.num}</div>
            <div className="icon">{f.icon}</div>
            <h3>{f.title}</h3>
            <p>{f.body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

/* ── Action Card ───────────────────────────────────────────────── */
function ActionCard({ icon, eyebrow, title, body, action, variant, to }) {
  return (
    <Link to={to} className={'action-card' + (variant ? ' ' + variant : '')}>
      <div className="action-card-top">
        <div className="action-card-icon">{icon}</div>
        <div className="action-card-eyebrow">{eyebrow}</div>
      </div>
      <h3>{title}</h3>
      <p>{body}</p>
      <div className="action-card-foot">
        <span>{action}</span><ArrowRight />
      </div>
    </Link>
  );
}

/* ── Org CTA ───────────────────────────────────────────────────── */
function OrgCTA() {
  return (
    <section className="dual-cta org-cta">
      <div className="dual-cta-inner">
        <div className="dual-cta-head">
          <div>
            <div className="dual-cta-eyebrow">/ For organizations</div>
            <h2 className="dual-cta-title">Are you an organization?</h2>
          </div>
          <p className="dual-cta-lede">
            List a one-off event or build a full volunteer page in minutes —
            verified, searchable, and free to start.
          </p>
        </div>
        <div className="dual-cta-grid two">
          <ActionCard
            icon={<IconCalendar />}
            eyebrow="01 · QUICK POST"
            title="Create an event"
            body="Post a single shift, recurring need, or campaign in under three minutes. Volunteers find it, sign up, and show up."
            action="Create Event"
            to="/signup?role=organization"
          />
          <ActionCard
            icon={<IconBuilding />}
            eyebrow="02 · FULL PROFILE"
            title="Register your organization"
            body="Claim a verified profile, manage your team, track impact hours, and unlock recurring partnerships with local volunteers."
            action="Register Organization"
            variant="accent"
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
    <section className="dual-cta vol-cta">
      <div className="dual-cta-inner">
        <div className="dual-cta-head">
          <div>
            <div className="dual-cta-eyebrow light">/ For volunteers</div>
            <h2 className="dual-cta-title light">Ready to find your fit?</h2>
          </div>
          <p className="dual-cta-lede light">
            Three ways in. Browse organizations doing the work you care about,
            find events happening this week, or set up a profile and let the
            right opportunities come to you.
          </p>
        </div>
        <div className="dual-cta-grid three">
          <ActionCard
            icon={<IconCompass />}
            eyebrow="01 · EXPLORE"
            title="Browse organizations"
            body="See verified nonprofits and groups working on the causes you care about — filtered by city, category, and time of week."
            action="Browse Organizations"
            to="/organizations"
          />
          <ActionCard
            icon={<IconCalendar />}
            eyebrow="02 · SHOW UP"
            title="Find events near you"
            body="One-off shifts and pop-up campaigns happening this week — sortable by distance, date, and how many hours you can give."
            action="Find Events"
            to="/events"
          />
          <ActionCard
            icon={<IconUser />}
            eyebrow="03 · GET MATCHED"
            title="Register with Benevola"
            body="Create a free profile, save your skills and causes, log verified hours, and get matched to opportunities automatically."
            action="Create Profile"
            variant="accent"
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
