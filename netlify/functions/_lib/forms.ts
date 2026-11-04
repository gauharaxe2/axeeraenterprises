import { CONTACT_FORM_NAME } from '../../../src/utils/netlifyForm.ts';

const API_ORIGIN = 'https://api.netlify.com';
const PER_PAGE = 100;
const MAX_PAGES = 10;
const USER_AGENT = 'gauharaxe-admin/1.0 (+https://gauharaxe.org)';

export class NetlifyApiError extends Error {
  status: number;

  constructor(status: number) {
    super(`Netlify API request failed (${status})`);
    this.name = 'NetlifyApiError';
    this.status = status;
  }
}

export interface EnquiryRecord {
  id: string;
  createdAt: string;
  name: string;
  email: string;
  company: string;
  service: string;
  message: string;
}

export function isSubmissionId(value: unknown): value is string {
  return typeof value === 'string' && /^[A-Za-z0-9]{6,80}$/.test(value);
}

export function parseLinkHeader(header: string | null): { next?: string; last?: string } {
  const links: { next?: string; last?: string } = {};
  if (!header) return links;
  for (const part of header.split(',')) {
    const match = part.match(/<([^>]+)>\s*;\s*rel="?([^";]+)"?/i);
    if (!match) continue;
    const url = allowApiUrl(match[1].trim());
    if (!url) continue;
    for (const rel of match[2].toLowerCase().split(/\s+/)) {
      if (rel === 'next') links.next = url;
      if (rel === 'last') links.last = url;
    }
  }
  return links;
}

export function allowApiUrl(value: string): string | null {
  try {
    const url = new URL(value);
    if (url.origin !== API_ORIGIN) return null;
    if (!url.pathname.startsWith('/api/v1/')) return null;
    return url.toString();
  } catch {
    return null;
  }
}

function clip(value: string, max: number): string {
  const trimmed = value.trim();
  return trimmed.length > max ? trimmed.slice(0, max) : trimmed;
}

function asRecord(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  return value as Record<string, unknown>;
}

function field(data: Record<string, unknown>, key: string, max: number): string {
  const direct = data[key];
  if (typeof direct === 'string' && direct.trim()) return clip(direct, max);
  for (const [name, value] of Object.entries(data)) {
    if (name.toLowerCase() === key && typeof value === 'string' && value.trim()) return clip(value, max);
  }
  return '';
}

function messageFrom(data: Record<string, unknown>, body: unknown, summary: unknown): string {
  const direct = field(data, 'message', 50000);
  if (direct) return direct;
  if (typeof body === 'string' && body.trim() && !/\b(name|email)\s*:/i.test(body.slice(0, 120))) {
    return clip(body, 50000);
  }
  if (typeof summary === 'string' && summary.trim()) return clip(summary, 50000);
  return '';
}

export function mapSubmission(value: unknown): EnquiryRecord | null {
  const record = asRecord(value);
  if (!isSubmissionId(record.id)) return null;
  const data = asRecord(record.data);
  const createdAt = typeof record.created_at === 'string' ? record.created_at : '';
  return {
    id: record.id,
    createdAt,
    name: field(data, 'name', 2000) || (typeof record.name === 'string' ? clip(record.name, 2000) : ''),
    email: field(data, 'email', 2000) || (typeof record.email === 'string' ? clip(record.email, 2000) : ''),
    company: field(data, 'company', 2000) || (typeof record.company === 'string' ? clip(record.company, 2000) : ''),
    service: field(data, 'service', 2000),
    message: messageFrom(data, record.body, record.summary)
  };
}

export function sortEnquiries(records: EnquiryRecord[]): EnquiryRecord[] {
  return [...records].sort((left, right) => {
    const leftMs = Date.parse(left.createdAt);
    const rightMs = Date.parse(right.createdAt);
    return (Number.isFinite(rightMs) ? rightMs : 0) - (Number.isFinite(leftMs) ? leftMs : 0);
  });
}

interface FormSummary {
  id?: unknown;
  name?: unknown;
  site_id?: unknown;
}

interface PageResult {
  items: unknown[];
  next?: string;
  last?: string;
}

export interface ContactList {
  formFound: boolean;
  submissions: EnquiryRecord[];
  truncated: boolean;
}

export interface FormsClient {
  listContact(): Promise<ContactList>;
  ownsContactSubmission(id: string): Promise<boolean>;
  deleteSubmission(id: string): Promise<void>;
}

function pageNumber(url: string): number | null {
  try {
    const value = Number(new URL(url).searchParams.get('page'));
    return Number.isInteger(value) && value > 0 ? value : null;
  } catch {
    return null;
  }
}

export function createFormsClient(options: {
  fetchImpl: typeof fetch;
  token: string;
  siteId: string;
}): FormsClient {
  const { fetchImpl, token, siteId } = options;

  async function request(url: string, method: string): Promise<{ status: number; body: unknown; link: string | null }> {
    const allowed = allowApiUrl(url);
    if (!allowed) throw new NetlifyApiError(0);
    let response: Response;
    try {
      response = await fetchImpl(allowed, {
        method,
        headers: {
          authorization: `Bearer ${token}`,
          accept: 'application/json',
          'user-agent': USER_AGENT
        },
        signal: AbortSignal.timeout(8000)
      });
    } catch {
      throw new NetlifyApiError(0);
    }
    if (response.status === 404) return { status: 404, body: null, link: null };
    if (!response.ok) throw new NetlifyApiError(response.status);
    if (response.status === 204) return { status: 204, body: null, link: response.headers.get('link') };
    const text = await response.text();
    let body: unknown = null;
    if (text) {
      try {
        body = JSON.parse(text);
      } catch {
        throw new NetlifyApiError(response.status);
      }
    }
    return { status: response.status, body, link: response.headers.get('link') };
  }

  async function getPage(url: string): Promise<PageResult> {
    const result = await request(url, 'GET');
    if (!Array.isArray(result.body)) throw new NetlifyApiError(result.status || 502);
    const links = parseLinkHeader(result.link);
    return { items: result.body, next: links.next, last: links.last };
  }

  async function contactForm(): Promise<{ id: string } | null> {
    const url = `${API_ORIGIN}/api/v1/sites/${encodeURIComponent(siteId)}/forms`;
    const result = await request(url, 'GET');
    if (!Array.isArray(result.body)) throw new NetlifyApiError(result.status || 502);
    for (const item of result.body) {
      const form = item as FormSummary;
      if (form?.name === CONTACT_FORM_NAME && typeof form.id === 'string' && form.id) {
        if (typeof form.site_id === 'string' && form.site_id && form.site_id !== siteId) continue;
        return { id: form.id };
      }
    }
    return null;
  }

  async function listedOnForm(formId: string, id: string): Promise<boolean> {
    let url = `${API_ORIGIN}/api/v1/forms/${encodeURIComponent(formId)}/submissions?per_page=${PER_PAGE}&page=1`;
    const seen = new Set<string>();
    for (let page = 0; page < MAX_PAGES && url; page += 1) {
      if (seen.has(url)) return false;
      seen.add(url);
      const result = await getPage(url);
      if (result.items.some((item) => asRecord(item).id === id)) return true;
      if (!result.next) return false;
      url = result.next;
    }
    return false;
  }

  return {
    async listContact() {
      const form = await contactForm();
      if (!form) return { formFound: false, submissions: [], truncated: false };
      const collected = new Map<string, EnquiryRecord>();
      let truncated = false;
      let url = `${API_ORIGIN}/api/v1/forms/${encodeURIComponent(form.id)}/submissions?per_page=${PER_PAGE}&page=1`;
      const seen = new Set<string>();
      for (let page = 0; page < MAX_PAGES && url; page += 1) {
        if (seen.has(url)) break;
        seen.add(url);
        const result = await getPage(url);
        for (const item of result.items) {
          const mapped = mapSubmission(item);
          if (mapped) collected.set(mapped.id, mapped);
        }
        const lastPage = result.last ? pageNumber(result.last) : null;
        if (page === 0 && result.last && lastPage && lastPage > MAX_PAGES) {
          const tail = await getPage(result.last);
          for (const item of tail.items) {
            const mapped = mapSubmission(item);
            if (mapped) collected.set(mapped.id, mapped);
          }
          truncated = true;
          break;
        }
        if (!result.next) break;
        if (page + 1 >= MAX_PAGES) {
          truncated = true;
          break;
        }
        url = result.next;
      }
      return { formFound: true, submissions: sortEnquiries([...collected.values()]), truncated };
    },

    async ownsContactSubmission(id: string) {
      if (!isSubmissionId(id)) return false;
      const form = await contactForm();
      if (!form) return false;
      const single = await request(`${API_ORIGIN}/api/v1/submissions/${encodeURIComponent(id)}`, 'GET');
      if (single.status === 404 || !single.body) return false;
      const record = asRecord(single.body);
      if (record.id !== id) return false;
      if (typeof record.site_id === 'string' && record.site_id && record.site_id !== siteId) return false;
      if (typeof record.form_name === 'string' && record.form_name && record.form_name !== CONTACT_FORM_NAME) {
        return false;
      }
      if (typeof record.form_id === 'string' && record.form_id) {
        return record.form_id === form.id;
      }
      return listedOnForm(form.id, id);
    },

    async deleteSubmission(id: string) {
      const result = await request(`${API_ORIGIN}/api/v1/submissions/${encodeURIComponent(id)}`, 'DELETE');
      if (result.status === 404) throw new NetlifyApiError(404);
    }
  };
}
