import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export function resolveViteBasePath(rawBase?: string): string {
  const trimmed = rawBase?.trim();
  if (!trimmed || trimmed === '/') return '/';
  const withLeading = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  return withLeading.endsWith('/') ? withLeading : `${withLeading}/`;
}

// https://vitejs.dev/config/
export default defineConfig({
  base: resolveViteBasePath(process.env.VITE_BASE_PATH),
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 3000,
  },
  preview: {
    host: '0.0.0.0',
    port: 3000,
  }
});
