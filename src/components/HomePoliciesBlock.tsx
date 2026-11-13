import React from 'react';
import { Scale, Shield, FileText, ArrowRight, Lock, CheckCircle2 } from 'lucide-react';
import { PolicyType } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface HomePoliciesBlockProps {
  onOpenPolicy: (type: PolicyType) => void;
}

export const HomePoliciesBlock: React.FC<HomePoliciesBlockProps> = ({ onOpenPolicy }) => {
  const { strings } = useLanguage();

  return (
    <section
      id="policies"
      style={{
        padding: '5rem 0',
        background: 'linear-gradient(180deg, #070b14 0%, #0c1222 100%)',
        borderTop: '1px solid rgba(255, 255, 255, 0.06)',
        position: 'relative'
      }}
    >
      <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              color: 'var(--primary-color)',
              fontSize: '0.85rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              marginBottom: '0.75rem'
            }}
          >
            <Lock size={15} />
            <span>{strings.policies.badge}</span>
          </div>

          <h2
            style={{
              fontSize: 'clamp(2rem, 3.5vw, 2.75rem)',
              fontWeight: 800,
              color: '#ffffff',
              margin: '0 0 1rem',
              letterSpacing: '-0.02em'
            }}
          >
            {strings.policies.sectionTitle}
          </h2>

          <p
            style={{
              fontSize: '1.05rem',
              color: 'rgba(255, 255, 255, 0.7)',
              maxWidth: '680px',
              margin: '0 auto',
              lineHeight: 1.6
            }}
          >
            {strings.policies.sectionSubtitle}
          </p>
        </div>

        {/* 3 Interactive Policy Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '1.75rem'
          }}
        >
          {/* Card 1: Legal Notice */}
          <div
            style={{
              background: '#0f172a',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '16px',
              padding: '2.25rem 1.75rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              transition: 'all 0.3s ease',
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.25)',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '3px',
                background: 'linear-gradient(90deg, var(--primary-color), transparent)'
              }}
            />
            <div>
              <div
                style={{
                  width: '54px',
                  height: '54px',
                  borderRadius: '12px',
                  background: 'rgba(212, 175, 55, 0.12)',
                  color: 'var(--primary-color)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1.25rem'
                }}
              >
                <Scale size={26} />
              </div>

              <div
                style={{
                  fontSize: '0.8rem',
                  color: 'var(--primary-color)',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  marginBottom: '0.35rem'
                }}
              >
                Enterprise Identification
              </div>

              <h3
                style={{
                  fontSize: '1.4rem',
                  fontWeight: 700,
                  color: '#ffffff',
                  marginBottom: '0.75rem'
                }}
              >
                {strings.policies.legalNoticeTitle}
              </h3>

              <p
                style={{
                  color: 'rgba(255, 255, 255, 0.72)',
                  fontSize: '0.93rem',
                  lineHeight: 1.6,
                  marginBottom: '1.5rem'
                }}
              >
                {strings.policies.legalNoticeDesc}
              </p>

              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.4rem',
                  marginBottom: '1.75rem',
                  fontSize: '0.84rem',
                  color: '#94a3b8'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CheckCircle2 size={14} color="var(--primary-color)" /> Founder & Registered Headquarters
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CheckCircle2 size={14} color="var(--primary-color)" /> International IP & Copyright Protection
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CheckCircle2 size={14} color="var(--primary-color)" /> Multan, Pakistan Registered Entity
                </div>
              </div>
            </div>

            <button
              onClick={() => onOpenPolicy('legal-notice')}
              className="btn btn-outline"
              style={{
                width: '100%',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '12px 18px',
                fontSize: '0.92rem',
                fontWeight: 700
              }}
            >
              {strings.policies.readNotice} <ArrowRight size={16} />
            </button>
          </div>

          {/* Card 2: Privacy Policy */}
          <div
            style={{
              background: '#0f172a',
              border: '1px solid rgba(212, 175, 55, 0.25)',
              borderRadius: '16px',
              padding: '2.25rem 1.75rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              transition: 'all 0.3s ease',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.35)',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '3px',
                background: 'var(--primary-color)'
              }}
            />
            <div>
              <div
                style={{
                  width: '54px',
                  height: '54px',
                  borderRadius: '12px',
                  background: 'rgba(212, 175, 55, 0.15)',
                  color: 'var(--primary-color)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1.25rem'
                }}
              >
                <Shield size={26} />
              </div>

              <div
                style={{
                  fontSize: '0.8rem',
                  color: 'var(--primary-color)',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  marginBottom: '0.35rem'
                }}
              >
                Data Privacy & GDPR
              </div>

              <h3
                style={{
                  fontSize: '1.4rem',
                  fontWeight: 700,
                  color: '#ffffff',
                  marginBottom: '0.75rem'
                }}
              >
                {strings.policies.privacyPolicyTitle}
              </h3>

              <p
                style={{
                  color: 'rgba(255, 255, 255, 0.72)',
                  fontSize: '0.93rem',
                  lineHeight: 1.6,
                  marginBottom: '1.5rem'
                }}
              >
                {strings.policies.privacyPolicyDesc}
              </p>

              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.4rem',
                  marginBottom: '1.75rem',
                  fontSize: '0.84rem',
                  color: '#94a3b8'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CheckCircle2 size={14} color="var(--primary-color)" /> Zero Selling of Personal Data
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CheckCircle2 size={14} color="var(--primary-color)" /> Full Right to Erasure & Portability
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CheckCircle2 size={14} color="var(--primary-color)" /> TLS 1.3 End-to-End Encryption
                </div>
              </div>
            </div>

            <button
              onClick={() => onOpenPolicy('privacy-policy')}
              className="btn btn-primary"
              style={{
                width: '100%',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '12px 18px',
                fontSize: '0.92rem',
                fontWeight: 700
              }}
            >
              {strings.policies.readPrivacy} <ArrowRight size={16} />
            </button>
          </div>

          {/* Card 3: Terms of Service */}
          <div
            style={{
              background: '#0f172a',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '16px',
              padding: '2.25rem 1.75rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              transition: 'all 0.3s ease',
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.25)',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '3px',
                background: 'linear-gradient(90deg, transparent, var(--primary-color))'
              }}
            />
            <div>
              <div
                style={{
                  width: '54px',
                  height: '54px',
                  borderRadius: '12px',
                  background: 'rgba(212, 175, 55, 0.12)',
                  color: 'var(--primary-color)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1.25rem'
                }}
              >
                <FileText size={26} />
              </div>

              <div
                style={{
                  fontSize: '0.8rem',
                  color: 'var(--primary-color)',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  marginBottom: '0.35rem'
                }}
              >
                Client Engagement
              </div>

              <h3
                style={{
                  fontSize: '1.4rem',
                  fontWeight: 700,
                  color: '#ffffff',
                  marginBottom: '0.75rem'
                }}
              >
                {strings.policies.termsOfServiceTitle}
              </h3>

              <p
                style={{
                  color: 'rgba(255, 255, 255, 0.72)',
                  fontSize: '0.93rem',
                  lineHeight: 1.6,
                  marginBottom: '1.5rem'
                }}
              >
                {strings.policies.termsOfServiceDesc}
              </p>

              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.4rem',
                  marginBottom: '1.75rem',
                  fontSize: '0.84rem',
                  color: '#94a3b8'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CheckCircle2 size={14} color="var(--primary-color)" /> 100% Code & Asset IP Ownership Transfer
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CheckCircle2 size={14} color="var(--primary-color)" /> Milestone-Based Delivery Protection
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CheckCircle2 size={14} color="var(--primary-color)" /> 30-Day Post-Launch Bug Warranty
                </div>
              </div>
            </div>

            <button
              onClick={() => onOpenPolicy('terms-of-service')}
              className="btn btn-outline"
              style={{
                width: '100%',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '12px 18px',
                fontSize: '0.92rem',
                fontWeight: 700
              }}
            >
              {strings.policies.readTerms} <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
