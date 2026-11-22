import React from 'react';
import { Star } from 'lucide-react';
import { Testimonial } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { ClientAvatar } from './ClientAvatar';

interface TestimonialsSectionProps {
  testimonials: Testimonial[];
  onOpenTestimonialsPage?: () => void;
}

export const TestimonialsSection: React.FC<TestimonialsSectionProps> = ({
  testimonials,
  onOpenTestimonialsPage
}) => {
  const { strings } = useLanguage();

  return (
    <section id="testimonials" className="testimonials">
      <div className="container">
        <div className="section-header">
          <h2>{strings.testimonials.sectionTitle}</h2>
          <p>{strings.testimonials.sectionSubtitle}</p>
        </div>

        <div className="services-grid">
          {testimonials.map((item) => (
            <div key={item.id} className="testimonial-card">
              <div>
                <div className="stars-rating">
                  {[...Array(item.rating || 5)].map((_, i) => (
                    <Star key={i} size={18} fill="var(--primary-dark)" stroke="var(--primary-dark)" />
                  ))}
                </div>
                <p className="testimonial-quote">"{item.quote}"</p>
              </div>

              <div className="testimonial-author">
                <ClientAvatar name={item.name} initials={item.initials} imageUrl={item.imageUrl} />
                <div>
                  <h4 style={{ margin: 0, fontSize: '1.05rem', color: 'var(--text-dark)' }}>
                    {item.name}
                  </h4>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-light)' }}>
                    {item.role}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {onOpenTestimonialsPage && (
          <div style={{ textAlign: 'center', marginTop: '3rem' }}>
            <button
              type="button"
              onClick={onOpenTestimonialsPage}
              className="btn btn-outline"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.95rem',
                padding: '0.75rem 1.75rem'
              }}
            >
              {strings.testimonials.cta}
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
