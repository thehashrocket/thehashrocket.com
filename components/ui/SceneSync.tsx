"use client";

import { useEffect } from "react";
import { useSceneStore } from "@/lib/store";

interface SceneSyncProps {
  slug: string;
}

export function SceneSync({ slug }: SceneSyncProps) {
  const setCurrentScene = useSceneStore((s) => s.setCurrentScene);
  const resetScene = useSceneStore((s) => s.resetScene);

  useEffect(() => {
    setCurrentScene(slug);
    return () => resetScene();
  }, [slug, setCurrentScene, resetScene]);

  return null;
}
