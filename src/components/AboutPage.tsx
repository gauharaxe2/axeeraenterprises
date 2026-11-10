import React from 'react';
import {
  ArrowRight,
  Award,
  Building2,
  CheckCircle2,
  Clock,
  ExternalLink,
  Globe2,
  ShieldCheck,
  Users2,
  Zap
} from 'lucide-react';
import { AgencyGeneralInfo } from '../types';
import {
  EditorialCta,
  EditorialHero,
  EditorialImage,
  EditorialPage,
  EditorialSection,
  EditorialTopbar,
  openInApp
} from './editorial/Editorial';

interface AboutPageProps {
  generalInfo: AgencyGeneralInfo;
  onBackToHome: () => void;
  onContactClick: () => void;
}

const corePillars = [
  {
    icon: Zap,
    title: 'Architectural Performance',
    description:
      'We engineer systems for sub-second edge response times, sub-50ms database queries, and Lighthouse 95+ performance benchmarks across every device.'
  },
  {
    icon: ShieldCheck,
    title: 'Zero Vendor Lock-in & Full IP Rights',
    description:
      'Upon project milestone sign-off, 100% of the proprietary source code, design assets, and cloud deployment pipelines are transferred directly to your organization.'
  },
  {
    icon: Award,
    title: 'Measurable Conversion Velocity',
    description:
      'Every UI interaction, funnel layout, and typography scale is crafted with conversion rate optimization (CRO) principles to maximize revenue and qualified client inquiries.'
  },
  {
    icon: Globe2,
    title: 'Global Delivery & Enterprise Standards',
    description:
      'Headquartered in Multan, Pakistan, we serve international clients across North America, Europe, the Middle East, and Asia with modern multi-cloud agility.'
  }
];

const milestones = [
  {
    year: '2023',
    headline: 'Agency Inception & Boutique Engineering',
    detail:
      'Founded by Gauhar Axe (Gauhar Nadeem) with an unwavering commitment to craftsmanship in custom web platforms, typography systems, and high-impact brand identities.'
  },
  {
    year: '2024',
    headline: 'SaaS & Enterprise Systems Expansion',
    detail:
      'Scaled capabilities into full-stack SaaS dashboards, headless Shopify architectures, and high-conversion e-commerce engines with automated cloud pipelines.'
  },
  {
    year: '2025',
    headline: 'Strategic Technology Alliances',
    detail:
      'Formed technology ecosystem alliances with Google Cloud Platform, Stripe, Cloudflare, and Cursor to offer enterprise-grade cloud hosting and security.'
  },
  {
    year: '2026',
    headline: 'Enterprise Digital Modernization',
    detail:
      'Now delivering bespoke enterprise digital products, real estate operating systems, and multi-platform solutions backed by a 30-day post-launch warranty.'
  }
];

export const AboutPage: React.FC<AboutPageProps> = ({ generalInfo, onBackToHome, onContactClick }) => {
  const { stats, aboutTitle, aboutParagraph1, aboutParagraph2, aboutImageUrl, whatsappNumber } = generalInfo;
  const whatsapp = whatsappNumber || '923157338694';

  return (
    <EditorialPage page="about">
      <EditorialTopbar
        crumb="About Us"
        onBack={onBackToHome}
        action={
          <a href="/contact" className="btn btn-primary editorial-top-action" onClick={(event) => openInApp(event, onContactClick)}>
            Book Consultation <ArrowRight size={16} aria-hidden="true" />
          </a>
        }
      />

      <EditorialHero
        eyebrow="About Axe's Era Enterprise"
        title={aboutTitle || 'Your Digital Transformation Partner'}
        description={
          aboutParagraph1 ||
          "Founded by Gauhar Axe, Axe's Era Enterprise has grown into a leading digital agency with over 3+ years of experience. We've helped hundreds of businesses establish their digital presence and achieve their goals. Our team combines creativity with technical expertise to deliver exceptional results."
        }
      >
        <p className="editorial-copy">
          {aboutParagraph2 ||
            'We believe in building long-term partnerships with our clients, understanding their unique challenges, and crafting tailored solutions that drive real business impact.'}
        </p>
        <div className="editorial-metrics">
          <div className="editorial-metric">
            <strong>
              {stats.years}+
            </strong>
            <span>Years of Experience</span>
            <small>Continuous digital innovation</small>
          </div>
          <div className="editorial-metric">
            <strong>{stats.experts}</strong>
            <span>Visionary Leadership</span>
            <small>Dedicated senior oversight</small>
          </div>
          <div className="editorial-metric">
            <strong>{stats.projects}+</strong>
            <span>Live Deployments</span>
            <small>Global production systems</small>
          </div>
          <div className="editorial-metric">
            <strong>{stats.retention}%</strong>
            <span>Client Retention</span>
            <small>High-trust long-term partnerships</small>
          </div>
        </div>
      </EditorialHero>

      <EditorialSection id="about-portrait">
        <article className="editorial-panel editorial-feature">
          <div className="editorial-media">
            <EditorialImage
              src={aboutImageUrl || 'https://i.postimg.cc/64KnkhQJ/Picsart-26-08-08-06-41-12-297.jpg'}
              alt="Axe's Era Enterprise leadership"
              loading="eager"
            />
          </div>
          <div className="editorial-feature-copy">
            <p className="editorial-kicker-inline">Leadership</p>
            <h2>Gauhar Nadeem (Gauhar Axe)</h2>
            <p className="editorial-muted">Founder & Chief Executive Officer</p>
            <ul className="editorial-facts" style={{ justifyContent: 'flex-start' }}>
              <li>
                <Building2 size={16} aria-hidden="true" /> Headquarters: Multan, Pakistan
              </li>
              <li>
                <Users2 size={16} aria-hidden="true" /> Founder & CEO: Gauhar Axe
              </li>
              <li>
                <Clock size={16} aria-hidden="true" /> Established 2023
              </li>
            </ul>
          </div>
        </article>
      </EditorialSection>

      <EditorialSection
        id="principles"
        eyebrow="Our Guiding Philosophy"
        title="The Principles That Define How We Engineer Software"
        description="Every digital system we build adheres to enterprise standards designed to eliminate technical debt and maximize long-term client independence."
      >
        <div className="editorial-grid" style={{ ['--card-min' as string]: '320px' }}>
          {corePillars.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <article key={pillar.title} className="editorial-card accent">
                <div className="editorial-card-body">
                  <span className="editorial-icon">
                    <Icon size={24} aria-hidden="true" />
                  </span>
                  <h3>{pillar.title}</h3>
                  <p className="editorial-muted">{pillar.description}</p>
                </div>
              </article>
            );
          })}
        </div>
      </EditorialSection>

      <EditorialSection
        id="milestones"
        eyebrow="Our Journey"
        title="Agency Milestones (2023–2026)"
        description="From crafting bespoke headless websites to architecting complete digital operating ecosystems for international businesses."
      >
        <div className="editorial-grid" style={{ ['--card-min' as string]: '220px' }}>
          {milestones.map((milestone) => (
            <article key={milestone.year} className="editorial-card accent">
              <div className="editorial-card-body">
                <span className="editorial-step-index">{milestone.year}</span>
                <h3>{milestone.headline}</h3>
                <p className="editorial-muted">{milestone.detail}</p>
                <p className="editorial-chip">
                  <CheckCircle2 size={14} aria-hidden="true" /> Verified milestone
                </p>
              </div>
            </article>
          ))}
        </div>
      </EditorialSection>

      <EditorialCta
        title="Ready to Architect Your Digital Transformation?"
        description="Schedule a confidential technical discovery call directly with founder Gauhar Axe. We will review your current architecture and chart a high-velocity roadmap."
      >
        <a href="/contact" className="btn btn-primary" onClick={(event) => openInApp(event, onContactClick)}>
          Start Your Project Consultation
        </a>
        <a
          href={`https://wa.me/${whatsapp}`}
          className="btn btn-outline editorial-whatsapp"
          target="_blank"
          rel="noopener noreferrer"
        >
          Instant WhatsApp Discussion <ExternalLink size={16} aria-hidden="true" />
        </a>
      </EditorialCta>
    </EditorialPage>
  );
};
