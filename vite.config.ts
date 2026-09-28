import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'node:url';
import {defineConfig} from 'vite';

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    allowedHosts: ['2b2t-th.org', 'www.2b2t-th.org'],
  },
  resolve: {
    alias: {
      '@': path.resolve(projectRoot, '.'),
    },
  },
});
