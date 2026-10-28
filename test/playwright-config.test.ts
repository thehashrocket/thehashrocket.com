import { describe, it, expect } from "vitest";
import config from "../playwright.config";

// `reuseExistingServer: true` makes Playwright adopt whatever is already
// listening on the configured port instead of starting the app. When that
// port is 3000, "whatever is listening" is regularly not this app — Docker, a
// sibling Conductor worktree, a leftover `next dev`. The suite then runs green
// or red against a stranger, and the red case is worse: six tests failed with
// stack traces pointing at SceneSync and the contact form while a Docker
// container answered every request with a 307. Nothing was wrong with either.
//
// A test suite that can fail because of an unrelated process is not a signal.
// These assertions keep the harness hermetic.

const webServer = Array.isArray(config.webServer)
  ? config.webServer[0]
  : config.webServer;

describe("playwright.config.ts server isolation", () => {
  it("never adopts a server it did not start", () => {
    expect(webServer?.reuseExistingServer).toBe(false);
  });

  it("stays off the ports other dev servers claim by default", () => {
    const port = new URL(webServer!.url!).port;

    expect(["3000", "3001", "8080"]).not.toContain(port);
  });

  it("points the browser at the same port it boots the server on", () => {
    // A baseURL that drifts from webServer.url sends every test to a port
    // nothing is serving, which reads as "the whole app is broken".
    expect(config.use?.baseURL).toBe(webServer?.url);
  });
});
