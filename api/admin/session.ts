import handler from '../../netlify/functions/admin-session.ts';

/** Vercel Function entry for GET /api/admin/session. */
export default {
  fetch(request: Request) {
    return handler(request);
  }
};
