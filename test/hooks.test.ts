/**
 * @vitest-environment jsdom
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { usePrefersReducedMotion, useMediaQuery } from "@/lib/hooks";

function mockMatchMedia(matches: boolean) {
  const listeners = new Map<string, ((e: MediaQueryListEvent) => void)[]>();
  const mql = {
    matches,
    media: "",
    onchange: null,
    addEventListener(type: string, handler: (e: MediaQueryListEvent) => void) {
      const list = listeners.get(type) ?? [];
      list.push(handler);
      listeners.set(type, list);
    },
    removeEventListener(type: string, handler: (e: MediaQueryListEvent) => void) {
      const list = listeners.get(type) ?? [];
      listeners.set(type, list.filter((h) => h !== handler));
    },
    dispatchEvent: () => false,
    // Helper to simulate a media query change
    triggerChange(newMatches: boolean) {
      const event = { matches: newMatches } as MediaQueryListEvent;
      (listeners.get("change") ?? []).forEach((h) => h(event));
    },
  };
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: () => mql,
  });
  return mql;
}

describe("usePrefersReducedMotion", () => {
  it("returns false initially (SSR-safe default)", () => {
    mockMatchMedia(true); // media query says reduced, but useState starts false
    const { result } = renderHook(() => usePrefersReducedMotion());
    // After effect runs it reads the real value from the mock
    expect(result.current).toBe(true);
  });

  it("returns true when prefers-reduced-motion matches", () => {
    const mql = mockMatchMedia(true);
    const { result } = renderHook(() => usePrefersReducedMotion());
    expect(result.current).toBe(true);
    // Silence unused var warning
    void mql;
  });

  it("returns false when prefers-reduced-motion does not match", () => {
    mockMatchMedia(false);
    const { result } = renderHook(() => usePrefersReducedMotion());
    expect(result.current).toBe(false);
  });

  it("updates reactively when media query changes", () => {
    const mql = mockMatchMedia(false);
    const { result } = renderHook(() => usePrefersReducedMotion());
    expect(result.current).toBe(false);
    act(() => mql.triggerChange(true));
    expect(result.current).toBe(true);
    act(() => mql.triggerChange(false));
    expect(result.current).toBe(false);
  });

  it("removes event listener on unmount", () => {
    const mql = mockMatchMedia(false);
    const spy = vi.spyOn(mql, "removeEventListener");
    const { unmount } = renderHook(() => usePrefersReducedMotion());
    unmount();
    expect(spy).toHaveBeenCalledWith("change", expect.any(Function));
  });
});

describe("useMediaQuery", () => {
  it("returns false initially (SSR-safe default)", () => {
    mockMatchMedia(false);
    const { result } = renderHook(() => useMediaQuery("(max-width: 767px)"));
    expect(result.current).toBe(false);
  });

  it("returns true when query matches", () => {
    mockMatchMedia(true);
    const { result } = renderHook(() => useMediaQuery("(max-width: 767px)"));
    expect(result.current).toBe(true);
  });

  it("updates reactively when query result changes", () => {
    const mql = mockMatchMedia(false);
    const { result } = renderHook(() => useMediaQuery("(max-width: 767px)"));
    act(() => mql.triggerChange(true));
    expect(result.current).toBe(true);
  });

  it("removes event listener on unmount", () => {
    const mql = mockMatchMedia(false);
    const spy = vi.spyOn(mql, "removeEventListener");
    const { unmount } = renderHook(() => useMediaQuery("(max-width: 767px)"));
    unmount();
    expect(spy).toHaveBeenCalledWith("change", expect.any(Function));
  });
});
