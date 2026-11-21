import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 30000,
  retries: process.env.CI ? 2 : 1,
  use: {
    baseURL: 'http://127.0.0.1:5173',
    headless: true,
    screenshot: 'only-on-failure',
    trace: 'on-first-retry',
  },
  reporter: [
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['list'],
  ],
  webServer: {
    command: 'npm run dev -- --host 127.0.0.1 --port 5173',
    url: 'http://127.0.0.1:5173',
    timeout: 60000,
    reuseExistingServer: !process.env.CI,
  },
});
