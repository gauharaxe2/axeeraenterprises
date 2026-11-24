import React, { useEffect, useState } from 'react';
import {
  authErrorMessage,
  isEmbeddedBrowser,
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
  const embedded = isEmbeddedBrowser();

  useEffect(() => {
    const giveUp = window.setTimeout(() => setPhase('form'), 1500);
    const unsubscribe = watchAdminAuth((user) => {
      if (user) {
        onSuccess();
        return;
      }
      setPhase('form');
    });
    return () => {
      window.clearTimeout(giveUp);
      unsubscribe();
    };
  }, [onSuccess]);

  const handleGoogleSignIn = async () => {
    if (busy) return;
    setBusy(true);
    setError('');
    try {
      const user = await signInAdminWithGoogle();
      if (user) onSuccess();
    } catch (caught) {
      setError(authErrorMessage(caught));
      setBusy(false);
    }
  };

  return (
    <div className="studio studio-gate">
      <div className="studio-gate-card">
        <p className="studio-kicker">Axe&apos;s Era Enterprises</p>
        <h1 style={{ fontSize: '2.4rem', marginBottom: '0.6rem' }}>Admin sign in</h1>
        <p>
          Sign in with an authorized Google account to open the content editor and enquiry inbox.
        </p>

        {phase === 'checking' ? (
          <p role="status" style={{ color: '#57534e' }}>
            Checking your session…
          </p>
        ) : (
          <>
            {error && (
              <p role="alert" style={{ color: '#dc2626', marginBottom: '1rem', fontWeight: 600 }}>
                {error}
              </p>
            )}
            {embedded ? (
              <>
                <p>
                  This preview is inside another window, so the Google pop-up cannot open here.
                </p>
                <a className="studio-btn studio-btn-primary" href="/admin" target="_blank" rel="noopener noreferrer" style={{ width: '100%', marginBottom: '0.7rem' }}>
                  Open the admin panel in a new tab
                </a>
              </>
            ) : null}
            <button
              type="button"
              onClick={() => void handleGoogleSignIn()}
              disabled={busy}
              className={embedded ? 'studio-btn studio-btn-line' : 'studio-btn studio-btn-primary'}
              style={{ width: '100%' }}
            >
              <GoogleMark />
              {busy ? 'Opening Google…' : embedded ? 'Continue with Google in this tab' : 'Continue with Google'}
            </button>
            {!embedded && (
              <p style={{ marginTop: '0.9rem' }}>
                <a href="/admin" target="_blank" rel="noopener noreferrer">Open the admin panel in a new tab</a>
              </p>
            )}
          </>
        )}

        <p style={{ marginTop: '1.25rem', marginBottom: 0 }}>
          <a href="/">Back to the website</a>
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
