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
          <h2>Our Services</h2>
          <p>Comprehensive digital solutions tailored to your business needs</p>
        </div>

        <div className="services-grid">
          {services.map((service) => (
            <div key={service.id} className="service-card">
              <div className="service-icon">{getIcon(service.icon)}</div>
              <h3>{service.title}</h3>
              <p>{service.shortDesc}</p>
              <div>
                <button
                  className="service-link"
                  onClick={() => {
                    if (service.slug) {
                      onSelectService(service);
                    } else {
                      onContactClick();
                    }
                  }}
                >
                  Learn More <ArrowRight size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {onOpenServicesPage && (
          <div style={{ textAlign: 'center', marginTop: '3rem' }}>
            <button
              onClick={onOpenServicesPage}
              className="btn btn-outline"
              style={{
                padding: '12px 28px',
                fontSize: '1rem',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                border: '1px solid var(--primary-color)',
                color: 'var(--primary-color)',
                cursor: 'pointer'
              }}
            >
              Explore Complete Services & Engineering Deliverables ({services.length} Core Pillars) <ArrowRight size={18} />
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
