import type { FaqCategoryId, FaqItem } from '../types';

export interface FaqCategoryOption {
  id: FaqCategoryId | string;
  label: string;
}

export const BUILTIN_FAQ_CATEGORIES: readonly { id: FaqCategoryId; label: string }[] = [
  { id: 'engineering', label: 'Architecture & Tech' },
  { id: 'ownership', label: 'IP & Code Ownership' },
  { id: 'billing', label: 'Billing & Milestones' },
  { id: 'support', label: 'Warranties & Support' }
] as const;

const BUILTIN_LABELS: Record<string, string> = Object.fromEntries(
  BUILTIN_FAQ_CATEGORIES.map((item) => [item.id, item.label])
);

const LABEL_TO_ID: Record<string, FaqCategoryId> = Object.fromEntries(
  BUILTIN_FAQ_CATEGORIES.map((item) => [item.label.toLowerCase(), item.id])
) as Record<string, FaqCategoryId>;

export function normalizeFaqCategoryValue(raw: string | undefined | null): string {
  const trimmed = (raw || '').trim();
  if (!trimmed) return '';
  const lower = trimmed.toLowerCase();
  if (lower in BUILTIN_LABELS) return lower;
  if (lower in LABEL_TO_ID) return LABEL_TO_ID[lower];
  return trimmed;
}

export function resolveFaqCategory(faq: Pick<FaqItem, 'question' | 'category'>): string {
  const explicit = normalizeFaqCategoryValue(faq.category);
  if (explicit) return explicit;

  const question = (faq.question || '').toLowerCase();
  if (
    question.includes('own') ||
    question.includes('source code') ||
    question.includes('intellectual property') ||
    /\bip\b/.test(question)
  ) {
    return 'ownership';
  }
  if (
    question.includes('payment') ||
    question.includes('billing') ||
    question.includes('cost') ||
    question.includes('price')
  ) {
    return 'billing';
  }
  if (
    question.includes('maintenance') ||
    question.includes('support') ||
    question.includes('warranty') ||
    question.includes('post-launch')
  ) {
    return 'support';
  }
  return 'engineering';
}

export function isBuiltinFaqCategory(category: string | undefined | null): category is FaqCategoryId {
  const normalized = normalizeFaqCategoryValue(category);
  return normalized in BUILTIN_LABELS;
}

export function getFaqCategoryLabel(category: string | undefined | null): string {
  const normalized = normalizeFaqCategoryValue(category);
  if (!normalized) return BUILTIN_LABELS.engineering;
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
