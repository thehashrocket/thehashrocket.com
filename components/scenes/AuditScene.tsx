"use client";

import { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group } from "three";
import { usePrefersReducedMotion, useMediaQuery } from "@/lib/hooks";
import { MORPH_DURATION_MS } from "@/lib/constants";
import type { SceneProps } from "./types";

const SERVERS = 8;
const RADIUS = 1.8;

const SERVER_POSITIONS: [number, number, number][] = Array.from({ length: SERVERS }, (_, i) => {
  const angle = (i / SERVERS) * Math.PI * 2;
  return [Math.cos(angle) * RADIUS, 0, Math.sin(angle) * RADIUS];
});

// A ring of servers with a sweeping scan beam. Servers light up as the
// audit (scroll progress) reaches them.
export function AuditScene({ progress, active, accent = "#f87171", onMorphComplete }: SceneProps) {
  const groupRef = useRef<Group>(null);
  const beamRef = useRef<Group>(null);
  const prefersReduced = usePrefersReducedMotion();
  const isMobile = useMediaQuery("(max-width: 767px)");

  useEffect(() => {
    if (!active || !onMorphComplete) return;
    const t = setTimeout(onMorphComplete, MORPH_DURATION_MS);
    return () => clearTimeout(t);
  }, [active, onMorphComplete]);

  useFrame((_, delta) => {
    if (!active || prefersReduced) return;
    if (beamRef.current) beamRef.current.rotation.y -= delta * 0.8;
    if (groupRef.current && !isMobile) groupRef.current.rotation.y += delta * 0.05;
  });

  if (!active) return null;

  const scanned = Math.ceil(SERVERS * Math.min(Math.max(progress, 0.05), 1));

  return (
    <group ref={groupRef}>
      <ambientLight intensity={0.2} />
      <pointLight position={[0, 3, 2]} intensity={0.6} color={accent} />

      {SERVER_POSITIONS.map((pos, i) => {
        const lit = i < scanned;
        return (
          <mesh key={i} position={pos}>
            <boxGeometry args={[0.22, 0.7, 0.22]} />
            <meshStandardMaterial
              color={accent}
              emissive={lit ? accent : "#000000"}
              emissiveIntensity={lit ? 0.6 : 0}
              transparent
              opacity={lit ? 0.8 : 0.25}
            />
          </mesh>
        );
      })}

      <group ref={beamRef}>
        <mesh position={[RADIUS / 2, 0, 0]}>
          <boxGeometry args={[RADIUS, 0.01, 0.01]} />
          <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={1.2} transparent opacity={0.7} />
        </mesh>
      </group>
    </group>
  );
}
