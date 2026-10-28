"use client";

import { useRef, useEffect, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group } from "three";
import { usePrefersReducedMotion, useMediaQuery } from "@/lib/hooks";
import { MORPH_DURATION_MS } from "@/lib/constants";
import type { SceneProps } from "./types";

const STORE_COUNT = 9;
const RING_RADIUS = 2;

const RING: [number, number, number][] = Array.from({ length: STORE_COUNT }, (_, i) => {
  const angle = (i / STORE_COUNT) * Math.PI * 2;
  return [Math.cos(angle) * RING_RADIUS, Math.sin(angle * 2) * 0.2, Math.sin(angle) * RING_RADIUS];
});

// Nine separate storefronts converge into one multi-tenant platform as you scroll.
export function ConsolidationScene({ progress, active, accent = "#fb923c", onMorphComplete }: SceneProps) {
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
    groupRef.current.rotation.y += delta * 0.1;
  });

  const p = Math.min(Math.max(progress, 0), 1);
  const stores = useMemo(
    () => RING.map(([x, y, z]) => [x * (1 - p * 0.85), y * (1 - p), z * (1 - p * 0.85)] as [number, number, number]),
    [p],
  );

  if (!active) return null;

  const coreScale = 0.15 + p * 0.45;

  return (
    <group ref={groupRef}>
      <ambientLight intensity={0.25} />
      <pointLight position={[2, 3, 3]} intensity={0.6} color={accent} />

      {stores.map((pos, i) => (
        <mesh key={i} position={pos}>
          <boxGeometry args={[0.16, 0.16, 0.16]} />
          <meshStandardMaterial color={accent} transparent opacity={0.6 - p * 0.35} />
        </mesh>
      ))}

      <mesh scale={coreScale}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial
          color={accent}
          emissive={accent}
          emissiveIntensity={0.4 + p}
          transparent
          opacity={0.35 + p * 0.5}
        />
      </mesh>
    </group>
  );
}
