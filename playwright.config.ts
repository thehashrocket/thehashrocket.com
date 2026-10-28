import { defineConfig, devices } from "@playwright/test";

// E2E drives its own server on a dedicated port, always.
//
// This used to be port 3000 with `reuseExistingServer: !process.env.CI`, which
// means Playwright checks whether ANYTHING is listening on 3000 and, if so,
// assumes it is this app. It usually is. When it is not — Docker, a sibling
// Conductor worktree, a stray `next dev` — the whole suite silently runs
// against the wrong server and reports failures against innocent application
// code. That happened: six tests failed with stack traces pointing at
// SceneSync and the contact form while a Docker container on 3000 answered
// every request with a 307.
//
// 3178 is off the common-default path (3000/3001/8080), and reuse is off in
// both CI and local runs, so a green suite means the code is green. Turbopack
// boots in well under a second, so hermetic costs roughly nothing. Override
// with E2E_PORT if 3178 is taken too.
const PORT = Number.parseInt(process.env.E2E_PORT ?? "", 10) || 3178;
const BASE_URL = `http://localhost:${PORT}`;

export default defineConfig({
  testDir: "./test/e2e",
  use: {
    baseURL: BASE_URL,
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: `pnpm run dev --port ${PORT}`,
    url: BASE_URL,
    reuseExistingServer: false,
    env: { TEST_EMAIL_ENABLED: "true" },
  },
});
