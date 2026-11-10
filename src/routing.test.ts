import test from 'node:test';
import assert from 'node:assert/strict';
import { CONTENT_PAGE_PATHS, isAdminLocation, normalizePath, resolveRoute, SERVICE_IDS } from './routing.ts';

test('normalizePath strips trailing slash, html, and index', () => {
  assert.equal(normalizePath('/Policies/'), '/policies');
  assert.equal(normalizePath('/privacy-policy.html'), '/privacy-policy');
  assert.equal(normalizePath('/blog/index.html'), '/blog');
  assert.equal(normalizePath('/'), '/');
});

test('unknown paths are not found and /admin opens the admin gate', () => {
  assert.equal(resolveRoute('/missing-page', '').page, 'not-found');
  assert.equal(resolveRoute('/admin', '').page, 'admin');
  assert.equal(resolveRoute('/admin/', '').page, 'admin');
  assert.equal(resolveRoute('/Admin.html', '').page, 'admin');
  assert.equal(resolveRoute('/', '#admin').page, 'admin');
  assert.equal(resolveRoute('/admin/settings', '').page, 'not-found');
  assert.equal(resolveRoute('/', '#admin/settings').page, 'not-found');
  assert.equal(isAdminLocation('/admin', ''), true);
  assert.equal(isAdminLocation('/', '#admin'), true);
  assert.equal(isAdminLocation('/admin/settings', ''), false);
  assert.equal(isAdminLocation('/', '#contact'), false);
});

test('home, sections, services, blogs, and policies resolve', () => {
  assert.deepEqual(resolveRoute('/', ''), { page: 'home' });
  assert.deepEqual(resolveRoute('/', '#contact'), { page: 'home', section: 'contact' });
  assert.deepEqual(resolveRoute('/policies', '#privacy-policy'), {
    page: 'policies',
    policy: 'privacy-policy'
  });
  assert.deepEqual(resolveRoute('/', '#privacy-policy'), {
    page: 'policies',
    policy: 'privacy-policy'
  });
  assert.deepEqual(resolveRoute('/', '#service-seo-optimization'), {
    page: 'service-detail',
    serviceId: 'seo-optimization'
  });
  assert.deepEqual(resolveRoute('/', '#service-not-a-service'), {
    page: 'home',
    section: 'services'
  });
  assert.deepEqual(resolveRoute('/', '#services-page'), { page: 'services' });
  assert.deepEqual(resolveRoute('/', '#about-page'), { page: 'about' });
  assert.deepEqual(resolveRoute('/', '#websites-page'), { page: 'websites' });
  assert.deepEqual(resolveRoute('/', '#team-page'), { page: 'team' });
  assert.deepEqual(resolveRoute('/', '#testimonials-page'), { page: 'testimonials' });
  assert.deepEqual(resolveRoute('/', '#partnership-page'), { page: 'partnership' });
  assert.deepEqual(resolveRoute('/', '#contact-page'), { page: 'contact' });
  assert.deepEqual(resolveRoute('/', '#faq-page'), { page: 'faq' });
  assert.deepEqual(resolveRoute('/FAQ', ''), { page: 'faq' });
  assert.deepEqual(resolveRoute('/FAQ/', ''), { page: 'faq' });
  assert.deepEqual(resolveRoute('/Faq', ''), { page: 'faq' });
  for (const path of CONTENT_PAGE_PATHS) {
    const page = path.slice(1);
    assert.deepEqual(resolveRoute(path, ''), { page });
    assert.deepEqual(resolveRoute(`${path}/`, ''), { page });
  }
  assert.deepEqual(resolveRoute('/', '#blog-hub'), { page: 'blog-hub' });
  assert.deepEqual(resolveRoute('/', '#blog-what-is-web-development.html'), {
    page: 'blog-detail',
    slug: 'what-is-web-development'
  });
  assert.deepEqual(resolveRoute('/', '#blog-category/how-we-build-from-idea-to-launch'), {
    page: 'blog-detail',
    slug: 'how-we-build-from-idea-to-launch'
  });
});

test('service ids used by redirects exist', () => {
  for (const id of ['web-development', 'brand-design', 'digital-marketing', 'mobile-apps', 'seo-optimization', 'social-media']) {
    assert.ok(SERVICE_IDS.includes(id as (typeof SERVICE_IDS)[number]));
  }
});
