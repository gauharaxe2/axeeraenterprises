import React, { useEffect, useState } from 'react';
import { fetchAdminSession, loginAdmin } from '../utils/adminClient';

interface AdminGateProps {
  onSuccess: () => void;
}

export const AdminGate: React.FC<AdminGateProps> = ({ onSuccess }) => {
  const [phase, setPhase] = useState<'checking' | 'form'>('checking');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetchAdminSession().then((result) => {
      if (cancelled) return;
      if (result.authenticated) {
        onSuccess();
        return;
      }
      setError(result.message);
      setPhase('form');
    });
    return () => {
      cancelled = true;
    };
  }, [onSuccess]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!password || busy) return;
    setBusy(true);
    setError('');
    const result = await loginAdmin(password);
    setBusy(false);
    if (result.ok) {
      onSuccess();
      return;
    }
    setError(result.message);
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
          Axe's Era Enterprise
        </p>
        <h1 style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>Admin sign in</h1>
        <p style={{ marginBottom: '1.5rem' }}>
          Website enquiries and the content editor are available after the server accepts this password.
        </p>
        {phase === 'checking' ? (
          <p role="status">Checking your session…</p>
        ) : (
          <form onSubmit={handleSubmit}>
            <label htmlFor="admin-password" style={{ display: 'block', marginBottom: '0.4rem', color: '#e2e8f0' }}>
              Password
            </label>
            <input
              id="admin-password"
              type="password"
              autoComplete="current-password"
              autoFocus
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              style={{
                width: '100%',
                padding: '12px 14px',
                borderRadius: '8px',
                background: '#0f172a',
                border: '1px solid #334155',
                color: '#fff',
                marginBottom: '1rem'
              }}
            />
            {error && (
              <p role="alert" style={{ color: '#f87171', marginBottom: '1rem' }}>
                {error}
              </p>
            )}
            <button type="submit" className="btn btn-primary" disabled={busy} style={{ width: '100%' }}>
              {busy ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
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
