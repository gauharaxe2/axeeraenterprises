import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  type User
} from 'firebase/auth';
import { auth } from './firebase';

/** Google accounts allowed into the admin panel. Override with VITE_ADMIN_EMAILS. */
const DEFAULT_ADMIN_EMAILS = [
  'gauharaxe@outlook.com',
  'gauhar426622@gmail.com'
];

function adminEmailAllowlist(): string[] {
  const fromEnv =
    typeof import.meta !== 'undefined' && import.meta.env?.VITE_ADMIN_EMAILS
      ? String(import.meta.env.VITE_ADMIN_EMAILS)
          .split(',')
          .map((email) => email.trim().toLowerCase())
          .filter(Boolean)
      : [];
  return fromEnv.length > 0 ? fromEnv : DEFAULT_ADMIN_EMAILS.map((email) => email.toLowerCase());
}

export function isAllowedAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return adminEmailAllowlist().includes(email.trim().toLowerCase());
}

export function isAdminUser(user: User | null | undefined): boolean {
  return Boolean(user && isAllowedAdminEmail(user.email));
}

/** Synchronous check after Firebase Auth has restored persistence. */
export function isAdminSessionActive(): boolean {
  return isAdminUser(auth.currentUser);
}

export function watchAdminAuth(onChange: (user: User | null) => void): () => void {
  return onAuthStateChanged(auth, (user) => {
    onChange(isAdminUser(user) ? user : null);
  });
}

export async function signInAdminWithGoogle(): Promise<User> {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  const result = await signInWithPopup(auth, provider);
  const user = result.user;
  if (!isAllowedAdminEmail(user.email)) {
    await signOut(auth);
    throw new Error('This Google account is not authorized for the admin panel.');
  }
  return user;
}

export async function signOutAdmin(): Promise<void> {
  await signOut(auth);
}

export function authErrorMessage(error: unknown): string {
  if (!(error instanceof Error)) return 'Google sign-in failed.';
  const code = 'code' in error && typeof (error as { code?: unknown }).code === 'string'
    ? (error as { code: string }).code
    : '';
  if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
    return 'Sign-in was cancelled.';
  }
  if (code === 'auth/popup-blocked') {
    return 'Pop-up blocked. Allow pop-ups for this site and try again.';
  }
  if (code === 'auth/unauthorized-domain') {
    return 'This domain is not authorized for Google sign-in. Add it in Firebase Authentication → Settings → Authorized domains.';
  }
  if (code === 'auth/operation-not-allowed') {
    return 'Google sign-in is not enabled yet in the Firebase project.';
  }
  return error.message || 'Google sign-in failed.';
}
