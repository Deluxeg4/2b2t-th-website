import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'path';
import { fileURLToPath } from 'node:url';
import { defineConfig, type Plugin, type ResolvedConfig } from 'vite';
import { canonicalOrigin, routeSeo, statusOrigin, statusSeo } from './src/seo';

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

function staticSeoPages(): Plugin {
  let outputDir = path.resolve(projectRoot, 'dist');

  return {
    name: 'static-seo-pages',
    apply: 'build',
    configResolved(config: ResolvedConfig) {
      outputDir = path.resolve(config.root, config.build.outDir);
    },
    async closeBundle() {
      const source = await readFile(path.join(outputDir, 'index.html'), 'utf8');
      const escapeHtml = (value: string) => value
        .replaceAll('&', '&amp;')
        .replaceAll('"', '&quot;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;');
      const renderHtml = (metadata: { title: string; description: string }, canonical: string) => source
        .replace(/<title>[\s\S]*?<\/title>/, `<title>${escapeHtml(metadata.title)}</title>`)
        .replace(/<meta name="description" content="[^"]*"\s*\/>/, `<meta name="description" content="${escapeHtml(metadata.description)}" />`)
        .replace(/<link rel="canonical" href="[^"]*"\s*\/>/, `<link rel="canonical" href="${canonical}" />`);

      for (const route of ['/mods', '/commands', '/about', '/terms', '/contact']) {
        const metadata = routeSeo[route].th;
        const routeHtml = renderHtml(metadata, `${canonicalOrigin}${route}`);
        const routeHtmlPath = path.join(outputDir, route.slice(1), 'index.html');
        await mkdir(path.dirname(routeHtmlPath), { recursive: true });
        await writeFile(routeHtmlPath, routeHtml, 'utf8');
      }

      const statusHtmlPath = path.join(outputDir, 'status', 'index.html');
      await mkdir(path.dirname(statusHtmlPath), { recursive: true });
      await writeFile(statusHtmlPath, renderHtml(statusSeo.th, `${statusOrigin}/`), 'utf8');
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), staticSeoPages()],
  server: {
    allowedHosts: ['2b2t-th.org', 'www.2b2t-th.org'],
  },
  resolve: {
    alias: {
      '@': path.resolve(projectRoot, '.'),
    },
  },
});
