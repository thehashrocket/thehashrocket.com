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

  // Value: protects=an inquiry reaches the jasonshultz.com inbox, and pressing Reply reaches the visitor (#104);
  //   fails_when=to keeps a second literal, replyTo is missing, or an empty RESEND_FROM_EMAIL sends from "<>";
  //   why_new=#104 moved the inbox and the live test showed an empty reply_to; seam=none;
  //   no_claim=Resend delivery or DMARC (live send test before merge)
  it("sends to the jasonshultz.com inbox with the visitor as Reply-To", async () => {
    mockSend.mockClear();
    vi.stubEnv("RESEND_FROM_EMAIL", "");
    try {
      await submitContact(idle, makeFormData({ ...validFields, email: "pat@example.com" }));
      const payload = mockSend.mock.calls[0][0];
      expect(payload.to).toBe("jason@jasonshultz.com");
      expect(payload.replyTo).toBe("pat@example.com");
      expect(payload.from).toBe("Contact Form <contact@mail.jasonshultz.com>");
    } finally {
      // Undo every stub, then put back the file-wide API key the other tests rely on.
      vi.unstubAllEnvs();
      vi.stubEnv("RESEND_API_KEY", "re_test_key");
    }
  });

  it("refuses an address list before sending anything", async () => {
    mockSend.mockClear();
    const result = await submitContact(idle, makeFormData({ ...validFields, email: "a@x.com,b@y.com" }));
    expect(result.success).toBe(false);
    expect(result.error).toBe("Please enter a valid email address.");
    expect(mockSend).not.toHaveBeenCalled();
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
    // The confirmation names what was sent (ContactForm), so the action echoes the allow-listed type.
    expect(result.submittedProjectType).toBe("AI-built app review");
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
    // Only an allow-listed value is echoed back to the page, never raw form data.
    expect(result.submittedProjectType).toBe("");
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

  // Value: protects=a honeypot submit gets the same answer as a real send apart from leadSent, so the page
  //   can't show a bot it was caught, and only a real send counts as a lead (#115, D3);
  //   fails_when=the honeypot branch returns a different shape, drops the echoed project type, or sets leadSent;
  //   why_new=the success state now carries leadSent; seam=none;
  //   no_claim=what the browser renders or reports (ContactForm and conversion-event tests)
  it("answers a honeypot submit like a real send, without sending or counting a lead", async () => {
    mockSend.mockClear();
    const fields = { ...validFields, projectType: "Rescue" };
    const trapped = await submitContact(idle, makeFormData({ ...fields, website: "spam-bot-value" }));
    expect(mockSend).not.toHaveBeenCalled();
    const real = await submitContact(idle, makeFormData(fields));
    expect(real.leadSent).toBe(true);
    expect(trapped.leadSent).toBeUndefined();
    expect(trapped).toEqual({ ...real, leadSent: undefined });
    expect(trapped.submittedProjectType).toBe("Rescue");
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
    expect(result.error).toContain("wasn't sent");
    expect(result.code).toBe("send_failed");
  });

  it("returns failure when Resend throws an exception", async () => {
    mockSend.mockRejectedValueOnce(new Error("Network failure"));
    const result = await submitContact(
      idle,
      makeFormData(validFields),
    );
    expect(result.success).toBe(false);
    expect(result.error).toContain("wasn't sent");
    expect(result.code).toBe("send_failed");
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
    expect(result.error).toContain("wasn't sent");
    expect(result.code).toBe("send_failed");
    vi.stubEnv("RESEND_API_KEY", "re_test_key");
  });
});

describe("submitContact rate limiting", () => {
  // A stand-in for @upstash/ratelimit 2.2 that follows its sliding-window rules: fixed windows
  // aligned to the epoch, the previous window weighted by how much of it still overlaps and
  // floored. getRemaining reads without spending; limit spends one slot unless the window is full.
  // no_claim=Upstash's Lua scripts and Redis timing (mocked to the same formula).
  type Window = { tokens: number; window: string };
  type Options = { limiter: Window; prefix: string; timeout: number };
  type Fault = "throw" | "hang";
  const WINDOW_MS: Record<string, number> = { "1 m": 60_000, "1 h": 3_600_000, "1 d": 86_400_000 };
  const instances: Options[] = [];
  const calls: { op: "check" | "record"; prefix: string; key: string }[] = [];
  const buckets = new Map<string, number>();
  let checkFaults: Record<string, Fault> = {};
  let recordFaults: Record<string, Fault> = {};
  let setupThrows = false;
  let requestHeaders: Record<string, string> = {};

  function used(options: Options, key: string) {
    const size = WINDOW_MS[options.limiter.window];
    const now = Date.now();
    const current = Math.floor(now / size);
    const id = (w: number) => `${options.prefix}:${key}:${w}`;
    const inCurrent = buckets.get(id(current)) ?? 0;
    const weighted = Math.floor((1 - (now % size) / size) * (buckets.get(id(current - 1)) ?? 0));
    return { total: weighted + inCurrent, currentId: id(current), inCurrent, reset: (current + 1) * size };
  }

  function fault(kind: Fault | undefined) {
    if (kind === "throw") throw new Error("upstash down at https://secret.upstash.example");
    if (kind === "hang") return new Promise<never>(() => {});
    return null;
  }

  function limiterFor(options: Options) {
    return {
      getRemaining: async (key: string) => {
        calls.push({ op: "check", prefix: options.prefix, key });
        const failed = fault(checkFaults[options.prefix]);
        if (failed) return failed;
        const { total, reset } = used(options, key);
        return { remaining: Math.max(0, options.limiter.tokens - total), reset, limit: options.limiter.tokens };
      },
      limit: async (key: string) => {
        calls.push({ op: "record", prefix: options.prefix, key });
        const failed = fault(recordFaults[options.prefix]);
        if (failed) return failed;
        const { total, currentId, inCurrent, reset } = used(options, key);
        if (total >= options.limiter.tokens) return { success: false, reset };
        buckets.set(currentId, inCurrent + 1);
        return { success: true, reset };
      },
    };
  }

  /** Slots spent by one key under one prefix, across all windows. */
  function spent(prefix: string, key: string) {
    let sum = 0;
    for (const [id, n] of buckets) if (id.startsWith(`${prefix}:${key}:`)) sum += n;
    return sum;
  }
  const emailKeyOf = (email: string) => {
    const call = calls.find((c) => c.prefix === "contact:email" && c.op === "check");
    expect(call, `no email check for ${email}`).toBeDefined();
    return call!.key;
  };

  async function loadWithLimiter() {
    vi.doMock("@upstash/ratelimit", () => ({
      Ratelimit: Object.assign(
        vi.fn().mockImplementation(function (options: Options) {
          instances.push(options);
          return limiterFor(options);
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
  const DENIED = {
    success: false,
    error: expect.stringMatching(/^Too many submissions\. Try again in /),
    code: "rate_limited",
    draft: expect.objectContaining({ message: validFields.message }),
  };
  const SENT = { success: true, error: null, code: null, submittedProjectType: "", leadSent: true };
  const warnSpy = () => vi.spyOn(console, "warn").mockImplementation(() => {});

  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2026-11-16T00:00:00Z"));
    instances.length = 0;
    calls.length = 0;
    buckets.clear();
    checkFaults = {};
    recordFaults = {};
    setupThrows = false;
    requestHeaders = {};
    mockSend.mockReset().mockResolvedValue({ data: { id: "test-id" }, error: null });
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

  // Value: protects=the three limits the owner set on #97, the burst ceiling, and their prefixes and timeouts;
  //   fails_when=a window typo, a swapped prefix, or the 5 s default timeout returns;
  //   why_new=the old limiter had one 3/hour bucket; seam=none; no_claim=Upstash accepts these options at runtime (mocked)
  it("builds daily IP, hourly IP, per-email and burst limiters with a 1 s timeout", async () => {
    const submit = await loadWithLimiter();
    await send(submit, "a@x.com");
    expect(instances.map(({ prefix, limiter, timeout }) => ({ prefix, limiter, timeout }))).toEqual([
      { prefix: "contact:ip-day", limiter: { tokens: 30, window: "1 d" }, timeout: 1000 },
      { prefix: "contact:ip", limiter: { tokens: 10, window: "1 h" }, timeout: 1000 },
      { prefix: "contact:email", limiter: { tokens: 3, window: "1 h" }, timeout: 1000 },
      { prefix: "contact:burst", limiter: { tokens: 10, window: "1 m" }, timeout: 1000 },
    ]);
  });

  // Value: protects=parallel submissions can't all slip past the spend-free check: the burst limiter spends before
  //   the send, so one IP's burst sends at most 10 and the hourly check refuses the rest afterwards;
  //   fails_when=the burst limiter is dropped or moved after the send; why_new=review found check-then-record let an
  //   unbounded parallel burst through; seam=mock limiter with a tick between check and record;
  //   no_claim=real Redis interleaving (the mock reads every check before any record)
  it("caps a parallel burst from one IP at the hourly allowance", async () => {
    const submit = await loadWithLimiter();
    requestHeaders = { "x-real-ip": "203.0.113.9" };
    const results = await Promise.all(
      Array.from({ length: 25 }, (_, i) => submit(idle, makeFormData({ ...validFields, email: `p${i}@x.com` }))),
    );
    expect(results.filter((r) => r.success)).toHaveLength(10);
    expect(results.filter((r) => r.code === "rate_limited")).toHaveLength(15);
    expect(mockSend).toHaveBeenCalledTimes(10);
    expect(await send(submit, "late@x.com")).toEqual(DENIED);
  });

  // Value: protects=a talk room on shared venue Wi-Fi gets through (#97); fails_when=the IP limit drops below 8 or
  //   the email bucket is shared across people; why_new=the 4th person on one IP was refused before; seam=none;
  //   no_claim=real venue NAT behaviour
  it("lets 8 different people on one IP write in within an hour", async () => {
    // Back to back at one instant, on purpose: a room hitting send in the same minute after a talk is the case
    // this protects (owner, #97). Never space these out to get the test passing.
    const submit = await loadWithLimiter();
    for (let i = 0; i < 8; i++) expect(await send(submit, `u${i}@x.com`)).toEqual(SENT);
  });

  // Value: protects=the hourly per-IP cap, its denial copy and log, and that a denial never sends;
  //   fails_when=the hourly limit or order changes, or the check moves after the send; why_new=new limiter;
  //   seam=none; no_claim=Upstash's window edges (mocked to its rules)
  it("rejects the 11th message from one IP within an hour without sending it", async () => {
    const warn = warnSpy();
    const submit = await loadWithLimiter();
    for (let i = 0; i < 10; i++) expect((await send(submit, `u${i}@x.com`)).success).toBe(true);
    expect((await send(submit, "u10@x.com")).error).toBe("Too many submissions. Try again in 60 minutes.");
    expect(warn).toHaveBeenCalledWith("Contact rate limit denied", { limiter: "ip" });
    expect(mockSend).toHaveBeenCalledTimes(10);
  });

  // Value: protects=the daily per-IP cap that bounds one source when the email check is dodged;
  //   fails_when=the daily limiter is dropped; why_new=new limiter; seam=none;
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
    expect((await send(submit, `u${n}@x.com`)).error).toBe("Too many submissions. Try again in 18 hours.");
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

  // Value: protects=a Resend outage never uses up a visitor's slots: only a message that reached the inbox counts
  //   (owner decision on #97); fails_when=slots are spent before or regardless of the send;
  //   why_new=the limiter used to count every attempt; seam=none; no_claim=Resend's own retry behaviour
  it("counts one slot for an email that failed 3 times and then sent", async () => {
    const submit = await loadWithLimiter();
    mockSend
      .mockResolvedValueOnce({ data: null, error: { statusCode: 500, message: "down" } })
      .mockResolvedValueOnce({ data: null, error: { statusCode: 500, message: "down" } })
      .mockRejectedValueOnce(new Error("network"));
    vi.spyOn(console, "error").mockImplementation(() => {});
    for (let i = 0; i < 3; i++) expect((await send(submit, "retry@x.com")).code).toBe("send_failed");
    expect(await send(submit, "retry@x.com")).toEqual(SENT);
    expect(spent("contact:email", emailKeyOf("retry@x.com"))).toBe(1);
  });

  // Value: protects=a failed send leaves the IP's hourly and daily counts untouched, so a room keeps its allowance;
  //   fails_when=the record step runs before or without a successful send; why_new=check-then-record is new;
  //   seam=none; no_claim=none beyond protects
  it("leaves the IP's hourly and daily counts unchanged when a send fails", async () => {
    const submit = await loadWithLimiter();
    mockSend.mockResolvedValueOnce({ data: null, error: { statusCode: 500, message: "down" } });
    vi.spyOn(console, "error").mockImplementation(() => {});
    expect((await send(submit, "a@x.com")).code).toBe("send_failed");
    expect(spent("contact:ip", "203.0.113.9")).toBe(0);
    expect(spent("contact:ip-day", "203.0.113.9")).toBe(0);
    // Only the one-minute burst ceiling spends before the send.
    expect(calls.filter((c) => c.op === "record").map((c) => c.prefix)).toEqual(["contact:burst"]);
  });

  // Value: protects=an exhausted limit still rejects before any send is attempted; fails_when=the check is skipped or
  //   only the record step enforces the limit; why_new=checks no longer spend slots; seam=none; no_claim=none beyond protects
  it("rejects an exhausted limit before attempting a send", async () => {
    const submit = await loadWithLimiter();
    for (let i = 0; i < 3; i++) await send(submit, "busy@x.com", `198.51.100.${i}`);
    mockSend.mockClear();
    expect(await send(submit, "busy@x.com", "192.0.2.1")).toEqual(DENIED);
    expect(mockSend).not.toHaveBeenCalled();
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

  // Value: protects=both IP limiters key on Vercel's x-real-ip, falling back to the trimmed leftmost x-forwarded-for,
  //   then "anonymous"; fails_when=the key reverts to the raw spoofable header or the order flips; why_new=ported from
  //   the single-limiter test; seam=none; no_claim=Vercel actually sets x-real-ip
  it("keys both IP limits on x-real-ip before the spoofable x-forwarded-for", async () => {
    const submit = await loadWithLimiter();
    const keysFor = async (h: Record<string, string>) => {
      requestHeaders = h;
      calls.length = 0;
      await submit(idle, makeFormData(validFields));
      return calls.filter((c) => c.op === "check" && c.prefix.startsWith("contact:ip")).map((c) => c.key);
    };
    expect(await keysFor({ "x-real-ip": "203.0.113.9", "x-forwarded-for": "1.2.3.4, 203.0.113.9" })).toEqual([
      "203.0.113.9",
      "203.0.113.9",
    ]);
    expect(await keysFor({ "x-forwarded-for": " 198.51.100.7 , 10.0.0.1" })).toEqual(["198.51.100.7", "198.51.100.7"]);
    expect(await keysFor({})).toEqual(["anonymous", "anonymous"]);
  });

  // Value: protects=an unavailable limiter never drops a lead, a later working limiter still applies, and the log
  //   never carries the Upstash URL; fails_when=one try wraps all checks again; why_new=per-limiter fail-open is new;
  //   seam=none; no_claim=real network latency (mocked)
  it("fails open per limiter when a check throws and logs no URL", async () => {
    const warn = warnSpy();
    const submit = await loadWithLimiter();
    checkFaults = { "contact:ip-day": "throw", "contact:ip": "throw" };
    expect((await send(submit, "a@x.com")).success).toBe(true);
    expect(warn).toHaveBeenCalledWith("Contact rate limit unavailable, failing open", {
      limiter: "ip-day",
      reason: "Error: upstash down at https://secret.upstash.example",
    });
    // The email limiter still counts and still denies.
    await send(submit, "a@x.com");
    await send(submit, "a@x.com");
    expect(await send(submit, "a@x.com")).toEqual(DENIED);
  });

  // Value: protects=hanging checks give up after 1 s in total and accept, because the three run together;
  //   fails_when=the getRemaining timeout is dropped (Upstash applies its timeout option to limit only) or the checks
  //   go back to running one after another (two hangs then take 2 s); why_new=getRemaining is new; seam=none;
  //   no_claim=real Redis latency
  it("fails open when checks hang, within one 1 s timeout", async () => {
    vi.useFakeTimers({ toFake: ["Date", "setTimeout", "clearTimeout"] });
    vi.setSystemTime(new Date("2026-11-16T00:00:00Z"));
    const warn = warnSpy();
    const submit = await loadWithLimiter();
    checkFaults = { "contact:ip-day": "hang", "contact:ip": "hang" };
    const pending = send(submit, "a@x.com");
    await vi.advanceTimersByTimeAsync(1000);
    expect((await pending).success).toBe(true);
    expect(warn).toHaveBeenCalledWith("Contact rate limit unavailable, failing open", {
      limiter: "ip-day",
      reason: "Error: timeout",
    });
  });

  // Value: protects=a failed record after a successful send still reports success; fails_when=a record error
  //   surfaces as a send failure and the visitor resends a message that already arrived; why_new=record step is new;
  //   seam=none; no_claim=none beyond protects
  it("still reports success when recording a slot fails", async () => {
    const warn = warnSpy();
    const submit = await loadWithLimiter();
    recordFaults = { "contact:email": "throw" };
    expect(await send(submit, "a@x.com")).toEqual(SENT);
    expect(warn).toHaveBeenCalledWith("Contact rate limit not recorded", expect.objectContaining({ limiter: "email" }));
    expect(spent("contact:ip", "203.0.113.9")).toBe(1);
  });

  // Value: protects=an unavailable burst limiter accepts and sends the message, warning without the Upstash URL;
  //   fails_when=the burst limit() call loses its own try and a Redis error drops the lead; why_new=burst fail-open
  //   had no test; seam=none; no_claim=how @upstash/ratelimit resolves its own timeout
  it("fails open when the burst limiter throws", async () => {
    const warn = warnSpy();
    const submit = await loadWithLimiter();
    recordFaults = { "contact:burst": "throw" };
    expect(await send(submit, "a@x.com")).toEqual(SENT);
    expect(mockSend).toHaveBeenCalledTimes(1);
    expect(warn).toHaveBeenCalledWith("Contact rate limit unavailable, failing open", {
      limiter: "burst",
      reason: "Error: upstash down at https://secret.upstash.example",
    });
    expect(spent("contact:ip", "203.0.113.9")).toBe(1);
  });

  // Value: protects=a broken Redis setup accepts the message instead of a 500; fails_when=setup moves outside the
  //   fail-open try; why_new=per-call tries no longer cover setup; seam=none; no_claim=which Upstash errors occur in practice
  it("accepts the message and warns once when limiter setup fails", async () => {
    const warn = warnSpy();
    setupThrows = true;
    const submit = await loadWithLimiter();
    expect(await send(submit, "a@x.com")).toEqual(SENT);
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls[0][1]).toMatchObject({ limiter: "setup" });
    expect(mockSend).toHaveBeenCalledTimes(1);
  });

  // Value: protects=a hung Resend call gives up after 10 s as "wasn't sent" with the draft, and records nothing;
  //   fails_when=the send timeout is dropped and the visitor waits until the platform kills the function, or a
  //   timed-out send is recorded; why_new=Codex adversarial review: no send timeout; seam=none;
  //   no_claim=a late send that still lands at Resend (can arrive twice if the visitor retries)
  it("treats a send that hangs past 10 s as failed and records nothing", async () => {
    vi.useFakeTimers({ toFake: ["Date", "setTimeout", "clearTimeout"] });
    vi.setSystemTime(new Date("2026-11-16T00:00:00Z"));
    vi.spyOn(console, "error").mockImplementation(() => {});
    const submit = await loadWithLimiter();
    mockSend.mockReturnValueOnce(new Promise(() => {}));
    const pending = send(submit, "slow@x.com");
    await vi.advanceTimersByTimeAsync(9_999);
    let settled = false;
    void pending.then(() => (settled = true));
    await vi.advanceTimersByTimeAsync(0);
    expect(settled).toBe(false);
    await vi.advanceTimersByTimeAsync(1);
    const result = await pending;
    expect(result.code).toBe("send_failed");
    expect(result.draft).toEqual({ name: validFields.name, email: "slow@x.com", message: validFields.message, projectType: "", timeline: "" });
    expect(spent("contact:ip", "203.0.113.9")).toBe(0);
    expect(spent("contact:email", emailKeyOf("slow@x.com"))).toBe(0);
  });

  // Value: protects=production logs when missing Upstash secrets leave the form unprotected, and stays quiet
  //   elsewhere; fails_when=the warning is dropped or fires in local dev; why_new=Codex adversarial review: silent
  //   fail-open on a misspelled secret; seam=none; no_claim=that anyone watches the log (no alert is wired)
  it("warns in production when the Upstash env vars are missing", async () => {
    const warn = warnSpy();
    vi.stubEnv("UPSTASH_REDIS_REST_URL", "");
    const submit = await loadWithLimiter();
    expect(await send(submit, "a@x.com")).toEqual(SENT);
    expect(warn).not.toHaveBeenCalled();
    vi.stubEnv("VERCEL_ENV", "production");
    expect(await send(submit, "b@x.com")).toEqual(SENT);
    expect(warn).toHaveBeenCalledWith("Contact rate limit disabled: Upstash env vars are not set", { limiter: "setup" });
    expect(instances).toHaveLength(0);
  });

  // Value: protects=TEST_EMAIL_ENABLED=true skips every limiter and the email outside production;
  //   fails_when=the test-run gate is dropped and local e2e burns real Upstash quota; why_new=ported; seam=none
  //   (TEST_EMAIL_ENABLED is the production switch); no_claim=TEST_EMAIL_ENABLED is never set in production
  it("skips the limiters in test runs", async () => {
    vi.stubEnv("TEST_EMAIL_ENABLED", "true");
    const submit = await loadWithLimiter();
    const result = await send(submit, "a@x.com");
    expect(result.success).toBe(true);
    // Nothing was sent, so it is not a lead.
    expect(result.leadSent).toBe(false);
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
    expect(await send(submit, "a@x.com")).toEqual(SENT);
    const prefixes = (op: string) => calls.filter((c) => c.op === op).map((c) => c.prefix).sort();
    expect(prefixes("check")).toEqual(["contact:email", "contact:ip", "contact:ip-day"]);
    expect(prefixes("record")).toEqual(["contact:burst", "contact:email", "contact:ip", "contact:ip-day"]);
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
    expect(result).toEqual({ success: true, error: null, code: null, submittedProjectType: "", leadSent: true });
    // A textarea at its 5,000-character limit arrives with CRLF line breaks.
    const crlf = await submitContact(
      idle,
      makeFormData({ ...validFields, message: ("x".repeat(99) + "\r\n").repeat(50).slice(0, -2) }),
    );
    expect(crlf).toEqual({ success: true, error: null, code: null, submittedProjectType: "", leadSent: true });
  });
});
