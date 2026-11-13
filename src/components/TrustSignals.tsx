import React from 'react';
import { useLanguage } from '../context/LanguageContext';

export const TrustSignals: React.FC = () => {
  const { strings } = useLanguage();

  return (
    <div
      className="trust-signals-bar"
      style={{
        background: 'rgba(15, 23, 42, 0.95)',
        padding: '2.5rem 0',
        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
        borderTop: '1px solid rgba(255, 255, 255, 0.05)',
        textAlign: 'center'
      }}
    >
      <div className="container">
        <p
          style={{
            color: 'var(--text-light)',
            fontSize: '0.85rem',
            textTransform: 'uppercase',
            letterSpacing: '1.5px',
            marginBottom: '1.25rem',
            fontWeight: 600
          }}
        >
          {strings.trustSignals.title}
        </p>
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '3.5rem',
            flexWrap: 'wrap',
            opacity: 0.88
          }}
        >
          {/* Brand badges */}
          <span style={{ fontSize: '1.4rem', fontWeight: 800, letterSpacing: '1px', color: '#fff' }}>
            <i className="fab fa-aws fa-lg" style={{ marginRight: '8px', color: '#ff9900' }}></i>AWS
          </span>
          <span style={{ fontSize: '1.4rem', fontWeight: 700, letterSpacing: '0.5px', color: '#fff' }}>
            <i className="fab fa-google fa-lg" style={{ marginRight: '8px', color: '#4285F4' }}></i>Google
          </span>
          <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#635bff' }}>
            <i className="fab fa-stripe fa-lg" style={{ marginRight: '8px' }}></i>stripe
          </span>
          <span style={{ fontSize: '1.4rem', fontWeight: 700, color: '#00a4ef' }}>
            <i className="fab fa-microsoft fa-lg" style={{ marginRight: '8px' }}></i>Microsoft
          </span>
          <span style={{ fontSize: '1.4rem', fontWeight: 700, color: '#96bf48' }}>
            <i className="fab fa-shopify fa-lg" style={{ marginRight: '8px' }}></i>shopify
          </span>
        </div>
      </div>
    </div>
  );
};
