"use client";

import { useSceneStore } from "@/lib/store";
import { HeroScene } from "./HeroScene";
import { PharmaScene } from "./PharmaScene";

export function SceneRouter() {
  const currentScene = useSceneStore((s) => s.currentScene);
  const scrollProgress = useSceneStore((s) => s.scrollProgress);

  return (
    <>
      <HeroScene
        progress={scrollProgress}
        active={currentScene === "hero"}
      />
      <PharmaScene
        progress={scrollProgress}
        active={currentScene === "pharma-wms"}
      />
    </>
  );
}
