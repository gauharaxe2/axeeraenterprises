export const SESSION_COOKIE = 'ae_admin';
export const SESSION_TTL_SECONDS = 8 * 60 * 60;
export const LOGIN_DELAY_MS = 800;
export const MIN_SECRET_LENGTH = 16;

const NOT_CONFIGURED =
  'Admin sign-in is not configured. Set ADMIN_PASSWORD and ADMIN_SESSION_SECRET (at least 16 characters) in the Netlify Functions environment.';

export function notConfiguredMessage(): string {
  return NOT_CONFIGURED;
}

export function json(status: number, body: unknown, extra?: HeadersInit): Response {
  const headers = new Headers(extra);
  headers.set('content-type', 'application/json; charset=utf-8');
  headers.set('cache-control', 'no-store');
  headers.set('x-content-type-options', 'nosniff');
  headers.set('referrer-policy', 'no-referrer');
  headers.set('vary', 'cookie');
  return new Response(JSON.stringify(body), { status, headers });
}

export function readEnv(name: string): string {
  const proc = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process;
  const value = proc?.env?.[name];
  return typeof value === 'string' ? value.trim() : '';
}

export type EnvFn = (name: string) => string;

export function envValue(env: EnvFn, name: string): string {
  const value = env(name);
  return typeof value === 'string' ? value.trim() : '';
}

export function resolveSecret(env: EnvFn): string {
  const secret = envValue(env, 'ADMIN_SESSION_SECRET');
  return secret.length >= MIN_SECRET_LENGTH ? secret : '';
}

export function resolvePassword(env: EnvFn): string {
  return envValue(env, 'ADMIN_PASSWORD');
}

export function resolveToken(env: EnvFn): string {
  return envValue(env, 'NETLIFY_API_TOKEN');
}

export const DEFAULT_SITE_ID = 'c44c508d-5333-4a95-b1b1-2c3a7f8ef12d';

export function resolveSiteId(env: EnvFn): string {
  return envValue(env, 'NETLIFY_SITE_ID') || envValue(env, 'SITE_ID') || DEFAULT_SITE_ID;
}

export function readCookie(header: string | null, name: string): string | null {
  if (!header) return null;
  for (const part of header.split(';')) {
    const separator = part.indexOf('=');
    if (separator === -1) continue;
    const key = part.slice(0, separator).trim();
    if (key !== name) continue;
    return part.slice(separator + 1).trim();
  }
  return null;
}

export function requestIsSecure(request: Request): boolean {
  const forwarded = request.headers.get('x-forwarded-proto')?.split(',')[0]?.trim().toLowerCase();
  if (forwarded) return forwarded === 'https';
  try {
    return new URL(request.url).protocol === 'https:';
  } catch {
    return false;
  }
}

export function serializeSessionCookie(token: string, secure: boolean, maxAge: number): string {
  const parts = [
    `${SESSION_COOKIE}=${token}`,
    'HttpOnly',
    'SameSite=Strict',
    'Path=/',
    `Max-Age=${maxAge}`
  ];
  if (secure) parts.push('Secure');
  return parts.join('; ');
}

export function clearSessionCookie(secure: boolean): string {
  return serializeSessionCookie('', secure, 0);
}

export function originAllowed(request: Request): boolean {
  const origin = request.headers.get('origin');
  if (!origin) return true;
  let originHost = '';
  try {
    originHost = new URL(origin).host;
  } catch {
    return false;
  }
  if (!originHost) return false;
  const forwarded = request.headers.get('x-forwarded-host')?.split(',')[0]?.trim();
  const host = request.headers.get('host')?.trim();
  let urlHost = '';
  try {
    urlHost = new URL(request.url).host;
  } catch {
    urlHost = '';
  }
  return [urlHost, forwarded, host].some((candidate) => candidate && candidate === originHost);
}

export function clientIp(request: Request): string {
  const netlifyIp = request.headers.get('x-nf-client-connection-ip')?.trim() ?? '';
  if (netlifyIp && netlifyIp.length <= 80 && !/[\s,]/.test(netlifyIp)) return netlifyIp;
  return 'unknown';
}

export async function readJson(
  request: Request,
  maxBytes = 4096
): Promise<{ ok: true; value: unknown } | { ok: false; response: Response }> {
  const type = request.headers.get('content-type') ?? '';
  if (!type.toLowerCase().includes('application/json')) {
    return { ok: false, response: json(415, { error: 'Expected a JSON body.' }) };
  }
  let text = '';
  try {
    text = await request.text();
  } catch {
    return { ok: false, response: json(400, { error: 'Expected a JSON body.' }) };
  }
  if (text.length > maxBytes) {
    return { ok: false, response: json(413, { error: 'Request is too large.' }) };
  }
  try {
    return { ok: true, value: text ? JSON.parse(text) : {} };
  } catch {
    return { ok: false, response: json(400, { error: 'Expected a JSON body.' }) };
  }
}

export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export function failureDelayMs(failures: number): number {
  if (failures <= 1) return LOGIN_DELAY_MS;
  return Math.min(4000, LOGIN_DELAY_MS + (failures - 1) * 300);
}
