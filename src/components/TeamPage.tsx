import React from 'react';
import { ArrowRight, Award, CheckCircle2 } from 'lucide-react';
import { TeamMemberData } from '../types';
import { collectTeamSocialLinks } from '../utils/teamSocials';
import { SocialPlatformIcon } from './SocialPlatformIcon';
import {
  EditorialCta,
  EditorialHero,
  EditorialImage,
  EditorialPage,
  EditorialSection,
  EditorialTopbar,
  openInApp
} from './editorial/Editorial';

interface TeamPageProps {
  team: TeamMemberData[];
  onBackToHome: () => void;
  onContactClick: () => void;
}

const fallbackFounder: TeamMemberData = {
  id: 'gauhar-nadeem',
  name: 'Gauhar Nadeem',
  title: 'CEO & Founder',
  bio: "Visionary leadership driving digital excellence. Gauhar Axe founded Axe's Era Enterprises with a focus on crafting conversion-engineered web platforms, cutting-edge mobile apps, and iconic visual identities.",
  imageUrl: 'https://i.postimg.cc/PqjZ6d8q/Picsart-26-08-08-06-40-52-321.jpg',
  socials: {
    linkedin: 'https://www.linkedin.com/in/gauharaxe/',
    linkedinCompany: '',
    twitter: 'https://twitter.com/gauharaxe',
    upwork: 'https://www.upwork.com/freelancers/~0131edfc6b7fb25125',
    youtube: 'https://www.youtube.com/@gauharaxe',
    facebook: 'https://www.facebook.com/gauharaxe',
    instagram: 'https://www.instagram.com/gauharaxe',
    instagramCompany: ''
  }
};

const disciplines = [
  {
    title: 'Full-Stack Architecture & Cloud',
    skills: ['Next.js 15 & React 19', 'TypeScript Strict Mode', 'PostgreSQL & Firestore', 'Cloudflare Edge CDN']
  },
  {
    title: 'UI/UX & Brand Identity Systems',
    skills: ['Figma Design Systems', 'Design Tokens & Scalable Grids', 'Vector Typography', 'Conversion Rate Optimization']
  },
  {
    title: 'Performance Marketing & SEO',
    skills: ['Technical Core Web Vitals', 'Intent-Driven Search Strategy', 'Full-Funnel Analytics', 'Attribution Modeling']
  },
  {
    title: 'Mobile & Headless Applications',
    skills: ['Progressive Web Apps (PWA)', 'Headless Shopify (Liquid/Storefront API)', 'REST & GraphQL APIs', 'Stripe Billing']
  }
];



export const TeamPage: React.FC<TeamPageProps> = ({ team, onBackToHome, onContactClick }) => {
  const members = team.length > 0 ? team : [fallbackFounder];
  const [founder, ...others] = members;

  return (
    <EditorialPage page="team">
      <EditorialTopbar
        crumb="Our Leadership & Team"
        onBack={onBackToHome}
        action={
          <a href="/contact" className="btn btn-primary editorial-top-action" onClick={(event) => openInApp(event, onContactClick)}>
            Connect with Founder <ArrowRight size={16} aria-hidden="true" />
          </a>
        }
      />

      <EditorialHero
        eyebrow="Visionary Leadership"
        title="Meet the Architects Behind Axe's Era Enterprises"
        description="We operate with a high-density senior talent model. You collaborate directly with principal architects and designers who take personal ownership of your digital platform from day one."
      />

      <EditorialSection id="founder">
        <article className="editorial-panel editorial-feature">
          <div className="editorial-media">
            <EditorialImage src={founder.imageUrl} alt={founder.name} loading="eager" />
            <span className="editorial-badge bottom">
              <Award size={13} aria-hidden="true" /> Top-Rated Digital Architect
            </span>
          </div>
          <div className="editorial-feature-copy">
            <p className="editorial-kicker-inline">Founder & Principal Architect</p>
            <h2>
              {founder.name} <span className="editorial-muted">(Gauhar Axe)</span>
            </h2>
            <p className="editorial-muted">Multan, Pakistan / Global Client Base</p>
            <p style={{ color: 'var(--primary-color)', fontWeight: 700 }}>{founder.title}</p>
            <p className="editorial-copy">{founder.bio}</p>
            <p className="editorial-copy">
              Gauhar brings extensive experience engineering bespoke enterprise platforms, high-converting commercial web
              stores, and custom software architectures. His philosophy centers on technical precision, eliminating
              unnecessary software bloat, and empowering clients with complete code sovereignty upon project handover.
            </p>
            <div>
              <p className="editorial-eyebrow" style={{ marginBottom: '0.7rem' }}>
                Verified Executive Channels
              </p>
              <div className="editorial-socials">
                {collectTeamSocialLinks(founder).map((item) => (
                  <a key={item.id} href={item.url} target="_blank" rel="noopener noreferrer">
                    <SocialPlatformIcon platform={item.platform} size={15} />
                    {item.label}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </article>

        {others.length > 0 ? (
          <div className="editorial-grid" style={{ marginTop: '1.5rem', ['--card-min' as string]: '260px' }}>
            {others.map((member) => (
              <article key={member.id || member.name} className="editorial-card">
                <div className="editorial-media">
                  <EditorialImage src={member.imageUrl} alt={member.name} />
                </div>
                <div className="editorial-card-body">
                  <h3>{member.name}</h3>
                  <p className="editorial-kicker-inline">{member.title}</p>
                  <p className="editorial-muted">{member.bio}</p>
                  <div className="editorial-socials">
                    {collectTeamSocialLinks(member).map((item) => (
                      <a key={item.id} href={item.url} target="_blank" rel="noopener noreferrer">
                        <SocialPlatformIcon platform={item.platform} size={15} />
                        {item.label}
                      </a>
                    ))}
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p className="editorial-todo" style={{ marginTop: '1.25rem' }}>
            TODO: Additional team profiles will appear here when they are published. The roster currently lists the founder only.
          </p>
        )}
      </EditorialSection>

      <EditorialSection
        id="ceo-introduction"
        eyebrow="CEO Introduction"
        title="Meet Gauhar Nadeem — Leadership & Engineering Vision"
        description="Watch our Founder & CEO share how Axe's Era Enterprises delivers full-stack platforms, Shopify stores, and WordPress architectures."
      >
        <div className="editorial-panel editorial-video-panel">
          <div className="editorial-video-frame">
            <iframe
              width="1491"
              height="839"
              src="https://www.youtube.com/embed/7xiVMuv-A2g"
              title="Full-Stack, Shopify & Wordpress Expert | Gauhar Nadeem | Axe's Era Enterprises"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
          </div>
        </div>
      </EditorialSection>

      <EditorialSection
        id="disciplines"
        eyebrow="Core Capabilities"
        title="Technical Disciplines Mastered"
        description="Our team cross-pollinates technical engineering and visual design to deliver unified results."
      >
        <div className="editorial-grid" style={{ ['--card-min' as string]: '220px' }}>
          {disciplines.map((discipline) => (
            <article key={discipline.title} className="editorial-card accent">
              <div className="editorial-card-body">
                <h3>{discipline.title}</h3>
                <ul className="editorial-list">
                  {discipline.skills.map((skill) => (
                    <li key={skill}>
                      <CheckCircle2 size={16} aria-hidden="true" />
                      <span>{skill}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </div>
      </EditorialSection>

      <EditorialSection id="collaborate">
        <article className="editorial-panel padded">
          <h2>Partner With Our Extended Engineering Network</h2>
          <p className="editorial-muted" style={{ margin: '0.7rem 0 1.1rem', maxWidth: '720px' }}>
            Axe's Era Enterprises regularly partners with specialized backend engineers, cloud architects, and motion
            designers for mission-critical enterprise engagements. If you build at the highest level, we welcome
            collaborations on global client projects.
          </p>
          <a href="/contact" className="btn btn-outline" onClick={(event) => openInApp(event, onContactClick)}>
            Inquire About Technical Collaboration
          </a>
        </article>
      </EditorialSection>

      <EditorialCta
        title="Collaborate Directly With Gauhar Axe"
        description="Skip the middle management. Speak directly with the engineering lead who will build, oversee, and guarantee your digital product delivery."
      >
        <a href="/contact" className="btn btn-primary" onClick={(event) => openInApp(event, onContactClick)}>
          Schedule Strategy Discussion
        </a>
        <a href="/" className="btn btn-outline" onClick={(event) => openInApp(event, onBackToHome)}>
          Return to Home
        </a>
      </EditorialCta>
    </EditorialPage>
  );
};
