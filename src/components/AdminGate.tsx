import React, { useEffect, useState } from 'react';
import {
  authErrorMessage,
  signInAdminWithGoogle,
  watchAdminAuth
} from '../utils/adminAuth';

export { signOutAdmin as clearAdminSession } from '../utils/adminAuth';

interface AdminGateProps {
  onSuccess: () => void;
}

export const AdminGate: React.FC<AdminGateProps> = ({ onSuccess }) => {
  const [phase, setPhase] = useState<'checking' | 'form'>('checking');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const unsubscribe = watchAdminAuth((user) => {
      if (user) {
        onSuccess();
        return;
      }
      setPhase('form');
    });
    return () => unsubscribe();
  }, [onSuccess]);

  const handleGoogleSignIn = async () => {
    if (busy) return;
    setBusy(true);
    setError('');
    try {
      await signInAdminWithGoogle();
      onSuccess();
    } catch (caught) {
      setError(authErrorMessage(caught));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0f172a 0%, #000000 100%)',
        padding: '24px'
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '440px',
          background: '#151d32',
          border: '1px solid rgba(212, 175, 55, 0.35)',
          borderRadius: '16px',
          padding: '2rem',
          boxShadow: '0 24px 48px rgba(0, 0, 0, 0.45)'
        }}
      >
        <p
          style={{
            color: 'var(--primary-color)',
            fontWeight: 700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            marginBottom: '0.5rem'
          }}
        >
          Axe&apos;s Era Enterprise
        </p>
        <h1 style={{ fontSize: '1.8rem', marginBottom: '0.5rem', color: '#f8fafc' }}>Admin sign in</h1>
        <p style={{ marginBottom: '1.5rem', color: '#94a3b8' }}>
          Sign in with an authorized Google account to open the content editor and enquiry inbox.
        </p>

        {phase === 'checking' ? (
          <p role="status" style={{ color: '#94a3b8' }}>
            Checking your session…
          </p>
        ) : (
          <>
            {error && (
              <p role="alert" style={{ color: '#f87171', marginBottom: '1rem' }}>
                {error}
              </p>
            )}
            <button
              type="button"
              onClick={() => void handleGoogleSignIn()}
              disabled={busy}
              className="btn btn-primary"
              style={{
                width: '100%',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                padding: '12px 16px'
              }}
            >
              <GoogleMark />
              {busy ? 'Signing in…' : 'Continue with Google'}
            </button>
          </>
        )}

        <p style={{ marginTop: '1.25rem', marginBottom: 0 }}>
          <a href="/" style={{ color: 'var(--primary-color)' }}>
            Back to the website
          </a>
        </p>
      </div>
    </div>
  );
};

function GoogleMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 8 3.1l5.7-5.7C34.2 6.1 29.4 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.5-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16.1 19 13 24 13c3.1 0 5.8 1.2 8 3.1l5.7-5.7C34.2 6.1 29.4 4 24 4 16.3 4 9.6 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.3 35.3 26.8 36 24 36c-5.3 0-9.7-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.3 4.1-4.1 5.5l.1.1 6.2 5.2C39.2 36.3 44 31.5 44 24c0-1.3-.1-2.5-.4-3.5z" />
    </svg>
  );
}
