import test from 'node:test';
import assert from 'node:assert/strict';
import { CONTENT_PAGE_PATHS } from './routing.ts';
import { canonicalUrl, metaForPage } from './pageMeta.ts';

test('the seven redesigned pages keep titles and canonical paths', () => {
  const expected: Record<string, string> = {
    '/about': "About | Axe's Era Enterprise",
    '/services': "Enterprise Services & Capabilities | Axe's Era Enterprise",
    '/websites': "Websites | Axe's Era Enterprise",
    '/team': "Our Team | Axe's Era Enterprise",
    '/testimonials': "Testimonials | Axe's Era Enterprise",
    '/partnership': "Partnership | Axe's Era Enterprise",
    '/contact': "Contact | Axe's Era Enterprise",
    '/location': "Location | Axe's Era Enterprise",
    '/faq': "FAQ | Axe's Era Enterprise"
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
