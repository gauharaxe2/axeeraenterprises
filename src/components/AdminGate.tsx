import React, { useState } from 'react';

interface AdminGateProps {
  onSuccess: () => void;
}

const SESSION_KEY = 'ae_admin_unlocked';

/** Digits of the admin passcode (assembled at runtime). */
const PASSCODE = String.fromCharCode(52, 50, 56, 52, 50, 55);

export function isAdminSessionActive(): boolean {
  try {
    return sessionStorage.getItem(SESSION_KEY) === '1';
  } catch {
    return false;
  }
}

export function clearAdminSession(): void {
  try {
    sessionStorage.removeItem(SESSION_KEY);
  } catch {
    /* ignore */
  }
}

function markAdminSession(): void {
  try {
    sessionStorage.setItem(SESSION_KEY, '1');
  } catch {
    /* ignore */
  }
}

export const AdminGate: React.FC<AdminGateProps> = ({ onSuccess }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (password.trim() !== PASSCODE) {
      setError('Incorrect passcode.');
      return;
    }
    markAdminSession();
    setError('');
    onSuccess();
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
          Enter the passcode to open the content editor and enquiry inbox.
        </p>
        <form onSubmit={handleSubmit}>
          <label htmlFor="admin-password" style={{ display: 'block', marginBottom: '0.4rem', color: '#e2e8f0' }}>
            Passcode
          </label>
          <input
            id="admin-password"
            type="password"
            inputMode="numeric"
            autoComplete="current-password"
            autoFocus
            value={password}
            onChange={(event) => {
              setPassword(event.target.value);
              if (error) setError('');
            }}
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
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
            Sign in
          </button>
        </form>
        <p style={{ marginTop: '1.25rem', marginBottom: 0 }}>
          <a href="/" style={{ color: 'var(--primary-color)' }}>
            Back to the website
          </a>
        </p>
      </div>
    </div>
  );
};
