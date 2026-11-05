/**
 * @vitest-environment jsdom
 */
// Value: protects=the canvas dims while case study text is on screen and clears on leaving;
//   fails_when=the trigger inverts, a Home or End jump is missed, or the dim leaks to the next page;
//   why_new=CaseStudyScroll had no tests; seam=none;
//   no_claim=rendered opacity (layout is faked here; jsdom has none)
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, render } from "@testing-library/react";
import { CaseStudyScroll } from "@/components/ui/CaseStudyScroll";
import { useSceneStore } from "@/lib/store";

vi.mock("motion/react", () => ({
  useScroll: () => ({ scrollYProgress: {} }),
  useMotionValueEvent: () => {},
}));

let top = 900;

beforeEach(() => {
  top = 900;
  useSceneStore.setState({ canvasDimmed: false });
  vi.stubGlobal("innerHeight", 800);
  vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(
    () => ({ top }) as DOMRect,
  );
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

const beats = [{ heading: "The Problem", body: "Body" }];
const scrollTo = (next: number) => {
  top = next;
  act(() => {
    window.dispatchEvent(new Event("scroll"));
  });
};
const dimmed = () => useSceneStore.getState().canvasDimmed;

describe("CaseStudyScroll canvas dimming", () => {
  it("stays bright until the narrative reaches the viewport", () => {
    render(<CaseStudyScroll beats={beats} />);
    expect(dimmed()).toBe(false);
  });

  it("dims once the narrative is in view", () => {
    render(<CaseStudyScroll beats={beats} />);
    scrollTo(500);
    expect(dimmed()).toBe(true);
  });

  it("starts dim when the page loads partway down", () => {
    top = -400;
    render(<CaseStudyScroll beats={beats} />);
    expect(dimmed()).toBe(true);
  });

  it("handles a jump straight past the narrative and back", () => {
    render(<CaseStudyScroll beats={beats} />);
    scrollTo(-2000);
    expect(dimmed()).toBe(true);
    scrollTo(900);
    expect(dimmed()).toBe(false);
  });

  it("clears on unmount and stops listening", () => {
    const { unmount } = render(<CaseStudyScroll beats={beats} />);
    scrollTo(500);
    unmount();
    expect(dimmed()).toBe(false);

    scrollTo(100);
    expect(dimmed()).toBe(false);
  });
});
