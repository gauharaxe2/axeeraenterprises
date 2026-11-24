import {
  GoogleAuthProvider,
  getRedirectResult,
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
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

/** Embedded browsers (the in-app preview) block Firebase's Google popup. */
export function isEmbeddedBrowser(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return window.self !== window.top;
  } catch {
    return true;
  }
}

function authCode(error: unknown): string {
  return error && typeof error === 'object' && 'code' in error && typeof (error as { code?: unknown }).code === 'string'
    ? (error as { code: string }).code
    : '';
}

function rejectUnauthorized(): Promise<never> {
  return signOut(auth).then(() => {
    throw new Error('This Google account is not authorized for the admin panel.');
  });
}

function acceptAdmin(user: User): Promise<User> {
  if (!isAllowedAdminEmail(user.email)) return rejectUnauthorized();
  return Promise.resolve(user);
}

/**
 * Finish a redirect sign-in after Google sends the browser back to /admin.
 * Returns null when this page load is not the return trip.
 */
export async function finishAdminRedirect(): Promise<User | null> {
  const result = await getRedirectResult(auth);
  if (!result?.user) return null;
  return acceptAdmin(result.user);
}

export async function signInAdminWithGoogle(): Promise<User | null> {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  if (isEmbeddedBrowser()) {
    await signInWithRedirect(auth, provider);
    return null;
  }
  try {
    const result = await signInWithPopup(auth, provider);
    return acceptAdmin(result.user);
  } catch (error) {
    const code = authCode(error);
    if (code === 'auth/popup-blocked' || code === 'auth/operation-not-supported-in-this-environment') {
      await signInWithRedirect(auth, provider);
      return null;
    }
    throw error;
  }
}

export async function signOutAdmin(): Promise<void> {
  await signOut(auth);
}

export function authErrorMessage(error: unknown): string {
  if (!(error instanceof Error)) return 'Google sign-in failed.';
  const code = authCode(error);
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
