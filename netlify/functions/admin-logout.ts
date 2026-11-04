import { clearSessionCookie, json, originAllowed, requestIsSecure } from './_lib/http.ts';

export function createLogoutHandler() {
  return async function adminLogout(request: Request): Promise<Response> {
    if (request.method !== 'POST') {
      return json(405, { error: 'Method not allowed.' }, { allow: 'POST' });
    }
    if (!originAllowed(request)) return json(403, { error: 'Cross-origin request rejected.' });
    const cookie = clearSessionCookie(requestIsSecure(request));
    return json(200, { ok: true }, { 'set-cookie': cookie });
  };
}

export default createLogoutHandler();
