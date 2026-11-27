import React from 'react';
import { Scale, Shield, FileText, ArrowRight } from 'lucide-react';
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
        background: 'var(--bg-light)',
        borderTop: '1px solid var(--border-color)',
        borderBottom: '1px solid var(--border-color)'
      }}
    >
      <div className="container">
        <div className="section-header">
          <span
            style={{
              display: 'inline-block',
              color: 'var(--gold-ink)',
              background: 'var(--chip-bg)',
              border: '1px solid var(--chip-border)',
              borderRadius: '9999px',
              padding: '4px 14px',
              fontSize: '0.8rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              marginBottom: '0.75rem'
            }}
          >
            {strings.policies.badge}
          </span>
          <h2>{strings.policies.sectionTitle}</h2>
          <p>{strings.policies.sectionSubtitle}</p>
        </div>

        <div className="services-grid">
          <div className="service-card">
            <div className="service-icon">
              <Scale size={26} />
            </div>
            <h3>{strings.policies.legalNoticeTitle}</h3>
            <p>{strings.policies.legalNoticeDesc}</p>
            <button
              type="button"
              className="service-link"
              onClick={() => onOpenPolicy('legal-notice')}
            >
              {strings.policies.readNotice} <ArrowRight size={16} />
            </button>
          </div>

          <div className="service-card">
            <div className="service-icon">
              <Shield size={26} />
            </div>
            <h3>{strings.policies.privacyPolicyTitle}</h3>
            <p>{strings.policies.privacyPolicyDesc}</p>
            <button
              type="button"
              className="service-link"
              onClick={() => onOpenPolicy('privacy-policy')}
            >
              {strings.policies.readPrivacy} <ArrowRight size={16} />
            </button>
          </div>

          <div className="service-card">
            <div className="service-icon">
              <FileText size={26} />
            </div>
            <h3>{strings.policies.termsOfServiceTitle}</h3>
            <p>{strings.policies.termsOfServiceDesc}</p>
            <button
              type="button"
              className="service-link"
              onClick={() => onOpenPolicy('terms-of-service')}
            >
              {strings.policies.readTerms} <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
