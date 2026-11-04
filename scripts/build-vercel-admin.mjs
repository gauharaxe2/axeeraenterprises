import { build } from 'esbuild';
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = join(root, 'api', 'admin');

const routes = {
  login: 'netlify/functions/admin-login.ts',
  logout: 'netlify/functions/admin-logout.ts',
  session: 'netlify/functions/admin-session.ts',
  submissions: 'netlify/functions/admin-submissions.ts'
};

mkdirSync(outDir, { recursive: true });

for (const name of Object.keys(routes)) {
  rmSync(join(outDir, `${name}.ts`), { force: true });
  rmSync(join(outDir, `${name}.js`), { force: true });
}

for (const [name, entry] of Object.entries(routes)) {
  const outfile = join(outDir, `${name}.js`);
  const source = `
import handler from ${JSON.stringify(join(root, entry))};
export default {
  fetch(request) {
    return handler(request);
  }
};
`;
  // Write a temp entry so esbuild can resolve relative paths cleanly, then bundle.
  const tempEntry = join(outDir, `${name}.entry.mjs`);
  writeFileSync(tempEntry, source);
  try {
    await build({
      entryPoints: [tempEntry],
      outfile,
      bundle: true,
      platform: 'node',
      format: 'esm',
      packages: 'external',
      logLevel: 'warning'
    });
  } finally {
    rmSync(tempEntry, { force: true });
  }
}

console.log(`Bundled Vercel admin APIs: ${Object.keys(routes).join(', ')}`);
