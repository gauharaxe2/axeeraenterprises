// src/utils/netlifyForm.ts
var CONTACT_FORM_NAME = "contact";

// netlify/functions/_lib/forms.ts
var API_ORIGIN = "https://api.netlify.com";
var PER_PAGE = 100;
var MAX_PAGES = 10;
var USER_AGENT = "gauharaxe-admin/1.0 (+https://gauharaxe.org)";
var NetlifyApiError = class extends Error {
  status;
  constructor(status) {
    super(`Netlify API request failed (${status})`);
    this.name = "NetlifyApiError";
    this.status = status;
  }
};
function isSubmissionId(value) {
  return typeof value === "string" && /^[A-Za-z0-9]{6,80}$/.test(value);
}
function parseLinkHeader(header) {
  const links = {};
  if (!header) return links;
  for (const part of header.split(",")) {
    const match = part.match(/<([^>]+)>\s*;\s*rel="?([^";]+)"?/i);
    if (!match) continue;
    const url = allowApiUrl(match[1].trim());
    if (!url) continue;
    for (const rel of match[2].toLowerCase().split(/\s+/)) {
      if (rel === "next") links.next = url;
      if (rel === "last") links.last = url;
    }
  }
  return links;
}
function allowApiUrl(value) {
  try {
    const url = new URL(value);
    if (url.origin !== API_ORIGIN) return null;
    if (!url.pathname.startsWith("/api/v1/")) return null;
    return url.toString();
  } catch {
    return null;
  }
}
function clip(value, max) {
  const trimmed = value.trim();
  return trimmed.length > max ? trimmed.slice(0, max) : trimmed;
}
function asRecord(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return value;
}
function field(data, key, max) {
  const direct = data[key];
  if (typeof direct === "string" && direct.trim()) return clip(direct, max);
  for (const [name, value] of Object.entries(data)) {
    if (name.toLowerCase() === key && typeof value === "string" && value.trim()) return clip(value, max);
  }
  return "";
}
function messageFrom(data, body, summary) {
  const direct = field(data, "message", 5e4);
  if (direct) return direct;
  if (typeof body === "string" && body.trim() && !/\b(name|email)\s*:/i.test(body.slice(0, 120))) {
    return clip(body, 5e4);
  }
  if (typeof summary === "string" && summary.trim()) return clip(summary, 5e4);
  return "";
}
function mapSubmission(value) {
  const record = asRecord(value);
  if (!isSubmissionId(record.id)) return null;
  const data = asRecord(record.data);
  const createdAt = typeof record.created_at === "string" ? record.created_at : "";
  return {
    id: record.id,
    createdAt,
    name: field(data, "name", 2e3) || (typeof record.name === "string" ? clip(record.name, 2e3) : ""),
    email: field(data, "email", 2e3) || (typeof record.email === "string" ? clip(record.email, 2e3) : ""),
    company: field(data, "company", 2e3) || (typeof record.company === "string" ? clip(record.company, 2e3) : ""),
    service: field(data, "service", 2e3),
    message: messageFrom(data, record.body, record.summary)
  };
}
function sortEnquiries(records) {
  return [...records].sort((left, right) => {
    const leftMs = Date.parse(left.createdAt);
    const rightMs = Date.parse(right.createdAt);
    return (Number.isFinite(rightMs) ? rightMs : 0) - (Number.isFinite(leftMs) ? leftMs : 0);
  });
}
function pageNumber(url) {
  try {
    const value = Number(new URL(url).searchParams.get("page"));
    return Number.isInteger(value) && value > 0 ? value : null;
  } catch {
    return null;
  }
}
function createFormsClient(options) {
  const { fetchImpl, token, siteId } = options;
  async function request(url, method) {
    const allowed = allowApiUrl(url);
    if (!allowed) throw new NetlifyApiError(0);
    let response;
    try {
      response = await fetchImpl(allowed, {
        method,
        headers: {
          authorization: `Bearer ${token}`,
          accept: "application/json",
          "user-agent": USER_AGENT
        },
        signal: AbortSignal.timeout(8e3)
      });
    } catch {
      throw new NetlifyApiError(0);
    }
    if (response.status === 404) return { status: 404, body: null, link: null };
    if (!response.ok) throw new NetlifyApiError(response.status);
    if (response.status === 204) return { status: 204, body: null, link: response.headers.get("link") };
    const text = await response.text();
    let body = null;
    if (text) {
      try {
        body = JSON.parse(text);
      } catch {
        throw new NetlifyApiError(response.status);
      }
    }
    return { status: response.status, body, link: response.headers.get("link") };
  }
  async function getPage(url) {
    const result = await request(url, "GET");
    if (!Array.isArray(result.body)) throw new NetlifyApiError(result.status || 502);
    const links = parseLinkHeader(result.link);
    return { items: result.body, next: links.next, last: links.last };
  }
  async function contactForm() {
    const url = `${API_ORIGIN}/api/v1/sites/${encodeURIComponent(siteId)}/forms`;
    const result = await request(url, "GET");
    if (!Array.isArray(result.body)) throw new NetlifyApiError(result.status || 502);
    for (const item of result.body) {
      const form = item;
      if (form?.name === CONTACT_FORM_NAME && typeof form.id === "string" && form.id) {
        if (typeof form.site_id === "string" && form.site_id && form.site_id !== siteId) continue;
        return { id: form.id };
      }
    }
    return null;
  }
  async function listedOnForm(formId, id) {
    let url = `${API_ORIGIN}/api/v1/forms/${encodeURIComponent(formId)}/submissions?per_page=${PER_PAGE}&page=1`;
    const seen = /* @__PURE__ */ new Set();
    for (let page = 0; page < MAX_PAGES && url; page += 1) {
      if (seen.has(url)) return false;
      seen.add(url);
      const result = await getPage(url);
      if (result.items.some((item) => asRecord(item).id === id)) return true;
      if (!result.next) return false;
      url = result.next;
    }
    return false;
  }
  return {
    async listContact() {
      const form = await contactForm();
      if (!form) return { formFound: false, submissions: [], truncated: false };
      const collected = /* @__PURE__ */ new Map();
      let truncated = false;
      let url = `${API_ORIGIN}/api/v1/forms/${encodeURIComponent(form.id)}/submissions?per_page=${PER_PAGE}&page=1`;
      const seen = /* @__PURE__ */ new Set();
      for (let page = 0; page < MAX_PAGES && url; page += 1) {
        if (seen.has(url)) break;
        seen.add(url);
        const result = await getPage(url);
        for (const item of result.items) {
          const mapped = mapSubmission(item);
          if (mapped) collected.set(mapped.id, mapped);
        }
        const lastPage = result.last ? pageNumber(result.last) : null;
        if (page === 0 && result.last && lastPage && lastPage > MAX_PAGES) {
          const tail = await getPage(result.last);
          for (const item of tail.items) {
            const mapped = mapSubmission(item);
            if (mapped) collected.set(mapped.id, mapped);
          }
          truncated = true;
          break;
        }
        if (!result.next) break;
        if (page + 1 >= MAX_PAGES) {
          truncated = true;
          break;
        }
        url = result.next;
      }
      return { formFound: true, submissions: sortEnquiries([...collected.values()]), truncated };
    },
    async ownsContactSubmission(id) {
      if (!isSubmissionId(id)) return false;
      const form = await contactForm();
      if (!form) return false;
      const single = await request(`${API_ORIGIN}/api/v1/submissions/${encodeURIComponent(id)}`, "GET");
      if (single.status === 404 || !single.body) return false;
      const record = asRecord(single.body);
      if (record.id !== id) return false;
      if (typeof record.site_id === "string" && record.site_id && record.site_id !== siteId) return false;
      if (typeof record.form_name === "string" && record.form_name && record.form_name !== CONTACT_FORM_NAME) {
        return false;
      }
      if (typeof record.form_id === "string" && record.form_id) {
        return record.form_id === form.id;
      }
      return listedOnForm(form.id, id);
    },
    async deleteSubmission(id) {
      const result = await request(`${API_ORIGIN}/api/v1/submissions/${encodeURIComponent(id)}`, "DELETE");
      if (result.status === 404) throw new NetlifyApiError(404);
    }
  };
}

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
function resolveToken(env) {
  return envValue(env, "NETLIFY_API_TOKEN");
}
var DEFAULT_SITE_ID = "c44c508d-5333-4a95-b1b1-2c3a7f8ef12d";
function resolveSiteId(env) {
  return envValue(env, "NETLIFY_SITE_ID") || envValue(env, "SITE_ID") || DEFAULT_SITE_ID;
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

// netlify/functions/_lib/readState.ts
import { getStore } from "@netlify/blobs";
var STORE_NAME = "contact-enquiry-reads";
var READ_KEY = "read-ids";
function asIdList(value) {
  if (!Array.isArray(value)) return [];
  return value.filter((item) => typeof item === "string");
}
function createBlobReadStore(siteID, token) {
  const store = getStore({
    name: STORE_NAME,
    siteID,
    token,
    consistency: "strong"
  });
  return {
    async readIds() {
      const raw = await store.get(READ_KEY, { type: "json" });
      return new Set(asIdList(raw));
    },
    async setRead(id, read) {
      const current = new Set(asIdList(await store.get(READ_KEY, { type: "json" })));
      if (read) current.add(id);
      else current.delete(id);
      await store.setJSON(READ_KEY, [...current]);
    }
  };
}

// netlify/functions/admin-submissions.ts
var TOKEN_MISSING = "Form submissions are not configured. Set NETLIFY_API_TOKEN in the Functions environment.";
var UPSTREAM = "Could not reach Netlify Forms. Check the API token and site id.";
function createSubmissionsHandler(overrides = {}) {
  const env = overrides.env ?? readEnv;
  const fetchImpl = overrides.fetchImpl ?? fetch;
  const now = overrides.now ?? (() => Date.now());
  let storePromise = null;
  const readStore = async () => {
    if (overrides.readStore) return overrides.readStore;
    if (!storePromise) {
      storePromise = Promise.resolve(createBlobReadStore(resolveSiteId(env), resolveToken(env)));
    }
    return storePromise;
  };
  return async function adminSubmissions(request) {
    if (request.method !== "GET" && request.method !== "POST") {
      return json(405, { error: "Method not allowed." }, { allow: "GET, POST" });
    }
    const denied = await requireSession(request, env, now());
    if (denied) return denied;
    const token = resolveToken(env);
    if (!token) return json(503, { error: TOKEN_MISSING });
    const forms = createFormsClient({ fetchImpl, token, siteId: resolveSiteId(env) });
    try {
      if (request.method === "GET") {
        const list = await forms.listContact();
        let readIds = /* @__PURE__ */ new Set();
        let readState = "ok";
        try {
          readIds = await (await readStore()).readIds();
        } catch {
          readState = "unavailable";
        }
        return json(200, {
          formFound: list.formFound,
          truncated: list.truncated,
          readState,
          submissions: list.submissions.map((item) => ({ ...item, read: readIds.has(item.id) }))
        });
      }
      const body = await readJson(request);
      if (!body.ok) return body.response;
      const payload = body.value;
      if (!isSubmissionId(payload.id)) return json(400, { error: "Invalid submission id." });
      const owned = await forms.ownsContactSubmission(payload.id);
      if (!owned) return json(404, { error: "Submission not found." });
      if (payload.action === "delete") {
        await forms.deleteSubmission(payload.id);
        try {
          await (await readStore()).setRead(payload.id, false);
        } catch {
        }
        return json(200, { ok: true });
      }
      if (payload.action === "read") {
        try {
          await (await readStore()).setRead(payload.id, payload.read !== false);
        } catch {
          return json(503, { error: "Read status could not be saved." });
        }
        return json(200, { ok: true, read: payload.read !== false });
      }
      return json(400, { error: "Unsupported action." });
    } catch (error) {
      if (error instanceof NetlifyApiError && error.status === 404) {
        return json(404, { error: "Submission not found." });
      }
      return json(502, { error: UPSTREAM });
    }
  };
}
var admin_submissions_default = createSubmissionsHandler();

// api/admin/submissions.entry.mjs
var submissions_entry_default = {
  fetch(request) {
    return admin_submissions_default(request);
  }
};
export {
  submissions_entry_default as default
};
