import { defineConfig, devices } from "@playwright/test";

const PORT = 3100;

export default defineConfig({
  testDir: "./tests/e2e",
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "retain-on-failure",
  },
  // ponytail: Chromium only until Phase 12 adds Firefox and WebKit (phases.md).
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    // CI runs `npm run build` as its own step first.
    command: `${process.env.CI ? "" : "npm run build && "}npm run start -- --port ${PORT}`,
    url: `http://localhost:${PORT}/dev/tokens`,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
    env: { NEXT_PUBLIC_APP_ENV: "development" },
  },
});
