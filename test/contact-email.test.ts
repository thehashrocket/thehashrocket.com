import { describe, expect, it } from "vitest";
import { afterEach, vi } from "vitest";
import { CONTACT_FROM_FALLBACK, contactFromAddress, isSingleEmailAddress, tooManyMessage } from "@/lib/contact-email";

const NOW = Date.UTC(2026, 10, 16, 0, 0, 0);

// Value: protects=the fallback sender is on the one domain Resend and DMARC accept (#104); fails_when=it moves to the
//   root jasonshultz.com (strict DMARC p=reject and a key restricted to mail.jasonshultz.com reject it) or back to the
//   old domain; why_new=#104 moved mail to jasonshultz.com; seam=none;
//   no_claim=the live RESEND_FROM_EMAIL value in Vercel (checked by hand before merge)
describe("CONTACT_FROM_FALLBACK", () => {
  it("sends from mail.jasonshultz.com exactly", () => {
    expect(CONTACT_FROM_FALLBACK.split("@")[1]).toBe("mail.jasonshultz.com");
  });
});

// Value: protects=the visitor's address can be the email's Reply-To and still reach exactly one person (#104);
//   fails_when=a list (comma or semicolon), a display name (< > or quotes) or a line break passes the check;
//   why_new=the address now becomes replyTo; seam=none; no_claim=whether the mailbox exists
describe("isSingleEmailAddress", () => {
  it.each(["pat@example.com", "pat.o+tag@sub.example.co", "o'brien@example.com", "PAT@EXAMPLE.COM", "a@xn--mnchen-3ya.de"])("accepts %s", (value) => {
    expect(isSingleEmailAddress(value)).toBe(true);
  });
  it.each([
    "a@x.com,b@y.com",
    "a@x.com;b@y.com",
    "Pat <pat@example.com>",
    '"pat"@example.com',
    "pat@example.com\r\nBcc: x@y.com",
    "pat @example.com",
    "pat@example",
    "@example.com",
    "a(b)@x.com",
    "g:a@x.com",
    "a@x..com",
    "a@x.com.",
    "pat\u0000@example.com",
    "pat\u200b@example.com",
    ".pat@example.com",
    "pat.@example.com",
    "pa..t@example.com",
    `pat@${"a".repeat(64)}.com`,
  ])("rejects %j", (value) => {
    expect(isSingleEmailAddress(value)).toBe(false);
  });
});

// Value: protects=a stale, root-domain, padded or display-name RESEND_FROM_EMAIL can't make every send fail (#104);
//   fails_when=the env value is used verbatim or the domain check loosens; why_new=review finding (production sets the
//   variable, so the fallback never applied); seam=none; no_claim=what Resend accepts (mocked elsewhere)
describe("contactFromAddress", () => {
  afterEach(() => vi.restoreAllMocks());

  it("uses a configured address on mail.jasonshultz.com, trimmed, in any letter case", () => {
    expect(contactFromAddress(" contact@mail.jasonshultz.com\n")).toBe("contact@mail.jasonshultz.com");
    expect(contactFromAddress("Contact@MAIL.JasonShultz.com")).toBe("Contact@MAIL.JasonShultz.com");
  });

  it("falls back, with a warning, for anything else", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const bad = [
      "contact@thehashrocket.com",
      "jason@jasonshultz.com",
      "Contact <contact@mail.jasonshultz.com>",
      "evil@xmail.jasonshultz.com",
      "a@b.mail.jasonshultz.com",
    ];
    for (const value of bad) expect(contactFromAddress(value), value).toBe(CONTACT_FROM_FALLBACK);
    expect(warn).toHaveBeenCalledTimes(bad.length);
  });

  it("falls back quietly when unset or empty", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    expect(contactFromAddress(undefined)).toBe(CONTACT_FROM_FALLBACK);
    expect(contactFromAddress("  ")).toBe(CONTACT_FROM_FALLBACK);
    expect(warn).not.toHaveBeenCalled();
  });
});

// Value: protects=a rate-limited visitor is told how long to wait, from the limiter's reset time (#97);
//   fails_when=the wait rounds down to "0 minutes", reads "1 minutes", shows a long daily wait in minutes, or a
//   missing reset yields "NaN"; why_new=#97 asks for "Try again in N minutes"; seam=none;
//   no_claim=that Upstash's reset matches when a sliding-window slot actually frees
describe("tooManyMessage", () => {
  it("rounds the wait up to whole minutes and words one minute", () => {
    expect(tooManyMessage(NOW + 1_000, NOW)).toBe("Too many submissions. Try again in 1 minute.");
    expect(tooManyMessage(NOW + 12 * 60_000 - 1, NOW)).toBe("Too many submissions. Try again in 12 minutes.");
    expect(tooManyMessage(NOW + 60 * 60_000, NOW)).toBe("Too many submissions. Try again in 60 minutes.");
  });

  it("switches to hours past an hour", () => {
    expect(tooManyMessage(NOW + 61 * 60_000, NOW)).toBe("Too many submissions. Try again in 2 hours.");
    expect(tooManyMessage(NOW + 18 * 3_600_000, NOW)).toBe("Too many submissions. Try again in 18 hours.");
  });

  it("falls back to 'later' without a usable reset", () => {
    for (const reset of [undefined, NOW, NOW - 5_000, Number.NaN]) {
      expect(tooManyMessage(reset, NOW)).toBe("Too many submissions. Please try again later.");
    }
  });
});
