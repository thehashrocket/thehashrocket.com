/**
 * @vitest-environment jsdom
 */
// Value: protects=a lead reported before <Analytics /> has started (its effect runs inside a Suspense boundary,
//   possibly after the page's own first-commit effects) is queued for Vercel instead of dropped (#115, D4);
//   fails_when=trackEvent stops creating window.va, or the queue loses the event or its properties;
//   why_new=the Vercel library is mocked everywhere else; seam=none (the real @vercel/analytics track runs);
//   no_claim=Vercel's script draining window.vaq after it loads (third-party, not loaded in jsdom)
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@next/third-parties/google", () => ({ sendGAEvent: vi.fn() }));

const { trackEvent } = await import("@/lib/analytics");

afterEach(() => {
  delete window.va;
  delete window.vaq;
});

describe("Vercel queue before <Analytics /> starts", () => {
  it("queues the event, with only its Vercel properties", () => {
    expect(window.va).toBeUndefined();
    trackEvent("generate_lead", { method: "contact_form", source: "talks", offer: "none" });
    expect(window.vaq).toHaveLength(1);
    const [kind, payload] = window.vaq![0];
    expect(kind).toBe("event");
    expect(payload).toMatchObject({ name: "generate_lead", data: { source: "talks", offer: "none" } });
    expect((payload as { data: Record<string, unknown> }).data).not.toHaveProperty("method");
  });

  it("leaves an existing window.va alone", () => {
    const va = vi.fn();
    window.va = va;
    trackEvent("book_call_click", { source: "home" });
    expect(window.va).toBe(va);
    expect(va).toHaveBeenCalledWith("event", expect.objectContaining({ name: "book_call_click" }));
    expect(window.vaq).toBeUndefined();
  });
});
