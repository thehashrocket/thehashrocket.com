/**
 * @vitest-environment jsdom
 */
// Value: protects=the hero scene's dots fade out over page text and back in off it, in viewport pixels, under
//   reduced motion too (#109); fails_when=the projection flips y, a block partly scrolled off screen is dropped,
//   a dot just inside a padded text block counts as clear, off-screen or hidden blocks are measured, text outside <main> counts, or the fade overshoots;
//   why_new=new helper; seam=none (the scene calls these exact functions; getBoundingClientRect stubbed in jsdom);
//   no_claim=how the dots look in WebGL (checked by screenshot)
import { afterEach, describe, expect, it } from "vitest";
import {
  TEXT_PADDING_PX,
  isOverText,
  ndcToViewport,
  readTextRects,
  stepOpacity,
} from "../lib/scene-text-avoid";

function place(el: Element, r: { left: number; top: number; width: number; height: number }) {
  el.getBoundingClientRect = () =>
    ({ ...r, right: r.left + r.width, bottom: r.top + r.height, x: r.left, y: r.top, toJSON: () => r }) as DOMRect;
}

afterEach(() => {
  document.body.innerHTML = "";
});

describe("ndcToViewport", () => {
  it("maps the NDC corners to viewport pixels with y pointing down", () => {
    expect(ndcToViewport(-1, 1, 1440, 900)).toEqual({ x: 0, y: 0 });
    expect(ndcToViewport(1, -1, 1440, 900)).toEqual({ x: 1440, y: 900 });
    expect(ndcToViewport(0, 0, 1440, 900)).toEqual({ x: 720, y: 450 });
  });
});

describe("readTextRects and isOverText", () => {
  it("measures on-screen text inside <main>, padded, and skips hidden, off-screen and outside blocks", () => {
    document.body.innerHTML = `
      <header><p id="nav">nav</p></header>
      <main>
        <h1 id="h1">Title</h1>
        <p id="below">far below</p>
        <p id="hidden"></p>
        <p id="straddle">half scrolled off the top</p>
      </main>`;
    place(document.getElementById("nav")!, { left: 0, top: 0, width: 200, height: 40 });
    place(document.getElementById("h1")!, { left: 100, top: 100, width: 400, height: 60 });
    place(document.getElementById("below")!, { left: 100, top: 2000, width: 400, height: 20 });
    place(document.getElementById("hidden")!, { left: 0, top: 0, width: 0, height: 0 });
    // Partly on screen still counts: dots must clear the visible half of a block scrolling out of view.
    place(document.getElementById("straddle")!, { left: 600, top: -30, width: 300, height: 60 });

    const rects = readTextRects(document, { width: 1440, height: 900 });
    expect(rects).toEqual([
      { left: 100 - TEXT_PADDING_PX, top: 100 - TEXT_PADDING_PX, right: 500 + TEXT_PADDING_PX, bottom: 160 + TEXT_PADDING_PX },
      { left: 600 - TEXT_PADDING_PX, top: -30 - TEXT_PADDING_PX, right: 900 + TEXT_PADDING_PX, bottom: 30 + TEXT_PADDING_PX },
    ]);
    expect(isOverText(300, 130, rects)).toBe(true);
    expect(isOverText(100 - TEXT_PADDING_PX + 1, 130, rects)).toBe(true);
    expect(isOverText(100 - TEXT_PADDING_PX - 1, 130, rects)).toBe(false);
    expect(isOverText(50, 20, rects)).toBe(false);
  });
});

describe("stepOpacity", () => {
  it("fades toward the target without overshooting, and jumps when instant", () => {
    expect(stepOpacity(0.5, 0, 0.1, 2)).toBeCloseTo(0.3);
    expect(stepOpacity(0.1, 0, 0.1, 2)).toBe(0);
    expect(stepOpacity(0, 0.5, 0.1, 2)).toBeCloseTo(0.2);
    expect(stepOpacity(0.5, 0, 0.01, 2, true)).toBe(0);
  });
});
