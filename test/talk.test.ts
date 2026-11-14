// Value: protects=the /talks H1 stays short enough for a phone's first screen, with three takeaways;
//   fails_when=the title grows past 60 characters or a takeaway is dropped or duplicated;
//   why_new=TALK_TITLE is owner-written and replaced before merge; seam=none;
//   no_claim=the 375×560 fit itself (test/e2e/offer-pages.spec.ts checks it)
import { describe, expect, it } from "vitest";
import { TALK_TAKEAWAYS, TALK_TITLE } from "@/lib/talk";

describe("talk content", () => {
  it("keeps the title to 60 characters", () => {
    expect(TALK_TITLE.trim().length).toBeGreaterThan(0);
    expect(TALK_TITLE.length, "shorten TALK_TITLE in lib/talk.ts, then re-check /talks at 375×560").toBeLessThanOrEqual(60);
  });

  it("lists three distinct takeaways", () => {
    expect(TALK_TAKEAWAYS).toHaveLength(3);
    expect(new Set(TALK_TAKEAWAYS).size).toBe(3);
  });
});
