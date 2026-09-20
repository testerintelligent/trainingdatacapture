import { defineConfig } from '@playwright/test';

// Base URL of the running back-end API. Override with API_BASE_URL if it's
// not on the default local port (see back-end/.env.development / PORT).
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:5002';

export default defineConfig({
  testDir: './tests',
  timeout: 30_000,
  fullyParallel: false,
  retries: 0,
  reporter: 'list',
  use: {
    baseURL: API_BASE_URL,
    extraHTTPHeaders: {
      'Content-Type': 'application/json',
    },
  },
});
