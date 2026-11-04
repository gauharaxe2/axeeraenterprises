import react from '@vitejs/plugin-react';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { defineConfig, loadEnv, type Plugin, type ViteDevServer } from 'vite';

const ADMIN_ENV = ['ADMIN_PASSWORD', 'ADMIN_SESSION_SECRET', 'NETLIFY_API_TOKEN', 'NETLIFY_SITE_ID'] as const;

const ADMIN_ROUTES: Record<string, string> = {
  '/api/admin/login': '/netlify/functions/admin-login.ts',
  '/api/admin/logout': '/netlify/functions/admin-logout.ts',
  '/api/admin/session': '/netlify/functions/admin-session.ts',
  '/api/admin/submissions': '/netlify/functions/admin-submissions.ts'
};

const SKIP_HEADERS = new Set([
  'host',
  'connection',
  'content-length',
  'transfer-encoding',
  'keep-alive',
  'upgrade',
  'expect',
  'te',
  'trailer'
]);

function applyAdminEnv(mode: string, root: string) {
  const loaded = loadEnv(mode, root, '');
  for (const key of ADMIN_ENV) {
    if (!process.env[key] && loaded[key]) process.env[key] = loaded[key];
  }
}

async function toWebRequest(req: IncomingMessage): Promise<Request> {
  const host = req.headers.host || '127.0.0.1:3000';
  const url = `http://${host}${req.url || '/'}`;
  const method = (req.method || 'GET').toUpperCase();
  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers)) {
    if (value === undefined || SKIP_HEADERS.has(key.toLowerCase())) continue;
    headers.set(key, Array.isArray(value) ? value.join(', ') : value);
  }
  const remote = req.socket.remoteAddress || 'local';
  headers.set('x-nf-client-connection-ip', `dev-${remote}`);
  if (method === 'GET' || method === 'HEAD') return new Request(url, { method, headers });
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  const body = Buffer.concat(chunks);
  return new Request(url, { method, headers, body, duplex: 'half' });
}

async function sendWebResponse(res: ServerResponse, response: Response) {
  res.statusCode = response.status;
  const cookies = typeof response.headers.getSetCookie === 'function' ? response.headers.getSetCookie() : [];
  response.headers.forEach((value, key) => {
    if (key.toLowerCase() === 'set-cookie') return;
    res.setHeader(key, value);
  });
  if (cookies.length > 0) res.setHeader('set-cookie', cookies);
  res.end(Buffer.from(await response.arrayBuffer()));
}

async function handleAdminApi(
  req: IncomingMessage,
  res: ServerResponse,
  load: (specifier: string) => Promise<{ default?: (request: Request) => Promise<Response> }>
): Promise<boolean> {
  const pathname = new URL(req.url || '/', 'http://localhost').pathname.replace(/\/+$/, '') || '/';
  const specifier = ADMIN_ROUTES[pathname];
  if (!specifier) return false;
  const module = await load(specifier);
  if (typeof module.default !== 'function') throw new Error(`Missing admin handler for ${pathname}`);
  const response = await module.default(await toWebRequest(req));
  await sendWebResponse(res, response);
  return true;
}

/**
 * Dev-only bridge so `npm run dev` runs the same Netlify function handlers.
 * Production invokes them through the redirects in netlify.toml.
 */
function adminApiDevPlugin(): Plugin {
  const attach = (server: ViteDevServer) => {
    applyAdminEnv(server.config.mode, server.config.root);
    server.middlewares.use(async (req, res, next) => {
      try {
        const handled = await handleAdminApi(req, res, (specifier) => server.ssrLoadModule(specifier));
        if (!handled) next();
      } catch (error) {
        next(error);
      }
    });
  };

  return {
    name: 'admin-api-dev',
    apply: 'serve',
    configureServer: attach
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), adminApiDevPlugin()],
  server: {
    host: '0.0.0.0',
    port: 3000,
  },
  preview: {
    host: '0.0.0.0',
    port: 3000,
  }
});
