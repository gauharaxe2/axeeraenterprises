import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Shield,
  FileText,
  Scale,
  Printer,
  Copy,
  Check,
  Building,
  Mail,
  Phone,
  Lock,
  Clock
} from 'lucide-react';
import { PolicyType } from '../types';
import { POLICIES_DATA } from '../data/policiesData';

interface PoliciesViewProps {
  initialPolicy?: PolicyType;
  onBackToHome: () => void;
  onContactClick: () => void;
  onPolicyChange?: (policy: PolicyType) => void;
}

export const PoliciesView: React.FC<PoliciesViewProps> = ({
  initialPolicy = 'legal-notice',
  onBackToHome,
  onContactClick,
  onPolicyChange
}) => {
  const [activePolicy, setActivePolicy] = useState<PolicyType>(initialPolicy);
  const [copiedLink, setCopiedLink] = useState(false);
  const [activeSectionId, setActiveSectionId] = useState<string>('');

  useEffect(() => {
    setActivePolicy(initialPolicy);
  }, [initialPolicy]);

  const doc = POLICIES_DATA[activePolicy];

  const handleTabChange = (type: PolicyType) => {
    setActivePolicy(type);
    if (onPolicyChange) {
      onPolicyChange(type);
    }
    window.location.hash = type;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCopyLink = () => {
    const url = `${window.location.origin}${window.location.pathname}#${activePolicy}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const getPolicyIcon = (type: PolicyType, size = 18) => {
    switch (type) {
      case 'legal-notice':
        return <Scale size={size} />;
      case 'privacy-policy':
        return <Shield size={size} />;
      case 'terms-of-service':
        return <FileText size={size} />;
    }
  };

  return (
    <div
      style={{
        background: '#070b14',
        minHeight: '100vh',
        color: '#f8fafc',
        paddingTop: '90px',
        paddingBottom: '80px'
      }}
    >
      {/* Header Banner */}
      <section
        style={{
          background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.9) 0%, rgba(7, 11, 20, 0.95) 100%)',
          borderBottom: '1px solid rgba(212, 175, 55, 0.15)',
          padding: '2.5rem 1rem 3rem',
          position: 'relative'
        }}
      >
        <div className="container" style={{ maxWidth: '1100px', margin: '0 auto' }}>
          {/* Back Button */}
          <button
            onClick={onBackToHome}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--primary-color)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '0.95rem',
              fontWeight: 600,
              cursor: 'pointer',
              marginBottom: '1.5rem',
              padding: 0
            }}
          >
            <ArrowLeft size={18} /> Back to Agency Home
          </button>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div
              style={{
                color: 'var(--primary-color)',
                fontSize: '0.85rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.12em',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <Lock size={15} />
              <span>Axe's Era Enterprise Governance</span>
            </div>

            <h1
              style={{
                fontSize: 'clamp(2rem, 4vw, 3rem)',
                fontWeight: 800,
                color: '#ffffff',
                margin: '0.25rem 0 0.75rem',
                letterSpacing: '-0.02em',
                lineHeight: 1.15
              }}
            >
              Our Policies
            </h1>

            <p
              style={{
                fontSize: '1.05rem',
                color: 'rgba(255, 255, 255, 0.75)',
                maxWidth: '750px',
                lineHeight: 1.6,
                margin: 0
              }}
            >
              Transparent, professional guidelines defining enterprise identity, client confidentiality, intellectual property ownership, and terms of service.
            </p>
          </div>

          {/* Policy Navigation Tabs */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '12px',
              marginTop: '2rem',
              padding: '6px',
              background: 'rgba(15, 23, 42, 0.8)',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              width: 'fit-content'
            }}
          >
            <button
              onClick={() => handleTabChange('legal-notice')}
              style={{
                background: activePolicy === 'legal-notice' ? 'var(--primary-color)' : 'transparent',
                color: activePolicy === 'legal-notice' ? '#070b14' : 'rgba(255, 255, 255, 0.8)',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '8px',
                fontSize: '0.92rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s ease'
              }}
            >
              <Scale size={16} /> Legal Notice
            </button>

            <button
              onClick={() => handleTabChange('privacy-policy')}
              style={{
                background: activePolicy === 'privacy-policy' ? 'var(--primary-color)' : 'transparent',
                color: activePolicy === 'privacy-policy' ? '#070b14' : 'rgba(255, 255, 255, 0.8)',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '8px',
                fontSize: '0.92rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s ease'
              }}
            >
              <Shield size={16} /> Privacy Policy
            </button>

            <button
              onClick={() => handleTabChange('terms-of-service')}
              style={{
                background: activePolicy === 'terms-of-service' ? 'var(--primary-color)' : 'transparent',
                color: activePolicy === 'terms-of-service' ? '#070b14' : 'rgba(255, 255, 255, 0.8)',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '8px',
                fontSize: '0.92rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s ease'
              }}
            >
              <FileText size={16} /> Terms of Service
            </button>
          </div>
        </div>
      </section>

      {/* Main Document Content */}
      <div className="container" style={{ maxWidth: '1100px', margin: '2.5rem auto 0', padding: '0 1rem' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr',
            gap: '2rem'
          }}
        >
          {/* Document Header Card */}
          <div
            style={{
              background: '#0f172a',
              border: '1px solid rgba(212, 175, 55, 0.25)',
              borderRadius: '16px',
              padding: '2rem',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.4)'
            }}
          >
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                gap: '1.5rem',
                borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                paddingBottom: '1.5rem',
                marginBottom: '1.5rem'
              }}
            >
              <div>
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    color: 'var(--primary-color)',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    marginBottom: '0.5rem'
                  }}
                >
                  {getPolicyIcon(doc.id, 16)} {doc.badge}
                </div>
                <h2
                  style={{
                    fontSize: '1.85rem',
                    fontWeight: 700,
                    color: '#ffffff',
                    margin: '0 0 0.5rem'
                  }}
                >
                  {doc.title}
                </h2>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    color: '#94a3b8',
                    fontSize: '0.85rem'
                  }}
                >
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={14} /> Last Reviewed: {doc.lastUpdated}
                  </span>
                  <span>•</span>
                  <span>Effective: {doc.effectiveDate}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button
                  onClick={handleCopyLink}
                  style={{
                    background: 'rgba(255, 255, 255, 0.06)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    color: '#e2e8f0',
                    padding: '8px 14px',
                    borderRadius: '8px',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'all 0.2s ease'
                  }}
                  title="Copy direct link to this policy"
                >
                  {copiedLink ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
                  {copiedLink ? 'Link Copied!' : 'Copy Link'}
                </button>

                <button
                  onClick={handlePrint}
                  style={{
                    background: 'rgba(255, 255, 255, 0.06)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    color: '#e2e8f0',
                    padding: '8px 14px',
                    borderRadius: '8px',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                  title="Print or Save PDF"
                >
                  <Printer size={14} /> Print / Save
                </button>
              </div>
            </div>

            {/* Document Summary Box */}
            <div
              style={{
                background: 'rgba(212, 175, 55, 0.08)',
                borderLeft: '4px solid var(--primary-color)',
                padding: '1rem 1.25rem',
                borderRadius: '0 8px 8px 0',
                color: '#e2e8f0',
                fontSize: '0.95rem',
                lineHeight: 1.6,
                marginBottom: '2rem'
              }}
            >
              <strong style={{ color: 'var(--primary-color)' }}>Summary of Purpose: </strong>
              {doc.summary}
            </div>

            {/* Quick Table of Contents Jump Links */}
            <div
              style={{
                background: '#090d19',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                borderRadius: '10px',
                padding: '1rem 1.25rem',
                marginBottom: '2.5rem'
              }}
            >
              <div
                style={{
                  fontSize: '0.8rem',
                  textTransform: 'uppercase',
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  color: 'var(--primary-color)',
                  marginBottom: '0.75rem'
                }}
              >
                Table of Contents:
              </div>
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '8px 16px'
                }}
              >
                {doc.sections.map((sec) => (
                  <a
                    key={sec.id}
                    href={`#${sec.id}`}
                    onClick={(e) => {
                      e.preventDefault();
                      const el = document.getElementById(sec.id);
                      if (el) {
                        el.scrollIntoView({ behavior: 'smooth' });
                        setActiveSectionId(sec.id);
                      }
                    }}
                    style={{
                      color: activeSectionId === sec.id ? 'var(--primary-color)' : '#94a3b8',
                      fontSize: '0.85rem',
                      textDecoration: 'none',
                      transition: 'color 0.2s ease'
                    }}
                  >
                    {sec.title}
                  </a>
                ))}
              </div>
            </div>

            {/* Detailed Policy Sections */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
              {doc.sections.map((section) => (
                <article
                  key={section.id}
                  id={section.id}
                  style={{
                    scrollMarginTop: '110px',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                    paddingBottom: '2rem'
                  }}
                >
                  <h3
                    style={{
                      fontSize: '1.25rem',
                      fontWeight: 700,
                      color: '#ffffff',
                      marginBottom: '1rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <span
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: 'var(--primary-color)',
                        display: 'inline-block'
                      }}
                    />
                    {section.title}
                  </h3>

                  {section.paragraphs.map((p, idx) => (
                    <p
                      key={idx}
                      style={{
                        color: 'rgba(255, 255, 255, 0.82)',
                        fontSize: '0.96rem',
                        lineHeight: 1.7,
                        margin: '0 0 1rem',
                        whiteSpace: 'pre-line'
                      }}
                    >
                      {p}
                    </p>
                  ))}

                  {section.listItems && section.listItems.length > 0 && (
                    <ul
                      style={{
                        margin: '0.75rem 0 1rem 1.25rem',
                        padding: 0,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.5rem'
                      }}
                    >
                      {section.listItems.map((item, itemIdx) => (
                        <li
                          key={itemIdx}
                          style={{
                            color: 'rgba(255, 255, 255, 0.8)',
                            fontSize: '0.93rem',
                            lineHeight: 1.6
                          }}
                        >
                          {item}
                        </li>
                      ))}
                    </ul>
                  )}
                </article>
              ))}
            </div>

            {/* Direct Verification & Contact Box */}
            <div
              style={{
                marginTop: '3rem',
                background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(9, 13, 25, 0.95) 100%)',
                border: '1px solid rgba(212, 175, 55, 0.3)',
                borderRadius: '12px',
                padding: '1.75rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Building size={22} color="var(--primary-color)" />
                <h4 style={{ margin: 0, color: '#fff', fontSize: '1.1rem', fontWeight: 700 }}>
                  Axe's Era Enterprise Official Legal Desk
                </h4>
              </div>
              <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.9rem', lineHeight: 1.6 }}>
                For custom Non-Disclosure Agreements (NDAs), master service agreements (MSA), compliance audits, or data rights requests, connect directly with our legal and management desk.
              </p>
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '12px 24px',
                  fontSize: '0.88rem',
                  color: '#cbd5e1'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Mail size={15} color="var(--primary-color)" />
                  <a
                    href="mailto:gauharaxe@outlook.com"
                    style={{ color: '#cbd5e1', textDecoration: 'none' }}
                  >
                    gauharaxe@outlook.com
                  </a>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Phone size={15} color="var(--primary-color)" />
                  <span>+92-315-7338694</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                <button
                  onClick={onContactClick}
                  className="btn btn-primary"
                  style={{
                    padding: '8px 20px',
                    fontSize: '0.88rem',
                    fontWeight: 700
                  }}
                >
                  Contact Legal & Enterprise Desk
                </button>
                <button
                  onClick={onBackToHome}
                  className="btn btn-outline"
                  style={{
                    padding: '8px 18px',
                    fontSize: '0.88rem'
                  }}
                >
                  Return to Home
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
