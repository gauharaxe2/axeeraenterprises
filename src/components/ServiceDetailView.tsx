import React from 'react';
import { ArrowLeft, Check, Laptop, Palette, TrendingUp, Smartphone, ArrowRight, ShieldCheck, Zap } from 'lucide-react';
import { ServiceItem } from '../types';

interface ServiceDetailViewProps {
  service: ServiceItem;
  onBackToHome: () => void;
  onContactClick: () => void;
}

export const ServiceDetailView: React.FC<ServiceDetailViewProps> = ({
  service,
  onBackToHome,
  onContactClick
}) => {
  const getHeroIcon = () => {
    switch (service.slug) {
      case 'web-development':
        return <Laptop size={80} />;
      case 'brand-design':
        return <Palette size={80} />;
      case 'digital-marketing':
        return <TrendingUp size={80} />;
      case 'mobile-apps':
        return <Smartphone size={80} />;
      default:
        return <Laptop size={80} />;
    }
  };

  const getSubServices = () => {
    switch (service.slug) {
      case 'web-development':
        return [
          {
            title: 'Custom Web Applications',
            desc: 'Tailored platforms built from scratch with high-performance architectures and secure API endpoints.'
          },
          {
            title: 'E-Commerce Platforms',
            desc: 'High-converting online stores with custom cart flows, multi-currency checkout, and ERP integrations.'
          },
          {
            title: 'CMS & Headless Architectures',
            desc: 'Scalable content management systems enabling marketing teams to deploy content rapidly.'
          },
          {
            title: 'Progressive Web Apps (PWA)',
            desc: 'Installable, offline-first web apps that deliver native-like performance on all devices.'
          },
          {
            title: 'Backend & Cloud DevOps',
            desc: 'Resilient microservices, database normalization, caching tiers, and automated cloud deployments.'
          },
          {
            title: 'Ongoing Maintenance & SLA',
            desc: '24/7 uptime monitoring, vulnerability patching, and database speed tuning.'
          }
        ];
      case 'brand-design':
        return [
          {
            title: 'Logo & Visual Identity',
            desc: 'Memorable brand marks that represent your company’s core values and stand out in crowded markets.'
          },
          {
            title: 'Design Systems & Guidelines',
            desc: 'Complete rulebooks covering typography, color ratios, component behavior, and brand voice.'
          },
          {
            title: 'Corporate Stationery',
            desc: 'Business cards, letterheads, invoice templates, and presentation decks.'
          },
          {
            title: 'Digital & Social Assets',
            desc: 'Banner suites, social media avatar systems, and interactive brand components.'
          }
        ];
      case 'digital-marketing':
        return [
          {
            title: 'Search Engine Optimization (SEO)',
            desc: 'Technical site audits, schema structured data, content clustering, and high-authority link acquisition.'
          },
          {
            title: 'Paid Media (PPC / Google Ads)',
            desc: 'High-intent search ads, display remarketing, and conversion tracking attribution.'
          },
          {
            title: 'Conversion Rate Optimization (CRO)',
            desc: 'Heatmap analysis, user flow restructuring, and A/B test experiments that turn visitors into buyers.'
          },
          {
            title: 'Content & Social Strategy',
            desc: 'Thought leadership articles and targeted campaign assets designed to build lasting trust.'
          }
        ];
      case 'mobile-apps':
        return [
          {
            title: 'iOS App Development',
            desc: 'Native applications designed according to Apple Human Interface Guidelines using Swift and SwiftUI.'
          },
          {
            title: 'Android App Development',
            desc: 'Custom Android applications engineered in Kotlin with support for modern Android devices.'
          },
          {
            title: 'Cross-Platform Applications',
            desc: 'Unified codebases using React Native or Flutter for rapid time-to-market without compromising speed.'
          },
          {
            title: 'App Store Optimization (ASO)',
            desc: 'Keyword optimization and creative asset testing to maximize organic installs on App Store & Google Play.'
          }
        ];
      default:
        return [
          {
            title: 'Strategic Consultation',
            desc: 'Targeted discovery and planning to identify high-leverage digital opportunities.'
          },
          {
            title: 'Implementation & Delivery',
            desc: 'High-velocity development backed by automated testing and rigorous quality assurance.'
          }
        ];
    }
  };

  return (
    <div style={{ paddingTop: '70px', minHeight: '100vh', background: 'var(--bg-light)' }}>
      {/* Service Hero */}
      <section
        style={{
          padding: '110px 0 70px',
          background: 'linear-gradient(135deg, #0f172a 0%, #000000 100%)',
          color: '#ffffff',
          position: 'relative'
        }}
      >
        <div className="container">
          <button
            onClick={onBackToHome}
            style={{
              background: 'transparent',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: 'var(--primary-color)',
              padding: '8px 18px',
              borderRadius: '20px',
              cursor: 'pointer',
              marginBottom: '1.5rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontWeight: 600
            }}
          >
            <ArrowLeft size={16} /> Back to All Services
          </button>

          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '3rem', alignItems: 'center' }}>
            <div>
              <span
                style={{
                  color: 'var(--primary-color)',
                  textTransform: 'uppercase',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  letterSpacing: '2px',
                  display: 'block',
                  marginBottom: '0.5rem'
                }}
              >
                Axe's Era Enterprise Solutions
              </span>
              <h1 style={{ fontSize: '3.4rem', marginBottom: '1.25rem', color: '#fff' }}>
                {service.title}
              </h1>
              <p style={{ fontSize: '1.2rem', color: 'var(--text-light)', lineHeight: 1.7, marginBottom: '2rem' }}>
                {service.fullDesc || service.shortDesc}
              </p>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <button onClick={onContactClick} className="btn btn-primary">
                  Start Your Project
                </button>
                <button onClick={onBackToHome} className="btn btn-outline">
                  View Case Studies
                </button>
              </div>
            </div>

            <div style={{ textAlign: 'center' }}>
              <div
                style={{
                  width: '220px',
                  height: '220px',
                  borderRadius: '50%',
                  background: 'rgba(212, 175, 55, 0.1)',
                  border: '2px solid rgba(212, 175, 55, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto',
                  color: 'var(--primary-color)',
                  boxShadow: '0 0 40px rgba(212, 175, 55, 0.2)'
                }}
              >
                {getHeroIcon()}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Offerings Grid */}
      <section style={{ padding: '80px 0' }}>
        <div className="container">
          <div className="section-header">
            <h2>Specialized Capabilities</h2>
            <p>Engineered for maximum reliability, scalability, and measurable business growth.</p>
          </div>

          <div className="services-grid">
            {getSubServices().map((item, idx) => (
              <div
                key={idx}
                style={{
                  background: 'rgba(30, 41, 59, 0.7)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '12px',
                  padding: '2rem',
                  boxShadow: 'var(--shadow-md)'
                }}
              >
                <div
                  style={{
                    color: 'var(--primary-color)',
                    marginBottom: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <Check size={22} />
                  <h3 style={{ margin: 0, color: '#fff', fontSize: '1.25rem' }}>{item.title}</h3>
                </div>
                <p style={{ color: 'var(--text-light)', margin: 0, lineHeight: 1.6 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Technologies & Standards */}
      <section style={{ padding: '60px 0 100px', background: 'var(--bg-white)' }}>
        <div className="container">
          <div className="section-header">
            <h2>Our Standards & Technologies</h2>
            <p>We work exclusively with industry-proven, high-performance tools.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
            <div
              style={{
                background: 'rgba(15, 23, 42, 0.8)',
                padding: '2rem',
                borderRadius: '12px',
                border: '1px solid var(--border-color)'
              }}
            >
              <h3 style={{ color: 'var(--primary-color)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Zap size={22} /> Performance-First
              </h3>
              <p style={{ color: 'var(--text-light)', lineHeight: 1.6 }}>
                Every solution is audited against strict speed benchmarks, achieving sub-second load times and 90+ Core Web Vitals scores.
              </p>
            </div>

            <div
              style={{
                background: 'rgba(15, 23, 42, 0.8)',
                padding: '2rem',
                borderRadius: '12px',
                border: '1px solid var(--border-color)'
              }}
            >
              <h3 style={{ color: 'var(--primary-color)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldCheck size={22} /> Enterprise Security
              </h3>
              <p style={{ color: 'var(--text-light)', lineHeight: 1.6 }}>
                SSL enforcement, sanitized database queries, encrypted communications, and adherence to modern privacy regulations.
              </p>
            </div>

            <div
              style={{
                background: 'rgba(15, 23, 42, 0.8)',
                padding: '2rem',
                borderRadius: '12px',
                border: '1px solid var(--border-color)'
              }}
            >
              <h3 style={{ color: 'var(--primary-color)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Laptop size={22} /> Modern Tech Stacks
              </h3>
              <p style={{ color: 'var(--text-light)', lineHeight: 1.6 }}>
                TypeScript, React, Node.js, Next.js, Kotlin, Swift, PostgreSQL, Tailwind, and AWS cloud infrastructure.
              </p>
            </div>
          </div>

          {/* CTA Banner */}
          <div
            style={{
              marginTop: '4rem',
              padding: '3rem',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.15) 0%, rgba(15, 23, 42, 0.95) 100%)',
              border: '1px solid var(--primary-color)',
              textAlign: 'center'
            }}
          >
            <h3 style={{ fontSize: '2rem', color: '#fff', marginBottom: '1rem' }}>
              Ready to elevate your {service.title}?
            </h3>
            <p style={{ color: 'var(--text-light)', maxWidth: '650px', margin: '0 auto 2rem', fontSize: '1.05rem' }}>
              Discuss your project scope directly with Founder Gauhar Axe and receive a comprehensive roadmap tailored to your timeline.
            </p>
            <button onClick={onContactClick} className="btn btn-primary" style={{ padding: '14px 36px', fontSize: '1.05rem' }}>
              Request Project Proposal <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
