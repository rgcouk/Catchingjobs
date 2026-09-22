import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './apps/web/src'),
      '@api': path.resolve(__dirname, './apps/api/src'),
      '@catchingjobs/shared': path.resolve(__dirname, './packages/shared/src'),
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setupTests.ts'],
    globals: true,
    exclude: [
      '**/node_modules/**', 
      '**/dist/**', 
      '**/.{idea,git,cache,output,temp}/**', 
      '**/{karma,rollup,webpack,vite,vitest,ava,babel,nyc,cypress,tsup,build,eslint,prettier}.config.*',
      'tests/*.spec.ts',
      'apps/web/src/hooks/use-table-url-state.test.ts'
    ],
  },
});
