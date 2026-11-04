export type PolicyId = 'legal-notice' | 'privacy-policy' | 'terms-of-service';

export const HOME_SECTIONS = [
  'home',
  'about',
  'services',
  'websites',
  'blogs',
  'team',
  'testimonials',
  'partnership',
  'contact',
  'faq'
] as const;

export type HomeSection = (typeof HOME_SECTIONS)[number];

/** Ids from src/data/services.ts. Redirect targets and hash routes use these. */
export const SERVICE_IDS = [
  'web-development',
  'brand-design',
  'digital-marketing',
  'mobile-apps',
  'seo-optimization',
  'social-media',
  'digital-products'
] as const;

export type ServiceId = (typeof SERVICE_IDS)[number];

const POLICIES: Record<string, PolicyId> = {
  'legal-notice': 'legal-notice',
  'privacy-policy': 'privacy-policy',
  'terms-of-service': 'terms-of-service'
};

export type AppRoute =
  | { page: 'home'; section?: HomeSection }
  | { page: 'policies'; policy: PolicyId }
  | { page: 'service-detail'; serviceId: ServiceId }
  | { page: 'blog-hub' }
  | { page: 'blog-detail'; slug: string }
  | { page: 'admin' }
  | { page: 'not-found' };

export function normalizePath(pathname: string): string {
  let path = pathname || '/';
  try {
    path = decodeURIComponent(path);
  } catch {
    // Keep the raw path when it is not valid percent-encoding.
  }
  path = path.toLowerCase();
  if (path.length > 1 && path.endsWith('/')) {
    path = path.slice(0, -1);
  }
  if (path.endsWith('.html')) {
    path = path.slice(0, -'.html'.length);
  }
  if (path.endsWith('/index')) {
    path = path.slice(0, -'/index'.length);
  }
  if (path === '') return '/';
  return path.startsWith('/') ? path : `/${path}`;
}

export function parseHash(hash: string): string {
  const raw = hash.startsWith('#') ? hash.slice(1) : hash;
  let decoded = raw;
  try {
    decoded = decodeURIComponent(raw);
  } catch {
    decoded = raw;
  }
  return decoded.replace(/^\/+|\/+$/g, '');
}

/** True for the admin entry points, /admin and #admin. Nested admin URLs stay not found. */
export function isAdminLocation(pathname: string, hash: string): boolean {
  const path = normalizePath(pathname);
  const fragment = parseHash(hash).toLowerCase();
  return path === '/admin' || (path === '/' && fragment === 'admin');
}

function isRetiredAdminAlias(pathname: string, hash: string): boolean {
  const path = normalizePath(pathname);
  const fragment = parseHash(hash).toLowerCase();
  return path.startsWith('/admin/') || fragment.startsWith('admin/');
}

function isHomeSection(value: string): value is HomeSection {
  return (HOME_SECTIONS as readonly string[]).includes(value);
}

function isServiceId(value: string): value is ServiceId {
  return (SERVICE_IDS as readonly string[]).includes(value);
}

/**
 * Resolve the public URL to a view.
 * `/`, `/policies`, and `/admin` are real app paths. Legacy URLs are 301'd by
 * the host redirects before this runs. Anything else is not found.
 */
export function resolveRoute(pathname: string, hash: string): AppRoute {
  if (isAdminLocation(pathname, hash)) {
    return { page: 'admin' };
  }
  if (isRetiredAdminAlias(pathname, hash)) {
    return { page: 'not-found' };
  }

  const path = normalizePath(pathname);
  const fragment = parseHash(hash).toLowerCase();

  if (path !== '/' && path !== '/policies') {
    return { page: 'not-found' };
  }

  if (path === '/policies' || fragment === 'policies') {
    return { page: 'policies', policy: POLICIES[fragment] ?? 'legal-notice' };
  }

  if (POLICIES[fragment]) {
    return { page: 'policies', policy: POLICIES[fragment] };
  }

  if (fragment.startsWith('service-')) {
    const serviceId = fragment.slice('service-'.length);
    if (isServiceId(serviceId)) {
      return { page: 'service-detail', serviceId };
    }
    return { page: 'home', section: 'services' };
  }

  if (fragment === 'blog-hub') {
    return { page: 'blog-hub' };
  }

  if (fragment.startsWith('blog-')) {
    const rest = fragment.slice('blog-'.length).replace(/\.html$/, '');
    const slug = rest.split('/').filter(Boolean).pop() ?? '';
    if (!slug || slug === 'hub') return { page: 'blog-hub' };
    return { page: 'blog-detail', slug };
  }

  if (isHomeSection(fragment)) {
    return { page: 'home', section: fragment };
  }

  return { page: 'home' };
}
