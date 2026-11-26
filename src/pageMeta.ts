export const DEFAULT_TITLE = "Axe's Era Enterprises by Gauhar Nadeem - Digital Solutions";

export const DEFAULT_DESCRIPTION =
  "Axe's Era Enterprises by Gauhar Nadeem - Professional digital solutions company specializing in web design, branding, and technology services.";

export const SITE_ORIGIN = 'https://www.gauharaxe.org';

export interface PublicPageMeta {
  title: string;
  description: string;
  path: string;
}

const PAGES: Record<string, PublicPageMeta> = {
  home: {
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    path: '/'
  },
  about: {
    title: "About | Axe's Era Enterprises",
    description:
      "Founded by Gauhar Nadeem (Gauhar Axe), Axe's Era Enterprises is a digital agency in Multan, Pakistan, with 3+ years of experience helping businesses establish their digital presence.",
    path: '/about'
  },
  services: {
    title: "Enterprise Services & Capabilities | Axe's Era Enterprises",
    description:
      'Web development, brand design, digital marketing, mobile apps, SEO, social media, and digital products from Axe\'s Era Enterprises.',
    path: '/services'
  },
  websites: {
    title: "Websites | Axe's Era Enterprises",
    description:
      'Production websites, e-commerce stores, and SaaS platforms built by Axe\'s Era Enterprises.',
    path: '/websites'
  },
  team: {
    title: "Our Team | Axe's Era Enterprises",
    description:
      'Gauhar Nadeem (Gauhar Axe), CEO and founder of Axe\'s Era Enterprises, and the disciplines behind the studio.',
    path: '/team'
  },
  testimonials: {
    title: "Testimonials | Axe's Era Enterprises",
    description:
      'Client reviews published by Axe\'s Era Enterprises from Sarah Reynolds, Michael Chang, and Elena Torres.',
    path: '/testimonials'
  },
  partnership: {
    title: "Partnership | Axe's Era Enterprises",
    description:
      'Strategic partners, technology alliances, and the published partner network of Axe\'s Era Enterprises.',
    path: '/partnership'
  },
  contact: {
    title: "Contact | Axe's Era Enterprises",
    description:
      'Contact Axe\'s Era Enterprises at D-26, Wahdat Colony, Multan, Punjab, 66000, Pakistan. Phone +92-315-7338694 / +92-339-0096853. Email gauharaxe@outlook.com.',
    path: '/contact'
  },
  location: {
    title: "Location | Axe's Era Enterprises",
    description:
      'Axe\'s Era Enterprises office at D-26, Wahdat Colony, Multan, Punjab, Pakistan, pinned at 30.2050672, 71.4902707 on Google Maps.',
    path: '/location'
  },
  faq: {
    title: "FAQ | Axe's Era Enterprises",
    description:
      'Answers from Axe\'s Era Enterprises about services, project timelines, redesigns, and support after launch.',
    path: '/faq'
  }
};

export function metaForPage(page: string): PublicPageMeta | null {
  return PAGES[page] ?? null;
}

export function metaForProject(title: string, summary: string, typeLabel: string): PublicPageMeta {
  return {
    title: `${title} | ${typeLabel} | Axe's Era Enterprises`,
    description: summary || DEFAULT_DESCRIPTION,
    path: '/websites'
  };
}

export function canonicalUrl(path: string): string {
  if (path === '/' || path === '') return `${SITE_ORIGIN}/`;
  return `${SITE_ORIGIN}${path.startsWith('/') ? path : `/${path}`}`;
}

function upsertMeta(attribute: 'name' | 'property', key: string, content: string) {
  let meta = document.head.querySelector(`meta[${attribute}="${key}"]`);
  if (!meta) {
    meta = document.createElement('meta');
    meta.setAttribute(attribute, key);
    document.head.appendChild(meta);
  }
  meta.setAttribute('content', content);
}

function upsertCanonical(href: string) {
  let link = document.head.querySelector('link[rel="canonical"]');
  if (!link) {
    link = document.createElement('link');
    link.setAttribute('rel', 'canonical');
    document.head.appendChild(link);
  }
  link.setAttribute('href', href);
}

function removeCanonical() {
  document.head.querySelector('link[rel="canonical"]')?.remove();
}

export function applyPublicMeta(meta: PublicPageMeta) {
  document.title = meta.title;
  const url = canonicalUrl(meta.path);
  upsertMeta('name', 'description', meta.description);
  upsertMeta('property', 'og:title', meta.title);
  upsertMeta('property', 'og:description', meta.description);
  upsertMeta('property', 'og:url', url);
  upsertCanonical(url);
  document.head.querySelector('meta[name="robots"]')?.remove();
}

export function applyPrivateMeta(kind: 'admin' | 'not-found') {
  const robots = document.querySelector('meta[name="robots"]') ?? document.createElement('meta');
  robots.setAttribute('name', 'robots');
  if (kind === 'admin') {
    document.title = "Admin | Axe's Era Enterprises";
    robots.setAttribute('content', 'noindex, nofollow');
  } else {
    document.title = "Page not found | Axe's Era Enterprises";
    robots.setAttribute('content', 'noindex');
  }
  if (!robots.parentElement) document.head.appendChild(robots);
  removeCanonical();
}
