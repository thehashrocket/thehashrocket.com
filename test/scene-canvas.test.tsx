/**
 * @vitest-environment jsdom
 */

import { describe, it, expect, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { render, screen, act } from "@testing-library/react";

vi.mock("@/lib/webgl", () => ({
  isWebGLSupported: () => false,
}));

vi.mock("@react-three/fiber", () => ({
  Canvas: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="r3f-canvas">{children}</div>
  ),
}));

vi.mock("@/components/scenes/SceneRouter", () => ({
  SceneRouter: () => null,
}));

describe("SceneCanvas", () => {
  it("renders StaticFallback when WebGL is unsupported", async () => {
    const { default: SceneCanvas } = await import(
      "@/components/layout/SceneCanvas"
    );
    await act(async () => {
      render(<SceneCanvas />);
    });
    expect(screen.queryByTestId("r3f-canvas")).not.toBeInTheDocument();
    expect(document.querySelector(".fixed.inset-0.-z-10")).toBeInTheDocument();
  });
});
