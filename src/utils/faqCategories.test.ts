import test from 'node:test';
import assert from 'node:assert/strict';
import {
  BUILTIN_FAQ_CATEGORIES,
  DEFAULT_FAQ_CATEGORY_ID,
  collectFaqCategories,
  filterFaqs,
  getFaqCategoryLabel,
  isBuiltinFaqCategory,
  normalizeFaqCategoryValue,
  resolveFaqCategory
} from './faqCategories.ts';
import type { FaqItem } from '../types';

test('exposes all 10 official FAQ categories with exact labels', () => {
  assert.equal(BUILTIN_FAQ_CATEGORIES.length, 10);
  assert.deepEqual(
    BUILTIN_FAQ_CATEGORIES.map((c) => c.label),
    [
      'Custom Web Development & Full-Stack Engineering',
      'Shopify & E-commerce Development',
      'Mobile Application Development',
      'UI/UX Design & Brand Identity',
      'Search Engine Optimization (SEO) & Technical Audits',
      'Digital Marketing & Paid Advertising',
      'Cloud Infrastructure, DNS & Hosting Architecture',
      'Agency Workflows, Contracts & Intellectual Property',
      'Post-Launch Maintenance, Security & Support',
      'Hiring, Collaboration & Enterprise Partnerships'
    ]
  );
});

test('explicit faq category overrides question keyword heuristics', () => {
  const faq: FaqItem = {
    id: 'f1',
    question: 'What services do you offer?',
    answer: 'Full stack delivery.',
    category: 'shopify-ecommerce'
  };
  assert.equal(resolveFaqCategory(faq), 'shopify-ecommerce');
  assert.equal(getFaqCategoryLabel('shopify-ecommerce'), 'Shopify & E-commerce Development');
});

test('maps legacy category aliases and keyword heuristics to the 10 official categories', () => {
  assert.equal(normalizeFaqCategoryValue('engineering'), 'custom-web-dev');
  assert.equal(normalizeFaqCategoryValue('ownership'), 'contracts-ip');
  assert.equal(normalizeFaqCategoryValue('billing'), 'contracts-ip');
  assert.equal(normalizeFaqCategoryValue('support'), 'maintenance-support');
  assert.equal(
    normalizeFaqCategoryValue('Cloud Infrastructure, DNS & Hosting Architecture'),
    'cloud-infrastructure'
  );

  assert.equal(resolveFaqCategory({ question: 'Can you build a Shopify Plus store?', answer: 'Yes' }), 'shopify-ecommerce');
  assert.equal(resolveFaqCategory({ question: 'Do you build iOS and Android mobile apps?', answer: 'Yes' }), 'mobile-apps');
  assert.equal(resolveFaqCategory({ question: 'Can you redesign our UI/UX in Figma?', answer: 'Yes' }), 'ui-ux-brand');
  assert.equal(resolveFaqCategory({ question: 'Do you run technical SEO audits?', answer: 'Yes' }), 'seo-audits');
  assert.equal(resolveFaqCategory({ question: 'How do you manage Google Ads and Meta Ads?', answer: 'Yes' }), 'digital-marketing');
  assert.equal(resolveFaqCategory({ question: 'How do you handle AWS hosting and DNS?', answer: 'Yes' }), 'cloud-infrastructure');
  assert.equal(resolveFaqCategory({ question: 'Do we own source code and intellectual property?', answer: 'Yes' }), 'contracts-ip');
  assert.equal(resolveFaqCategory({ question: 'Do you provide ongoing post-launch support?', answer: 'Yes' }), 'maintenance-support');
  assert.equal(resolveFaqCategory({ question: 'Do you offer white-label enterprise partnerships?', answer: 'Yes' }), 'partnerships-hiring');
  assert.equal(resolveFaqCategory({ question: "What services does Axe's Era Enterprise offer?", answer: 'Full stack' }), DEFAULT_FAQ_CATEGORY_ID);
  assert.equal(resolveFaqCategory({ question: 'How does deployment work?', answer: 'Automated' }), DEFAULT_FAQ_CATEGORY_ID);
});

test('supports custom categories alongside the 10 built-in categories', () => {
  const faqs: FaqItem[] = [
    { id: '1', question: 'Q1', answer: 'A1', category: 'custom-web-dev' },
    { id: '2', question: 'Q2', answer: 'A2', category: 'Onboarding' }
  ];

  assert.equal(isBuiltinFaqCategory('custom-web-dev'), true);
  assert.equal(isBuiltinFaqCategory('Onboarding'), false);

  const collected = collectFaqCategories(faqs);
  assert.equal(collected.length, BUILTIN_FAQ_CATEGORIES.length + 2); // All + 10 built-in + 1 custom
  assert.deepEqual(collected.find((c) => c.id === 'all'), { id: 'all', label: 'All Questions', count: 2 });
  assert.deepEqual(collected.find((c) => c.id === 'Onboarding'), { id: 'Onboarding', label: 'Onboarding', count: 1 });
});

test('filters faqs by category and search keyword accurately', () => {
  const faqs: FaqItem[] = [
    { id: '1', question: 'Pricing & milestones?', answer: 'Fixed milestone.', category: 'contracts-ip' },
    { id: '2', question: 'Tech stack?', answer: 'React and TypeScript.', category: 'custom-web-dev' },
    { id: '3', question: 'Kickoff call?', answer: 'Within 24h.', category: 'Onboarding' }
  ];

  assert.equal(filterFaqs(faqs, { category: 'contracts-ip' }).length, 1);
  assert.equal(filterFaqs(faqs, { category: 'Onboarding' })[0]?.id, '3');
  assert.equal(filterFaqs(faqs, { category: 'all', search: 'typescript' })[0]?.id, '2');
  assert.equal(filterFaqs(faqs, { category: 'all', search: 'Contracts & Intellectual Property' })[0]?.id, '1');
});
