// netlify/functions/_lib/rateLimit.ts
var WINDOW_MS = 15 * 60 * 1e3;
var MAX_FAILURES = 5;
var MAX_BUCKETS = 1e3;
var LoginRateLimiter = class {
  buckets = /* @__PURE__ */ new Map();
  now;
  constructor(now) {
    this.now = now;
  }
  status(ip) {
    const bucket = this.current(ip);
    if (!bucket || bucket.failures < MAX_FAILURES) {
      return { locked: false, retryAfterSeconds: 0, failures: bucket?.failures ?? 0 };
    }
    const retryAfterSeconds = Math.max(1, Math.ceil((bucket.windowStart + WINDOW_MS - this.now()) / 1e3));
    return { locked: true, retryAfterSeconds, failures: bucket.failures };
  }
  recordFailure(ip) {
    const existing = this.current(ip);
    const bucket = existing ?? { failures: 0, windowStart: this.now() };
    bucket.failures += 1;
    this.buckets.delete(ip);
    this.buckets.set(ip, bucket);
    if (this.buckets.size > MAX_BUCKETS) {
      const oldest = this.buckets.keys().next().value;
      if (oldest && oldest !== ip) this.buckets.delete(oldest);
    }
    return bucket.failures;
  }
  recordSuccess(ip) {
    this.buckets.delete(ip);
  }
  current(ip) {
    const bucket = this.buckets.get(ip);
    if (!bucket) return null;
    if (this.now() - bucket.windowStart >= WINDOW_MS) {
      this.buckets.delete(ip);
      return null;
    }
    return bucket;
  }
};

// netlify/functions/_lib/http.ts
var SESSION_COOKIE = "ae_admin";
var SESSION_TTL_SECONDS = 8 * 60 * 60;
var LOGIN_DELAY_MS = 800;
var MIN_SECRET_LENGTH = 16;
var NOT_CONFIGURED = "Admin sign-in is not configured. Set ADMIN_PASSWORD and ADMIN_SESSION_SECRET (at least 16 characters) in the Functions environment.";
function notConfiguredMessage() {
  return NOT_CONFIGURED;
}
function json(status, body, extra) {
  const headers = new Headers(extra);
  headers.set("content-type", "application/json; charset=utf-8");
  headers.set("cache-control", "no-store");
  headers.set("x-content-type-options", "nosniff");
  headers.set("referrer-policy", "no-referrer");
  headers.set("vary", "cookie");
  return new Response(JSON.stringify(body), { status, headers });
}
function readEnv(name) {
  const proc = globalThis.process;
  const value = proc?.env?.[name];
  return typeof value === "string" ? value.trim() : "";
}
function envValue(env, name) {
  const value = env(name);
  return typeof value === "string" ? value.trim() : "";
}
function resolveSecret(env) {
  const secret = envValue(env, "ADMIN_SESSION_SECRET");
  return secret.length >= MIN_SECRET_LENGTH ? secret : "";
}
function resolvePassword(env) {
  return envValue(env, "ADMIN_PASSWORD");
}
function requestIsSecure(request) {
  const forwarded = request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim().toLowerCase();
  if (forwarded) return forwarded === "https";
  try {
    return new URL(request.url).protocol === "https:";
  } catch {
    return false;
  }
}
function serializeSessionCookie(token, secure, maxAge) {
  const parts = [
    `${SESSION_COOKIE}=${token}`,
    "HttpOnly",
    "SameSite=Strict",
    "Path=/",
    `Max-Age=${maxAge}`
  ];
  if (secure) parts.push("Secure");
  return parts.join("; ");
}
function originAllowed(request) {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  let originHost = "";
  try {
    originHost = new URL(origin).host;
  } catch {
    return false;
  }
  if (!originHost) return false;
  const forwarded = request.headers.get("x-forwarded-host")?.split(",")[0]?.trim();
  const host = request.headers.get("host")?.trim();
  let urlHost = "";
  try {
    urlHost = new URL(request.url).host;
  } catch {
    urlHost = "";
  }
  return [urlHost, forwarded, host].some((candidate) => candidate && candidate === originHost);
}
function usableIp(value) {
  const ip = value?.trim() ?? "";
  if (!ip || ip.length > 80 || /[\s,]/.test(ip)) return "";
  return ip;
}
function clientIp(request) {
  const netlifyIp = usableIp(request.headers.get("x-nf-client-connection-ip"));
  if (netlifyIp) return netlifyIp;
  const forwarded = usableIp(request.headers.get("x-forwarded-for")?.split(",")[0]);
  if (forwarded) return forwarded;
  const realIp = usableIp(request.headers.get("x-real-ip"));
  if (realIp) return realIp;
  return "unknown";
}
async function readJson(request, maxBytes = 4096) {
  const type = request.headers.get("content-type") ?? "";
  if (!type.toLowerCase().includes("application/json")) {
    return { ok: false, response: json(415, { error: "Expected a JSON body." }) };
  }
  let text = "";
  try {
    text = await request.text();
  } catch {
    return { ok: false, response: json(400, { error: "Expected a JSON body." }) };
  }
  if (text.length > maxBytes) {
    return { ok: false, response: json(413, { error: "Request is too large." }) };
  }
  try {
    return { ok: true, value: text ? JSON.parse(text) : {} };
  } catch {
    return { ok: false, response: json(400, { error: "Expected a JSON body." }) };
  }
}
function delay(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
function failureDelayMs(failures) {
  if (failures <= 1) return LOGIN_DELAY_MS;
  return Math.min(4e3, LOGIN_DELAY_MS + (failures - 1) * 300);
}

// netlify/functions/_lib/session.ts
var encoder = new TextEncoder();
function bytesToBase64Url(bytes) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}
function timingSafeEqual(left, right) {
  if (left.length !== right.length) return false;
  let diff = 0;
  for (let index = 0; index < left.length; index += 1) diff |= left[index] ^ right[index];
  return diff === 0;
}
async function hmac(secret, message) {
  const key = await crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, [
    "sign"
  ]);
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(message));
  return new Uint8Array(signature);
}
async function passwordMatches(provided, expected, secret) {
  if (!provided || !expected || !secret) return false;
  const [left, right] = await Promise.all([
    hmac(secret, `ae-admin-pw.${provided}`),
    hmac(secret, `ae-admin-pw.${expected}`)
  ]);
  return timingSafeEqual(left, right);
}
async function createSessionToken(secret, nowMs) {
  const nowSeconds = Math.floor(nowMs / 1e3);
  const payload = { v: 1, iat: nowSeconds, exp: nowSeconds + SESSION_TTL_SECONDS };
  const payloadPart = bytesToBase64Url(encoder.encode(JSON.stringify(payload)));
  const signature = bytesToBase64Url(await hmac(secret, `ae-admin-v1.${payloadPart}`));
  return `${payloadPart}.${signature}`;
}

// netlify/functions/admin-login.ts
var sharedLimiter = new LoginRateLimiter(() => Date.now());
function createLoginHandler(overrides = {}) {
  const deps = {
    env: readEnv,
    now: () => Date.now(),
    sleep: delay,
    limiter: sharedLimiter,
    ...overrides
  };
  return async function adminLogin(request) {
    if (request.method !== "POST") {
      return json(405, { error: "Method not allowed." }, { allow: "POST" });
    }
    if (!originAllowed(request)) return json(403, { error: "Cross-origin request rejected." });
    const started = deps.now();
    const finish = async (response, waitMs) => {
      const elapsed = deps.now() - started;
      await deps.sleep(Math.max(0, waitMs - elapsed));
      return response;
    };
    const body = await readJson(request);
    if (!body.ok) return finish(body.response, LOGIN_DELAY_MS);
    const password = body.value.password;
    if (typeof password !== "string" || password.length < 1 || password.length > 256) {
      return finish(json(400, { error: "Enter your password." }), LOGIN_DELAY_MS);
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
          error: "Too many attempts. Try again later.",
          retryAfterSeconds: limit.retryAfterSeconds
        }, { "retry-after": String(limit.retryAfterSeconds) }),
        LOGIN_DELAY_MS
      );
    }
    const matches = await passwordMatches(password, expected, secret);
    if (!matches) {
      const failures = deps.limiter.recordFailure(ip);
      return finish(json(401, { error: "Incorrect password." }), failureDelayMs(failures));
    }
    deps.limiter.recordSuccess(ip);
    const token = await createSessionToken(secret, deps.now());
    const cookie = serializeSessionCookie(token, requestIsSecure(request), SESSION_TTL_SECONDS);
    return finish(json(200, { ok: true }, { "set-cookie": cookie }), LOGIN_DELAY_MS);
  };
}
var admin_login_default = createLoginHandler();

// api/admin/login.entry.mjs
var login_entry_default = {
  fetch(request) {
    return admin_login_default(request);
  }
};
export {
  login_entry_default as default
};
