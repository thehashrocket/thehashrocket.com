import { describe, it, expect, beforeEach } from "vitest";
import { useSceneStore } from "../lib/store";

describe("useSceneStore", () => {
  beforeEach(() => {
    useSceneStore.getState().resetScene();
  });

  it("has correct initial state", () => {
    const state = useSceneStore.getState();
    expect(state.currentScene).toBe("hero");
    expect(state.scrollProgress).toBe(0);
    expect(state.morphRunning).toBe(false);
  });

  it("setCurrentScene updates the scene", () => {
    useSceneStore.getState().setCurrentScene("pharma-wms");
    expect(useSceneStore.getState().currentScene).toBe("pharma-wms");
  });

  it("setScrollProgress clamps to the given value", () => {
    useSceneStore.getState().setScrollProgress(0.75);
    expect(useSceneStore.getState().scrollProgress).toBe(0.75);
  });

  it("startMorph sets morphRunning and changes scene", () => {
    useSceneStore.getState().startMorph("pharma-wms");
    const state = useSceneStore.getState();
    expect(state.morphRunning).toBe(true);
    expect(state.currentScene).toBe("pharma-wms");
  });

  it("completeMorph clears morphRunning", () => {
    useSceneStore.getState().startMorph("pharma-wms");
    useSceneStore.getState().completeMorph();
    expect(useSceneStore.getState().morphRunning).toBe(false);
  });

  it("resetScene returns to initial state", () => {
    useSceneStore.getState().setCurrentScene("pharma-wms");
    useSceneStore.getState().setScrollProgress(0.5);
    useSceneStore.getState().startMorph("about");
    useSceneStore.getState().resetScene();
    const state = useSceneStore.getState();
    expect(state.currentScene).toBe("hero");
    expect(state.scrollProgress).toBe(0);
    expect(state.morphRunning).toBe(false);
  });
});
