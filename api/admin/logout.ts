import handler from '../../netlify/functions/admin-logout.ts';

/** Vercel Function entry for POST /api/admin/logout. */
export default {
  fetch(request: Request) {
    return handler(request);
  }
};
