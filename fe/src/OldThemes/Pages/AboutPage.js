import React from 'react';
import Header from '../Components/Header';
import Footer from '../Components/Footer';
import Breadcrumb from '../Components/Breadcrumb';
import { IconMail } from '../Components/Icons';
import '../styles/AboutPage.css';

const TEAM = [
  { name: 'Talha Djibril',   initials: 'TD', role: 'Backend Developer',  hue: '152' },
  { name: 'Zachary Norton',  initials: 'ZN', role: 'Backend Developer',  hue: '170' },
  { name: 'Owen Voorhees',   initials: 'OV', role: 'Frontend Developer', hue: '134' },
];

function TeamCard({ name, initials, role, hue }) {
  return (
    <div className="about-team-card">
      <div className="about-avatar" style={{ '--hue': hue }}>
        {initials}
      </div>
      <div className="about-team-info">
        <h3 className="about-team-name">{name}</h3>
        <span className="about-team-role">{role}</span>
      </div>
    </div>
  );
}

function AboutPage() {
  return (
    <div className="about-page">
      <Header />
      <div className="about-content">
        <Breadcrumb crumbs={[
          { label: 'Home', to: '/' },
          { label: 'About' },
        ]} />

        {/* ── Mission ── */}
        <section className="about-mission">
          <div className="about-eyebrow">/ Our mission</div>
          <h1 className="about-title">Built for good.</h1>
          <p className="about-lede">
            Benevola exists to remove the friction between people who want to help
            and the organizations that need them. We believe volunteering should be
            as easy as ordering a coffee, with no cold emails, no gatekeeping, and no
            endless sign-up forms.
          </p>
          <p className="about-body">
            We partner with nonprofits, community groups, and civic organizations
            to surface real opportunities that are verified, searchable, and matched to
            what you actually care about. Every hour logged on Benevola is an hour
            that moved something forward.
          </p>
        </section>

        {/* ── Contact ── */}
        <section className="about-contact-section">
          <div className="about-contact-card">
            <div className="about-contact-header">
              <div className="about-contact-icon"><IconMail size={20} /></div>
              <div>
                <div className="about-contact-label">Get in touch</div>
                <a
                  href="mailto:benevolacorp@gmail.com"
                  className="about-contact-email"
                >
                  benevolacorp@gmail.com
                </a>
              </div>
            </div>
            <p className="about-contact-body">
              Questions, partnership inquiries, press, or just want to say hello.
              We read everything and reply to as much as we can.
            </p>
          </div>
        </section>

        {/* ── Team ── */}
        <section className="about-team-section">
          <div className="about-eyebrow">/ The people behind it</div>
          <h2 className="about-section-title">Our team</h2>
          <div className="about-team-grid">
            {TEAM.map(member => (
              <TeamCard key={member.name} {...member} />
            ))}
          </div>
        </section>
      </div>
      <Footer />
    </div>
  );
}

export default AboutPage;
