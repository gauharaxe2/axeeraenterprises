export interface Enquiry {
  id: string;
  createdAt: string;
  name: string;
  email: string;
  company: string;
  service: string;
  message: string;
  read: boolean;
}

export interface EnquiryList {
  submissions: Enquiry[];
  truncated: boolean;
  formFound: boolean;
  readState: 'ok' | 'unavailable';
}

async function errorMessage(response: Response, fallback: string): Promise<string> {
  try {
    const body = await response.json();
    if (body && typeof body.error === 'string' && body.error.trim()) return body.error;
  } catch {
    // The status line is enough when the body is not JSON.
  }
  return fallback;
}

export async function fetchAdminSession(): Promise<{ authenticated: boolean; message: string }> {
  try {
    const response = await fetch('/api/admin/session', { credentials: 'include', cache: 'no-store' });
    if (response.ok) {
      const body = await response.json().catch(() => null);
      if (body && body.authenticated === true) return { authenticated: true, message: '' };
    }
    if (response.status === 401) return { authenticated: false, message: '' };
    return { authenticated: false, message: await errorMessage(response, 'Could not check the admin session.') };
  } catch {
    return { authenticated: false, message: 'Could not reach the admin service.' };
  }
}

export async function loginAdmin(password: string): Promise<{ ok: true } | { ok: false; message: string }> {
  try {
    const response = await fetch('/api/admin/login', {
      method: 'POST',
      credentials: 'include',
      cache: 'no-store',
      headers: { 'content-type': 'application/json', accept: 'application/json' },
      body: JSON.stringify({ password })
    });
    if (response.ok) return { ok: true };
    return { ok: false, message: await errorMessage(response, 'Sign-in failed.') };
  } catch {
    return { ok: false, message: 'Could not reach the admin service.' };
  }
}

export async function logoutAdmin(): Promise<void> {
  await fetch('/api/admin/logout', { method: 'POST', credentials: 'include', cache: 'no-store' });
}

export async function fetchEnquiries(): Promise<EnquiryList> {
  const response = await fetch('/api/admin/submissions', { credentials: 'include', cache: 'no-store' });
  if (response.status === 401) {
    const error = new Error('Sign in required.');
    error.name = 'AdminUnauthorized';
    throw error;
  }
  if (!response.ok) throw new Error(await errorMessage(response, 'Could not load enquiries.'));
  const body = await response.json();
  const submissions = Array.isArray(body?.submissions) ? body.submissions.filter(isEnquiry) : [];
  submissions.sort((left: Enquiry, right: Enquiry) => {
    const rightMs = Date.parse(right.createdAt);
    const leftMs = Date.parse(left.createdAt);
    return (Number.isFinite(rightMs) ? rightMs : 0) - (Number.isFinite(leftMs) ? leftMs : 0);
  });
  return {
    submissions,
    truncated: body?.truncated === true,
    formFound: body?.formFound !== false,
    readState: body?.readState === 'unavailable' ? 'unavailable' : 'ok'
  };
}

export async function updateEnquiry(action: 'delete' | 'read', id: string, read?: boolean): Promise<void> {
  const response = await fetch('/api/admin/submissions', {
    method: 'POST',
    credentials: 'include',
    cache: 'no-store',
    headers: { 'content-type': 'application/json', accept: 'application/json' },
    body: JSON.stringify({ action, id, read })
  });
  if (response.status === 401) {
    const error = new Error('Sign in required.');
    error.name = 'AdminUnauthorized';
    throw error;
  }
  if (!response.ok) throw new Error(await errorMessage(response, 'Could not update that enquiry.'));
}

function isEnquiry(value: unknown): value is Enquiry {
  if (!value || typeof value !== 'object') return false;
  const record = value as Partial<Enquiry>;
  return typeof record.id === 'string'
    && typeof record.createdAt === 'string'
    && typeof record.name === 'string'
    && typeof record.email === 'string'
    && typeof record.company === 'string'
    && typeof record.service === 'string'
    && typeof record.message === 'string'
    && typeof record.read === 'boolean';
}
