/**
 * @vitest-environment happy-dom
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

describe("isWebGLSupported", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.restoreAllMocks();
  });

  it("returns true when webgl2 context is available", async () => {
    const { isWebGLSupported } = await import("../lib/webgl");
    const mockCanvas = {
      getContext: vi.fn().mockReturnValue({}),
    };
    vi.spyOn(document, "createElement").mockReturnValue(
      mockCanvas as unknown as HTMLCanvasElement,
    );
    expect(isWebGLSupported()).toBe(true);
    expect(mockCanvas.getContext).toHaveBeenCalledWith("webgl2");
  });

  it("falls back to webgl when webgl2 is unavailable", async () => {
    const { isWebGLSupported } = await import("../lib/webgl");
    const mockCanvas = {
      getContext: vi.fn((ctx: string) => (ctx === "webgl" ? {} : null)),
    };
    vi.spyOn(document, "createElement").mockReturnValue(
      mockCanvas as unknown as HTMLCanvasElement,
    );
    expect(isWebGLSupported()).toBe(true);
  });

  it("returns false when no webgl context is available", async () => {
    const { isWebGLSupported } = await import("../lib/webgl");
    const mockCanvas = {
      getContext: vi.fn().mockReturnValue(null),
    };
    vi.spyOn(document, "createElement").mockReturnValue(
      mockCanvas as unknown as HTMLCanvasElement,
    );
    expect(isWebGLSupported()).toBe(false);
  });

  it("returns false when canvas creation throws", async () => {
    const { isWebGLSupported } = await import("../lib/webgl");
    vi.spyOn(document, "createElement").mockImplementation(() => {
      throw new Error("Not supported");
    });
    expect(isWebGLSupported()).toBe(false);
  });

  it("caches the result and only calls getContext once", async () => {
    const { isWebGLSupported } = await import("../lib/webgl");
    const mockCanvas = {
      getContext: vi.fn().mockReturnValue({}),
    };
    vi.spyOn(document, "createElement").mockReturnValue(
      mockCanvas as unknown as HTMLCanvasElement,
    );
    expect(isWebGLSupported()).toBe(true);
    expect(isWebGLSupported()).toBe(true);
    expect(mockCanvas.getContext).toHaveBeenCalledTimes(1);
  });
});
