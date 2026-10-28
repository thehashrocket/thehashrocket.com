"use client";

import { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group } from "three";
import { usePrefersReducedMotion, useMediaQuery } from "@/lib/hooks";
import { MORPH_DURATION_MS } from "@/lib/constants";
import type { SceneProps } from "./types";

const STACKS = 3;
const LAYERS = 4;

// Each site is a stack of layers. Scroll rebuilds them bottom-up from
// wireframe (legacy) to solid (modernized), keeping the same shape.
export function ModernizeScene({ progress, active, accent = "#a78bfa", onMorphComplete }: SceneProps) {
  const groupRef = useRef<Group>(null);
  const prefersReduced = usePrefersReducedMotion();
  const isMobile = useMediaQuery("(max-width: 767px)");

  useEffect(() => {
    if (!active || !onMorphComplete) return;
    const t = setTimeout(onMorphComplete, MORPH_DURATION_MS);
    return () => clearTimeout(t);
  }, [active, onMorphComplete]);

  useFrame((_, delta) => {
    if (!active || !groupRef.current || prefersReduced || isMobile) return;
    groupRef.current.rotation.y += delta * 0.08;
  });

  if (!active) return null;

  const total = STACKS * LAYERS;
  const solidCount = Math.floor(total * Math.min(Math.max(progress, 0), 1));

  const layers: { pos: [number, number, number]; solid: boolean }[] = [];
  for (let level = 0; level < LAYERS; level++) {
    for (let s = 0; s < STACKS; s++) {
      layers.push({
        pos: [(s - (STACKS - 1) / 2) * 1.2, (level - (LAYERS - 1) / 2) * 0.32, 0],
        solid: layers.length < solidCount,
      });
    }
  }

  return (
    <group ref={groupRef}>
      <ambientLight intensity={0.25} />
      <pointLight position={[0, 3, 3]} intensity={0.6} color={accent} />

      {layers.map(({ pos, solid }, i) => (
        <mesh key={i} position={pos}>
          <boxGeometry args={[0.8, 0.22, 0.8]} />
          <meshStandardMaterial
            color={accent}
            wireframe={!solid}
            emissive={solid ? accent : "#000000"}
            emissiveIntensity={solid ? 0.35 : 0}
            transparent
            opacity={solid ? 0.75 : 0.3}
          />
        </mesh>
      ))}
    </group>
  );
}
