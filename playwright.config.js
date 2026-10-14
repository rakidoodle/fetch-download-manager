import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests/browser', fullyParallel: false, workers: 1, timeout: 30000,
  reporter: [['list']], use: { baseURL: 'http://localhost:4318', viewport: { width: 1440, height: 1000 }, trace: 'retain-on-failure', screenshot: 'only-on-failure' },
  webServer: { command: 'npm run build && node server/index.js', url: 'http://localhost:4318/api/health', reuseExistingServer: false, env: { NODE_ENV: 'production', PORT: '4318', FETCH_DATA_DIR: '.data/browser-test', FETCH_DOWNLOAD_DIR: '.data/browser-downloads' }, timeout: 20000 }
});
