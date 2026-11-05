import { create } from "zustand";

interface SceneState {
  currentScene: string;
  scrollProgress: number;
  morphRunning: boolean;
  canvasDimmed: boolean;
  setCurrentScene: (scene: string) => void;
  setScrollProgress: (progress: number) => void;
  setCanvasDimmed: (dimmed: boolean) => void;
  startMorph: (target: string) => void;
  completeMorph: () => void;
  resetScene: () => void;
}

export const useSceneStore = create<SceneState>((set) => ({
  currentScene: "hero",
  scrollProgress: 0,
  morphRunning: false,
  canvasDimmed: false,
  setCurrentScene: (scene) => set({ currentScene: scene }),
  setScrollProgress: (progress) => set({ scrollProgress: progress }),
  setCanvasDimmed: (dimmed) => set({ canvasDimmed: dimmed }),
  startMorph: (target) => set({ morphRunning: true, currentScene: target }),
  completeMorph: () => set({ morphRunning: false }),
  resetScene: () =>
    set({ currentScene: "hero", scrollProgress: 0, morphRunning: false, canvasDimmed: false }),
}));
