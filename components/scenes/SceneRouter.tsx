"use client";

import { useSceneStore } from "@/lib/store";
import { caseStudies } from "@/lib/case-studies";
import { HeroScene } from "./HeroScene";
import { PharmaScene } from "./PharmaScene";
import { NonprofitScene } from "./NonprofitScene";
import { GrantScene } from "./GrantScene";
import { PrintPortalScene } from "./PrintPortalScene";

export function SceneRouter() {
  const currentScene = useSceneStore((s) => s.currentScene);
  const scrollProgress = useSceneStore((s) => s.scrollProgress);
  const morphRunning = useSceneStore((s) => s.morphRunning);
  const completeMorph = useSceneStore((s) => s.completeMorph);
  // Only pass the callback during an active morph — scenes should not fire
  // the completion timer on direct-URL loads where no morph is in progress.
  const morphCallback = morphRunning ? completeMorph : undefined;

  return (
    <>
      <HeroScene
        progress={scrollProgress}
        active={currentScene === "hero"}
        onMorphComplete={morphCallback}
      />
      <PharmaScene
        progress={scrollProgress}
        active={currentScene === "pharma-wms"}
        accent={caseStudies["pharma-wms"].accent}
        onMorphComplete={morphCallback}
      />
      <NonprofitScene
        progress={scrollProgress}
        active={currentScene === "nonprofit-matching"}
        accent={caseStudies["nonprofit-matching"].accent}
        onMorphComplete={morphCallback}
      />
      <GrantScene
        progress={scrollProgress}
        active={currentScene === "grant-discovery"}
        accent={caseStudies["grant-discovery"].accent}
        onMorphComplete={morphCallback}
      />
      <PrintPortalScene
        progress={scrollProgress}
        active={currentScene === "print-portal"}
        accent={caseStudies["print-portal"].accent}
        onMorphComplete={morphCallback}
      />
    </>
  );
}
