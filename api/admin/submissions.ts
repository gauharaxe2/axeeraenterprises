import handler from '../../netlify/functions/admin-submissions.ts';

/** Vercel Function entry for GET/POST /api/admin/submissions. */
export default {
  fetch(request: Request) {
    return handler(request);
  }
};
