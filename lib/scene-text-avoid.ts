// Keeps the hero scene's background dots off body text (#109). The scene projects each
// dot to viewport pixels every frame and fades it out while it sits over a text block.
// Kept free of three.js so it can be unit-tested in jsdom.

export interface Rect {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

/** Text-bearing elements inside the page body. Cards and list items count as whole blocks. */
export const TEXT_SELECTOR = "main :is(h1, h2, h3, h4, p, li, dt, dd, label, blockquote, figcaption, td, th)";

/** Extra room around each block, in CSS pixels, so a dot's own radius and glow clear the letters. */
export const TEXT_PADDING_PX = 12;

/** The rects of text blocks that are at least partly on screen, grown by `pad`. */
export function readTextRects(doc: Document, viewport: { width: number; height: number }, pad = TEXT_PADDING_PX): Rect[] {
  const rects: Rect[] = [];
  for (const el of doc.querySelectorAll(TEXT_SELECTOR)) {
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) continue;
    if (r.bottom < 0 || r.top > viewport.height || r.right < 0 || r.left > viewport.width) continue;
    rects.push({ left: r.left - pad, top: r.top - pad, right: r.right + pad, bottom: r.bottom + pad });
  }
  return rects;
}

/** Whether a viewport point lies inside any rect. */
export function isOverText(x: number, y: number, rects: readonly Rect[]): boolean {
  return rects.some((r) => x >= r.left && x <= r.right && y >= r.top && y <= r.bottom);
}

/** Normalized device coordinates (-1..1, y up) to viewport pixels (y down). */
export function ndcToViewport(ndcX: number, ndcY: number, width: number, height: number): { x: number; y: number } {
  return { x: ((ndcX + 1) / 2) * width, y: ((1 - ndcY) / 2) * height };
}

/**
 * Moves `current` toward `target` at `perSecond` opacity units per second, never overshooting.
 * `instant` (reduced motion) jumps straight there.
 */
export function stepOpacity(current: number, target: number, delta: number, perSecond: number, instant = false): number {
  if (instant) return target;
  const step = perSecond * delta;
  if (Math.abs(target - current) <= step) return target;
  return current + Math.sign(target - current) * step;
}
