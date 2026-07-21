import { defineConfig, devices } from '@playwright/test';

import { env } from './e2e/shared/config/env';

/**
 * FormFlow Playwright configuration.
 * Shared `use` + webServer apply to all projects.
 * Default npm scripts pin `--project=chromium` so the suite is not ×3.
 * Use `npm run test:cross-browser` (or `--project=firefox|webkit`) for multi-browser.
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: env.isCI,
  retries: env.isCI ? 2 : 0,
  workers: env.isCI ? 2 : undefined,
  timeout: env.defaultTimeoutMs,
  expect: {
    timeout: env.actionTimeoutMs,
  },
  reporter: env.isCI
    ? [
        ['list'],
        ['github'],
        ['html', { open: 'never', outputFolder: 'playwright-report' }],
      ]
    : [['list'], ['html', { open: 'never', outputFolder: 'playwright-report' }]],
  use: {
    baseURL: env.baseURL,
    actionTimeout: env.actionTimeoutMs,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
  webServer: {
    command: 'npm run start',
    url: env.baseURL,
    reuseExistingServer: !env.isCI,
    timeout: 120_000,
  },
  outputDir: 'test-results',
});
