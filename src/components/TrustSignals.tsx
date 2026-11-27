import React from 'react';
import { useLanguage } from '../context/LanguageContext';

export const TrustSignals: React.FC = () => {
  const { strings } = useLanguage();

  return (
    <section style={{ padding: '2.5rem 0', background: 'var(--bg-white)', borderBottom: '1px solid var(--border-color)' }}>
      <div className="container" style={{ textAlign: 'center' }}>
        <p
          style={{
            color: 'var(--text-muted)',
            fontSize: '0.85rem',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            fontWeight: 600,
            marginBottom: '1.25rem'
          }}
        >
          {strings.trustSignals.title}
        </p>
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '2.5rem',
            flexWrap: 'wrap',
            opacity: 0.85
          }}
        >
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-strong)' }}>
            <i className="fab fa-aws" aria-hidden="true" /> AWS
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-strong)' }}>
            <i className="fab fa-google" aria-hidden="true" /> Google
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-strong)' }}>
            <i className="fab fa-stripe" aria-hidden="true" /> Stripe
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-strong)' }}>
            <i className="fab fa-microsoft" aria-hidden="true" /> Microsoft
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-strong)' }}>
            <i className="fab fa-shopify" aria-hidden="true" /> Shopify
          </span>
        </div>
      </div>
    </section>
  );
};
