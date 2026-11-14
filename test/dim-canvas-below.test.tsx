/**
 * @vitest-environment jsdom
 */
// Value: protects=offer pages dim the scene once body text reaches mid-viewport, clear it on leaving,
//   and every offer page carries the marker; fails_when=the 0.5 threshold drifts, the dim leaks to the next page,
//   a new offer page skips <DimCanvasBelow />, or a page mounts it next to CaseStudyScroll;
//   why_new=dimming moved from CaseStudyScroll into a shared hook; seam=none;
//   no_claim=rendered opacity (jsdom has no layout; the e2e offer-dimming spec covers it)
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, render } from "@testing-library/react";
import { DimCanvasBelow } from "@/components/ui/DimCanvasBelow";
import { OFFER_ROUTES } from "@/lib/site";
import { useSceneStore } from "@/lib/store";

let top = 900;

beforeEach(() => {
  top = 900;
  useSceneStore.setState({ canvasDimmed: false });
  vi.stubGlobal("innerHeight", 800);
  vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(() => ({ top }) as DOMRect);
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

const scrollTo = (next: number) => {
  top = next;
  act(() => {
    window.dispatchEvent(new Event("scroll"));
  });
};
const dimmed = () => useSceneStore.getState().canvasDimmed;

describe("DimCanvasBelow", () => {
  it("stays bright while the marker is below mid-viewport", () => {
    render(<DimCanvasBelow />);
    scrollTo(401);
    expect(dimmed()).toBe(false);
  });

  it("dims once the marker passes mid-viewport, and brightens on scrolling back", () => {
    render(<DimCanvasBelow />);
    scrollTo(399);
    expect(dimmed()).toBe(true);
    scrollTo(900);
    expect(dimmed()).toBe(false);
  });

  it("clears on unmount and stops listening", () => {
    const { unmount } = render(<DimCanvasBelow />);
    scrollTo(100);
    unmount();
    expect(dimmed()).toBe(false);
    scrollTo(50);
    expect(dimmed()).toBe(false);
  });
});

describe("offer pages carry the dimming marker", () => {
  for (const route of OFFER_ROUTES) {
    const source = readFileSync(`app${route}/page.tsx`, "utf8");

    it(`${route} renders <DimCanvasBelow />`, () => {
      const imported = /import \{ DimCanvasBelow \} from "@\/components\/ui\/DimCanvasBelow"/.test(source);
      const rendered = /<DimCanvasBelow \/>/.test(source);
      expect(imported && rendered, `${route}: place <DimCanvasBelow /> right after the hero section`).toBe(true);
    });

    it(`${route} does not also mount CaseStudyScroll`, () => {
      expect(source, `${route}: CaseStudyScroll and DimCanvasBelow both own the canvas dim flag`).not.toMatch(
        /CaseStudyScroll/,
      );
    });
  }
});

function pageFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) return pageFiles(path);
    return entry === "page.tsx" ? [path] : [];
  });
}

describe("one dimming owner per page", () => {
  it("no page renders both DimCanvasBelow and CaseStudyScroll", () => {
    const both = pageFiles("app").filter((path) => {
      const source = readFileSync(path, "utf8");
      return source.includes("<DimCanvasBelow") && source.includes("CaseStudyScroll");
    });
    expect(both, "both reset the canvas dim flag on unmount; keep one per page").toEqual([]);
  });
});
