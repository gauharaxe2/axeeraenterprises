// netlify/functions/_lib/http.ts
var SESSION_COOKIE = "ae_admin";
var SESSION_TTL_SECONDS = 8 * 60 * 60;
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
function readCookie(header, name) {
  if (!header) return null;
  for (const part of header.split(";")) {
    const separator = part.indexOf("=");
    if (separator === -1) continue;
    const key = part.slice(0, separator).trim();
    if (key !== name) continue;
    return part.slice(separator + 1).trim();
  }
  return null;
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

// netlify/functions/_lib/session.ts
var encoder = new TextEncoder();
function base64UrlToBytes(value) {
  if (!/^[A-Za-z0-9_-]+$/.test(value)) return null;
  const padded = value + "=".repeat((4 - value.length % 4) % 4);
  try {
    const binary = atob(padded.replace(/-/g, "+").replace(/_/g, "/"));
    const bytes = new Uint8Array(binary.length);
    for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
    return bytes;
  } catch {
    return null;
  }
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
async function verifySessionToken(token, secret, nowMs) {
  if (!secret || !token) return false;
  const parts = token.split(".");
  if (parts.length !== 2) return false;
  const [payloadPart, signaturePart] = parts;
  if (!payloadPart || !signaturePart) return false;
  const provided = base64UrlToBytes(signaturePart);
  if (!provided) return false;
  const expected = await hmac(secret, `ae-admin-v1.${payloadPart}`);
  if (!timingSafeEqual(provided, expected)) return false;
  const payloadBytes = base64UrlToBytes(payloadPart);
  if (!payloadBytes) return false;
  let payload;
  try {
    payload = JSON.parse(new TextDecoder().decode(payloadBytes));
  } catch {
    return false;
  }
  if (!payload || payload.v !== 1) return false;
  if (!Number.isFinite(payload.iat) || !Number.isFinite(payload.exp)) return false;
  if (payload.exp - payload.iat > SESSION_TTL_SECONDS + 60) return false;
  const nowSeconds = Math.floor(nowMs / 1e3);
  if (payload.iat > nowSeconds + 60) return false;
  if (payload.exp <= nowSeconds) return false;
  return true;
}

// netlify/functions/_lib/guard.ts
async function requireSession(request, env, nowMs) {
  if (!originAllowed(request)) return json(403, { error: "Cross-origin request rejected." });
  const secret = resolveSecret(env);
  if (!secret || !envValue(env, "ADMIN_PASSWORD")) {
    return json(503, { error: notConfiguredMessage() });
  }
  const token = readCookie(request.headers.get("cookie"), SESSION_COOKIE);
  if (!token || !await verifySessionToken(token, secret, nowMs)) {
    return json(401, { error: "Sign in required." });
  }
  return null;
}

// netlify/functions/admin-session.ts
function createSessionHandler(overrides = {}) {
  const env = overrides.env ?? readEnv;
  const now = overrides.now ?? (() => Date.now());
  return async function adminSession(request) {
    if (request.method !== "GET" && request.method !== "HEAD") {
      return json(405, { error: "Method not allowed." }, { allow: "GET" });
    }
    const denied = await requireSession(request, env, now());
    if (denied) return denied;
    return json(200, { authenticated: true });
  };
}
var admin_session_default = createSessionHandler();

// api/admin/session.entry.mjs
var session_entry_default = {
  fetch(request) {
    return admin_session_default(request);
  }
};
export {
  session_entry_default as default
};
