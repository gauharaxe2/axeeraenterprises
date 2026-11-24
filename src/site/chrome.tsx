import React, { useState } from 'react';
import { SITE_LOGO_SRC } from '../brand';
import { LANGUAGE_OPTIONS } from '../i18n/languages';
import { useLanguage } from '../context/LanguageContext';
import { WhatsAppIcon } from '../components/WhatsAppIcon';
import type { PageView, PolicyType, ServiceItem } from '../types';
import { subscribeToNewsletter } from '../utils/firebase';

export interface SiteNavigate {
  (url: string): void;
}

export function usePlainClick(navigate: SiteNavigate) {
  return (event: React.MouseEvent<HTMLAnchorElement>, url: string) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
    event.preventDefault();
    navigate(url);
  };
}

export function Media({ src, alt, className }: { src?: string; alt: string; className?: string }) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) {
    return <div className={`studio-ph ${className || ''}`} aria-hidden="true">{alt.slice(0, 1)}</div>;
  }
  return <img src={src} alt={alt} className={className} loading="lazy" onError={() => setFailed(true)} />;
}

export function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="studio-empty">
      <h2>{title}</h2>
      <p>{body}</p>
    </div>
  );
}

const PRIMARY: Array<{ href: string; page: PageView; label: string }> = [
  { href: '/', page: 'home', label: 'Home' },
  { href: '/services', page: 'services', label: 'Services' },
  { href: '/case-studies', page: 'websites', label: 'Case studies' },
  { href: '/blog', page: 'blogs', label: 'Blog' },
  { href: '/about', page: 'about', label: 'About' },
  { href: '/contact', page: 'contact', label: 'Contact' }
];

const MORE: Array<{ href: string; page: PageView; label: string }> = [
  { href: '/team', page: 'team', label: 'Team' },
  { href: '/testimonials', page: 'testimonials', label: 'Testimonials' },
  { href: '/faq', page: 'faq', label: 'FAQs' },
  { href: '/partnership', page: 'partnership', label: 'Partnership' },
  { href: '/location', page: 'location', label: 'Location' },
  { href: '/policies', page: 'policies', label: 'Policies' }
];

function currentNav(page: PageView): PageView {
  if (page === 'service-detail') return 'services';
  if (page === 'blog-detail') return 'blogs';
  if (page === 'project-detail') return 'websites';
  return page;
}

export function SiteHeader({ page, navigate }: { page: PageView; navigate: SiteNavigate }) {
  const { language, setLanguage, strings } = useLanguage();
  const [open, setOpen] = useState(false);
  const [more, setMore] = useState(false);
  const click = usePlainClick((url) => {
    setOpen(false);
    setMore(false);
    navigate(url);
  });
  const active = currentNav(page);
  const labels: Record<string, string> = {
    home: strings.nav.home,
    services: strings.nav.services,
    websites: language === 'en' ? 'Case studies' : strings.nav.websites,
    blogs: language === 'en' ? 'Blog' : strings.nav.blogs,
    about: strings.nav.about,
    contact: strings.nav.contact,
    team: strings.nav.team,
    testimonials: strings.nav.testimonials,
    faq: strings.nav.faq,
    partnership: strings.nav.partnership,
    location: strings.nav.location,
    policies: strings.nav.policies
  };

  return (
    <header className={`studio-header ${open ? 'is-open' : ''}`}>
      <a className="studio-skip" href="#content">Skip to content</a>
      <div className="studio-header-inner">
        <a href="/" className="studio-brand" onClick={(event) => click(event, '/')}>
          <img src={SITE_LOGO_SRC} alt="" />
          <span>
            <strong>{strings.brand.name}</strong>
            <span>{strings.brand.tagline}</span>
          </span>
        </a>
        <nav className="studio-nav" aria-label="Primary">
          {PRIMARY.map((item) => (
            <a
              key={item.href}
              href={item.href}
              aria-current={active === item.page ? 'page' : undefined}
              onClick={(event) => click(event, item.href)}
            >
              {labels[item.page] || item.label}
            </a>
          ))}
          <div className="studio-more">
            <button type="button" aria-expanded={more} onClick={() => setMore((value) => !value)}>
              More
            </button>
            {more && (
              <div className="studio-more-panel">
                {MORE.map((item) => (
                  <a key={item.href} href={item.href} onClick={(event) => click(event, item.href)}>
                    {labels[item.page] || item.label}
                  </a>
                ))}
              </div>
            )}
          </div>
        </nav>
        <div className="studio-tools">
          <label className="studio-sr" htmlFor="studio-lang" style={{ position: 'absolute', left: '-9999px' }}>
            Language
          </label>
          <select
            id="studio-lang"
            className="studio-lang"
            value={language}
            aria-label="Language"
            onChange={(event) => setLanguage(event.target.value as typeof language)}
          >
            {LANGUAGE_OPTIONS.map((option) => (
              <option key={option.code} value={option.code}>
                {option.shortCode}
              </option>
            ))}
          </select>
          <a className="studio-btn studio-btn-primary" href="/contact" onClick={(event) => click(event, '/contact')}>
            {strings.hero.startProject}
          </a>
          <button type="button" className="studio-btn studio-btn-line studio-burger" aria-expanded={open} onClick={() => setOpen((value) => !value)}>
            {open ? 'Close' : 'Menu'}
          </button>
        </div>
      </div>
    </header>
  );
}

export function SiteFooter({
  navigate,
  services,
  address,
  email,
  phone
}: {
  navigate: SiteNavigate;
  services: ServiceItem[];
  address: string;
  email: string;
  phone: string;
}) {
  const { strings } = useLanguage();
  const click = usePlainClick(navigate);
  const [emailValue, setEmailValue] = useState('');
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState('');

  const subscribe = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!emailValue.trim()) {
      setFeedback(strings.footer.newsletterEmailRequired);
      return;
    }
    setBusy(true);
    const result = await subscribeToNewsletter({ email: emailValue, source: 'footer' });
    setBusy(false);
    setFeedback(result.success ? strings.footer.newsletterSuccess : result.error || strings.footer.newsletterError);
    if (result.success) setEmailValue('');
  };

  return (
    <footer className="studio-footer">
      <div className="studio-wrap studio-footer-grid">
        <div>
          <h2>{strings.brand.name}</h2>
          <p>{strings.footer.founderInfo}</p>
          <p>{address}</p>
          <p><a href={`mailto:${email}`}>{email}</a></p>
          <p>{phone}</p>
        </div>
        <div>
          <h2>{strings.footer.servicesHeading}</h2>
          {services.map((service) => (
            <a key={service.id} href={`/services/${service.id}`} onClick={(event) => click(event, `/services/${service.id}`)}>
              {service.title}
            </a>
          ))}
        </div>
        <div>
          <h2>{strings.footer.companyHeading}</h2>
          {MORE.map((item) => (
            <a key={item.href} href={item.href} onClick={(event) => click(event, item.href)}>
              {item.label}
            </a>
          ))}
          <a href="/policies#privacy-policy" onClick={(event) => click(event, '/policies#privacy-policy')}>Privacy</a>
          <a href="/policies#terms-of-service" onClick={(event) => click(event, '/policies#terms-of-service')}>Terms</a>
        </div>
        <div>
          <h2>{strings.footer.newsletterHeading}</h2>
          <p>{strings.footer.newsletterDesc}</p>
          <form onSubmit={(event) => void subscribe(event)} className="studio-form">
            <input
              type="email"
              value={emailValue}
              onChange={(event) => setEmailValue(event.target.value)}
              placeholder={strings.footer.newsletterPlaceholder}
              aria-label={strings.footer.newsletterPlaceholder}
            />
            <button className="studio-btn studio-btn-ink" type="submit" disabled={busy}>
              {busy ? strings.footer.newsletterSubscribing : strings.footer.newsletterButton}
            </button>
            {feedback && <p role="status">{feedback}</p>}
          </form>
        </div>
      </div>
    </footer>
  );
}

export function WhatsAppFloat({ number }: { number?: string }) {
  const clean = (number || '923157338694').replace(/[^0-9]/g, '');
  return (
    <a className="studio-whatsapp" href={`https://wa.me/${clean}`} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">
      <WhatsAppIcon size={30} color="#ffffff" />
    </a>
  );
}

export function policyPath(policy: PolicyType): string {
  return policy === 'legal-notice' ? '/policies' : `/policies#${policy}`;
}
