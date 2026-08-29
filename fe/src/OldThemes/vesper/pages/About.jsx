import React from 'react';
import Shell, { Crumbs } from '../Shell';
import { Eyebrow, Meta, SectionHead } from '../parts';
import { IconMail } from '../../Components/Icons';

const TEAM = [
  { name: 'Talha Djibril',  initials: 'TD', role: 'Backend developer' },
  { name: 'Zachary Norton', initials: 'ZN', role: 'Backend developer' },
  { name: 'Owen Voorhees',  initials: 'OV', role: 'Frontend developer' },
];

export default function About() {
  return (
    <Shell>
      <div className="vsp-shell">
        <Crumbs items={[{ label: 'Home', to: '/' }, { label: 'About' }]} />

        <section className="vsp-about-lede">
          <Eyebrow tone="clay">Our mission</Eyebrow>
          <h1 className="vsp-display">Built for <span className="vsp-em">good</span>.</h1>
          <div className="vsp-about-body">
            <p>
              Benevola exists to remove the friction between people who want to help and
              the organizations that need them. Volunteering should take about as much
              effort as ordering a coffee: no cold emails, no gatekeeping, and no forms
              that ask for your address three separate times.
            </p>
            <p>
              We work with nonprofits, community groups, and civic organizations to
              surface real opportunities, verified and searchable and matched to what you
              actually care about. Every hour logged here is an hour that moved something
              forward.
            </p>
          </div>
        </section>

        <section className="vsp-section" style={{ paddingTop: 0 }}>
          <div className="vsp-panel vsp-contact">
            <span className="vsp-contact-icon"><IconMail size={22} /></span>
            <div>
              <Eyebrow>Questions, partnerships, press, or hello</Eyebrow>
              <a href="mailto:benevolacorp@gmail.com">benevolacorp@gmail.com</a>
            </div>
          </div>
        </section>

        <section className="vsp-section">
          <SectionHead
            num="01"
            title="The people behind it"
            sub="A small team, building the thing we wanted to exist."
          />
          <div className="vsp-team">
            {TEAM.map(member => (
              <div className="vsp-team-member" key={member.name}>
                <span className="vsp-team-initials">{member.initials}</span>
                <h3 className="vsp-h3">{member.name}</h3>
                <Meta>{member.role}</Meta>
              </div>
            ))}
          </div>
        </section>
      </div>
    </Shell>
  );
}
