"use client";

import { useRef, useEffect, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group } from "three";
import { usePrefersReducedMotion, useMediaQuery } from "@/lib/hooks";
import { MORPH_DURATION_MS } from "@/lib/constants";
import type { SceneProps } from "./types";

// A small workflow graph: trigger → branch → two paths → merge → output.
const NODES: [number, number, number][] = [
  [-2.4, 0, 0],
  [-1.2, 0, 0],
  [0, 0.7, 0],
  [0, -0.7, 0],
  [1.2, 0, 0],
  [2.4, 0, 0],
];
const EDGES: [number, number][] = [
  [0, 1],
  [1, 2],
  [1, 3],
  [2, 4],
  [3, 4],
  [4, 5],
];
const EDGE_POSITIONS = EDGES.map(([a, b]) => new Float32Array([...NODES[a], ...NODES[b]]));

// Execution pulses travel along each edge; scroll progress repairs the
// graph, turning dim (broken) edges solid one by one.
export function AutomationScene({ progress, active, accent = "#f472b6", onMorphComplete }: SceneProps) {
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

  const p = Math.min(Math.max(progress, 0), 1);
  const healthy = Math.max(1, Math.ceil(EDGES.length * p));

  const pulses = useMemo(
    () =>
      EDGES.slice(0, healthy).map(([a, b], i) => {
        const t = (p * 3 + i * 0.37) % 1;
        const [ax, ay, az] = NODES[a];
        const [bx, by, bz] = NODES[b];
        return [ax + (bx - ax) * t, ay + (by - ay) * t, az + (bz - az) * t] as [number, number, number];
      }),
    [p, healthy],
  );

  if (!active) return null;

  return (
    <group ref={groupRef}>
      <ambientLight intensity={0.25} />
      <pointLight position={[0, 3, 3]} intensity={0.6} color={accent} />

      {NODES.map((pos, i) => (
        <mesh key={i} position={pos}>
          <sphereGeometry args={[0.12, 16, 16]} />
          <meshStandardMaterial color={accent} transparent opacity={0.55} />
        </mesh>
      ))}

      {EDGE_POSITIONS.map((positions, i) => (
        <line key={i}>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[positions, 3]} />
          </bufferGeometry>
          <lineBasicMaterial color={accent} transparent opacity={i < healthy ? 0.6 : 0.12} />
        </line>
      ))}

      {pulses.map((pos, i) => (
        <mesh key={`pulse-${i}`} position={pos}>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={1.5} />
        </mesh>
      ))}
    </group>
  );
}
