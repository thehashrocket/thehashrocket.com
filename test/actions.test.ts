import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock resend before importing the module
vi.mock("resend", () => ({
  Resend: vi.fn().mockImplementation(() => ({
    emails: {
      send: vi.fn().mockResolvedValue({ id: "test-id" }),
    },
  })),
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
});
