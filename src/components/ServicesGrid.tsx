import React from 'react';
import {
  Laptop,
  Palette,
  TrendingUp,
  Smartphone,
  Search,
  Megaphone,
  Box,
  ArrowRight
} from 'lucide-react';
import { ServiceItem } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface ServicesGridProps {
  services: ServiceItem[];
  onSelectService: (service: ServiceItem) => void;
  onContactClick: () => void;
  onOpenServicesPage?: () => void;
}

export const ServicesGrid: React.FC<ServicesGridProps> = ({
  services,
  onSelectService,
  onContactClick,
  onOpenServicesPage
}) => {
  const { strings } = useLanguage();

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Laptop':
        return <Laptop size={26} />;
      case 'Palette':
        return <Palette size={26} />;
      case 'TrendingUp':
        return <TrendingUp size={26} />;
      case 'Smartphone':
        return <Smartphone size={26} />;
      case 'Search':
        return <Search size={26} />;
      case 'Megaphone':
        return <Megaphone size={26} />;
      case 'Box':
        return <Box size={26} />;
      default:
        return <Laptop size={26} />;
    }
  };

  return (
    <section id="services" className="services">
      <div className="container">
        <div className="section-header">
          <h2>{strings.services.sectionTitle}</h2>
          <p>{strings.services.sectionSubtitle}</p>
        </div>

        <div className="services-grid">
          {services.map((service) => (
            <div key={service.id} className="service-card">
              <div className="service-icon">{getIcon(service.icon)}</div>
              <h3>{service.title}</h3>
              <p>{service.shortDesc}</p>
              <button
                type="button"
                className="service-link"
                onClick={() => {
                  if (service.slug) {
                    onSelectService(service);
                  } else {
                    onContactClick();
                  }
                }}
              >
                {strings.services.learnMore} <ArrowRight size={16} />
              </button>
            </div>
          ))}
        </div>

        {onOpenServicesPage && (
          <div style={{ textAlign: 'center', marginTop: '3rem' }}>
            <button
              type="button"
              onClick={onOpenServicesPage}
              className="btn btn-outline"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.95rem',
                padding: '0.75rem 1.75rem'
              }}
            >
              {strings.services.exploreAll}
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
