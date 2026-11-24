import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  isPublished,
  isSafeDocId,
  resolveCatalogList,
  slugify,
  toFirestoreDoc,
  uniqueDocId,
  visibleItems
} from './catalog.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '../..');

test('missing published flags stay public and explicit drafts stay hidden', () => {
  assert.equal(isPublished({ published: undefined }), true);
  assert.equal(isPublished({ published: true }), true);
  assert.equal(isPublished({ published: false }), false);
  assert.deepEqual(
    visibleItems([{ id: 'a' }, { id: 'b', published: false }, { id: 'c', published: true }]).map((item) => item.id),
    ['a', 'c']
  );
});

test('an authoritative empty collection replaces the fallback', () => {
  const fallback = [{ id: 'kept' }];
  assert.deepEqual(resolveCatalogList({ fallback, remote: [], authoritative: true }), []);
  assert.deepEqual(resolveCatalogList({ fallback, remote: null, authoritative: false }), fallback);
  assert.deepEqual(
    resolveCatalogList({
      fallback,
      remote: [{ id: 'kept', title: 'edited' }],
      authoritative: false
    }),
    [{ id: 'kept', title: 'edited' }]
  );
});

test('document ids match the security rule alphabet', () => {
  assert.equal(isSafeDocId('estate-crm'), true);
  assert.equal(isSafeDocId('what-is-web-development'), true);
  assert.equal(isSafeDocId('../secret'), false);
  assert.equal(slugify('Shopaxe Web Store (Shopify)'), 'shopaxe-web-store-shopify');
  assert.equal(uniqueDocId('saas-dashboard', ['saas-dashboard']), 'saas-dashboard-2');
});

test('firestore payloads omit undefined and keep real catalog ids', () => {
  assert.deepEqual(toFirestoreDoc({ id: 'a', link: undefined, tags: ['React'] }), {
    id: 'a',
    tags: ['React']
  });

  const files = ['src/data/projects.ts', 'src/data/blogs.ts', 'src/data/team.ts', 'src/data/testimonials.ts', 'src/data/faqs.ts'];
  const ids = files.flatMap((file) => [...readFileSync(join(root, file), 'utf8').matchAll(/id: '([^']+)'/g)].map((match) => match[1]));
  assert.ok(ids.length > 20);
  for (const id of ids) assert.equal(isSafeDocId(id), true, id);
});

test('security rules and the admin allowlist name the same Google accounts', () => {
  const auth = readFileSync(join(root, 'src/utils/adminAuth.ts'), 'utf8');
  const rules = readFileSync(join(root, 'firestore.rules'), 'utf8');
  const emails = [...auth.matchAll(/'([^']+@[^']+)'/g)].map((match) => match[1]);
  assert.deepEqual(emails, ['gauharaxe@outlook.com', 'gauhar426622@gmail.com']);
  for (const email of emails) assert.match(rules, new RegExp(email.replace('.', '\\.')));
  assert.match(rules, /resource\.data\.published == true/);
  assert.match(rules, /match \/caseStudies\/\{docId\}/);
  assert.match(rules, /match \/posts\/\{docId\}/);
  assert.match(rules, /match \/teamMembers\/\{docId\}/);
  assert.match(rules, /match \/testimonials\/\{docId\}/);
  assert.match(rules, /match \/faqs\/\{docId\}/);
  assert.equal(rules.includes('allow list: if true'), false);
});
