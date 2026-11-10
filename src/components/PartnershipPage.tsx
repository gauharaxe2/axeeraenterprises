import React from 'react';
import { ArrowRight, CheckCircle2, ExternalLink, Globe, Handshake, Network } from 'lucide-react';
import { PartnerLogo, PartnershipItem } from '../types';
import {
  EditorialCta,
  EditorialHero,
  EditorialImage,
  EditorialPage,
  EditorialSection,
  EditorialTopbar,
  openInApp
} from './editorial/Editorial';

interface PartnershipPageProps {
  partnerships: PartnershipItem[];
  partnerLogos: PartnerLogo[];
  notice?: string;
  onBackToHome: () => void;
  onContactClick: () => void;
}

const partnerPrograms = [
  {
    title: 'Cloud & Infrastructure Alliances',
    audience: 'Cloud Providers, Security Platforms & SaaS Tooling',
    perks: [
      'Direct architectural integration into client enterprise deployments',
      "Featured placement across Axe's Era official client documentation",
      'Joint case studies and co-marketing case breakdowns'
    ]
  },
  {
    title: 'Agency Referral & Co-Selling',
    audience: 'Specialized Agencies, Consultancies & Freelancers',
    perks: [
      'Lucrative 15% recurring referral commissions on signed enterprise retainers',
      'Access to our specialized engineering squad for complex builds',
      'Co-pitching support and architecture blueprints provided'
    ]
  },
  {
    title: 'Enterprise Vendor Integration',
    audience: 'FinTech, Logistics, CRM & E-Commerce APIs',
    perks: [
      'Certified production connectors for Next.js and headless apps',
      'Sub-second edge caching for third-party API payloads',
      'Dedicated SLA monitoring and priority bug reporting'
    ]
  }
];

function PartnerIcon({ name }: { name: string }) {
  if (name === 'Network') return <Network size={24} aria-hidden="true" />;
  if (name === 'Globe') return <Globe size={24} aria-hidden="true" />;
  return <Handshake size={24} aria-hidden="true" />;
}

export const PartnershipPage: React.FC<PartnershipPageProps> = ({
  partnerships,
  partnerLogos,
  notice = 'We are currently expanding our strategic partner network. Check back soon for new enterprise announcements!',
  onBackToHome,
  onContactClick
}) => {
  return (
    <EditorialPage page="partnership">
      <EditorialTopbar
        crumb="Enterprise Partnerships"
        onBack={onBackToHome}
        action={
          <a href="/contact" className="btn btn-primary editorial-top-action" onClick={(event) => openInApp(event, onContactClick)}>
            Apply to Partner <ArrowRight size={16} aria-hidden="true" />
          </a>
        }
      />

      <EditorialHero
        eyebrow="Strategic Enterprise Alliances"
        title="Collaborating With World-Class Technology Leaders"
        description="We partner with industry-leading cloud providers, payment rails, and software vendors to engineer scalable, resilient, and enterprise-grade digital systems for our global clients."
      />

      <EditorialSection id="partnership-pillars">
        <div className="editorial-grid">
          {partnerships.map((partnership) => (
            <article key={partnership.id} className="editorial-card accent">
              <div className="editorial-card-body">
                <span className="editorial-icon">
                  <PartnerIcon name={partnership.icon} />
                </span>
                <h3>{partnership.title}</h3>
                <p className="editorial-muted">{partnership.description}</p>
              </div>
            </article>
          ))}
        </div>
      </EditorialSection>

      <EditorialSection
        id="partner-logos"
        eyebrow="Official Technology Ecosystem"
        title="Enterprise & Solution Partners"
        description="Our applications are built on and powered by the world's most trusted developer tools and cloud infrastructures."
      >
        {partnerLogos.length === 0 ? (
          <p className="editorial-todo">TODO: Publish partner logos. None are available in the current partner list.</p>
        ) : (
          <div className="editorial-grid" style={{ ['--card-min' as string]: '220px' }}>
            {partnerLogos.map((logo) => (
              <article key={logo.id} className="editorial-card">
                <div className="editorial-card-body">
                  <div className="editorial-logo-well">
                    <EditorialImage src={logo.logoUrl} alt={logo.name} />
                  </div>
                  <h3>{logo.name}</h3>
                  <p className="editorial-muted">Verified Technology Ecosystem Partner</p>
                  {logo.websiteUrl ? (
                    <a className="editorial-link" href={logo.websiteUrl} target="_blank" rel="noopener noreferrer">
                      Visit Partner Platform <ExternalLink size={15} aria-hidden="true" />
                    </a>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        )}
        <p className="editorial-notice" style={{ marginTop: '1.25rem' }}>
          {notice}
        </p>
      </EditorialSection>

      <EditorialSection
        id="partner-programs"
        eyebrow="Collaboration Models"
        title="How We Partner With Organizations"
        description="Structured engagement frameworks designed for mutual growth and enterprise delivery excellence."
      >
        <div className="editorial-grid">
          {partnerPrograms.map((program, index) => (
            <article key={program.title} className="editorial-card accent">
              <div className="editorial-card-body">
                <span className="editorial-step-index">0{index + 1}</span>
                <h3>{program.title}</h3>
                <p className="editorial-kicker-inline">{program.audience}</p>
                <ul className="editorial-list">
                  {program.perks.map((perk) => (
                    <li key={perk}>
                      <CheckCircle2 size={16} aria-hidden="true" />
                      <span>{perk}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </div>
      </EditorialSection>

      <EditorialCta
        title="Explore a Strategic Alliance With Axe's Era"
        description="Are you a technology provider, design agency, or enterprise vendor looking to partner? Let's connect and discuss how we can create mutual value."
      >
        <a href="/contact" className="btn btn-primary" onClick={(event) => openInApp(event, onContactClick)}>
          Submit Partnership Inquiry
        </a>
        <a href="/" className="btn btn-outline" onClick={(event) => openInApp(event, onBackToHome)}>
          Return to Home
        </a>
      </EditorialCta>
    </EditorialPage>
  );
};
