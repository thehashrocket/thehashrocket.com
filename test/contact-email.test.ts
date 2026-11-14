import { describe, expect, it } from "vitest";
import { tooManyMessage } from "@/lib/contact-email";

const NOW = Date.UTC(2026, 10, 16, 0, 0, 0);

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
