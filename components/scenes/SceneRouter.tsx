"use client";

import { useSceneStore } from "@/lib/store";
import { caseStudies } from "@/lib/case-studies";
import { HeroScene } from "./HeroScene";
import { PharmaScene } from "./PharmaScene";
import { NonprofitScene } from "./NonprofitScene";
import { GrantScene } from "./GrantScene";
import { PrintPortalScene } from "./PrintPortalScene";
import { ConsolidationScene } from "./ConsolidationScene";
import { ModernizeScene } from "./ModernizeScene";
import { AuditScene } from "./AuditScene";
import { AutomationScene } from "./AutomationScene";

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
      <ConsolidationScene
        progress={scrollProgress}
        active={currentScene === "storefront-consolidation"}
        accent={caseStudies["storefront-consolidation"].accent}
        onMorphComplete={morphCallback}
      />
      <ModernizeScene
        progress={scrollProgress}
        active={currentScene === "wordpress-modernization"}
        accent={caseStudies["wordpress-modernization"].accent}
        onMorphComplete={morphCallback}
      />
      <AuditScene
        progress={scrollProgress}
        active={currentScene === "fleet-security-audit"}
        accent={caseStudies["fleet-security-audit"].accent}
        onMorphComplete={morphCallback}
      />
      <AutomationScene
        progress={scrollProgress}
        active={currentScene === "automation-rescue"}
        accent={caseStudies["automation-rescue"].accent}
        onMorphComplete={morphCallback}
      />
    </>
  );
}
