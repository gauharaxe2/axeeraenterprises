import test from 'node:test';
import assert from 'node:assert/strict';
import { CONTENT_PAGE_PATHS } from './routing.ts';
import { canonicalUrl, metaForPage } from './pageMeta.ts';

test('the seven redesigned pages keep titles and canonical paths', () => {
  const expected: Record<string, string> = {
    '/about': "About | Axe's Era Enterprises",
    '/services': "Enterprise Services & Capabilities | Axe's Era Enterprises",
    '/websites': "Websites | Axe's Era Enterprises",
    '/team': "Our Team | Axe's Era Enterprises",
    '/testimonials': "Testimonials | Axe's Era Enterprises",
    '/partnership': "Partnership | Axe's Era Enterprises",
    '/contact': "Contact | Axe's Era Enterprises",
    '/location': "Location | Axe's Era Enterprises",
    '/faq': "FAQ | Axe's Era Enterprises"
  };

  for (const path of CONTENT_PAGE_PATHS) {
    const page = path.slice(1);
    const meta = metaForPage(page as 'about');
    assert.ok(meta, path);
    assert.equal(meta?.path, path);
    assert.equal(meta?.title, expected[path]);
    assert.ok(meta && meta.description.length > 40, path);
    assert.equal(canonicalUrl(path), `https://www.gauharaxe.org${path}`);
  }
});
