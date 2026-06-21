import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  timeout: 300_000,
  use: {
    baseURL: 'http://localhost:5175',
    video: 'on',
    viewport: { width: 1280, height: 720 },
    headless: false,
    slowMo: 300,
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
  outputDir: './test-results',
});
