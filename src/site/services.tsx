import { Box, Laptop, Megaphone, Palette, Search, Smartphone, TrendingUp } from 'lucide-react';
import type { ServiceItem } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { EmptyState, SiteNavigate, usePlainClick } from './chrome';

const ICONS = { Laptop, Palette, TrendingUp, Smartphone, Search, Megaphone, Box };

function Icon({ name }: { name: string }) {
  const Glyph = ICONS[name as keyof typeof ICONS] || Box;
  return <Glyph size={20} aria-hidden="true" />;
}

export function ServicesIndex({ services, navigate }: { services: ServiceItem[]; navigate: SiteNavigate }) {
  const { strings } = useLanguage();
  const click = usePlainClick(navigate);
  return (
    <section className="studio-section">
      <div className="studio-wrap">
        <p className="studio-kicker">{strings.services.sectionTitle}</p>
        <div className="studio-section-head">
          <h1>Services</h1>
          <p>{strings.services.sectionSubtitle}</p>
        </div>
        {services.length === 0 ? (
          <EmptyState title="Services" body="No services are published yet." />
        ) : (
          <div className="studio-grid">
            {services.map((service, index) => (
              <a key={service.id} className="studio-card" href={`/services/${service.id}`} onClick={(event) => click(event, `/services/${service.id}`)}>
                <span className="studio-index"><Icon name={service.icon} /> 0{index + 1}</span>
                <h2>{service.title}</h2>
                <p>{service.shortDesc}</p>
                <span className="studio-linkish">{strings.services.learnMore}</span>
              </a>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export function ServiceDetail({
  service,
  navigate
}: {
  service: ServiceItem | null;
  navigate: SiteNavigate;
}) {
  const { strings } = useLanguage();
  const click = usePlainClick(navigate);
  if (!service) {
    return (
      <section className="studio-section">
        <div className="studio-wrap">
          <EmptyState title="Service not published" body="That service is not on the site. The services list has everything currently published." />
          <p><a href="/services" onClick={(event) => click(event, '/services')}>Back to services</a></p>
        </div>
      </section>
    );
  }
  return (
    <section className="studio-section">
      <div className="studio-wrap studio-split">
        <div>
          <p className="studio-kicker"><a href="/services" onClick={(event) => click(event, '/services')}>{strings.services.sectionTitle}</a></p>
          <h1>{service.title}</h1>
          <p className="studio-lede">{service.fullDesc || service.shortDesc}</p>
          <div className="studio-actions">
            <a className="studio-btn studio-btn-primary" href="/contact" onClick={(event) => click(event, '/contact')}>{strings.hero.startProject}</a>
          </div>
        </div>
        <div className="studio-card">
          <h2>Included</h2>
          {service.features && service.features.length > 0 ? (
            <ul>
              {service.features.map((feature) => <li key={feature}>{feature}</li>)}
            </ul>
          ) : (
            <p>{service.shortDesc}</p>
          )}
        </div>
      </div>
    </section>
  );
}
