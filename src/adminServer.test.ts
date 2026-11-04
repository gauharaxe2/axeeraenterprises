import test from 'node:test';
import assert from 'node:assert/strict';
import { createLoginHandler } from '../netlify/functions/admin-login.ts';
import { createLogoutHandler } from '../netlify/functions/admin-logout.ts';
import { createSessionHandler } from '../netlify/functions/admin-session.ts';
import { createSubmissionsHandler } from '../netlify/functions/admin-submissions.ts';
import { LoginRateLimiter } from '../netlify/functions/_lib/rateLimit.ts';
import {
  allowApiUrl,
  mapSubmission,
  parseLinkHeader,
  sortEnquiries,
  type EnquiryRecord
} from '../netlify/functions/_lib/forms.ts';
import {
  LOGIN_DELAY_MS,
  SESSION_COOKIE,
  SESSION_TTL_SECONDS,
  type EnvFn
} from '../netlify/functions/_lib/http.ts';
import { createSessionToken } from '../netlify/functions/_lib/session.ts';
import type { ReadStore } from '../netlify/functions/_lib/readState.ts';

const SECRET = 'session-secret-value-32ch';
const PASSWORD = 'correct horse battery';
const TOKEN = 'super-secret-token';
const SITE = 'c44c508d-5333-4a95-b1b1-2c3a7f8ef12d';
const NOW = 1_700_000_000_000;

function env(values: Record<string, string>): EnvFn {
  return (name) => values[name] ?? '';
}

const configured = env({
  ADMIN_PASSWORD: PASSWORD,
  ADMIN_SESSION_SECRET: SECRET,
  NETLIFY_API_TOKEN: TOKEN,
  NETLIFY_SITE_ID: SITE
});

function loginHandler(values: Record<string, string> = {
  ADMIN_PASSWORD: PASSWORD,
  ADMIN_SESSION_SECRET: SECRET
}, clock = NOW) {
  const sleeps: number[] = [];
  const handler = createLoginHandler({
    env: env(values),
    now: () => clock,
    sleep: async (ms) => {
      sleeps.push(ms);
    },
    limiter: new LoginRateLimiter(() => clock)
  });
  return { handler, sleeps };
}

function loginRequest(url: string, password: string, origin = new URL(url).origin) {
  return new Request(url, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      origin,
      'x-nf-client-connection-ip': '203.0.113.10'
    },
    body: JSON.stringify({ password })
  });
}

function cookiePair(response: Response): string {
  const header = response.headers.get('set-cookie') ?? '';
  return header.split(';')[0] ?? '';
}

test('login fails closed when the password or session secret is missing or short', async () => {
  for (const values of [
    {},
    { ADMIN_PASSWORD: PASSWORD },
    { ADMIN_SESSION_SECRET: SECRET },
    { ADMIN_PASSWORD: PASSWORD, ADMIN_SESSION_SECRET: 'too-short' }
  ]) {
    const { handler } = loginHandler(values);
    const response = await handler(loginRequest('https://gauharaxe.org/api/admin/login', PASSWORD));
    assert.equal(response.status, 503);
    assert.equal(response.headers.get('set-cookie'), null);
    const body = await response.json();
    assert.match(body.error, /not configured/i);
    assert.equal(JSON.stringify(body).includes(PASSWORD), false);
  }
});

test('login sets an HttpOnly session cookie only for the right password', async () => {
  const { handler, sleeps } = loginHandler();
  const wrong = await handler(loginRequest('https://gauharaxe.org/api/admin/login', 'nope'));
  assert.equal(wrong.status, 401);
  assert.equal(wrong.headers.get('set-cookie'), null);
  assert.equal((await wrong.json()).error, 'Incorrect password.');
  assert.ok(sleeps[0] >= LOGIN_DELAY_MS);

  const right = await handler(loginRequest('https://gauharaxe.org/api/admin/login', PASSWORD));
  assert.equal(right.status, 200);
  const cookie = right.headers.get('set-cookie') ?? '';
  assert.match(cookie, new RegExp(`^${SESSION_COOKIE}=`));
  assert.match(cookie, /HttpOnly/);
  assert.match(cookie, /SameSite=Strict/);
  assert.match(cookie, /Path=\//);
  assert.match(cookie, new RegExp(`Max-Age=${SESSION_TTL_SECONDS}`));
  assert.match(cookie, /Secure/);
  assert.equal(JSON.stringify(await right.clone().json()).includes(SECRET), false);
  assert.ok(sleeps[1] >= LOGIN_DELAY_MS);

  const local = await handler(loginRequest('http://127.0.0.1:3000/api/admin/login', PASSWORD));
  assert.equal(local.status, 200);
  assert.equal((local.headers.get('set-cookie') ?? '').includes('Secure'), false);

  const session = createSessionHandler({ env: configured, now: () => NOW });
  const accepted = await session(new Request('https://gauharaxe.org/api/admin/session', {
    headers: { cookie: cookiePair(right), origin: 'https://gauharaxe.org' }
  }));
  assert.equal(accepted.status, 200);
  assert.deepEqual(await accepted.json(), { authenticated: true });

  const missing = await session(new Request('https://gauharaxe.org/api/admin/session'));
  assert.equal(missing.status, 401);
});

test('a tampered or expired session is rejected and logout clears the cookie', async () => {
  const token = await createSessionToken(SECRET, NOW);
  const session = createSessionHandler({ env: configured, now: () => NOW });
  const tampered = await session(new Request('https://gauharaxe.org/api/admin/session', {
    headers: { cookie: `${SESSION_COOKIE}=${token.replace(/.$/, (char) => (char === 'a' ? 'b' : 'a'))}` }
  }));
  assert.equal(tampered.status, 401);

  const expired = createSessionHandler({
    env: configured,
    now: () => NOW + (SESSION_TTL_SECONDS + 5) * 1000
  });
  const stale = await expired(new Request('https://gauharaxe.org/api/admin/session', {
    headers: { cookie: `${SESSION_COOKIE}=${token}` }
  }));
  assert.equal(stale.status, 401);

  const logout = createLogoutHandler();
  const cleared = await logout(new Request('https://gauharaxe.org/api/admin/logout', { method: 'POST' }));
  const header = cleared.headers.get('set-cookie') ?? '';
  assert.equal(cleared.status, 200);
  assert.match(header, /Max-Age=0/);
  assert.match(header, /HttpOnly/);
});

test('failed logins are delayed and then rate limited', async () => {
  const { handler, sleeps } = loginHandler();
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const response = await handler(loginRequest('https://gauharaxe.org/api/admin/login', 'wrong'));
    assert.equal(response.status, 401);
  }
  const locked = await handler(loginRequest('https://gauharaxe.org/api/admin/login', PASSWORD));
  assert.equal(locked.status, 429);
  const body = await locked.json();
  assert.ok(body.retryAfterSeconds > 0);
  assert.ok(sleeps.every((ms) => ms >= LOGIN_DELAY_MS));

  const foreign = await handler(loginRequest('https://gauharaxe.org/api/admin/login', PASSWORD, 'https://evil.example'));
  assert.equal(foreign.status, 403);
});

test('submission mapping keeps the contact fields and drops client metadata', () => {
  const mapped = mapSubmission({
    id: 'abc123def456',
    email: 'top@example.com',
    name: 'Top Name',
    company: 'Top Co',
    summary: 'summary',
    body: 'name: Top\nemail: top@example.com',
    created_at: '2024-06-01T12:00:00.000Z',
    data: {
      name: 'Jane',
      email: 'jane@example.com',
      company: 'Era',
      service: 'Web Development',
      message: 'Hello there',
      ip: '203.0.113.5',
      user_agent: 'secret-browser',
      'bot-field': 'filled'
    }
  });
  assert.deepEqual(mapped, {
    id: 'abc123def456',
    createdAt: '2024-06-01T12:00:00.000Z',
    name: 'Jane',
    email: 'jane@example.com',
    company: 'Era',
    service: 'Web Development',
    message: 'Hello there'
  });
  assert.equal(JSON.stringify(mapped).includes('203.0.113.5'), false);
  assert.equal(JSON.stringify(mapped).includes('secret-browser'), false);

  const records: EnquiryRecord[] = [
    { ...mapped!, createdAt: '2024-01-01T00:00:00.000Z', id: 'aaa111bbb222' },
    { ...mapped!, createdAt: '2024-06-01T00:00:00.000Z', id: 'ccc333ddd444' }
  ];
  assert.deepEqual(sortEnquiries(records).map((item) => item.id), ['ccc333ddd444', 'aaa111bbb222']);
  assert.equal(allowApiUrl('https://evil.example/api/v1/forms/x'), null);
  assert.equal(
    parseLinkHeader('<https://api.netlify.com/api/v1/forms/form123/submissions?page=2>; rel="next"').next?.includes('page=2'),
    true
  );
  assert.equal(parseLinkHeader('<https://evil.example/steal>; rel="next"').next, undefined);
});

function memoryStore(initial: string[] = []): ReadStore & { ids: Set<string> } {
  const ids = new Set(initial);
  return {
    ids,
    async readIds() {
      return new Set(ids);
    },
    async setRead(id, read) {
      if (read) ids.add(id);
      else ids.delete(id);
    }
  };
}

test('queries require a session and a token, then list newest first', async () => {
  const calls: Array<{ url: string; method: string; authorization: string }> = [];
  const fetchImpl: typeof fetch = async (input, init) => {
    const url = String(input);
    const method = init?.method ?? 'GET';
    const authorization = new Headers(init?.headers).get('authorization') ?? '';
    calls.push({ url, method, authorization });
    if (url.endsWith('/forms')) {
      return Response.json([{ id: 'form123abc', name: 'contact', site_id: SITE }]);
    }
    if (url.includes('/forms/form123abc/submissions')) {
      return Response.json(
        [
          {
            id: 'aaa111bbb222',
            created_at: '2024-01-01T00:00:00.000Z',
            data: { name: 'Older', email: 'old@example.com', company: '', service: 'SEO', message: 'First' }
          },
          {
            id: 'ccc333ddd444',
            created_at: '2024-06-01T00:00:00.000Z',
            data: {
              name: 'Newer',
              email: 'new@example.com',
              company: 'Era',
              service: 'Web',
              message: 'Second',
              ip: '203.0.113.9'
            }
          }
        ],
        { headers: { link: '<https://evil.example/next>; rel="next"' } }
      );
    }
    if (method === 'DELETE') return new Response(null, { status: 204 });
    const id = url.split('/').pop();
    if (id === 'zzz999yyy888') {
      return Response.json({ id, form_id: 'otherform999', form_name: 'other', site_id: SITE });
    }
    return Response.json({ id, form_id: 'form123abc', form_name: 'contact', site_id: SITE });
  };

  const store = memoryStore(['ccc333ddd444']);
  const handler = createSubmissionsHandler({
    env: configured,
    fetchImpl,
    now: () => NOW,
    readStore: store
  });
  const token = await createSessionToken(SECRET, NOW);
  const headers = { cookie: `${SESSION_COOKIE}=${token}`, origin: 'https://gauharaxe.org' };

  const anonymous = await handler(new Request('https://gauharaxe.org/api/admin/submissions'));
  assert.equal(anonymous.status, 401);
  assert.equal(calls.length, 0);

  const unconfigured = createSubmissionsHandler({
    env: env({ ADMIN_PASSWORD: PASSWORD, ADMIN_SESSION_SECRET: SECRET }),
    fetchImpl,
    now: () => NOW,
    readStore: store
  });
  const missingToken = await unconfigured(new Request('https://gauharaxe.org/api/admin/submissions', { headers }));
  assert.equal(missingToken.status, 503);
  assert.equal(calls.length, 0);

  const listed = await handler(new Request('https://gauharaxe.org/api/admin/submissions', { headers }));
  assert.equal(listed.status, 200);
  const body = await listed.json();
  assert.deepEqual(body.submissions.map((item: { id: string; read: boolean }) => [item.id, item.read]), [
    ['ccc333ddd444', true],
    ['aaa111bbb222', false]
  ]);
  assert.equal(JSON.stringify(body).includes('203.0.113.9'), false);
  assert.equal(JSON.stringify(body).includes(TOKEN), false);
  assert.equal(calls.every((call) => call.authorization === `Bearer ${TOKEN}`), true);
  assert.equal(calls.some((call) => call.url.includes('evil.example')), false);

  calls.length = 0;
  const rejected = await handler(new Request('https://gauharaxe.org/api/admin/submissions', {
    method: 'POST',
    headers: { ...headers, 'content-type': 'application/json' },
    body: JSON.stringify({ action: 'delete', id: 'zzz999yyy888' })
  }));
  assert.equal(rejected.status, 404);
  assert.equal(calls.some((call) => call.method === 'DELETE'), false);

  const removed = await handler(new Request('https://gauharaxe.org/api/admin/submissions', {
    method: 'POST',
    headers: { ...headers, 'content-type': 'application/json' },
    body: JSON.stringify({ action: 'delete', id: 'ccc333ddd444' })
  }));
  assert.equal(removed.status, 200);
  assert.equal(calls.some((call) => call.method === 'DELETE' && call.url.endsWith('/submissions/ccc333ddd444')), true);
  assert.equal(store.ids.has('ccc333ddd444'), false);

  const marked = await handler(new Request('https://gauharaxe.org/api/admin/submissions', {
    method: 'POST',
    headers: { ...headers, 'content-type': 'application/json' },
    body: JSON.stringify({ action: 'read', id: 'aaa111bbb222', read: true })
  }));
  assert.equal(marked.status, 200);
  assert.equal(store.ids.has('aaa111bbb222'), true);

  const badId = await handler(new Request('https://gauharaxe.org/api/admin/submissions', {
    method: 'POST',
    headers: { ...headers, 'content-type': 'application/json' },
    body: JSON.stringify({ action: 'delete', id: '../etc/passwd' })
  }));
  assert.equal(badId.status, 400);
});
