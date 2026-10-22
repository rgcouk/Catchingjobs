import { defineConfig, devices } from '@playwright/test';
export default defineConfig({
  testDir: '.',
  testMatch: ['public-design.spec.ts', 'framework-rendering.spec.ts'],
  fullyParallel: false,
  workers: 1,
  reporter: 'list',
  use: { baseURL: 'http://127.0.0.1:3100', trace: 'retain-on-failure' },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    cwd: new URL('..', import.meta.url).pathname,
    command: 'node --import tsx tests/support/framework-preview.ts',
    url: 'http://127.0.0.1:3100',
    reuseExistingServer: false,
  },
});
