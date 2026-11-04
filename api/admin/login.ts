import handler from '../../netlify/functions/admin-login.ts';

/** Vercel Function entry for /api/admin/login. */
export default {
  fetch(request: Request) {
    return handler(request);
  }
};
