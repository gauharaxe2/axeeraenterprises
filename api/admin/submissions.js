import handler from '../../netlify/functions/admin-submissions.ts';

/** Vercel Function entry for /api/admin/submissions. */
export default {
  fetch(request) {
    return handler(request);
  }
};
