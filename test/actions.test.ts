import { describe, it, expect, vi, beforeEach } from "vitest";

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
