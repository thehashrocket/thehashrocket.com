"use client";

import { Canvas } from "@react-three/fiber";
import { SceneRouter } from "../scenes/SceneRouter";

export default function SceneCanvas() {
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
