import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { resolveViteBasePath } from '../vite.config.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

test('resolveViteBasePath defaults to / and normalizes GitHub Pages project paths', () => {
  assert.equal(resolveViteBasePath(undefined), '/');
  assert.equal(resolveViteBasePath(''), '/');
  assert.equal(resolveViteBasePath('/'), '/');
  assert.equal(resolveViteBasePath('/axes-era'), '/axes-era/');
  assert.equal(resolveViteBasePath('axes-era/'), '/axes-era/');
});

test('GitHub Pages workflow builds the Vite bundle into ./dist with SPA fallback', () => {
  const workflow = readFileSync(join(root, '.github/workflows/static.yml'), 'utf8');

  assert.match(workflow, /branches:\s*\["main",\s*"master"\]/);
  assert.match(workflow, /uses:\s*actions\/setup-node@v4/);
  assert.match(workflow, /run:\s*npm install --no-audit --no-fund/);
  assert.equal(workflow.includes('npm ci'), false, 'Repository uses bun.lock without package-lock.json');
  assert.match(workflow, /uses:\s*actions\/configure-pages@v5/);
  assert.match(workflow, /VITE_BASE_PATH:\s*\$\{\{\s*steps\.pages\.outputs\.base_path\s*\}\}/);
  assert.match(workflow, /run:\s*npm run build/);
  assert.match(workflow, /cp dist\/index\.html dist\/404\.html/);
  assert.match(workflow, /uses:\s*actions\/upload-pages-artifact@v3/);
  assert.match(workflow, /path:\s*"\.\/dist"/);
  assert.equal(workflow.includes("path: '.'"), false, 'Must upload built dist directory, not raw source root');
  assert.match(workflow, /uses:\s*actions\/deploy-pages@v4/);
});
