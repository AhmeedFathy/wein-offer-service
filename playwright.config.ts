import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/smoke',
  timeout: 30_000,
  expect: {
    timeout: 10_000,
  },
  use: {
    browserName: 'chromium',
    headless: true,
    baseURL: process.env.PORTAL_BASE_URL || 'http://127.0.0.1:5000',
    trace: 'retain-on-failure',
  },
});
