import test from 'node:test';
import assert from 'node:assert/strict';
import {
  BUILTIN_FAQ_CATEGORIES,
  collectFaqCategories,
  filterFaqs,
  getFaqCategoryLabel,
  isBuiltinFaqCategory,
  normalizeFaqCategoryValue,
  resolveFaqCategory
} from './faqCategories.ts';
import type { FaqItem } from '../types';

test('explicit faq category overrides question keyword heuristics', () => {
  const faq: FaqItem = {
    id: 'f1',
    question: 'What services do you offer?',
    answer: 'Full stack delivery.',
    category: 'billing'
  };
  assert.equal(resolveFaqCategory(faq), 'billing');
  assert.equal(getFaqCategoryLabel('billing'), 'Billing & Milestones');
});

test('falls back to legacy keyword classification when category is unset', () => {
  assert.equal(resolveFaqCategory({ question: 'Do we own source code?', answer: 'Yes' }), 'ownership');
  assert.equal(resolveFaqCategory({ question: 'What are payment terms?', answer: 'Milestones' }), 'billing');
  assert.equal(resolveFaqCategory({ question: 'Do you provide ongoing support?', answer: 'Yes' }), 'support');
  assert.equal(resolveFaqCategory({ question: 'How does deployment work?', answer: 'Automated' }), 'engineering');
});

test('supports custom categories alongside built-in categories', () => {
  const faqs: FaqItem[] = [
    { id: '1', question: 'Q1', answer: 'A1', category: 'engineering' },
    { id: '2', question: 'Q2', answer: 'A2', category: 'Onboarding' }
  ];

  assert.equal(isBuiltinFaqCategory('engineering'), true);
  assert.equal(isBuiltinFaqCategory('Onboarding'), false);
  assert.equal(normalizeFaqCategoryValue('IP & Code Ownership'), 'ownership');

  const collected = collectFaqCategories(faqs);
  assert.equal(collected.length, BUILTIN_FAQ_CATEGORIES.length + 2); // All + 4 built-in + 1 custom
  assert.deepEqual(collected.find((c) => c.id === 'all'), { id: 'all', label: 'All Questions', count: 2 });
  assert.deepEqual(collected.find((c) => c.id === 'Onboarding'), { id: 'Onboarding', label: 'Onboarding', count: 1 });
});

test('filters faqs by category and search keyword accurately', () => {
  const faqs: FaqItem[] = [
    { id: '1', question: 'Pricing tiers?', answer: 'Fixed milestone.', category: 'billing' },
    { id: '2', question: 'Tech stack?', answer: 'React and TypeScript.', category: 'engineering' },
    { id: '3', question: 'Kickoff call?', answer: 'Within 24h.', category: 'Onboarding' }
  ];

  assert.equal(filterFaqs(faqs, { category: 'billing' }).length, 1);
  assert.equal(filterFaqs(faqs, { category: 'Onboarding' })[0]?.id, '3');
  assert.equal(filterFaqs(faqs, { category: 'all', search: 'typescript' })[0]?.id, '2');
  assert.equal(filterFaqs(faqs, { category: 'all', search: 'Billing & Milestones' })[0]?.id, '1');
});
