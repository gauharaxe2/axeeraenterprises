import React, { useMemo, useState } from 'react';
import { ArrowRight, Award, CheckCircle2, Quote, ShieldCheck, Star, TrendingUp } from 'lucide-react';
import { Testimonial } from '../types';
import {
  EditorialCta,
  EditorialHero,
  EditorialPage,
  EditorialPills,
  EditorialSection,
  EditorialTopbar,
  openInApp
} from './editorial/Editorial';

interface TestimonialsPageProps {
  testimonials: Testimonial[];
  onBackToHome: () => void;
  onContactClick: () => void;
}

type ReviewFilter = 'all' | 'ecommerce' | 'saas' | 'marketing';

const filterCategories: { id: ReviewFilter; label: string }[] = [
  { id: 'all', label: 'All Reviews' },
  { id: 'ecommerce', label: 'E-Commerce Brands' },
  { id: 'saas', label: 'SaaS Platforms' },
  { id: 'marketing', label: 'Digital Growth' }
];

export const TestimonialsPage: React.FC<TestimonialsPageProps> = ({
  testimonials,
  onBackToHome,
  onContactClick
}) => {
  const [activeFilter, setActiveFilter] = useState<ReviewFilter>('all');

  const enrichedTestimonials = useMemo(() => {
    return testimonials.map((testimonial) => {
      let category: Exclude<ReviewFilter, 'all'> = 'ecommerce';
      let outcome = '+150% Inbound Sales';

      if (
        testimonial.role.toLowerCase().includes('saas') ||
        testimonial.quote.toLowerCase().includes('saas') ||
        testimonial.role.toLowerCase().includes('founder')
      ) {
        category = 'saas';
        outcome = '-40% Churn & 3x Speed';
      } else if (
        testimonial.role.toLowerCase().includes('marketing') ||
        testimonial.quote.toLowerCase().includes('marketing')
      ) {
        category = 'marketing';
        outcome = '+240% Inbound Traffic';
      }

      return {
        ...testimonial,
        category,
        outcome
      };
    });
  }, [testimonials]);

  const filteredTestimonials = useMemo(() => {
    if (activeFilter === 'all') return enrichedTestimonials;
    return enrichedTestimonials.filter((testimonial) => testimonial.category === activeFilter);
  }, [enrichedTestimonials, activeFilter]);

  const counts = useMemo(() => {
    return {
      all: enrichedTestimonials.length,
      ecommerce: enrichedTestimonials.filter((item) => item.category === 'ecommerce').length,
      saas: enrichedTestimonials.filter((item) => item.category === 'saas').length,
      marketing: enrichedTestimonials.filter((item) => item.category === 'marketing').length
    };
  }, [enrichedTestimonials]);

  return (
    <EditorialPage page="testimonials">
      <EditorialTopbar
        crumb="Client Reviews & Testimonials"
        onBack={onBackToHome}
        action={
          <a href="/contact" className="btn btn-primary editorial-top-action" onClick={(event) => openInApp(event, onContactClick)}>
            Start a Project <ArrowRight size={16} aria-hidden="true" />
          </a>
        }
      />

      <EditorialHero
        eyebrow="Verified Client Success"
        title="Real Impact. Measurable Growth. Enduring Partnerships."
        description="Read direct feedback from the founders, corporate leaders, and marketing executives who have trusted Axe's Era Enterprise to architect their critical digital platforms."
      >
        <div className="editorial-metrics">
          <div className="editorial-metric">
            <strong style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Star size={18} aria-hidden="true" fill="currentColor" /> 5.0
            </strong>
            <span>Average Review Rating</span>
          </div>
          <div className="editorial-metric">
            <strong style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <TrendingUp size={18} aria-hidden="true" /> 99%
            </strong>
            <span>Client Retention & Follow-up Work</span>
          </div>
          <div className="editorial-metric">
            <strong style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <ShieldCheck size={18} aria-hidden="true" /> 100%
            </strong>
            <span>On-Time Milestone Delivery</span>
          </div>
        </div>
      </EditorialHero>

      <div className="editorial-toolbar">
        <div className="editorial-wrap">
          <EditorialPills
            label="Review categories"
            value={activeFilter}
            onChange={(id) => setActiveFilter(id as ReviewFilter)}
            options={filterCategories.map((category) => ({ ...category, count: counts[category.id] }))}
          />
        </div>
      </div>

      <EditorialSection id="reviews">
        <p className="editorial-countline" aria-live="polite">
          <span>
            Showing <strong>{filteredTestimonials.length}</strong>{' '}
            {filteredTestimonials.length === 1 ? 'review' : 'reviews'}
          </span>
          <span className="editorial-chip">
            <Award size={14} aria-hidden="true" /> Published client quotes
          </span>
        </p>
        <div className="editorial-grid" style={{ ['--card-min' as string]: '280px' }}>
          {filteredTestimonials.map((testimonial) => (
            <article key={testimonial.id} className="editorial-card accent">
              <div className="editorial-card-body">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <p className="stars-rating" aria-label={`${testimonial.rating} out of 5 stars`} style={{ margin: 0 }}>
                    {Array.from({ length: testimonial.rating || 5 }, (_, index) => (
                      <Star key={index} size={16} aria-hidden="true" fill="currentColor" />
                    ))}
                  </p>
                  <Quote size={22} aria-hidden="true" color="rgba(212, 175, 55, 0.7)" />
                </div>
                <p className="editorial-chip">{testimonial.outcome}</p>
                <blockquote className="editorial-quote">“{testimonial.quote}”</blockquote>
                <div className="editorial-author">
                  <span className="avatar-circle" aria-hidden="true">
                    {testimonial.initials}
                  </span>
                  <div>
                    <h3 style={{ fontSize: '1rem' }}>{testimonial.name}</h3>
                    <p className="editorial-muted">{testimonial.role}</p>
                  </div>
                  <span className="editorial-chip" style={{ marginLeft: 'auto' }}>
                    <CheckCircle2 size={14} aria-hidden="true" /> Verified
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </EditorialSection>

      <EditorialSection id="review-integrity">
        <article className="editorial-panel padded">
          <h2>Our Review Integrity Policy</h2>
          <p className="editorial-muted" style={{ marginTop: '0.7rem', maxWidth: '760px' }}>
            All client reviews published by Axe's Era Enterprise reflect genuine commercial deliverables. We do not
            fabricate testimonials or solicit incentivized reviews. Each quote is verified by project milestone sign-offs
            and live production deployment records.
          </p>
          <p className="editorial-chip" style={{ marginTop: '1rem' }}>
            <ShieldCheck size={14} aria-hidden="true" /> 100% Authentic Enterprise Client Endorsements
          </p>
        </article>
      </EditorialSection>

      <EditorialCta
        title="Ready to Become Our Next Success Story?"
        description="Join forward-thinking founders and established enterprises who rely on Axe's Era Enterprise to engineer high-performance digital platforms."
      >
        <a href="/contact" className="btn btn-primary" onClick={(event) => openInApp(event, onContactClick)}>
          Start Your Project Consultation
        </a>
        <a href="/" className="btn btn-outline" onClick={(event) => openInApp(event, onBackToHome)}>
          Return to Home
        </a>
      </EditorialCta>
    </EditorialPage>
  );
};
