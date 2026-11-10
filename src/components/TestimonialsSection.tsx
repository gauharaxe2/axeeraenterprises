import React from 'react';
import { Star } from 'lucide-react';
import { Testimonial } from '../types';

interface TestimonialsSectionProps {
  testimonials: Testimonial[];
  onOpenTestimonialsPage?: () => void;
}

export const TestimonialsSection: React.FC<TestimonialsSectionProps> = ({
  testimonials,
  onOpenTestimonialsPage
}) => {
  return (
    <section id="testimonials" className="testimonials">
      <div className="container">
        <div className="section-header">
          <h2>Client Success Stories</h2>
          <p>Hear directly from the visionaries and organizations we've partnered with.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
          {testimonials.map((item) => (
            <div key={item.id} className="testimonial-card">
              <div>
                <div className="stars-rating">
                  {[...Array(item.rating || 5)].map((_, i) => (
                    <Star key={i} size={18} fill="var(--primary-color)" stroke="var(--primary-color)" />
                  ))}
                </div>
                <p className="testimonial-quote">"{item.quote}"</p>
              </div>

              <div className="testimonial-author">
                <div className="avatar-circle">{item.initials}</div>
                <div>
                  <h4 style={{ color: 'var(--text-white)', marginBottom: '0.15rem' }}>{item.name}</h4>
                  <p style={{ color: 'var(--primary-color)', fontSize: '0.85rem', margin: 0 }}>
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
              className="btn btn-primary"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.95rem',
                padding: '0.75rem 1.75rem'
              }}
            >
              Explore All Verified Client Reviews & Ratings (Testimonials Page) →
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
