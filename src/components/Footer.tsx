import React from 'react';
import { Facebook, Twitter, Linkedin, Instagram, Youtube, Scale, Shield, FileText } from 'lucide-react';
import { WhatsAppIcon } from './WhatsAppIcon';
import { PageView, PolicyType } from '../types';

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

