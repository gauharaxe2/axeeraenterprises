/**
 * Publishable catalog records live one-document-per-item so security rules
 * can show visitors only documents with published == true.
 * Existing copy has no flag and stays public. A draft is published: false.
 */

export const CATALOG_COLLECTIONS = {
  caseStudies: 'caseStudies',
  posts: 'posts',
  teamMembers: 'teamMembers',
  testimonials: 'testimonials',
  faqs: 'faqs',
  services: 'services',
  partnerships: 'partnerships',
  partnerLogos: 'partnerLogos'
} as const;

export type CatalogCollection = (typeof CATALOG_COLLECTIONS)[keyof typeof CATALOG_COLLECTIONS];

export const PUBLISHED_COLLECTIONS: readonly CatalogCollection[] = [
  CATALOG_COLLECTIONS.caseStudies,
  CATALOG_COLLECTIONS.posts,
  CATALOG_COLLECTIONS.teamMembers,
  CATALOG_COLLECTIONS.testimonials,
  CATALOG_COLLECTIONS.faqs
];

export const SETTINGS_COLLECTION = 'studio_settings';
export const GENERAL_SETTINGS_ID = 'general';
export const CATALOG_SETTINGS_ID = 'catalog';

export interface CatalogMarker {
  authoritative: Partial<Record<CatalogCollection, boolean>>;
  seededAt?: string;
}

export function isPublished(item: { published?: boolean } | null | undefined): boolean {
  return Boolean(item) && item?.published !== false;
}

export function visibleItems<T>(items: T[]): T[] {
  return items.filter((item) => isPublished(item as { published?: boolean }));
}

export function isSafeDocId(id: string): boolean {
  return /^[a-zA-Z0-9_-]{1,128}$/.test(id);
}

export function slugify(value: string): string {
  const slug = value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
  return slug;
}

export function uniqueDocId(preferred: string, taken: Iterable<string>): string {
  const base = slugify(preferred) || 'item';
  const used = new Set(taken);
  if (!used.has(base)) return base;
  let n = 2;
  while (used.has(`${base}-${n}`)) n += 1;
  return `${base}-${n}`;
}

/** Drop undefined so Firestore accepts the payload. */
export function toFirestoreDoc(value: unknown): unknown {
  if (value === undefined) return undefined;
  if (value === null || typeof value !== 'object') return value;
  if (value instanceof Date) return value.toISOString();
  if (Array.isArray(value)) {
    return value.map((entry) => {
      const next = toFirestoreDoc(entry);
      return next === undefined ? null : next;
    });
  }
  const out: Record<string, unknown> = {};
  for (const [key, entry] of Object.entries(value as Record<string, unknown>)) {
    if (entry === undefined) continue;
    const next = toFirestoreDoc(entry);
    if (next !== undefined) out[key] = next;
  }
  return out;
}

/**
 * Before a collection is marked authoritative, the site keeps the bundled
 * or legacy copy. After that, the Firestore query is the whole list,
 * including an empty list.
 */
export function resolveCatalogList<T extends { id: string }>(options: {
  fallback: T[];
  remote: T[] | null;
  authoritative: boolean;
}): T[] {
  if (options.authoritative && options.remote) return options.remote;
  if (!options.remote || options.remote.length === 0) return options.fallback;
  const merged = new Map(options.fallback.map((item) => [item.id, item]));
  for (const item of options.remote) merged.set(item.id, item);
  return Array.from(merged.values());
}

export function asRecordArray<T>(value: unknown): T[] | null {
  if (!Array.isArray(value)) return null;
  return value.filter((item) => item && typeof item === 'object' && typeof (item as { id?: unknown }).id === 'string') as T[];
}
