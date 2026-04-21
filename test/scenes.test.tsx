/**
 * @vitest-environment jsdom
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import "@testing-library/jest-dom/vitest";
import { render } from "@testing-library/react";
import React from "react";

vi.mock("@react-three/fiber", () => ({
  useFrame: vi.fn(),
}));

// jsdom doesn't implement matchMedia
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

let mockCurrentScene = "hero";
let mockScrollProgress = 0;

vi.mock("@/lib/store", () => ({
  useSceneStore: (selector: (s: { currentScene: string; scrollProgress: number }) => unknown) =>
    selector({ currentScene: mockCurrentScene, scrollProgress: mockScrollProgress }),
}));

describe("NonprofitScene", () => {
  it("returns null when inactive", async () => {
    const { NonprofitScene } = await import(
      "@/components/scenes/NonprofitScene"
    );
    const { container } = render(
      <NonprofitScene progress={0} active={false} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders without crash when active at progress 0", async () => {
    const { NonprofitScene } = await import(
      "@/components/scenes/NonprofitScene"
    );
    expect(() =>
      render(<NonprofitScene progress={0} active={true} />),
    ).not.toThrow();
  });

  it("renders without crash when active at progress 1", async () => {
    const { NonprofitScene } = await import(
      "@/components/scenes/NonprofitScene"
    );
    expect(() =>
      render(<NonprofitScene progress={1} active={true} />),
    ).not.toThrow();
  });
});

describe("GrantScene", () => {
  it("returns null when inactive", async () => {
    const { GrantScene } = await import("@/components/scenes/GrantScene");
    const { container } = render(<GrantScene progress={0} active={false} />);
    expect(container.firstChild).toBeNull();
  });

  it("renders without crash when active at progress 0", async () => {
    const { GrantScene } = await import("@/components/scenes/GrantScene");
    expect(() =>
      render(<GrantScene progress={0} active={true} />),
    ).not.toThrow();
  });

  it("renders without crash when active at progress 1", async () => {
    const { GrantScene } = await import("@/components/scenes/GrantScene");
    expect(() =>
      render(<GrantScene progress={1} active={true} />),
    ).not.toThrow();
  });
});

describe("PrintPortalScene", () => {
  it("returns null when inactive", async () => {
    const { PrintPortalScene } = await import(
      "@/components/scenes/PrintPortalScene"
    );
    const { container } = render(
      <PrintPortalScene progress={0} active={false} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders without crash when active at progress 0", async () => {
    const { PrintPortalScene } = await import(
      "@/components/scenes/PrintPortalScene"
    );
    expect(() =>
      render(<PrintPortalScene progress={0} active={true} />),
    ).not.toThrow();
  });

  it("renders without crash when active at progress 1", async () => {
    const { PrintPortalScene } = await import(
      "@/components/scenes/PrintPortalScene"
    );
    expect(() =>
      render(<PrintPortalScene progress={1} active={true} />),
    ).not.toThrow();
  });
});

describe("SceneRouter routing", () => {
  beforeEach(() => {
    mockScrollProgress = 0.5;
  });

  it("renders NonprofitScene for nonprofit-matching", async () => {
    mockCurrentScene = "nonprofit-matching";
    const { SceneRouter } = await import("@/components/scenes/SceneRouter");
    expect(() => render(<SceneRouter />)).not.toThrow();
  });

  it("renders GrantScene for grant-discovery", async () => {
    mockCurrentScene = "grant-discovery";
    const { SceneRouter } = await import("@/components/scenes/SceneRouter");
    expect(() => render(<SceneRouter />)).not.toThrow();
  });

  it("renders PrintPortalScene for print-portal", async () => {
    mockCurrentScene = "print-portal";
    const { SceneRouter } = await import("@/components/scenes/SceneRouter");
    expect(() => render(<SceneRouter />)).not.toThrow();
  });
});
