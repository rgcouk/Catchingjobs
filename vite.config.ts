import tailwindcss from '@tailwindcss/vite';
import { reactRouter } from '@react-router/dev/vite';
import path from 'node:path';
import { defineConfig } from 'vite';
export default defineConfig({
  publicDir: 'apps/web/public',
  plugins: [tailwindcss(), reactRouter()],
  resolve: {
    alias: {
      '@': path.resolve('apps/web/src'),
      '@catchingjobs/shared': path.resolve('packages/shared/src'),
    },
  },
  ssr: { noExternal: ['react-router', 'react-router-dom', '@clerk/clerk-react'] },
  server: {
    port: 3000,
    host: '0.0.0.0',
    hmr: process.env.DISABLE_HMR !== 'true',
    watch: process.env.DISABLE_HMR === 'true' ? null : {},
  },
});
