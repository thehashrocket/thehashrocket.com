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

const servers = Array.isArray(config.webServer) ? config.webServer : [config.webServer!];
const webServer = servers[0];

describe("playwright.config.ts server isolation", () => {
  it("never adopts a server it did not start", () => {
    for (const server of servers) expect(server.reuseExistingServer, server.url).toBe(false);
  });

  it("stays off the ports other dev servers claim by default", () => {
    for (const server of servers) {
      expect(["3000", "3001", "8080"]).not.toContain(new URL(server.url!).port);
    }
  });

  it("points the browser at the same port it boots the server on", () => {
    // A baseURL that drifts from webServer.url sends every test to a port
    // nothing is serving, which reads as "the whole app is broken".
    expect(config.use?.baseURL).toBe(webServer?.url);
  });
});

// Value: protects=the first-screen checks run once with Cal.com off and once with it on, each against its own server;
//   fails_when=a project points at the wrong port, the booking env leaks into the default server (or a developer's
//   .env.local does), or both servers share a build directory and the second dev server refuses to start;
//   why_new=the booking-on project and its server are new; seam=none; no_claim=Cal.com itself (a fake URL)
describe("playwright.config.ts booking projects", () => {
  const [off, on] = servers;
  const project = (name: string) => config.projects?.find((p) => p.name === name);

  it("runs two servers: booking off explicitly, booking on in its own build directory", () => {
    expect(servers).toHaveLength(2);
    expect(off.env?.NEXT_PUBLIC_CALCOM_URL).toBe("");
    expect(on.env?.NEXT_PUBLIC_CALCOM_URL).toMatch(/^https:\/\//);
    expect(on.env?.NEXT_DIST_DIR).toBeTruthy();
    expect(on.env?.NEXT_DIST_DIR).not.toBe(".next");
    for (const server of servers) expect(server.env?.TEST_EMAIL_ENABLED).toBe("true");
    expect(new URL(on.url!).port).not.toBe(new URL(off.url!).port);
  });

  it("maps each project to its server", () => {
    expect(project("chromium")?.use?.baseURL).toBe(off.url);
    expect(project("booking-on")?.use?.baseURL).toBe(on.url);
  });

  it("scopes the booking-on project to the first-screen checks", () => {
    const bookingOn = project("booking-on");
    expect(String(bookingOn?.testMatch)).toContain("offer-pages");
    expect(String(bookingOn?.grep)).toContain("first screen");
  });
});
