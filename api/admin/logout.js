// netlify/functions/_lib/http.ts
var SESSION_COOKIE = "ae_admin";
var SESSION_TTL_SECONDS = 8 * 60 * 60;
function json(status, body, extra) {
  const headers = new Headers(extra);
  headers.set("content-type", "application/json; charset=utf-8");
  headers.set("cache-control", "no-store");
  headers.set("x-content-type-options", "nosniff");
  headers.set("referrer-policy", "no-referrer");
  headers.set("vary", "cookie");
  return new Response(JSON.stringify(body), { status, headers });
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
function clearSessionCookie(secure) {
  return serializeSessionCookie("", secure, 0);
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

// netlify/functions/admin-logout.ts
function createLogoutHandler() {
  return async function adminLogout(request) {
    if (request.method !== "POST") {
      return json(405, { error: "Method not allowed." }, { allow: "POST" });
    }
    if (!originAllowed(request)) return json(403, { error: "Cross-origin request rejected." });
    const cookie = clearSessionCookie(requestIsSecure(request));
    return json(200, { ok: true }, { "set-cookie": cookie });
  };
}
var admin_logout_default = createLogoutHandler();

// api/admin/logout.entry.mjs
var logout_entry_default = {
  fetch(request) {
    return admin_logout_default(request);
  }
};
export {
  logout_entry_default as default
};
