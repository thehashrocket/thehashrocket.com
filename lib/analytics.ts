import { sendGAEvent } from "@next/third-parties/google";
import { track } from "@vercel/analytics";

/**
 * Every conversion event the site sends, and which properties each destination gets.
 * This table is the only thing that decides what leaves the browser: `trackEvent` sends
 * a destination just the keys listed for it, so a name, email or message can never
 * ride along, and a key meant for one event is dropped on another.
 *
 * Vercel's lists hold at most 2 keys: this team is on Pro without Web Analytics Plus,
 * which allows 2 properties per custom event (8 with Plus), and Vercel does not document
 * what happens to extras. That is why Vercel's `generate_lead` leaves out `method`, which
 * is always "contact_form" (#115, D1). GA4 keeps every key it had, so its history is unbroken.
 */
export const EVENTS = {
  book_call_click: { ga: ["source"], vercel: ["source"] },
  generate_lead: { ga: ["method", "source", "offer"], vercel: ["source", "offer"] },
  offer_click: { ga: ["route", "placement"], vercel: ["route", "placement"] },
} as const satisfies Record<string, { ga: readonly string[]; vercel: readonly string[] }>;

export type EventName = keyof typeof EVENTS;

type EventKey<N extends EventName> =
  | (typeof EVENTS)[N]["ga"][number]
  | (typeof EVENTS)[N]["vercel"][number];

/** Exactly the keys this event lists, all required, so a missing or extra key fails the type check. */
export type EventProps<N extends EventName> = Record<EventKey<N>, string>;

function pick(props: Record<string, string>, keys: readonly string[]): Record<string, string> {
  return Object.fromEntries(keys.filter((key) => Object.hasOwn(props, key)).map((key) => [key, props[key]]));
}

/**
 * Vercel's `track` silently drops an event until `<Analytics />` has created `window.va`,
 * and that happens in an effect inside a Suspense boundary, which can run after a page's
 * own first-commit effects (a contact form sent before the page finished loading reports
 * its lead from one). So create the same queue the library's `initQueue` makes: Vercel's
 * script drains `window.vaq` when it loads, and `<Analytics />` keeps an existing `va` (#115, D4).
 */
function ensureVercelQueue(): void {
  if (typeof window === "undefined" || window.va) return;
  window.va = (...params) => {
    (window.vaq ??= []).push(params);
  };
}

/**
 * Sends one event to GA4 and Vercel Web Analytics, each with only its listed keys.
 * Neither library throws in the browser: `sendGAEvent` warns when GA isn't loaded, and
 * Vercel's `track` queues the event until its script loads (see `ensureVercelQueue`).
 */
export function trackEvent<N extends EventName>(name: N, props: EventProps<N>): void {
  const event = EVENTS[name];
  sendGAEvent("event", name, pick(props, event.ga));
  ensureVercelQueue();
  track(name, pick(props, event.vercel));
}
