import type { FaqCategoryId, FaqItem } from '../types';

export interface FaqCategoryOption {
  id: FaqCategoryId | string;
  label: string;
}

export const DEFAULT_FAQ_CATEGORY_ID: FaqCategoryId = 'custom-web-dev';

export const BUILTIN_FAQ_CATEGORIES: readonly { id: FaqCategoryId; label: string }[] = [
  { id: 'custom-web-dev', label: 'Custom Web Development & Full-Stack Engineering' },
  { id: 'shopify-ecommerce', label: 'Shopify & E-commerce Development' },
  { id: 'mobile-apps', label: 'Mobile Application Development' },
  { id: 'ui-ux-brand', label: 'UI/UX Design & Brand Identity' },
  { id: 'seo-audits', label: 'Search Engine Optimization (SEO) & Technical Audits' },
  { id: 'digital-marketing', label: 'Digital Marketing & Paid Advertising' },
  { id: 'cloud-infrastructure', label: 'Cloud Infrastructure, DNS & Hosting Architecture' },
  { id: 'contracts-ip', label: 'Agency Workflows, Contracts & Intellectual Property' },
  { id: 'maintenance-support', label: 'Post-Launch Maintenance, Security & Support' },
  { id: 'partnerships-hiring', label: 'Hiring, Collaboration & Enterprise Partnerships' }
] as const;

const BUILTIN_LABELS: Record<string, string> = Object.fromEntries(
  BUILTIN_FAQ_CATEGORIES.map((item) => [item.id, item.label])
);

const LABEL_TO_ID: Record<string, FaqCategoryId> = Object.fromEntries(
  BUILTIN_FAQ_CATEGORIES.map((item) => [item.label.toLowerCase(), item.id])
) as Record<string, FaqCategoryId>;

const LEGACY_CATEGORY_ALIASES: Record<string, FaqCategoryId> = {
  engineering: 'custom-web-dev',
  'architecture & tech': 'custom-web-dev',
  ownership: 'contracts-ip',
  'ip & code ownership': 'contracts-ip',
  billing: 'contracts-ip',
  'billing & milestones': 'contracts-ip',
  support: 'maintenance-support',
  'warranties & support': 'maintenance-support'
};

export function normalizeFaqCategoryValue(raw: string | undefined | null): string {
  const trimmed = (raw || '').trim();
  if (!trimmed) return '';
  const lower = trimmed.toLowerCase();
  if (lower in BUILTIN_LABELS) return lower;
  if (lower in LABEL_TO_ID) return LABEL_TO_ID[lower];
  if (lower in LEGACY_CATEGORY_ALIASES) return LEGACY_CATEGORY_ALIASES[lower];
  return trimmed;
}

export function resolveFaqCategory(faq: Pick<FaqItem, 'question' | 'category'>): string {
  const explicit = normalizeFaqCategoryValue(faq.category);
  if (explicit) return explicit;

  const question = (faq.question || '').toLowerCase();
  if (
    question.includes('shopify') ||
    question.includes('e-commerce') ||
    question.includes('ecommerce') ||
    question.includes('storefront') ||
    question.includes('checkout')
  ) {
    return 'shopify-ecommerce';
  }
  if (
    question.includes('mobile') ||
    question.includes('ios') ||
    question.includes('android') ||
    question.includes('react native') ||
    question.includes('flutter') ||
    question.includes('app store')
  ) {
    return 'mobile-apps';
  }
  if (
    question.includes('ui/ux') ||
    question.includes('figma') ||
    question.includes('brand') ||
    question.includes('redesign') ||
    question.includes('design system')
  ) {
    return 'ui-ux-brand';
  }
  if (
    /\bseo\b/.test(question) ||
    question.includes('search engine') ||
    question.includes('technical audit') ||
    question.includes('core web vitals') ||
    question.includes('ranking')
  ) {
    return 'seo-audits';
  }
  if (
    question.includes('marketing') ||
    question.includes('paid advertising') ||
    question.includes('meta ads') ||
    question.includes('google ads') ||
    question.includes('ppc') ||
    question.includes('roas')
  ) {
    return 'digital-marketing';
  }
  if (
    question.includes('cloud') ||
    /\bdns\b/.test(question) ||
    question.includes('hosting') ||
    question.includes('aws') ||
    question.includes('vercel') ||
    question.includes('firebase') ||
    question.includes('server')
  ) {
    return 'cloud-infrastructure';
  }
  if (
    question.includes('own') ||
    question.includes('source code') ||
    question.includes('intellectual property') ||
    question.includes('contract') ||
    question.includes('workflow') ||
    question.includes('payment') ||
    question.includes('billing') ||
    question.includes('cost') ||
    question.includes('price') ||
    /\bip\b/.test(question) ||
    /\bnda\b/.test(question)
  ) {
    return 'contracts-ip';
  }
  if (
    question.includes('maintenance') ||
    question.includes('support') ||
    question.includes('warranty') ||
    question.includes('security') ||
    question.includes('post-launch')
  ) {
    return 'maintenance-support';
  }
  if (
    question.includes('hiring') ||
    question.includes('partner') ||
    question.includes('collaborat') ||
    question.includes('white-label') ||
    question.includes('enterprise partnership') ||
    question.includes('dedicated team') ||
    question.includes('retainer')
  ) {
    return 'partnerships-hiring';
  }
  return DEFAULT_FAQ_CATEGORY_ID;
}

export function isBuiltinFaqCategory(category: string | undefined | null): category is FaqCategoryId {
  const normalized = normalizeFaqCategoryValue(category);
  return normalized in BUILTIN_LABELS;
}

export function getFaqCategoryLabel(category: string | undefined | null): string {
  const normalized = normalizeFaqCategoryValue(category);
  if (!normalized) return BUILTIN_LABELS[DEFAULT_FAQ_CATEGORY_ID];
  return BUILTIN_LABELS[normalized] || normalized;
}

export function collectFaqCategories(faqs: FaqItem[]): Array<{ id: string; label: string; count: number }> {
  const counts = new Map<string, number>();
  for (const builtin of BUILTIN_FAQ_CATEGORIES) {
    counts.set(builtin.id, 0);
  }

  const customOrder: string[] = [];
  for (const faq of faqs) {
    const resolved = resolveFaqCategory(faq);
    if (!counts.has(resolved)) {
      customOrder.push(resolved);
    }
    counts.set(resolved, (counts.get(resolved) || 0) + 1);
  }

  const result: Array<{ id: string; label: string; count: number }> = [
    { id: 'all', label: 'All Questions', count: faqs.length }
  ];

  for (const builtin of BUILTIN_FAQ_CATEGORIES) {
    result.push({
      id: builtin.id,
      label: builtin.label,
      count: counts.get(builtin.id) || 0
    });
  }

  for (const custom of customOrder) {
    result.push({
      id: custom,
      label: getFaqCategoryLabel(custom),
      count: counts.get(custom) || 0
    });
  }

  return result;
}

export function filterFaqs(
  faqs: FaqItem[],
  options: { category?: string; search?: string } = {}
): Array<FaqItem & { index: number; resolvedCategory: string }> {
  const activeCategory = options.category && options.category !== 'all'
    ? normalizeFaqCategoryValue(options.category) || options.category
    : 'all';
  const query = (options.search || '').trim().toLowerCase();

  return faqs
    .map((faq, index) => ({
      ...faq,
      index,
      resolvedCategory: resolveFaqCategory(faq)
    }))
    .filter((item) => {
      const matchesCategory = activeCategory === 'all' || item.resolvedCategory.toLowerCase() === activeCategory.toLowerCase();
      const matchesSearch =
        !query ||
        item.question.toLowerCase().includes(query) ||
        item.answer.toLowerCase().includes(query) ||
        getFaqCategoryLabel(item.resolvedCategory).toLowerCase().includes(query);
      return matchesCategory && matchesSearch;
    });
}
