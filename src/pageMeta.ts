export const DEFAULT_TITLE = "Axe's Era Enterprise by Gauhar Axe - Digital Solutions";

export const DEFAULT_DESCRIPTION =
  "Axe's Era Enterprise by Gauhar Axe - Professional digital solutions company specializing in web design, branding, and technology services.";

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
    title: "About | Axe's Era Enterprise",
    description:
      "Founded by Gauhar Axe, Axe's Era Enterprise is a digital agency in Multan, Pakistan, with 3+ years of experience helping businesses establish their digital presence.",
    path: '/about'
  },
  services: {
    title: "Enterprise Services & Capabilities | Axe's Era Enterprise",
    description:
      'Web development, brand design, digital marketing, mobile apps, SEO, social media, and digital products from Axe\'s Era Enterprise.',
    path: '/services'
  },
  websites: {
    title: "Websites | Axe's Era Enterprise",
    description:
      'Production websites, e-commerce stores, and SaaS platforms built by Axe\'s Era Enterprise.',
    path: '/websites'
  },
  team: {
    title: "Our Team | Axe's Era Enterprise",
    description:
      'Gauhar Nadeem (Gauhar Axe), CEO and founder of Axe\'s Era Enterprise, and the disciplines behind the studio.',
    path: '/team'
  },
  testimonials: {
    title: "Testimonials | Axe's Era Enterprise",
    description:
      'Client reviews published by Axe\'s Era Enterprise from Sarah Reynolds, Michael Chang, and Elena Torres.',
    path: '/testimonials'
  },
  partnership: {
    title: "Partnership | Axe's Era Enterprise",
    description:
      'Strategic partners, technology alliances, and the published partner network of Axe\'s Era Enterprise.',
    path: '/partnership'
  },
  contact: {
    title: "Contact | Axe's Era Enterprise",
    description:
      'Contact Axe\'s Era Enterprise at D-26, Wahdat Colony, Multan, 66000. Phone +92-315-7338694 / +92-339-0096853. Email gauharaxe@outlook.com.',
    path: '/contact'
  },
  faq: {
    title: "FAQ | Axe's Era Enterprise",
    description:
      'Answers from Axe\'s Era Enterprise about services, project timelines, redesigns, and support after launch.',
    path: '/faq'
  }
};

export function metaForPage(page: string): PublicPageMeta | null {
  return PAGES[page] ?? null;
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
    document.title = "Admin | Axe's Era Enterprise";
    robots.setAttribute('content', 'noindex, nofollow');
  } else {
    document.title = "Page not found | Axe's Era Enterprise";
    robots.setAttribute('content', 'noindex');
  }
  if (!robots.parentElement) document.head.appendChild(robots);
  removeCanonical();
}
