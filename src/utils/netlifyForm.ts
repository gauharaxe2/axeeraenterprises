export const CONTACT_FORM_NAME = 'contact';
export const CONTACT_FORM_ACTION = '/form-received';
export const FORM_SUCCESS_MARKER = 'data-netlify-form="accepted"';
export const FORM_SKELETON_MARKER = 'data-form-skeleton="contact"';

/**
 * Netlify only records a submission when form detection is on and the POST
 * reaches the forms processor. A SPA rewrite can answer that POST with HTTP 200
 * and the homepage HTML, which is not a successful submission.
 */
export function isNetlifyFormAccepted(status: number, body: string): boolean {
  if (status < 200 || status >= 300) return false;

  const text = body ?? '';
  if (text.includes('id="root"') || text.includes("id='root'")) return false;
  if (text.includes(FORM_SKELETON_MARKER)) return false;
  if (text.includes(FORM_SUCCESS_MARKER)) return true;
  if (/form submission has been received/i.test(text)) return true;
  return text.trim() === '';
}

export function encodeContactForm(fields: {
  name: string;
  email: string;
  company: string;
  service: string;
  message: string;
  botField: string;
}): string {
  const params = new URLSearchParams();
  params.set('form-name', CONTACT_FORM_NAME);
  params.set('name', fields.name);
  params.set('email', fields.email);
  params.set('company', fields.company);
  params.set('service', fields.service);
  params.set('message', fields.message);
  params.set('bot-field', fields.botField);
  return params.toString();
}
