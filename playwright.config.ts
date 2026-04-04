import { defineConfig } from "@playwright/test";

const playwrightPort = process.env.PLAYWRIGHT_WEB_SERVER_PORT ?? "3210";
const baseUrl = `http://127.0.0.1:${playwrightPort}`;

export default defineConfig({
  testDir: "./tests/e2e",
  // The E2E suite shares one mutable SQLite runtime state, so one worker keeps promotion checks deterministic.
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: "list",
  use: {
    baseURL: baseUrl,
    trace: "on-first-retry"
  },
  webServer: {
    command: "node scripts/playwright-web-server.mjs",
    url: `${baseUrl}/api/health`,
    reuseExistingServer: !process.env.CI,
    timeout: 120000
  }
});
