import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@api': path.resolve(__dirname, './api'),
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./setupTests.ts'],
    globals: true,
    exclude: [
      '**/node_modules/**', 
      '**/dist/**', 
      '**/.{idea,git,cache,output,temp}/**', 
      '**/{karma,rollup,webpack,vite,vitest,ava,babel,nyc,cypress,tsup,build,eslint,prettier}.config.*',
      'tests/intake.spec.ts',
      'src/hooks/use-table-url-state.test.ts'
    ],
  },
});
