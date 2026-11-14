import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { ContactFormState } from "../lib/actions";

// Set env vars for testing
vi.stubEnv("RESEND_API_KEY", "re_test_key");

// Mock resend before importing the module
const mockSend = vi.fn().mockResolvedValue({ data: { id: "test-id" }, error: null });
vi.mock("resend", () => ({
  Resend: vi.fn().mockImplementation(function () {
    return { emails: { send: mockSend } };
  }),
}));

// Mock upstash modules
vi.mock("@upstash/ratelimit", () => ({
  Ratelimit: Object.assign(
    vi.fn().mockImplementation(() => ({
      limit: vi.fn().mockResolvedValue({ success: true }),
    })),
    { slidingWindow: vi.fn() },
  ),
}));

vi.mock("@upstash/redis", () => ({
  Redis: { fromEnv: vi.fn() },
}));

function makeFormData(fields: Record<string, string>): FormData {
  const fd = new FormData();
  for (const [key, value] of Object.entries(fields)) {
    fd.set(key, value);
  }
  return fd;
}

const idle: ContactFormState = { success: false, error: null, code: null };

const validFields = {
  name: "Jason Shultz",
  email: "jason@example.com",
  message: "I need help with a project, can we talk?",
  website: "",
};

describe("submitContact", () => {
  let submitContact: (prev: ContactFormState, fd: FormData) => Promise<ContactFormState>;

  beforeEach(async () => {
    vi.resetModules();
    const mod = await import("../lib/actions");
    submitContact = mod.submitContact;
  });

  it("succeeds with valid input", async () => {
    const result = await submitContact(
      idle,
      makeFormData(validFields),
    );
    expect(result.success).toBe(true);
    expect(result.error).toBeNull();
  });

  it("emails known sources and qualifying answers", async () => {
    mockSend.mockClear();
    await submitContact(
      idle,
      makeFormData({
        ...validFields,
        source: "work-print-portal",
        projectType: "Rescue",
        timeline: "1–3 months",
      }),
    );
    const payload = mockSend.mock.calls[0][0];
    expect(payload.subject).toContain("(via work-print-portal)");
    expect(payload.text).toContain("Source: work-print-portal");
    expect(payload.text).toContain("Needs: Rescue");
    expect(payload.text).toContain("Timeline: 1–3 months");
  });

  it("accepts the AI-built app review project type", async () => {
    mockSend.mockClear();
    const result = await submitContact(
      idle,
      makeFormData({ ...validFields, projectType: "AI-built app review", source: "ai-app-review" }),
    );
    expect(result.success).toBe(true);
    const payload = mockSend.mock.calls[0][0];
    expect(payload.text).toContain("Needs: AI-built app review");
  });

  it("drops unknown sources and select values without failing", async () => {
    mockSend.mockClear();
    const result = await submitContact(
      idle,
      makeFormData({
        ...validFields,
        source: "evil\r\nBcc: spam@example.com",
        projectType: "Anything",
        timeline: "Whenever",
      }),
    );
    expect(result.success).toBe(true);
    const payload = mockSend.mock.calls[0][0];
    expect(payload.subject).not.toContain("via");
    expect(payload.text).not.toContain("Bcc");
    expect(payload.text).not.toContain("Anything");
    expect(payload.text).not.toContain("Whenever");
  });

  // Value: protects=the subject carries project type and source only when present, on one line;
  //   fails_when=an empty type prints a stray separator, or a CR/LF in the name splits the header;
  //   why_new=the subject gained the project type; the old test checked "(via …)" only; seam=none;
  //   no_claim=Resend's own header encoding (mocked)
  it("builds a one-line subject with optional type and source", async () => {
    const subjectFor = async (fields: Record<string, string>) => {
      mockSend.mockClear();
      await submitContact(idle, makeFormData({ ...validFields, ...fields }));
      return mockSend.mock.calls[0][0].subject as string;
    };
    expect(await subjectFor({ projectType: "Automation sprint", source: "automation-sprint" })).toBe(
      "New contact from Jason Shultz - Automation sprint (via automation-sprint)",
    );
    expect(await subjectFor({ source: "talks" })).toBe("New contact from Jason Shultz (via talks)");
    expect(await subjectFor({ projectType: "A talk for my group", source: "talks" })).toBe(
      "New contact from Jason Shultz - A talk for my group (via talks)",
    );
    expect(await subjectFor({})).toBe("New contact from Jason Shultz");
    expect(await subjectFor({ name: "Jason\r\nBcc: spam@example.com" })).toBe(
      "New contact from Jason Bcc: spam@example.com",
    );
  });

  it("rejects an over-long name or message and non-string fields", async () => {
    const long = await submitContact(
      idle,
      makeFormData({ ...validFields, name: "x".repeat(101) }),
    );
    expect(long.error).toContain("100 characters");
    const essay = await submitContact(
      idle,
      makeFormData({ ...validFields, message: "x".repeat(5001) }),
    );
    expect(essay.error).toContain("5,000 characters");
    const longEmail = await submitContact(
      idle,
      // Well-formed but 255 characters: only the length cap rejects it.
      makeFormData({ ...validFields, email: "a@" + "b".repeat(249) + ".com" }),
    );
    expect(longEmail.error).toContain("valid email");
    const fd = makeFormData(validFields);
    fd.set("name", new File(["x"], "name.txt"));
    const file = await submitContact(idle, fd);
    expect(file.success).toBe(false);
  });

  it("rejects short name", async () => {
    const result = await submitContact(
      idle,
      makeFormData({ ...validFields, name: "J" }),
    );
    expect(result.success).toBe(false);
    expect(result.error).toContain("Name");
  });

  it("rejects invalid email", async () => {
    const result = await submitContact(
      idle,
      makeFormData({ ...validFields, email: "not-an-email" }),
    );
    expect(result.success).toBe(false);
    expect(result.error).toContain("email");
  });

  it("rejects short message", async () => {
    const result = await submitContact(
      idle,
      makeFormData({ ...validFields, message: "Hi" }),
    );
    expect(result.success).toBe(false);
    expect(result.error).toContain("Message");
  });

  it("silently succeeds on honeypot filled", async () => {
    const result = await submitContact(
      idle,
      makeFormData({ ...validFields, website: "spam-bot-value" }),
    );
    expect(result.success).toBe(true);
  });

  it("rejects empty name", async () => {
    const result = await submitContact(
      idle,
      makeFormData({ ...validFields, name: "" }),
    );
    expect(result.success).toBe(false);
  });

  it("returns failure when Resend returns an error", async () => {
    mockSend.mockResolvedValueOnce({
      data: null,
      error: { statusCode: 403, message: "Invalid API key" },
    });
    const result = await submitContact(
      idle,
      makeFormData(validFields),
    );
    expect(result.success).toBe(false);
    expect(result.error).toContain("Something went wrong");
  });

  it("returns failure when Resend throws an exception", async () => {
    mockSend.mockRejectedValueOnce(new Error("Network failure"));
    const result = await submitContact(
      idle,
      makeFormData(validFields),
    );
    expect(result.success).toBe(false);
    expect(result.error).toContain("Something went wrong");
  });

  it("returns failure when RESEND_API_KEY is missing", async () => {
    vi.stubEnv("RESEND_API_KEY", "");
    vi.resetModules();
    // Top-level vi.mock("resend") persists after resetModules; no need to re-register
    const mod = await import("../lib/actions");
    const fn = mod.submitContact;
    const result = await fn(
      idle,
      makeFormData(validFields),
    );
    expect(result.success).toBe(false);
    expect(result.error).toContain("Something went wrong");
    vi.stubEnv("RESEND_API_KEY", "re_test_key");
  });
});

describe("submitContact rate limiting", () => {
  // A stand-in for @upstash/ratelimit that follows its counting rules: fixed windows aligned to
  // the epoch, the previous window weighted by how much of it still overlaps and floored, and a
  // denied call is not counted. no_claim=Upstash's Lua script and Redis timing (mocked).
  type Window = { tokens: number; window: string };
  type Options = { limiter: Window; prefix: string; timeout: number };
  type Fault = "throw" | "timeout";
  const WINDOW_MS: Record<string, number> = { "1 h": 3_600_000, "1 d": 86_400_000 };
  const instances: Options[] = [];
  const calls: { prefix: string; key: string }[] = [];
  const buckets = new Map<string, number>();
  let faults: Record<string, Fault> = {};
  let setupThrows = false;
  let requestHeaders: Record<string, string> = {};

  function limitFor(options: Options) {
    return async (key: string) => {
      calls.push({ prefix: options.prefix, key });
      const fault = faults[options.prefix];
      if (fault === "throw") throw new Error("upstash down at https://secret.upstash.example");
      if (fault === "timeout") return { success: true, reason: "timeout" };
      const size = WINDOW_MS[options.limiter.window];
      const now = Date.now();
      const current = Math.floor(now / size);
      const id = (w: number) => `${options.prefix}:${key}:${w}`;
      const used = buckets.get(id(current)) ?? 0;
      const previous = buckets.get(id(current - 1)) ?? 0;
      const weighted = Math.floor((1 - (now % size) / size) * previous);
      if (weighted + used >= options.limiter.tokens) return { success: false };
      buckets.set(id(current), used + 1);
      return { success: true };
    };
  }

  async function loadWithLimiter() {
    vi.doMock("@upstash/ratelimit", () => ({
      Ratelimit: Object.assign(
        vi.fn().mockImplementation(function (options: Options) {
          instances.push(options);
          return { limit: limitFor(options) };
        }),
        { slidingWindow: (tokens: number, window: string) => ({ tokens, window }) },
      ),
    }));
    vi.doMock("@upstash/redis", () => ({
      Redis: {
        fromEnv: () => {
          if (setupThrows) throw new Error("bad url https://secret.upstash.example");
          return {};
        },
      },
    }));
    vi.doMock("next/headers", () => ({
      headers: async () => new Headers(requestHeaders),
    }));
    vi.resetModules();
    return (await import("../lib/actions")).submitContact;
  }

  const send = (submit: Awaited<ReturnType<typeof loadWithLimiter>>, email: string, ip = "203.0.113.9") => {
    requestHeaders = { "x-real-ip": ip };
    return submit(idle, makeFormData({ ...validFields, email }));
  };
  const DENIED = { success: false, error: "Too many submissions. Please try again later.", code: "rate_limited" };
  const warnSpy = () => vi.spyOn(console, "warn").mockImplementation(() => {});

  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2026-11-16T00:00:00Z"));
    instances.length = 0;
    calls.length = 0;
    buckets.clear();
    faults = {};
    setupThrows = false;
    requestHeaders = {};
    mockSend.mockClear();
    vi.stubEnv("UPSTASH_REDIS_REST_URL", "https://upstash.example");
    vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "token");
    vi.stubEnv("TEST_EMAIL_ENABLED", "");
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    vi.stubEnv("UPSTASH_REDIS_REST_URL", "");
    vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "");
    vi.stubEnv("TEST_EMAIL_ENABLED", "");
    vi.stubEnv("VERCEL_ENV", "");
    vi.doUnmock("@upstash/ratelimit");
    vi.doUnmock("@upstash/redis");
    vi.doUnmock("next/headers");
  });

  // Value: protects=the three limits the owner set on #97 and their prefixes and timeouts;
  //   fails_when=a window typo ("1 m"), a swapped prefix, or the 5 s default timeout returns;
  //   why_new=the old limiter had one 3/hour bucket; seam=none; no_claim=Upstash accepts these options at runtime (mocked)
  it("builds daily IP, hourly IP and per-email limiters with a 1 s timeout", async () => {
    const submit = await loadWithLimiter();
    await send(submit, "a@x.com");
    expect(instances.map(({ prefix, limiter, timeout }) => ({ prefix, limiter, timeout }))).toEqual([
      { prefix: "contact:ip-day", limiter: { tokens: 30, window: "1 d" }, timeout: 1000 },
      { prefix: "contact:ip", limiter: { tokens: 10, window: "1 h" }, timeout: 1000 },
      { prefix: "contact:email", limiter: { tokens: 3, window: "1 h" }, timeout: 1000 },
    ]);
  });

  // Value: protects=a talk room on shared venue Wi-Fi gets through (#97); fails_when=the IP limit drops below 8 or
  //   the email bucket is shared across people; why_new=the 4th person on one IP was refused before; seam=none;
  //   no_claim=real venue NAT behaviour
  it("lets 8 different people on one IP write in within an hour", async () => {
    const submit = await loadWithLimiter();
    for (let i = 0; i < 8; i++) {
      expect(await send(submit, `u${i}@x.com`)).toEqual({ success: true, error: null, code: null });
    }
  });

  // Value: protects=the hourly per-IP cap and its denial copy and log; fails_when=the hourly limit or order changes;
  //   why_new=new limiter; seam=none; no_claim=Upstash's window edges (mocked to its rules)
  it("rejects the 11th message from one IP within an hour", async () => {
    const warn = warnSpy();
    const submit = await loadWithLimiter();
    for (let i = 0; i < 10; i++) expect((await send(submit, `u${i}@x.com`)).success).toBe(true);
    expect(await send(submit, "u10@x.com")).toEqual(DENIED);
    expect(warn).toHaveBeenCalledWith("Contact rate limit denied", { limiter: "ip" });
    expect(mockSend).toHaveBeenCalledTimes(10);
  });

  // Value: protects=the daily per-IP cap that bounds one source when the email check is dodged;
  //   fails_when=the daily limiter is dropped or checked after the hourly one; why_new=new limiter; seam=none;
  //   no_claim=behaviour across UTC midnight (pinned inside one UTC day)
  it("rejects the 31st message from one IP in a day", async () => {
    const warn = warnSpy();
    const submit = await loadWithLimiter();
    let n = 0;
    for (const hour of ["00", "02", "04"]) {
      vi.setSystemTime(new Date(`2026-11-16T${hour}:00:00Z`));
      for (let i = 0; i < 10; i++) expect((await send(submit, `u${n++}@x.com`)).success).toBe(true);
    }
    vi.setSystemTime(new Date("2026-11-16T06:00:00Z"));
    expect(await send(submit, `u${n}@x.com`)).toEqual(DENIED);
    expect(warn).toHaveBeenCalledWith("Contact rate limit denied", { limiter: "ip-day" });
  });

  // Value: protects=one person can't resend endlessly by switching networks; fails_when=the email key or limit changes;
  //   why_new=no per-email limit existed; seam=none; no_claim=none beyond protects
  it("rejects a 4th message from one email within an hour, even from different IPs", async () => {
    const warn = warnSpy();
    const submit = await loadWithLimiter();
    for (let i = 0; i < 3; i++) expect((await send(submit, "same@x.com", `198.51.100.${i}`)).success).toBe(true);
    expect(await send(submit, "same@x.com", "198.51.100.9")).toEqual(DENIED);
    expect(warn).toHaveBeenCalledWith("Contact rate limit denied", { limiter: "email" });
  });

  // Value: protects=the email key ignores case and surrounding spaces and never stores the raw address;
  //   fails_when=normalization moves after validation or the hash is dropped; why_new=new key; seam=none;
  //   no_claim=browser trimming of type=email inputs
  it("keys the email limit on a hash of the trimmed, lowercased address", async () => {
    const submit = await loadWithLimiter();
    await send(submit, "A@X.com");
    expect((await send(submit, " a@x.com ")).success).toBe(true);
    const emailKeys = calls.filter((c) => c.prefix === "contact:email").map((c) => c.key);
    expect(new Set(emailKeys).size).toBe(1);
    expect(emailKeys[0]).toMatch(/^[0-9a-f]{64}$/);
    expect(emailKeys[0]).not.toContain("x.com");
    expect(mockSend.mock.calls[1][0].text).toContain("Email: a@x.com");
  });

  // Value: protects=a crowd on one IP can't burn a real person's email bucket; fails_when=the email check runs before
  //   or regardless of the IP check; why_new=new ordering; seam=none; no_claim=none beyond protects
  it("does not spend the email bucket on a request the IP limit denied", async () => {
    const submit = await loadWithLimiter();
    for (let i = 0; i < 10; i++) await send(submit, `u${i}@x.com`);
    expect(await send(submit, "e@x.com")).toEqual(DENIED);
    expect((await send(submit, "e@x.com", "192.0.2.1")).success).toBe(true);
    expect(calls.filter((c) => c.prefix === "contact:email" && c.key === calls.at(-1)?.key)).toHaveLength(1);
  });

  // Value: protects=both IP limiters key on Vercel's x-real-ip, falling back to the trimmed leftmost x-forwarded-for,
  //   then "anonymous"; fails_when=the key reverts to the raw spoofable header or the order flips; why_new=ported from
  //   the single-limiter test; seam=none; no_claim=Vercel actually sets x-real-ip
  it("keys both IP limits on x-real-ip before the spoofable x-forwarded-for", async () => {
    const submit = await loadWithLimiter();
    const keysFor = async (h: Record<string, string>) => {
      requestHeaders = h;
      calls.length = 0;
      await submit(idle, makeFormData(validFields));
      return calls.filter((c) => c.prefix.startsWith("contact:ip")).map((c) => c.key);
    };
    expect(await keysFor({ "x-real-ip": "203.0.113.9", "x-forwarded-for": "1.2.3.4, 203.0.113.9" })).toEqual([
      "203.0.113.9",
      "203.0.113.9",
    ]);
    expect(await keysFor({ "x-forwarded-for": " 198.51.100.7 , 10.0.0.1" })).toEqual(["198.51.100.7", "198.51.100.7"]);
    expect(await keysFor({})).toEqual(["anonymous", "anonymous"]);
  });

  // Value: protects=an unavailable limiter never drops a lead, a later working limiter still applies, and the log
  //   never carries the Upstash URL; fails_when=one try wraps all calls again, or a timeout result is ignored;
  //   why_new=the SDK resolves timeouts as success with reason "timeout" and the old catch was silent; seam=none;
  //   no_claim=real network latency (mocked)
  it("fails open per limiter on a throw or timeout and logs no URL", async () => {
    const warn = warnSpy();
    const submit = await loadWithLimiter();
    faults = { "contact:ip-day": "throw", "contact:ip": "timeout" };
    expect((await send(submit, "a@x.com")).success).toBe(true);
    expect(warn).toHaveBeenCalledWith("Contact rate limit unavailable, failing open", {
      limiter: "ip-day",
      reason: "Error: upstash down at https://secret.upstash.example",
    });
    expect(warn).toHaveBeenCalledWith("Contact rate limit unavailable, failing open", {
      limiter: "ip",
      reason: "timeout",
    });
    // The email limiter still counts and still denies.
    await send(submit, "a@x.com");
    await send(submit, "a@x.com");
    expect(await send(submit, "a@x.com")).toEqual(DENIED);
  });

  // Value: protects=a broken Redis setup accepts the message instead of a 500; fails_when=setup moves outside the
  //   fail-open try; why_new=per-call tries no longer cover setup; seam=none; no_claim=which Upstash errors occur in practice
  it("accepts the message and warns once when limiter setup fails", async () => {
    const warn = warnSpy();
    setupThrows = true;
    const submit = await loadWithLimiter();
    expect(await send(submit, "a@x.com")).toEqual({ success: true, error: null, code: null });
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls[0][1]).toMatchObject({ limiter: "setup" });
    expect(mockSend).toHaveBeenCalledTimes(1);
  });

  // Value: protects=TEST_EMAIL_ENABLED=true skips every limiter and the email outside production;
  //   fails_when=the test-run gate is dropped and local e2e burns real Upstash quota; why_new=ported; seam=none
  //   (TEST_EMAIL_ENABLED is the production switch); no_claim=TEST_EMAIL_ENABLED is never set in production
  it("skips the limiters in test runs", async () => {
    vi.stubEnv("TEST_EMAIL_ENABLED", "true");
    const submit = await loadWithLimiter();
    expect((await send(submit, "a@x.com")).success).toBe(true);
    expect(calls).toHaveLength(0);
    expect(mockSend).not.toHaveBeenCalled();
  });

  // Value: protects=production ignores TEST_EMAIL_ENABLED, so a stray value can't drop inquiries behind "Message sent";
  //   fails_when=the VERCEL_ENV guard is removed; why_new=ported to three limiters; seam=none;
  //   no_claim=preview deployments still honor the flag
  it("ignores the test flag in production", async () => {
    vi.stubEnv("TEST_EMAIL_ENABLED", "true");
    vi.stubEnv("VERCEL_ENV", "production");
    const submit = await loadWithLimiter();
    expect(await send(submit, "a@x.com")).toEqual({ success: true, error: null, code: null });
    expect(calls.map((c) => c.prefix)).toEqual(["contact:ip-day", "contact:ip", "contact:email"]);
    expect(mockSend).toHaveBeenCalledTimes(1);
  });
});

describe("submitContact length limits", () => {
  // Value: protects=a name of exactly 100 and a message of exactly 5,000 characters are accepted, matching the form's maxLength;
  //   fails_when=a check flips from > to >= and the server rejects input the browser let through;
  //   why_new=the existing test checks only 101 and 5001; seam=none; no_claim=browsers enforce maxLength identically
  it("accepts input at the limits", async () => {
    vi.resetModules();
    const { submitContact } = await import("../lib/actions");
    const result = await submitContact(
      idle,
      makeFormData({ ...validFields, name: "x".repeat(100), message: "x".repeat(5000) }),
    );
    expect(result).toEqual({ success: true, error: null, code: null });
    // A textarea at its 5,000-character limit arrives with CRLF line breaks.
    const crlf = await submitContact(
      idle,
      makeFormData({ ...validFields, message: ("x".repeat(99) + "\r\n").repeat(50).slice(0, -2) }),
    );
    expect(crlf).toEqual({ success: true, error: null, code: null });
  });
});
