import handler from '../../netlify/functions/admin-logout.ts';

/** Vercel Function entry for /api/admin/logout. */
export default {
  fetch(request: Request) {
    return handler(request);
  }
};
