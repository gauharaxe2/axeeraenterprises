import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { SERVICE_IDS } from './routing.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

function read(relativePath: string): string {
  return readFileSync(join(root, relativePath), 'utf8');
}

function redirectRules(toml: string): Array<{ from: string; to: string; status: number }> {
  return toml
    .split('[[redirects]]')
    .slice(1)
    .map((block) => ({
      from: block.match(/from = "([^"]+)"/)?.[1] ?? '',
      to: block.match(/to = "([^"]+)"/)?.[1] ?? '',
      status: Number(block.match(/status = (\d+)/)?.[1] ?? 0)
    }));
}

const legacy: Array<[string, string]> = [
  ['/web-development', '/#service-web-development'],
  ['/web-design', '/#service-web-development'],
  ['/brand-design', '/#service-brand-design'],
  ['/digital-marketing', '/#service-digital-marketing'],
  ['/mobile-apps', '/#service-mobile-apps'],
  ['/seo-services', '/#service-seo-optimization'],
  ['/social-media-marketing', '/#service-social-media'],
  ['/blogs', '/#blog-hub'],
  ['/blog', '/#blog-hub'],
  ['/privacy-policy', '/policies#privacy-policy'],
  ['/privacy', '/policies#privacy-policy'],
  ['/terms', '/policies#terms-of-service']
];

test('legacy urls 301 to the closest app section, including html variants', () => {
  const rules = redirectRules(read('netlify.toml'));
  for (const [from, to] of legacy) {
    for (const variant of [from, `${from}/`, `${from}.html`]) {
      const match = rules.find((rule) => rule.from === variant);
      assert.ok(match, `missing redirect for ${variant}`);
      assert.equal(match?.to, to, variant);
      assert.equal(match?.status, 301, variant);
    }
  }
  const blogSplat = rules.find((rule) => rule.from === '/blog/*');
  assert.deepEqual(blogSplat, { from: '/blog/*', to: '/#blog-:splat', status: 301 });
});

test('known app paths rewrite with 200 and everything else is a 404', () => {
  const rules = redirectRules(read('netlify.toml'));
  assert.equal(rules.at(-1)?.from, '/*');
  assert.equal(rules.at(-1)?.to, '/index.html');
  assert.equal(rules.at(-1)?.status, 404);
  assert.equal(rules.some((rule) => rule.from === '/*' && rule.status === 200), false);
  for (const path of ['/policies', '/policies/', '/admin', '/admin/']) {
    const match = rules.find((rule) => rule.from === path);
    assert.equal(match?.to, '/index.html', path);
    assert.equal(match?.status, 200, path);
    assert.ok(match && rules.indexOf(match) < rules.length - 1, path);
  }
  for (const path of ['/api/admin/login', '/api/admin/logout', '/api/admin/session', '/api/admin/submissions']) {
    const match = rules.find((rule) => rule.from === path);
    assert.equal(match?.status, 200, path);
    assert.match(match?.to ?? '', /^\/\.netlify\/functions\/admin-/);
    assert.ok(match && rules.indexOf(match) < rules.length - 1, path);
  }
  assert.match(read('netlify.toml'), /for = "\/admin"/);
  assert.match(read('netlify.toml'), /X-Robots-Tag = "noindex, nofollow"/);
  assert.equal(read('vite.config.ts').includes('dev-admin-stub'), false);
});

test('static files match the real public urls and the form definition', () => {
  const robots = read('public/robots.txt');
  const sitemap = read('public/sitemap.xml');
  const index = read('index.html');
  const success = read('public/form-received.html');
  const services = read('src/data/services.ts');

  assert.match(robots, /Sitemap: https:\/\/gauharaxe\.org\/sitemap\.xml/);
  assert.match(robots, /Disallow: \/admin/);
  assert.match(sitemap, /<loc>https:\/\/gauharaxe\.org\/<\/loc>/);
  assert.match(sitemap, /<loc>https:\/\/gauharaxe\.org\/policies<\/loc>/);
  assert.equal(sitemap.includes('/web-development'), false);
  assert.equal(sitemap.includes('/admin'), false);
  assert.equal(sitemap.includes('/blogs'), false);

  assert.match(index, /data-netlify="true"/);
  assert.match(index, /netlify-honeypot="bot-field"/);
  assert.match(index, /name="form-name"/);
  assert.match(index, /name="bot-field"/);
  for (const field of ['name', 'email', 'company', 'service', 'message']) {
    assert.match(index, new RegExp(`name="${field}"`));
  }
  assert.match(success, /data-netlify-form="accepted"/);
  assert.equal(success.includes('id="root"'), false);

  const serviceIds = [...services.matchAll(/id: '([^']+)'/g)].map((match) => match[1]);
  assert.deepEqual([...SERVICE_IDS], serviceIds);
});

test('the public source does not contain the old admin PIN', () => {
  const files: string[] = [];
  const walk = (dir: string) => {
    for (const entry of readdirSync(dir)) {
      const full = join(dir, entry);
      if (statSync(full).isDirectory()) walk(full);
      else if (/\.(ts|tsx|html|js|jsx)$/.test(entry) && !entry.endsWith('.test.ts')) files.push(full);
    }
  };
  walk(join(root, 'src'));
  walk(join(root, 'netlify'));
  files.push(join(root, 'index.html'), join(root, 'netlify.toml'), join(root, 'vite.config.ts'));
  for (const file of files) {
    const text = readFileSync(file, 'utf8');
    assert.equal(text.includes('428427'), false, file);
    if (file.startsWith(join(root, 'src')) || file.endsWith('index.html')) {
      assert.equal(text.includes('ADMIN_PASSWORD'), false, file);
      assert.equal(text.includes('ADMIN_SESSION_SECRET'), false, file);
      assert.equal(text.includes('NETLIFY_API_TOKEN'), false, file);
    }
  }
});
