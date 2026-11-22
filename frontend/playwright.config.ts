import { existsSync } from 'node:fs';

import { defineConfig, devices } from '@playwright/test';

// Local settings (test-user password) come from the repository's .env, like for the backend.
if (existsSync('../.env')) {
  process.loadEnvFile('../.env');
}

/**
 * End-to-end tests against the full local stack: Compose (Keycloak, PostgreSQL), the backend on :8080 and the web
 * app on :4200 (started here unless already running). See README.md.
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  forbidOnly: !!process.env['CI'],
  retries: process.env['CI'] ? 1 : 0,
  reporter: process.env['CI'] ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: 'http://localhost:4200',
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'desktop',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 800 } },
    },
    { name: 'mobile', use: { ...devices['Pixel 7'], viewport: { width: 390, height: 844 } } },
  ],
  webServer: {
    command: 'npm start',
    url: 'http://localhost:4200',
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
