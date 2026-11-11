import React, { useState } from 'react';
import {
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
  Youtube,
  Scale,
  Shield,
  FileText,
  Mail,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight
} from 'lucide-react';
import { WhatsAppIcon } from './WhatsAppIcon';
import { PageView, PolicyType } from '../types';
import { subscribeToNewsletter } from '../utils/firebase';

interface FooterProps {
  onNavigateSection: (sectionId: string) => void;
  onOpenBlogs: () => void;
  onOpenService: (serviceSlug: string) => void;
  onOpenPolicy: (policyType: PolicyType) => void;
  onOpenServicesPage?: () => void;
  onOpenPage?: (page: PageView) => void;
}

export const Footer: React.FC<FooterProps> = ({
  onNavigateSection,
  onOpenBlogs,
  onOpenService,
  onOpenPolicy,
  onOpenServicesPage,
  onOpenPage
}) => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [feedback, setFeedback] = useState('');

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setStatus('error');
      setFeedback('Please enter your email address.');
      return;
    }

    setStatus('loading');
    setFeedback('');

    try {
      const result = await subscribeToNewsletter({ email: cleanEmail, source: 'footer_form' });
      if (result.success) {
        setStatus('success');
        setFeedback("You're subscribed! Welcome to Axe's Era insights.");
        setEmail('');
      } else {
        setStatus('error');
        setFeedback(result.error || 'Failed to subscribe. Please try again.');
      }
    } catch {
      setStatus('error');
      setFeedback('Unable to subscribe at this moment. Please try again.');
    }
  };

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <div className="footer-brand">
              <h2>
                Axe's Era <span>Enterprise</span>
              </h2>
              <p style={{ color: 'rgba(255, 255, 255, 0.75)', lineHeight: 1.6 }}>
                Transforming businesses through innovative digital architecture, conversion-engineered design, and high-performance applications.
              </p>
              <p style={{ color: 'var(--primary-color)', fontSize: '0.9rem', marginTop: '0.5rem' }}>
                Founded by Gauhar Axe (Gauhar Nadeem)
              </p>
            </div>
          </div>

          <div className="footer-section">
            <h3>Services</h3>
            <ul>
              <li>
                <button onClick={() => onOpenService('web-development')}>
                  Web Development
                </button>
              </li>
              <li>
                <button onClick={() => onOpenService('brand-design')}>
                  Brand Design
                </button>
              </li>
              <li>
                <button onClick={() => onOpenService('digital-marketing')}>
                  Digital Marketing
                </button>
              </li>
              <li>
                <button onClick={() => onOpenService('mobile-apps')}>
                  Mobile Apps
                </button>
              </li>
              {onOpenServicesPage && (
                <li style={{ marginTop: '6px' }}>
                  <button
                    onClick={onOpenServicesPage}
                    style={{ color: 'var(--primary-color)', fontWeight: 700 }}
                  >
                    All Enterprise Services (7) →
                  </button>
                </li>
              )}
            </ul>
          </div>

          <div className="footer-section">
            <h3>Company</h3>
            <ul>
              {(
                [
                  ['About Us', '/about', 'about'],
                  ['Our Team', '/team', 'team'],
                  ['Websites', '/websites', 'websites'],
                  ['Testimonials', '/testimonials', 'testimonials'],
                  ['Partnership', '/partnership', 'partnership'],
                  ['Contact', '/contact', 'contact'],
                  ['Location', '/location', 'location'],
                  ['FAQ', '/faq', 'faq']
                ] as const
              ).map(([label, href, page]) => (
                <li key={href}>
                  <a
                    href={href}
                    onClick={(event) => {
                      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
                      event.preventDefault();
                      if (onOpenPage) onOpenPage(page);
                      else onNavigateSection(page);
                    }}
                  >
                    {label}
                  </a>
                </li>
              ))}
              <li>
                <a
                  href="/#blog-hub"
                  onClick={(event) => {
                    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
                    event.preventDefault();
                    onOpenBlogs();
                  }}
                >
                  Blogs Hub
                </a>
              </li>
            </ul>
          </div>

          {/* Block's heading: Our Policies */}
          <div className="footer-section">
            <h3>Our Policies</h3>
            <ul>
              <li>
                <button
                  onClick={() => onOpenPolicy('legal-notice')}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <Scale size={14} style={{ color: 'var(--primary-color)' }} /> Legal Notice
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenPolicy('privacy-policy')}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <Shield size={14} style={{ color: 'var(--primary-color)' }} /> Privacy Policy
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenPolicy('terms-of-service')}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <FileText size={14} style={{ color: 'var(--primary-color)' }} /> Terms of Service
                </button>
              </li>
            </ul>
          </div>

          <div className="footer-section">
            <h3>Connect</h3>
            <div className="social-links">
              <a
                href="https://www.facebook.com/gauharaxe"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
              >
                <Facebook size={18} />
              </a>
              <a
                href="https://twitter.com/gauharaxe"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="X (Twitter)"
              >
                <Twitter size={18} />
              </a>
              <a
                href="https://www.linkedin.com/in/gauharaxe/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
              >
                <Linkedin size={18} />
              </a>
              <a
                href="https://www.instagram.com/gauharaxe"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
              >
                <Instagram size={18} />
              </a>
              <a
                href="https://www.upwork.com/freelancers/~0131edfc6b7fb25125"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Upwork"
                title="Upwork"
              >
                <img
                  src="https://uxwing.com/wp-content/themes/uxwing/download/brands-and-social-media/upwork-icon.svg"
                  alt="Upwork"
                  width="18"
                  height="18"
                  style={{ verticalAlign: 'middle' }}
                />
              </a>
              <a
                href="https://www.youtube.com/@gauharaxe"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
                title="YouTube"
              >
                <Youtube size={18} />
              </a>
              <a
                href="https://wa.me/923157338694"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                title="WhatsApp Direct (+92-315-7338694)"
              >
                <WhatsAppIcon size={18} color="currentColor" />
              </a>
            </div>
          </div>
        </div>

        {/* Newsletter Subscription Form */}
        <div
          className="footer-newsletter"
          style={{
            margin: '2.5rem 0 2rem',
            padding: '2rem 2.25rem',
            background: 'linear-gradient(135deg, rgba(255, 107, 0, 0.08) 0%, rgba(20, 24, 38, 0.85) 100%)',
            border: '1px solid rgba(255, 107, 0, 0.25)',
            borderRadius: '16px',
            boxShadow: '0 10px 30px -10px rgba(0, 0, 0, 0.5)'
          }}
        >
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '1.5rem'
            }}
          >
            <div style={{ maxWidth: '480px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <Mail size={20} style={{ color: 'var(--primary-color)' }} />
                <h3
                  style={{
                    margin: 0,
                    fontSize: '1.25rem',
                    fontWeight: 700,
                    color: '#ffffff',
                    letterSpacing: '-0.01em'
                  }}
                >
                  Stay Ahead with Axe's Era Insights
                </h3>
              </div>
              <p
                style={{
                  margin: 0,
                  fontSize: '0.92rem',
                  color: 'rgba(255, 255, 255, 0.72)',
                  lineHeight: 1.5
                }}
              >
                Join forward-thinking executives receiving our monthly blueprints on conversion architecture and digital engineering. Zero spam.
              </p>
            </div>

            <form
              onSubmit={handleSubscribe}
              style={{
                flex: '1 1 340px',
                maxWidth: '480px',
                width: '100%'
              }}
              noValidate
            >
              <div
                style={{
                  display: 'flex',
                  gap: '8px',
                  flexWrap: 'wrap'
                }}
              >
                <div
                  style={{
                    position: 'relative',
                    flex: '1 1 240px',
                    minWidth: '220px'
                  }}
                >
                  <Mail
                    size={16}
                    style={{
                      position: 'absolute',
                      left: '14px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'rgba(255, 255, 255, 0.4)',
                      pointerEvents: 'none'
                    }}
                  />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (status !== 'idle') setStatus('idle');
                    }}
                    placeholder="Enter your corporate email..."
                    aria-label="Corporate email address for newsletter subscription"
                    disabled={status === 'loading'}
                    style={{
                      width: '100%',
                      padding: '12px 14px 12px 40px',
                      borderRadius: '8px',
                      background: 'rgba(10, 15, 29, 0.85)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      color: '#ffffff',
                      fontSize: '0.95rem',
                      outline: 'none',
                      transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
                      boxSizing: 'border-box'
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = 'var(--primary-color)';
                      e.currentTarget.style.boxShadow = '0 0 0 2px rgba(255, 107, 0, 0.2)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  />
                </div>
                <button
                  type="submit"
                  disabled={status === 'loading'}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    padding: '12px 22px',
                    borderRadius: '8px',
                    background: 'var(--primary-color)',
                    color: '#ffffff',
                    fontWeight: 600,
                    fontSize: '0.95rem',
                    border: 'none',
                    cursor: status === 'loading' ? 'not-allowed' : 'pointer',
                    transition: 'transform 0.15s ease, opacity 0.2s ease',
                    opacity: status === 'loading' ? 0.75 : 1,
                    whiteSpace: 'nowrap'
                  }}
                  onMouseEnter={(e) => {
                    if (status !== 'loading') e.currentTarget.style.opacity = '0.92';
                  }}
                  onMouseLeave={(e) => {
                    if (status !== 'loading') e.currentTarget.style.opacity = '1';
                  }}
                >
                  {status === 'loading' ? (
                    <>
                      <Loader2 size={16} className="animate-spin" /> Subscribing...
                    </>
                  ) : (
                    <>
                      Subscribe <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </div>

              {/* Status messages */}
              {status === 'success' && (
                <div
                  style={{
                    marginTop: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    color: '#4ade80',
                    fontSize: '0.88rem',
                    fontWeight: 500
                  }}
                >
                  <CheckCircle2 size={16} />
                  <span>{feedback}</span>
                </div>
              )}

              {status === 'error' && (
                <div
                  style={{
                    marginTop: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    color: '#f87171',
                    fontSize: '0.88rem',
                    fontWeight: 500
                  }}
                >
                  <AlertCircle size={16} />
                  <span>{feedback}</span>
                </div>
              )}
            </form>
          </div>
        </div>

        <div className="footer-bottom">
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '1rem'
            }}
          >
            <p style={{ margin: 0 }}>
              &copy; 2024–2026 Axe's Era Enterprise by Gauhar Axe. All rights reserved.
            </p>
            <div
              style={{
                display: 'flex',
                gap: '12px',
                flexWrap: 'wrap',
                alignItems: 'center',
                fontSize: '0.85rem'
              }}
            >
              <button
                onClick={() => onOpenPolicy('legal-notice')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'rgba(255, 255, 255, 0.7)',
                  cursor: 'pointer',
                  padding: 0
                }}
              >
                Legal Notice
              </button>
              <span style={{ color: 'rgba(255, 255, 255, 0.3)' }}>•</span>
              <button
                onClick={() => onOpenPolicy('privacy-policy')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'rgba(255, 255, 255, 0.7)',
                  cursor: 'pointer',
                  padding: 0
                }}
              >
                Privacy Policy
              </button>
              <span style={{ color: 'rgba(255, 255, 255, 0.3)' }}>•</span>
              <button
                onClick={() => onOpenPolicy('terms-of-service')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'rgba(255, 255, 255, 0.7)',
                  cursor: 'pointer',
                  padding: 0
                }}
              >
                Terms of Service
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

