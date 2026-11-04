import { json, readEnv, type EnvFn } from './_lib/http.ts';
import { requireSession } from './_lib/guard.ts';

export function createSessionHandler(overrides: { env?: EnvFn; now?: () => number } = {}) {
  const env = overrides.env ?? readEnv;
  const now = overrides.now ?? (() => Date.now());

  return async function adminSession(request: Request): Promise<Response> {
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      return json(405, { error: 'Method not allowed.' }, { allow: 'GET' });
    }
    const denied = await requireSession(request, env, now());
    if (denied) return denied;
    return json(200, { authenticated: true });
  };
}

export default createSessionHandler();
