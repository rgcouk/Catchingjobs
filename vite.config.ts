import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import { defineConfig, Plugin } from 'vite';

function ssrDevPlugin(): Plugin {
  return {
    name: 'catchingjobs-ssr-dev',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.originalUrl || req.url || '/';

        // Bypass asset requests, api endpoints, and internal Vite requests
        if (
          req.method !== 'GET' ||
          url.startsWith('/api') ||
          url.startsWith('/@') ||
          url.startsWith('/src') ||
          url.startsWith('/node_modules') ||
          url.includes('.')
        ) {
          return next();
        }

        try {
          const templatePath = path.resolve(__dirname, 'index.html');
          let template = fs.readFileSync(templatePath, 'utf-8');
          template = await server.transformIndexHtml(url, template);

          const { render } = await server.ssrLoadModule('/src/entry.server.tsx');
          const { html: appHtml, head: headHtml } = await render(url);

          const fullHtml = template
            .replace('<!--app-head-->', headHtml || '')
            .replace('<!--app-html-->', appHtml || '');

          res.statusCode = 200;
          res.setHeader('Content-Type', 'text/html; charset=utf-8');
          res.end(fullHtml);
        } catch (e) {
          server.ssrFixStacktrace(e as Error);
          next(e);
        }
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), ssrDevPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        'react-router-dom': 'react-router',
      },
    },
    ssr: {
      noExternal: ['react-router', 'react-helmet-async', '@clerk/clerk-react'],
    },


    server: {

      proxy: {
        '/api': {
          target: 'http://localhost:3001',
          changeOrigin: true,
        },
      },
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
