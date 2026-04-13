"use client";

import { Canvas } from "@react-three/fiber";
import { SceneRouter } from "../scenes/SceneRouter";
import { isWebGLSupported } from "@/lib/webgl";
import { StaticFallback } from "./StaticFallback";

export default function SceneCanvas() {
  if (!isWebGLSupported()) {
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
