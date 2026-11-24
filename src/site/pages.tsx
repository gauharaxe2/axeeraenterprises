import { Handshake, Network, Globe } from 'lucide-react';
import type { AgencyGeneralInfo, FaqItem, PartnerLogo, PartnershipItem, PolicyType, TeamMemberData, Testimonial } from '../types';
import { POLICIES_DATA } from '../data/policiesData';
import { useLanguage } from '../context/LanguageContext';
import { collectTeamSocialLinks } from '../utils/teamSocials';
import { resolveMemberBiography, resolveMemberSkills } from '../utils/teamProfile';
import { googleMapsDirectionsUrl, googleMapsEmbedUrl, googleMapsPlaceUrl } from '../utils/maps';
import { EmptyState, Media, SiteNavigate, usePlainClick } from './chrome';
import { ContactEnquiryForm } from '../components/ContactPage';

export function AboutPage({ info, navigate }: { info: AgencyGeneralInfo; navigate: SiteNavigate }) {
  const { strings } = useLanguage();
  const click = usePlainClick(navigate);
  return (
    <section className="studio-section">
      <div className="studio-wrap studio-split">
        <div>
          <p className="studio-kicker">{strings.about.sectionTitle}</p>
          <h1>{info.aboutTitle}</h1>
          <p>{info.aboutParagraph1}</p>
          <p>{info.aboutParagraph2}</p>
          <a className="studio-btn studio-btn-primary" href="/contact" onClick={(event) => click(event, '/contact')}>{strings.hero.startProject}</a>
        </div>
        <Media src={info.aboutImageUrl} alt={info.aboutTitle} />
      </div>
    </section>
  );
}

export function TeamPage({ team, navigate }: { team: TeamMemberData[]; navigate: SiteNavigate }) {
  const { strings } = useLanguage();
  const click = usePlainClick(navigate);
  return (
    <section className="studio-section">
      <div className="studio-wrap">
        <p className="studio-kicker">{strings.team.sectionTitle}</p>
        <h1>Team</h1>
        {team.length === 0 ? (
          <EmptyState title="Team" body="No team profiles are published yet." />
        ) : (
          <div className="studio-work" style={{ marginTop: '1.4rem' }}>
            {team.map((member) => {
              const links = collectTeamSocialLinks(member);
              const skills = resolveMemberSkills(member);
              return (
                <article key={member.id} id={`member-${member.id}`} className="studio-person">
                  <Media src={member.imageUrl} alt={member.name} />
                  <div>
                    <h2>{member.name}</h2>
                    <p>{member.title}</p>
                    <p>{resolveMemberBiography(member)}</p>
                    {skills.length > 0 && (
                      <ul>{skills.map((skill) => <li key={skill}>{skill}</li>)}</ul>
                    )}
                    {links.length > 0 && (
                      <div className="studio-socials">
                        {links.map((link) => (
                          <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer">{link.label}</a>
                        ))}
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
        <p style={{ marginTop: '1rem' }}><a href="/contact" onClick={(event) => click(event, '/contact')}>{strings.hero.startProject}</a></p>
      </div>
    </section>
  );
}

export function TestimonialsPage({ items, navigate }: { items: Testimonial[]; navigate: SiteNavigate }) {
  const { strings } = useLanguage();
  const click = usePlainClick(navigate);
  return (
    <section className="studio-section">
      <div className="studio-wrap">
        <p className="studio-kicker">{strings.testimonials.sectionTitle}</p>
        <h1>Testimonials</h1>
        <p>{strings.testimonials.sectionSubtitle}</p>
        {items.length === 0 ? (
          <EmptyState title="Testimonials" body="No testimonials are published yet." />
        ) : (
          <div className="studio-grid" style={{ marginTop: '1rem' }}>
            {items.map((item) => (
              <article key={item.id} className="studio-card">
                <div className="studio-stars" aria-label={`${item.rating} of 5`}>{`${'★'.repeat(item.rating)}`}</div>
                <p className="studio-quote">{item.quote}</p>
                <p><strong>{item.name}</strong><br />{item.role}</p>
              </article>
            ))}
          </div>
        )}
        <p><a href="/contact" onClick={(event) => click(event, '/contact')}>{strings.hero.startProject}</a></p>
      </div>
    </section>
  );
}

const PARTNER_ICONS = { Handshake, Network, Globe };

export function PartnershipPage({
  items,
  logos,
  notice,
  navigate
}: {
  items: PartnershipItem[];
  logos: PartnerLogo[];
  notice: string;
  navigate: SiteNavigate;
}) {
  const { strings } = useLanguage();
  const click = usePlainClick(navigate);
  return (
    <section className="studio-section">
      <div className="studio-wrap">
        <p className="studio-kicker">{strings.partnerships.ecosystemBadge}</p>
        <h1>{strings.partnerships.sectionTitle}</h1>
        {items.length === 0 && logos.length === 0 ? (
          <EmptyState title="Partnerships" body={notice || 'No partnership notes are published yet.'} />
        ) : (
          <>
            <div className="studio-grid" style={{ marginTop: '1rem' }}>
              {items.map((item) => {
                const Glyph = PARTNER_ICONS[item.icon] || Handshake;
                return (
                  <article key={item.id} className="studio-card">
                    <Glyph size={20} aria-hidden="true" />
                    <h2>{item.title}</h2>
                    <p>{item.description}</p>
                  </article>
                );
              })}
            </div>
            {logos.length > 0 && (
              <div className="studio-logos" style={{ marginTop: '1.2rem' }}>
                {logos.map((logo) => {
                  const inner = logo.logoUrl ? <img src={logo.logoUrl} alt={logo.name} /> : logo.name;
                  return logo.websiteUrl ? (
                    <a key={logo.id} href={logo.websiteUrl} target="_blank" rel="noopener noreferrer">{inner}</a>
                  ) : <span key={logo.id}>{inner}</span>;
                })}
              </div>
            )}
          </>
        )}
        {notice && <p>{notice}</p>}
        <a className="studio-btn studio-btn-primary" href="/contact" onClick={(event) => click(event, '/contact')}>{strings.hero.startProject}</a>
      </div>
    </section>
  );
}

export function FaqPage({ faqs, navigate }: { faqs: FaqItem[]; navigate: SiteNavigate }) {
  const { strings } = useLanguage();
  const click = usePlainClick(navigate);
  return (
    <section className="studio-section">
      <div className="studio-wrap">
        <p className="studio-kicker">{strings.faq.sectionTitle}</p>
        <h1>FAQs</h1>
        <p>{strings.faq.sectionSubtitle}</p>
        {faqs.length === 0 ? (
          <EmptyState title="FAQs" body="No questions are published yet." />
        ) : (
          <div className="studio-faq">
            {faqs.map((faq) => (
              <details key={faq.id || faq.question}>
                <summary>{faq.question}</summary>
                <p>{faq.answer}</p>
              </details>
            ))}
          </div>
        )}
        <p><a href="/contact" onClick={(event) => click(event, '/contact')}>{strings.contact.getInTouch}</a></p>
      </div>
    </section>
  );
}

export function LocationPage({ info, navigate }: { info: AgencyGeneralInfo; navigate: SiteNavigate }) {
  const click = usePlainClick(navigate);
  const pin = { lat: info.mapLatitude || 0, lng: info.mapLongitude || 0 };
  const hasPin = typeof info.mapLatitude === 'number' && typeof info.mapLongitude === 'number';
  return (
    <section className="studio-section">
      <div className="studio-wrap">
        <p className="studio-kicker">Studio</p>
        <h1>Location</h1>
        <p>{info.contactAddress}</p>
        <p>{info.contactPhone}</p>
        <p><a href={`mailto:${info.contactEmail}`}>{info.contactEmail}</a></p>
        <iframe className="studio-map" title="Map of the studio" src={googleMapsEmbedUrl(info.contactAddress, hasPin ? pin : null)} loading="lazy" />
        <div className="studio-actions">
          <a className="studio-btn studio-btn-line" href={googleMapsPlaceUrl(info.contactAddress, hasPin ? pin : null)} target="_blank" rel="noopener noreferrer">Open in Google Maps</a>
          <a className="studio-btn studio-btn-line" href={googleMapsDirectionsUrl(info.contactAddress, hasPin ? pin : null)} target="_blank" rel="noopener noreferrer">Directions</a>
          <a className="studio-btn studio-btn-primary" href="/contact" onClick={(event) => click(event, '/contact')}>Contact</a>
        </div>
      </div>
    </section>
  );
}

export function PoliciesPage({
  policy,
  navigate,
  onPolicy
}: {
  policy: PolicyType;
  navigate: SiteNavigate;
  onPolicy: (policy: PolicyType) => void;
}) {
  const click = usePlainClick(navigate);
  const doc = POLICIES_DATA[policy];
  const tabs: PolicyType[] = ['legal-notice', 'privacy-policy', 'terms-of-service'];
  return (
    <section className="studio-section">
      <div className="studio-wrap studio-prose">
        <p className="studio-kicker">{doc.badge}</p>
        <h1>{doc.title}</h1>
        <p className="studio-meta">Updated {doc.lastUpdated} · Effective {doc.effectiveDate}</p>
        <div className="studio-filters">
          {tabs.map((id) => (
            <a
              key={id}
              className="studio-btn studio-btn-line"
              href={id === 'legal-notice' ? '/policies' : `/policies#${id}`}
              aria-current={policy === id ? 'page' : undefined}
              onClick={(event) => {
                if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
                event.preventDefault();
                onPolicy(id);
              }}
            >
              {POLICIES_DATA[id].title}
            </a>
          ))}
        </div>
        <p>{doc.summary}</p>
        {doc.sections.map((section) => (
          <section key={section.id} id={section.id}>
            <h2>{section.title}</h2>
            {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            {section.listItems && (
              <ul>{section.listItems.map((item) => <li key={item}>{item}</li>)}</ul>
            )}
            {section.subsections?.map((sub) => (
              <div key={sub.subtitle}>
                <h3>{sub.subtitle}</h3>
                {sub.content.map((line) => <p key={line}>{line}</p>)}
              </div>
            ))}
          </section>
        ))}
        <p><a href="/contact" onClick={(event) => click(event, '/contact')}>Contact</a></p>
      </div>
    </section>
  );
}

export function NotFoundPage({ navigate }: { navigate: SiteNavigate }) {
  const click = usePlainClick(navigate);
  return (
    <section className="studio-section">
      <div className="studio-wrap">
        <p className="studio-kicker">404</p>
        <h1>That page is not on the site.</h1>
        <div className="studio-actions">
          <a className="studio-btn studio-btn-ink" href="/" onClick={(event) => click(event, '/')}>Home</a>
          <a className="studio-btn studio-btn-line" href="/contact" onClick={(event) => click(event, '/contact')}>Contact</a>
        </div>
      </div>
    </section>
  );
}

export function ContactBand({
  info,
  services,
  onShowNotification
}: {
  info: AgencyGeneralInfo;
  services: { id: string; title: string }[];
  onShowNotification: (message: string, type: 'success' | 'error' | 'info') => void;
}) {
  return (
    <section className="studio-section" id="contact">
      <div className="studio-wrap studio-split">
        <div>
          <p className="studio-kicker">Contact</p>
          <h2>Write to the studio</h2>
          <p>{info.contactAddress}</p>
          <p>{info.contactPhone}</p>
          <p><a href={`mailto:${info.contactEmail}`}>{info.contactEmail}</a></p>
          {info.urgentNotice && <div className="studio-note">{info.urgentNotice}</div>}
        </div>
        <ContactEnquiryForm
          idPrefix="home-contact"
          phone={info.contactPhone}
          servicesList={services}
          onShowNotification={onShowNotification}
        />
      </div>
    </section>
  );
}
