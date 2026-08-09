import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
  snapshotPathTemplate: "{testDir}/__screenshots__/{platform}/{arg}{ext}",
  expect: {
    toHaveScreenshot: {
      animations: "disabled",
      maxDiffPixelRatio: 0.03,
    },
  },
  use: {
    baseURL: "http://127.0.0.1:3100",
    colorScheme: "light",
    locale: "pl-PL",
    trace: "retain-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { height: 1000, width: 1440 },
      },
    },
  ],
  webServer: {
    command: "PORT=3100 HOSTNAME=127.0.0.1 pnpm --filter @wyceno/web start",
    reuseExistingServer:
      !process.env.CI && process.env.PLAYWRIGHT_REUSE_EXISTING_SERVER !== "false",
    timeout: 120_000,
    url: "http://127.0.0.1:3100/health",
  },
});
