import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 45000,
  fullyParallel: false,
  retries: 1,
  use: {
    baseURL: 'http://localhost:3000',
    screenshot: 'only-on-failure',
  },
  webServer: [
    {
      command: 'php artisan serve --port=8000',
      port: 8000,
      cwd: '..',
      reuseExistingServer: true,
      timeout: 30000,
    },
    {
      command: 'npm run dev',
      port: 3000,
      cwd: '.',
      reuseExistingServer: true,
      timeout: 60000,
    },
  ],
});
