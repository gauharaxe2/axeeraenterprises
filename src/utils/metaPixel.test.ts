import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  META_PIXEL_ID,
  shouldTrackSpaPageView,
  trackMetaPixelPageView
} from './metaPixel.ts';

test('META_PIXEL_ID matches configured Meta Pixel ID', () => {
  assert.equal(META_PIXEL_ID, '1174303161608369');
});

test('shouldTrackSpaPageView skips initial mount, StrictMode remounts, admin gates, and 404 pages', () => {
  assert.equal(
    shouldTrackSpaPageView({
      previousPageKey: null,
      currentPageKey: 'home||||',
      adminGate: 'off',
      currentPage: 'home'
    }),
    false
  );
  assert.equal(
    shouldTrackSpaPageView({
      previousPageKey: 'home||||',
      currentPageKey: 'home||||',
      adminGate: 'off',
      currentPage: 'home'
    }),
    false
  );
  assert.equal(
    shouldTrackSpaPageView({
      previousPageKey: 'home||||',
      currentPageKey: 'about||||',
      adminGate: 'gate',
      currentPage: 'about'
    }),
    false
  );
  assert.equal(
    shouldTrackSpaPageView({
      previousPageKey: 'home||||',
      currentPageKey: 'about||||',
      adminGate: 'open',
      currentPage: 'about'
    }),
    false
  );
  assert.equal(
    shouldTrackSpaPageView({
      previousPageKey: 'home||||',
      currentPageKey: 'not-found||||',
      adminGate: 'off',
      currentPage: 'not-found'
    }),
    false
  );
  assert.equal(
    shouldTrackSpaPageView({
      previousPageKey: 'home||||',
      currentPageKey: 'blogs||||',
      adminGate: 'off',
      currentPage: 'blogs'
    }),
    true
  );
  assert.equal(
    shouldTrackSpaPageView({
      previousPageKey: 'blogs||||',
      currentPageKey: 'blog-detail|what-is-web-development|||',
      adminGate: 'off',
      currentPage: 'blog-detail'
    }),
    true
  );
});

test('trackMetaPixelPageView safely invokes fbq when available and no-ops otherwise', () => {
  assert.equal(trackMetaPixelPageView(undefined), false);

  const calls: Array<[string, string]> = [];
  const ok = trackMetaPixelPageView((command, event) => {
    calls.push([command, event]);
  });

  assert.equal(ok, true);
  assert.deepEqual(calls, [['track', 'PageView']]);
});

test('index.html embeds the Meta Pixel base script and noscript fallback', () => {
  const html = readFileSync(resolve(process.cwd(), 'index.html'), 'utf8');
  assert.match(html, /https:\/\/connect\.facebook\.net\/en_US\/fbevents\.js/);
  assert.match(html, /fbq\('init',\s*'1174303161608369'\)/);
  assert.match(html, /fbq\('track',\s*'PageView'\)/);
  assert.match(
    html,
    /<noscript>\s*<img[\s\S]*src="https:\/\/www\.facebook\.com\/tr\?id=1174303161608369&ev=PageView&noscript=1"[\s\S]*<\/noscript>/
  );
});
