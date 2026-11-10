import React, { useState, useEffect } from 'react';
import { Handshake, Network, Globe, ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';
import { PartnershipItem, PartnerLogo } from '../types';

interface PartnershipSectionProps {
  partnerships: PartnershipItem[];
  partnerLogos?: PartnerLogo[];
  notice?: string;
  onOpenPartnershipPage?: () => void;
}

export const PartnershipSection: React.FC<PartnershipSectionProps> = ({
  partnerships,
  partnerLogos = [],
  notice = "We are currently expanding our strategic partner network. Check back soon for new enterprise announcements!",
  onOpenPartnershipPage
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // How many logos visible per slide based on screen width
  const itemsPerView = 4;
  const maxIndex = Math.max(0, partnerLogos.length - itemsPerView);

  // Autoplay slider
  useEffect(() => {
    if (isPaused || partnerLogos.length <= itemsPerView) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
    }, 3200);

    return () => clearInterval(timer);
  }, [isPaused, partnerLogos.length, maxIndex]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  };

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Handshake':
        return <Handshake size={32} />;
      case 'Network':
        return <Network size={32} />;
      case 'Globe':
        return <Globe size={32} />;
      default:
        return <Handshake size={32} />;
    }
  };

  return (
    <section id="partnership" className="partnership">
      <div className="container">
        <div className="section-header">
          <h2>Our Partnerships</h2>
          <p>Collaborating with industry leaders to deliver exceptional results.</p>
        </div>

        {/* 3 Strategic Pillars */}
        <div className="services-grid" style={{ marginBottom: '3.5rem' }}>
          {partnerships.map((item) => (
            <div key={item.id} className="partner-card">
              <div className="partner-icon">{getIcon(item.icon)}</div>
              <h3 style={{ color: 'var(--text-white)', marginBottom: '0.75rem' }}>{item.title}</h3>
              <p style={{ color: 'var(--text-light)', margin: 0 }}>{item.description}</p>
            </div>
          ))}
        </div>

        {/* Dynamic Partner Logos Carousel */}
        {partnerLogos.length > 0 && (
          <div
            style={{
              background: 'rgba(15, 23, 42, 0.85)',
              borderRadius: '16px',
              border: '1px solid rgba(212, 175, 55, 0.25)',
              padding: '2.5rem 1.5rem',
              marginBottom: '2.5rem',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.4)',
              position: 'relative'
            }}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <span
                style={{
                  color: 'var(--primary-color)',
                  textTransform: 'uppercase',
                  letterSpacing: '2px',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  display: 'block',
                  marginBottom: '0.4rem'
                }}
              >
                Official Technology Ecosystem
              </span>
              <h3 style={{ color: '#fff', fontSize: '1.6rem', margin: 0 }}>
                Enterprise & Solution Partners
              </h3>
            </div>

            {/* Carousel Container */}
            <div style={{ position: 'relative', overflow: 'hidden', padding: '0.5rem 0' }}>
              <div
                style={{
                  display: 'flex',
                  gap: '1.5rem',
                  transform: `translateX(-${currentIndex * (100 / itemsPerView)}%)`,
                  transition: 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)'
                }}
              >
                {partnerLogos.map((logo) => (
                  <div
                    key={logo.id}
                    style={{
                      flex: `0 0 calc(${100 / itemsPerView}% - 1.15rem)`,
                      minWidth: '220px',
                      background: 'rgba(30, 41, 59, 0.7)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: '12px',
                      padding: '1.5rem 1rem',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      height: '140px',
                      transition: 'all 0.3s ease',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
                      textAlign: 'center'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-4px)';
                      e.currentTarget.style.borderColor = 'var(--primary-color)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                    }}
                  >
                    <div
                      style={{
                        height: '56px',
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '0.75rem'
                      }}
                    >
                      {logo.logoUrl ? (
                        <img
                          src={logo.logoUrl}
                          alt={logo.name}
                          style={{
                            maxHeight: '48px',
                            maxWidth: '140px',
                            objectFit: 'contain',
                            filter: 'brightness(1.1)'
                          }}
                          onError={(e) => {
                            // Fallback to text initials if broken URL
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            width: '45px',
                            height: '45px',
                            borderRadius: '50%',
                            background: 'var(--gradient-primary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                            color: '#0f172a'
                          }}
                        >
                          {logo.name.charAt(0)}
                        </div>
                      )}
                    </div>
                    <span
                      style={{
                        color: 'var(--text-white)',
                        fontWeight: 600,
                        fontSize: '0.9rem',
                        lineHeight: 1.2
                      }}
                    >
                      {logo.name}
                    </span>
                    {logo.websiteUrl && (
                      <a
                        href={logo.websiteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          fontSize: '0.75rem',
                          color: 'var(--primary-color)',
                          textDecoration: 'none',
                          marginTop: '4px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '3px'
                        }}
                      >
                        Visit Partner <ExternalLink size={12} />
                      </a>
                    )}
                  </div>
                ))}
              </div>

              {/* Navigation Controls */}
              {partnerLogos.length > itemsPerView && (
                <>
                  <button
                    onClick={handlePrev}
                    style={{
                      position: 'absolute',
                      left: '4px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      background: 'rgba(15, 23, 42, 0.95)',
                      border: '1px solid var(--primary-color)',
                      color: 'var(--primary-color)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      zIndex: 2,
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)'
                    }}
                    aria-label="Previous Partners"
                  >
                    <ChevronLeft size={22} />
                  </button>
                  <button
                    onClick={handleNext}
                    style={{
                      position: 'absolute',
                      right: '4px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      background: 'rgba(15, 23, 42, 0.95)',
                      border: '1px solid var(--primary-color)',
                      color: 'var(--primary-color)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      zIndex: 2,
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)'
                    }}
                    aria-label="Next Partners"
                  >
                    <ChevronRight size={22} />
                  </button>
                </>
              )}
            </div>

            {/* Pagination Indicators */}
            {partnerLogos.length > itemsPerView && (
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  gap: '8px',
                  marginTop: '1.25rem'
                }}
              >
                {Array.from({ length: maxIndex + 1 }).map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentIndex(idx)}
                    style={{
                      width: currentIndex === idx ? '24px' : '8px',
                      height: '8px',
                      borderRadius: '4px',
                      border: 'none',
                      background: currentIndex === idx ? 'var(--primary-color)' : 'rgba(255, 255, 255, 0.2)',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      padding: 0
                    }}
                    aria-label={`Slide ${idx + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        <div style={{ textAlign: 'center', padding: '1rem 0' }}>
          <p style={{ fontSize: '1.15rem', color: 'var(--primary-color)', fontWeight: 500 }}>
            {notice}
          </p>
        </div>

        {onOpenPartnershipPage && (
          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <button
              type="button"
              onClick={onOpenPartnershipPage}
              className="btn btn-primary"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.95rem',
                padding: '0.75rem 1.75rem'
              }}
            >
              Explore Enterprise Alliances & Partner Program (Partnership Page) →
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
