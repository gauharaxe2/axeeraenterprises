import { LoginRateLimiter } from './_lib/rateLimit.ts';
import {
  clientIp,
  delay,
  failureDelayMs,
  json,
  LOGIN_DELAY_MS,
  notConfiguredMessage,
  originAllowed,
  readEnv,
  readJson,
  requestIsSecure,
  resolvePassword,
  resolveSecret,
  serializeSessionCookie,
  SESSION_TTL_SECONDS,
  type EnvFn
} from './_lib/http.ts';
import { createSessionToken, passwordMatches } from './_lib/session.ts';

export interface LoginDeps {
  env: EnvFn;
  now: () => number;
  sleep: (ms: number) => Promise<void>;
  limiter: LoginRateLimiter;
}

const sharedLimiter = new LoginRateLimiter(() => Date.now());

export function createLoginHandler(overrides: Partial<LoginDeps> = {}) {
  const deps: LoginDeps = {
    env: readEnv,
    now: () => Date.now(),
    sleep: delay,
    limiter: sharedLimiter,
    ...overrides
  };

  return async function adminLogin(request: Request): Promise<Response> {
    if (request.method !== 'POST') {
      return json(405, { error: 'Method not allowed.' }, { allow: 'POST' });
    }
    if (!originAllowed(request)) return json(403, { error: 'Cross-origin request rejected.' });

    const started = deps.now();
    const finish = async (response: Response, waitMs: number) => {
      const elapsed = deps.now() - started;
      await deps.sleep(Math.max(0, waitMs - elapsed));
      return response;
    };

    const body = await readJson(request);
    if (!body.ok) return finish(body.response, LOGIN_DELAY_MS);

    const password = (body.value as { password?: unknown }).password;
    if (typeof password !== 'string' || password.length < 1 || password.length > 256) {
      return finish(json(400, { error: 'Enter your password.' }), LOGIN_DELAY_MS);
    }

    const secret = resolveSecret(deps.env);
    const expected = resolvePassword(deps.env);
    if (!secret || !expected) {
      return finish(json(503, { error: notConfiguredMessage() }), LOGIN_DELAY_MS);
    }

    const ip = clientIp(request);
    const limit = deps.limiter.status(ip);
    if (limit.locked) {
      return finish(
        json(429, {
          error: 'Too many attempts. Try again later.',
          retryAfterSeconds: limit.retryAfterSeconds
        }, { 'retry-after': String(limit.retryAfterSeconds) }),
        LOGIN_DELAY_MS
      );
    }

    const matches = await passwordMatches(password, expected, secret);
    if (!matches) {
      const failures = deps.limiter.recordFailure(ip);
      return finish(json(401, { error: 'Incorrect password.' }), failureDelayMs(failures));
    }

    deps.limiter.recordSuccess(ip);
    const token = await createSessionToken(secret, deps.now());
    const cookie = serializeSessionCookie(token, requestIsSecure(request), SESSION_TTL_SECONDS);
    return finish(json(200, { ok: true }, { 'set-cookie': cookie }), LOGIN_DELAY_MS);
  };
}

export default createLoginHandler();
