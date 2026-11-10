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

type VercelConfig = {
  rewrites?: Array<{ source: string; destination: string }>;
  redirects?: Array<{ source: string; destination: string; permanent?: boolean }>;
  headers?: Array<{ source: string; headers: Array<{ key: string; value: string }> }>;
};

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

test('legacy urls permanently redirect to the closest app section', () => {
  const vercel = JSON.parse(read('vercel.json')) as VercelConfig;
  for (const [from, to] of legacy) {
    for (const variant of [from, `${from}/`, `${from}.html`]) {
      const match = vercel.redirects?.find((rule) => rule.source === variant);
      assert.ok(match, `missing redirect for ${variant}`);
      assert.equal(match?.destination, to, variant);
      assert.equal(match?.permanent, true, variant);
    }
  }
  const blogSplat = vercel.redirects?.find((rule) => rule.source === '/blog/:slug*');
  assert.equal(blogSplat?.destination, '/#blog-:slug*');
  assert.equal(blogSplat?.permanent, true);
});

test('uppercase FAQ urls permanently redirect to the canonical faq page', () => {
  const vercel = JSON.parse(read('vercel.json')) as VercelConfig;
  for (const source of ['/FAQ', '/FAQ/', '/Faq', '/Faq/']) {
    const match = vercel.redirects?.find((rule) => rule.source === source);
    assert.ok(match, `missing redirect for ${source}`);
    assert.equal(match?.destination, '/faq');
    assert.equal(match?.permanent, true);
  }
});

test('known app paths rewrite to the SPA shell without a catch-all soft 404', () => {
  const vercel = JSON.parse(read('vercel.json')) as VercelConfig;
  for (const path of [
    '/policies',
    '/policies/',
    '/admin',
    '/admin/',
    '/about',
    '/about/',
    '/services',
    '/services/',
    '/websites',
    '/websites/',
    '/team',
    '/team/',
    '/testimonials',
    '/testimonials/',
    '/partnership',
    '/partnership/',
    '/contact',
    '/contact/',
    '/faq',
    '/faq/'
  ]) {
    const match = vercel.rewrites?.find((rule) => rule.source === path);
    assert.equal(match?.destination, '/index.html', path);
  }
  assert.equal(
    vercel.rewrites?.some((rule) => rule.source === '/(.*)' && rule.destination === '/index.html'),
    false
  );
  const adminHeader = vercel.headers?.find((entry) => entry.source === '/admin');
  assert.ok(adminHeader?.headers.some((header) => header.key === 'X-Robots-Tag' && /noindex/.test(header.value)));
});

test('static files match the real public urls and the contact form no longer uses Netlify', () => {
  const robots = read('public/robots.txt');
  const sitemap = read('public/sitemap.xml');
  const index = read('index.html');
  const ads = read('public/ads.txt');
  const success = read('public/form-received.html');
  const services = read('src/data/services.ts');

  assert.match(robots, /Sitemap: https:\/\/gauharaxe\.org\/sitemap\.xml/);
  assert.match(robots, /Disallow: \/admin/);
  assert.match(sitemap, /<loc>https:\/\/gauharaxe\.org\/<\/loc>/);
  assert.match(sitemap, /<loc>https:\/\/gauharaxe\.org\/policies<\/loc>/);
  assert.equal(sitemap.includes('/web-development'), false);
  assert.equal(sitemap.includes('/admin'), false);
  assert.equal(sitemap.includes('/blogs'), false);

  assert.match(index, /name="google-adsense-account"/);
  assert.match(index, /ca-pub-1944222552097544/);
  assert.match(index, /pagead2\.googlesyndication\.com\/pagead\/js\/adsbygoogle\.js\?client=ca-pub-1944222552097544/);
  assert.match(ads, /google\.com, pub-1944222552097544, DIRECT, f08c47fec0942fa0/);

  assert.equal(index.includes('data-netlify'), false);
  assert.equal(index.includes('netlify-honeypot'), false);
  assert.match(index, /id="root"/);
  assert.match(success, /data-form="accepted"/);
  assert.equal(success.includes('data-netlify'), false);
  assert.equal(success.includes('id="root"'), false);

  const serviceIds = [...services.matchAll(/id: '([^']+)'/g)].map((match) => match[1]);
  assert.deepEqual([...SERVICE_IDS], serviceIds);
});

test('the repository no longer ships Netlify platform files or tokens', () => {
  assert.equal(statSync(join(root, 'netlify.toml'), { throwIfNoEntry: false })?.isFile() ?? false, false);
  assert.equal(statSync(join(root, 'netlify'), { throwIfNoEntry: false })?.isDirectory() ?? false, false);
  assert.equal(read('package.json').includes('@netlify/blobs'), false);
  assert.equal(read('package.json').includes('netlify'), false);
  assert.equal(read('vite.config.ts').includes('netlify'), false);

  const files: string[] = [];
  const walk = (dir: string) => {
    for (const entry of readdirSync(dir)) {
      const full = join(dir, entry);
      if (statSync(full).isDirectory()) walk(full);
      else if (/\.(ts|tsx|html|js|jsx|json|mjs)$/.test(entry) && !entry.endsWith('.test.ts')) files.push(full);
    }
  };
  walk(join(root, 'src'));
  files.push(join(root, 'index.html'), join(root, 'vite.config.ts'), join(root, 'vercel.json'), join(root, 'package.json'));
  for (const file of files) {
    const text = readFileSync(file, 'utf8');
    assert.equal(text.includes('428427'), false, file);
    assert.equal(text.includes('NETLIFY_API_TOKEN'), false, file);
    assert.equal(text.includes('NETLIFY_SITE_ID'), false, file);
    assert.equal(text.includes('@netlify/blobs'), false, file);
    assert.equal(text.includes('data-netlify'), false, file);
  }
});
