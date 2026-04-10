import { create } from "zustand";

interface SceneState {
  currentScene: string;
  scrollProgress: number;
  morphRunning: boolean;
  setCurrentScene: (scene: string) => void;
  setScrollProgress: (progress: number) => void;
  startMorph: (target: string) => void;
  completeMorph: () => void;
  resetScene: () => void;
}

export const useSceneStore = create<SceneState>((set) => ({
  currentScene: "hero",
  scrollProgress: 0,
  morphRunning: false,
  setCurrentScene: (scene) => set({ currentScene: scene }),
  setScrollProgress: (progress) => set({ scrollProgress: progress }),
  startMorph: (target) => set({ morphRunning: true, currentScene: target }),
  completeMorph: () => set({ morphRunning: false }),
  resetScene: () => set({ currentScene: "hero", scrollProgress: 0, morphRunning: false }),
}));
