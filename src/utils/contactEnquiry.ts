export interface ContactEnquiryFields {
  name: string;
  email: string;
  company: string;
  service: string;
  message: string;
  budget: string;
  timeline: string;
}

/**
 * Builds the Firestore `submissions` document the admin Queries tab reads.
 * Timeline stays inside the message so the stored fields do not change.
 */
export interface ContactEnquiryPayload {
  fullName: string;
  email: string;
  message: string;
  service?: string;
  company?: string;
  budget?: string;
}

export function buildContactEnquiry(fields: ContactEnquiryFields): ContactEnquiryPayload {
  const trimmedTimeline = fields.timeline.trim();
  const message = trimmedTimeline
    ? `${fields.message.trim()}\n\nTarget timeline: ${trimmedTimeline}`
    : fields.message.trim();

  return {
    fullName: fields.name.trim(),
    email: fields.email.trim(),
    company: fields.company.trim() || undefined,
    service: fields.service || undefined,
    message,
    budget: fields.budget.trim() || undefined
  };
}
