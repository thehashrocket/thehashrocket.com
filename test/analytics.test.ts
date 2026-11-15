// Value: protects=each destination gets only the keys the EVENTS table lists for it, so nothing unlisted (a name,
//   email or message, or another event's key) leaves the browser, and Vercel stays inside Pro's 2-property cap
//   (#115 item 3, D1, D2);
//   fails_when=the filter is removed, reads the other destination's list, or a Vercel list grows past 2 keys;
//   why_new=lib/analytics.ts is new; seam=none;
//   no_claim=what GA4 or Vercel do with what they receive (both mocked)
import { afterEach, describe, expect, it, vi } from "vitest";
import type { EventProps } from "@/lib/analytics";

const { sendGAEvent, track } = vi.hoisted(() => ({ sendGAEvent: vi.fn(), track: vi.fn() }));
vi.mock("@next/third-parties/google", () => ({ sendGAEvent }));
vi.mock("@vercel/analytics", () => ({ track }));

const { EVENTS, trackEvent } = await import("@/lib/analytics");

afterEach(() => {
  sendGAEvent.mockClear();
  track.mockClear();
});

describe("trackEvent", () => {
  it("sends each destination only its listed keys", () => {
    trackEvent("generate_lead", { method: "contact_form", source: "talks", offer: "A talk for my group" });
    expect(sendGAEvent).toHaveBeenCalledWith("event", "generate_lead", {
      method: "contact_form",
      source: "talks",
      offer: "A talk for my group",
    });
    expect(track).toHaveBeenCalledWith("generate_lead", { source: "talks", offer: "A talk for my group" });
  });

  it("drops any property not on the event's list, in both destinations", () => {
    const leaky = {
      route: "/talks",
      placement: "home-services",
      email: "someone@example.com",
      name: "Someone",
      message: "Hello there",
      source: "talks",
    };
    // The types already reject these keys; the cast proves the runtime filter holds too.
    trackEvent("offer_click", leaky as unknown as EventProps<"offer_click">);
    expect(sendGAEvent).toHaveBeenCalledWith("event", "offer_click", { route: "/talks", placement: "home-services" });
    expect(track).toHaveBeenCalledWith("offer_click", { route: "/talks", placement: "home-services" });
  });

  it("keeps every Vercel event within Pro's 2-property limit", () => {
    for (const [name, event] of Object.entries(EVENTS)) {
      expect(event.vercel.length, name).toBeLessThanOrEqual(2);
    }
  });
});
