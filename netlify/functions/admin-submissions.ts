import { createFormsClient, isSubmissionId, NetlifyApiError } from './_lib/forms.ts';
import { requireSession } from './_lib/guard.ts';
import { json, readEnv, readJson, resolveSiteId, resolveToken, type EnvFn } from './_lib/http.ts';
import { createBlobReadStore, type ReadStore } from './_lib/readState.ts';

const TOKEN_MISSING =
  'Form submissions are not configured. Set NETLIFY_API_TOKEN in the Netlify Functions environment.';
const UPSTREAM = 'Could not reach Netlify Forms. Check the API token and site id.';

export interface SubmissionsDeps {
  env: EnvFn;
  fetchImpl: typeof fetch;
  now: () => number;
  readStore?: ReadStore;
}

export function createSubmissionsHandler(overrides: Partial<SubmissionsDeps> = {}) {
  const env = overrides.env ?? readEnv;
  const fetchImpl = overrides.fetchImpl ?? fetch;
  const now = overrides.now ?? (() => Date.now());
  let storePromise: Promise<ReadStore> | null = null;

  const readStore = async (): Promise<ReadStore> => {
    if (overrides.readStore) return overrides.readStore;
    if (!storePromise) {
      storePromise = Promise.resolve(createBlobReadStore(resolveSiteId(env), resolveToken(env)));
    }
    return storePromise;
  };

  return async function adminSubmissions(request: Request): Promise<Response> {
    if (request.method !== 'GET' && request.method !== 'POST') {
      return json(405, { error: 'Method not allowed.' }, { allow: 'GET, POST' });
    }
    const denied = await requireSession(request, env, now());
    if (denied) return denied;
    const token = resolveToken(env);
    if (!token) return json(503, { error: TOKEN_MISSING });

    const forms = createFormsClient({ fetchImpl, token, siteId: resolveSiteId(env) });

    try {
      if (request.method === 'GET') {
        const list = await forms.listContact();
        let readIds = new Set<string>();
        let readState: 'ok' | 'unavailable' = 'ok';
        try {
          readIds = await (await readStore()).readIds();
        } catch {
          readState = 'unavailable';
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
      const payload = body.value as { action?: unknown; id?: unknown; read?: unknown };
      if (!isSubmissionId(payload.id)) return json(400, { error: 'Invalid submission id.' });
      const owned = await forms.ownsContactSubmission(payload.id);
      if (!owned) return json(404, { error: 'Submission not found.' });

      if (payload.action === 'delete') {
        await forms.deleteSubmission(payload.id);
        try {
          await (await readStore()).setRead(payload.id, false);
        } catch {
          // The submission is already gone. A leftover read flag is harmless.
        }
        return json(200, { ok: true });
      }

      if (payload.action === 'read') {
        try {
          await (await readStore()).setRead(payload.id, payload.read !== false);
        } catch {
          return json(503, { error: 'Read status could not be saved.' });
        }
        return json(200, { ok: true, read: payload.read !== false });
      }

      return json(400, { error: 'Unsupported action.' });
    } catch (error) {
      if (error instanceof NetlifyApiError && error.status === 404) {
        return json(404, { error: 'Submission not found.' });
      }
      return json(502, { error: UPSTREAM });
    }
  };
}

export default createSubmissionsHandler();
