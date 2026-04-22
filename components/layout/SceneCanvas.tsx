"use client";

import { useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { setConsoleFunction, getConsoleFunction } from "three";
import { SceneRouter } from "../scenes/SceneRouter";
import { isWebGLSupported } from "@/lib/webgl";
import { StaticFallback } from "./StaticFallback";

// Suppress THREE.Clock deprecation — r3f uses it internally; fixed upstream in a future release.
const prevConsole = getConsoleFunction();
setConsoleFunction((type, message, ...rest) => {
  if (type === "warn" && typeof message === "string" && message.includes("THREE.Clock")) return;
  if (prevConsole) {
    prevConsole(type, message, ...rest);
  } else {
    console[type]?.(message, ...rest);
  }
});

export default function SceneCanvas() {
  const [webgl, setWebgl] = useState<boolean | null>(null);

  useEffect(() => {
    setWebgl(isWebGLSupported());
  }, []);

  if (webgl === null || !webgl) {
    return <StaticFallback />;
  }

  return (
    <Canvas
      className="!fixed !inset-0 !-z-10"
      camera={{ position: [0, 0, 5], fov: 50 }}
      dpr={[1, 2]}
      aria-hidden
      style={{ position: "fixed", inset: 0, zIndex: -1 }}
    >
      <SceneRouter />
    </Canvas>
  );
}
