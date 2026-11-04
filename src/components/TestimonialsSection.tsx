import React from 'react';
import { Star } from 'lucide-react';
import { Testimonial } from '../types';

interface TestimonialsSectionProps {
  testimonials: Testimonial[];
}

export const TestimonialsSection: React.FC<TestimonialsSectionProps> = ({ testimonials }) => {
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
      </div>
    </section>
  );
};
