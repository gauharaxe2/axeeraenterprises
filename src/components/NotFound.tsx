import React from 'react';

interface NotFoundProps {
  onHome: () => void;
  onContact: () => void;
}

export const NotFound: React.FC<NotFoundProps> = ({ onHome, onContact }) => {
  return (
    <main
      style={{
        paddingTop: '120px',
        paddingBottom: '80px',
        minHeight: '70vh',
        background: 'linear-gradient(135deg, #0f172a 0%, #000000 100%)'
      }}
    >
      <div className="container" style={{ maxWidth: '760px', textAlign: 'center' }}>
        <p
          style={{
            color: 'var(--primary-color)',
            fontWeight: 700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            marginBottom: '0.75rem'
          }}
        >
          404
        </p>
        <h1 style={{ fontSize: '2.6rem', marginBottom: '1rem' }}>Page not found</h1>
        <p style={{ fontSize: '1.05rem', marginBottom: '2rem' }}>
          That address is not part of this site. The page may have moved, or the link may be mistyped.
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button type="button" className="btn btn-primary" onClick={onHome}>
            Back to homepage
          </button>
          <button type="button" className="btn btn-outline" onClick={onContact}>
            Contact us
          </button>
          <a
            className="btn btn-outline"
            href="https://wa.me/923157338694"
            target="_blank"
            rel="noopener noreferrer"
          >
            WhatsApp
          </a>
        </div>
      </div>
    </main>
  );
};
