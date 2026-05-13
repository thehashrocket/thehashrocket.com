"use client";

import { useRef, useEffect, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group } from "three";
import { usePrefersReducedMotion, useMediaQuery } from "@/lib/hooks";
import { MORPH_DURATION_MS } from "@/lib/constants";
import type { SceneProps } from "./types";

const NODE_POSITIONS: [number, number, number][] = [
  // Left cluster (0-5)
  [-2.0, 0.5, 0.0], [-2.3, -0.3, 0.2], [-1.7, -0.6, -0.1],
  [-2.1, 0.0, -0.5], [-1.8, 0.8, -0.3], [-2.4, 0.4, -0.2],
  // Right cluster (6-11)
  [2.0, 0.5, 0.0], [2.3, -0.3, 0.2], [1.7, -0.6, -0.1],
  [2.1, 0.0, -0.5], [1.8, 0.8, -0.3], [2.4, 0.4, -0.2],
  // Center connectors (12-14)
  [-0.3, 0.1, 0.0], [0.0, -0.2, 0.1], [0.3, 0.3, -0.1],
];

// Ordered so intra-cluster edges come first (always visible), cross-cluster last
const EDGES: [number, number][] = [
  [0, 1], [0, 2], [1, 3], [2, 4], [3, 5], [4, 5],    // left cluster
  [6, 7], [6, 8], [7, 9], [8, 10], [9, 11], [10, 11], // right cluster
  [12, 13], [13, 14], [12, 14],                         // center triangle
  [0, 12], [2, 13], [1, 14],                            // left → center
  [6, 12], [8, 13], [7, 14],                            // right → center
  [5, 11], [3, 9], [0, 6],                              // cross-cluster (scroll reveal)
];

export function NonprofitScene({ progress, active, accent = "#3b82f6", onMorphComplete }: SceneProps) {
  const groupRef = useRef<Group>(null);
  const prefersReduced = usePrefersReducedMotion();
  const isMobile = useMediaQuery("(max-width: 767px)");

  useEffect(() => {
    if (!active || !onMorphComplete) return;
    const t = setTimeout(onMorphComplete, MORPH_DURATION_MS);
    return () => clearTimeout(t);
  }, [active, onMorphComplete]);

  const edgePositions = useMemo(
    () =>
      EDGES.map(
        ([a, b]) =>
          new Float32Array([
            ...NODE_POSITIONS[a],
            ...NODE_POSITIONS[b],
          ]),
      ),
    [],
  );

  useFrame((_, delta) => {
    if (!active || !groupRef.current || prefersReduced || isMobile) return;
    groupRef.current.rotation.y += delta * 0.08;
  });

  if (!active) return null;

  const visibleEdges = Math.max(3, Math.floor(EDGES.length * progress));

  return (
    <group ref={groupRef}>
      <ambientLight intensity={0.25} />
      <pointLight position={[3, 3, 3]} intensity={0.6} color={accent} />

      {NODE_POSITIONS.map((pos, i) => (
        <mesh key={i} position={pos}>
          <sphereGeometry args={[0.08, 8, 8]} />
          <meshStandardMaterial color={accent} transparent opacity={0.35} />
        </mesh>
      ))}

      {edgePositions.map((positions, i) => (
        <line key={i}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[positions, 3]}
            />
          </bufferGeometry>
          <lineBasicMaterial
            color={accent}
            transparent
            opacity={i < visibleEdges ? 0.6 : 0}
          />
        </line>
      ))}
    </group>
  );
}
