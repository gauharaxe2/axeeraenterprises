import {
  envValue,
  json,
  notConfiguredMessage,
  originAllowed,
  readCookie,
  resolveSecret,
  SESSION_COOKIE,
  type EnvFn
} from './http.ts';
import { verifySessionToken } from './session.ts';

export async function requireSession(request: Request, env: EnvFn, nowMs: number): Promise<Response | null> {
  if (!originAllowed(request)) return json(403, { error: 'Cross-origin request rejected.' });
  const secret = resolveSecret(env);
  if (!secret || !envValue(env, 'ADMIN_PASSWORD')) {
    return json(503, { error: notConfiguredMessage() });
  }
  const token = readCookie(request.headers.get('cookie'), SESSION_COOKIE);
  if (!token || !(await verifySessionToken(token, secret, nowMs))) {
    return json(401, { error: 'Sign in required.' });
  }
  return null;
}
