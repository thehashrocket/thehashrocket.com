/**
 * @vitest-environment jsdom
 */

import { describe, it, expect, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { SceneSync } from "../components/ui/SceneSync";
import { useSceneStore } from "../lib/store";

describe("SceneSync", () => {
  beforeEach(() => {
    useSceneStore.getState().resetScene();
  });

  it("calls setCurrentScene with the slug on mount", () => {
    render(<SceneSync slug="pharma-wms" />);
    expect(useSceneStore.getState().currentScene).toBe("pharma-wms");
  });

  it("calls resetScene on unmount", () => {
    const { unmount } = render(<SceneSync slug="pharma-wms" />);
    expect(useSceneStore.getState().currentScene).toBe("pharma-wms");
    unmount();
    expect(useSceneStore.getState().currentScene).toBe("hero");
  });

  it("updates the scene when slug prop changes", () => {
    const { rerender } = render(<SceneSync slug="pharma-wms" />);
    expect(useSceneStore.getState().currentScene).toBe("pharma-wms");
    rerender(<SceneSync slug="nonprofit-matching" />);
    expect(useSceneStore.getState().currentScene).toBe("nonprofit-matching");
  });

  it("renders a sr-only sentinel with the active scene slug", () => {
    const { getByTestId } = render(<SceneSync slug="grant-discovery" />);
    const sentinel = getByTestId("current-scene");
    expect(sentinel.getAttribute("data-scene")).toBe("grant-discovery");
    expect(sentinel.classList.contains("sr-only")).toBe(true);
  });
});
