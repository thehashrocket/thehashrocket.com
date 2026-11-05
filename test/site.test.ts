import { afterEach, describe, expect, it, vi } from "vitest";
import { getBookingUrl, getContactHref } from "../lib/site";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("getBookingUrl", () => {
  it("returns null when Cal.com is not configured", () => {
    vi.stubEnv("NEXT_PUBLIC_CALCOM_URL", "");
    expect(getBookingUrl("home")).toBeNull();
  });

  it("tags the booking URL with the source", () => {
    vi.stubEnv("NEXT_PUBLIC_CALCOM_URL", "https://example.com/me");
    expect(getBookingUrl("home")).toBe("https://example.com/me?source=home");
  });

  it("encodes a visitor-supplied source", () => {
    vi.stubEnv("NEXT_PUBLIC_CALCOM_URL", "https://example.com/me");
    expect(getBookingUrl("a&b=c")).toBe("https://example.com/me?source=a%26b%3Dc");
  });

  it("keeps a query the configured URL already has", () => {
    vi.stubEnv("NEXT_PUBLIC_CALCOM_URL", "https://example.com/me?overlayCalendar=true");
    expect(getBookingUrl("home")).toBe("https://example.com/me?overlayCalendar=true&source=home");
  });

  it("treats an unusable URL as not configured", () => {
    for (const value of ["   ", "cal.example/me", "localhost:3000/me", "javascript:alert(1)"]) {
      vi.stubEnv("NEXT_PUBLIC_CALCOM_URL", value);
      expect(getBookingUrl("home"), value).toBeNull();
    }
  });

  it("omits the query when there is no source", () => {
    vi.stubEnv("NEXT_PUBLIC_CALCOM_URL", "https://example.com/me");
    expect(getBookingUrl()).toBe("https://example.com/me");
  });
});

describe("getContactHref", () => {
  it("carries the source through to the form", () => {
    expect(getContactHref("stockton")).toBe("/contact?source=stockton");
    expect(getContactHref()).toBe("/contact");
  });
});
