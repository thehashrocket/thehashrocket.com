"use client";

import { useSceneStore } from "@/lib/store";
import { HeroScene } from "./HeroScene";
import { PharmaScene } from "./PharmaScene";
import { NonprofitScene } from "./NonprofitScene";
import { GrantScene } from "./GrantScene";
import { PrintPortalScene } from "./PrintPortalScene";

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
      <NonprofitScene
        progress={scrollProgress}
        active={currentScene === "nonprofit-matching"}
      />
      <GrantScene
        progress={scrollProgress}
        active={currentScene === "grant-discovery"}
      />
      <PrintPortalScene
        progress={scrollProgress}
        active={currentScene === "print-portal"}
      />
    </>
  );
}
