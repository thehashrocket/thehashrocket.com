import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

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

const validFields = {
  name: "Jason Shultz",
  email: "jason@example.com",
  message: "I need help with a project, can we talk?",
  website: "",
};

describe("submitContact", () => {
  let submitContact: (
    prev: { success: boolean; error: string | null },
    fd: FormData,
  ) => Promise<{ success: boolean; error: string | null }>;

  beforeEach(async () => {
    vi.resetModules();
    const mod = await import("../lib/actions");
    submitContact = mod.submitContact;
  });

  it("succeeds with valid input", async () => {
    const result = await submitContact(
      { success: false, error: null },
      makeFormData(validFields),
    );
    expect(result.success).toBe(true);
    expect(result.error).toBeNull();
  });

  it("emails known sources and qualifying answers", async () => {
    mockSend.mockClear();
    await submitContact(
      { success: false, error: null },
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
      { success: false, error: null },
      makeFormData({ ...validFields, projectType: "AI-built app review", source: "ai-app-review" }),
    );
    expect(result.success).toBe(true);
    const payload = mockSend.mock.calls[0][0];
    expect(payload.text).toContain("Needs: AI-built app review");
  });

  it("drops unknown sources and select values without failing", async () => {
    mockSend.mockClear();
    const result = await submitContact(
      { success: false, error: null },
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
      await submitContact({ success: false, error: null }, makeFormData({ ...validFields, ...fields }));
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
      { success: false, error: null },
      makeFormData({ ...validFields, name: "x".repeat(101) }),
    );
    expect(long.error).toContain("100 characters");
    const essay = await submitContact(
      { success: false, error: null },
      makeFormData({ ...validFields, message: "x".repeat(5001) }),
    );
    expect(essay.error).toContain("5,000 characters");
    const longEmail = await submitContact(
      { success: false, error: null },
      // Well-formed but 255 characters: only the length cap rejects it.
      makeFormData({ ...validFields, email: "a@" + "b".repeat(249) + ".com" }),
    );
    expect(longEmail.error).toContain("valid email");
    const fd = makeFormData(validFields);
    fd.set("name", new File(["x"], "name.txt"));
    const file = await submitContact({ success: false, error: null }, fd);
    expect(file.success).toBe(false);
  });

  it("rejects short name", async () => {
    const result = await submitContact(
      { success: false, error: null },
      makeFormData({ ...validFields, name: "J" }),
    );
    expect(result.success).toBe(false);
    expect(result.error).toContain("Name");
  });

  it("rejects invalid email", async () => {
    const result = await submitContact(
      { success: false, error: null },
      makeFormData({ ...validFields, email: "not-an-email" }),
    );
    expect(result.success).toBe(false);
    expect(result.error).toContain("email");
  });

  it("rejects short message", async () => {
    const result = await submitContact(
      { success: false, error: null },
      makeFormData({ ...validFields, message: "Hi" }),
    );
    expect(result.success).toBe(false);
    expect(result.error).toContain("Message");
  });

  it("silently succeeds on honeypot filled", async () => {
    const result = await submitContact(
      { success: false, error: null },
      makeFormData({ ...validFields, website: "spam-bot-value" }),
    );
    expect(result.success).toBe(true);
  });

  it("rejects empty name", async () => {
    const result = await submitContact(
      { success: false, error: null },
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
      { success: false, error: null },
      makeFormData(validFields),
    );
    expect(result.success).toBe(false);
    expect(result.error).toContain("Something went wrong");
  });

  it("returns failure when Resend throws an exception", async () => {
    mockSend.mockRejectedValueOnce(new Error("Network failure"));
    const result = await submitContact(
      { success: false, error: null },
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
      { success: false, error: null },
      makeFormData(validFields),
    );
    expect(result.success).toBe(false);
    expect(result.error).toContain("Something went wrong");
    vi.stubEnv("RESEND_API_KEY", "re_test_key");
  });
});

describe("submitContact rate limiting", () => {
  const mockLimit = vi.fn();
  let requestHeaders: Record<string, string> = {};

  async function loadWithLimiter() {
    vi.doMock("@upstash/ratelimit", () => ({
      Ratelimit: Object.assign(
        vi.fn().mockImplementation(function () {
          return { limit: mockLimit };
        }),
        { slidingWindow: vi.fn() },
      ),
    }));
    vi.doMock("next/headers", () => ({
      headers: async () => new Headers(requestHeaders),
    }));
    vi.resetModules();
    return (await import("../lib/actions")).submitContact;
  }

  beforeEach(() => {
    mockLimit.mockReset().mockResolvedValue({ success: true });
    requestHeaders = {};
    vi.stubEnv("UPSTASH_REDIS_REST_URL", "https://upstash.example");
    vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "token");
    vi.stubEnv("TEST_EMAIL_ENABLED", "");
  });

  afterEach(() => {
    vi.stubEnv("UPSTASH_REDIS_REST_URL", "");
    vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "");
    vi.stubEnv("TEST_EMAIL_ENABLED", "");
    vi.doUnmock("@upstash/ratelimit");
    vi.doUnmock("next/headers");
  });

  // Value: protects=the limiter keys on Vercel's x-real-ip, falling back to the trimmed leftmost x-forwarded-for, then "anonymous";
  //   fails_when=the key reverts to the raw x-forwarded-for header (a spoofer rotates it to dodge the 3/hour limit) or the order flips;
  //   why_new=no test reached the limiter: Upstash env was unset, so the IP-selection branch never ran; seam=none;
  //   no_claim=Vercel actually sets x-real-ip, or Upstash's sliding window behaviour (mocked)
  it("keys the limit on x-real-ip before the spoofable x-forwarded-for", async () => {
    const submitContact = await loadWithLimiter();
    const keyFor = async (h: Record<string, string>) => {
      requestHeaders = h;
      mockLimit.mockClear();
      await submitContact({ success: false, error: null }, makeFormData(validFields));
      return mockLimit.mock.calls[0]?.[0];
    };
    expect(await keyFor({ "x-real-ip": "203.0.113.9", "x-forwarded-for": "1.2.3.4, 203.0.113.9" })).toBe("203.0.113.9");
    expect(await keyFor({ "x-forwarded-for": " 198.51.100.7 , 10.0.0.1" })).toBe("198.51.100.7");
    expect(await keyFor({})).toBe("anonymous");
  });

  // Value: protects=a denied limit returns the "too many" error and sends no email, while TEST_EMAIL_ENABLED=true skips the limiter entirely;
  //   fails_when=the denial branch falls through to sending, or the test-run gate is dropped and local e2e burns real Upstash quota;
  //   why_new=the gate is new and no unit test exercised a denied limit; seam=none (TEST_EMAIL_ENABLED is the production switch);
  //   no_claim=TEST_EMAIL_ENABLED is never set in production
  it("blocks a denied submission and skips the limiter in test runs", async () => {
    mockLimit.mockResolvedValue({ success: false });
    mockSend.mockClear();
    const submitContact = await loadWithLimiter();
    const denied = await submitContact({ success: false, error: null }, makeFormData(validFields));
    expect(denied).toEqual({ success: false, error: "Too many submissions. Please try again later." });
    expect(mockSend).not.toHaveBeenCalled();

    vi.stubEnv("TEST_EMAIL_ENABLED", "true");
    mockLimit.mockClear();
    const testRun = await submitContact({ success: false, error: null }, makeFormData(validFields));
    expect(testRun.success).toBe(true);
    expect(mockLimit).not.toHaveBeenCalled();
    expect(mockSend).not.toHaveBeenCalled();
  });

  // Value: protects=production ignores TEST_EMAIL_ENABLED, so a stray value can't drop inquiries behind "Message sent";
  //   fails_when=the VERCEL_ENV guard is removed; why_new=the flag gated email and the limiter with no production guard;
  //   seam=none; no_claim=preview deployments still honor the flag
  it("ignores the test flag in production", async () => {
    vi.stubEnv("TEST_EMAIL_ENABLED", "true");
    vi.stubEnv("VERCEL_ENV", "production");
    mockLimit.mockResolvedValue({ success: true });
    mockLimit.mockClear();
    mockSend.mockClear();
    const submitContact = await loadWithLimiter();
    const result = await submitContact({ success: false, error: null }, makeFormData(validFields));
    expect(result).toEqual({ success: true, error: null });
    expect(mockLimit).toHaveBeenCalledTimes(1);
    expect(mockSend).toHaveBeenCalledTimes(1);
    vi.stubEnv("VERCEL_ENV", "");
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
      { success: false, error: null },
      makeFormData({ ...validFields, name: "x".repeat(100), message: "x".repeat(5000) }),
    );
    expect(result).toEqual({ success: true, error: null });
    // A textarea at its 5,000-character limit arrives with CRLF line breaks.
    const crlf = await submitContact(
      { success: false, error: null },
      makeFormData({ ...validFields, message: ("x".repeat(99) + "\r\n").repeat(50).slice(0, -2) }),
    );
    expect(crlf).toEqual({ success: true, error: null });
  });
});
