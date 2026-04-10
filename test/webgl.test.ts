/**
 * @vitest-environment happy-dom
 */
import { describe, it, expect, vi } from "vitest";
import { isWebGLSupported } from "../lib/webgl";

describe("isWebGLSupported", () => {
  it("returns true when webgl2 context is available", () => {
    const mockCanvas = {
      getContext: vi.fn().mockReturnValue({}),
    };
    vi.spyOn(document, "createElement").mockReturnValue(
      mockCanvas as unknown as HTMLCanvasElement,
    );
    expect(isWebGLSupported()).toBe(true);
    expect(mockCanvas.getContext).toHaveBeenCalledWith("webgl2");
  });

  it("falls back to webgl when webgl2 is unavailable", () => {
    const mockCanvas = {
      getContext: vi.fn((ctx: string) => (ctx === "webgl" ? {} : null)),
    };
    vi.spyOn(document, "createElement").mockReturnValue(
      mockCanvas as unknown as HTMLCanvasElement,
    );
    expect(isWebGLSupported()).toBe(true);
  });

  it("returns false when no webgl context is available", () => {
    const mockCanvas = {
      getContext: vi.fn().mockReturnValue(null),
    };
    vi.spyOn(document, "createElement").mockReturnValue(
      mockCanvas as unknown as HTMLCanvasElement,
    );
    expect(isWebGLSupported()).toBe(false);
  });

  it("returns false when canvas creation throws", () => {
    vi.spyOn(document, "createElement").mockImplementation(() => {
      throw new Error("Not supported");
    });
    expect(isWebGLSupported()).toBe(false);
  });
});
