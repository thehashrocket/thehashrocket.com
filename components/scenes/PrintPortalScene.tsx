"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group } from "three";
import type { SceneProps } from "./types";

const STATIONS: [number, number, number][] = [
  [-2.25, 0, 0],
  [-0.75, 0, 0],
  [0.75, 0, 0],
  [2.25, 0, 0],
];

const BEAM_POSITIONS = STATIONS.slice(0, -1).map((a, i) => {
  const b = STATIONS[i + 1];
  return new Float32Array([a[0], a[1], a[2], b[0], b[1], b[2]]);
});

export function PrintPortalScene({ progress, active }: SceneProps) {
  const groupRef = useRef<Group>(null);

  const prefersReduced = useMemo(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    [],
  );
  const isMobile = useMemo(
    () => typeof window !== "undefined" && window.innerWidth < 768,
    [],
  );

  useFrame((_, delta) => {
    if (!active || !groupRef.current || prefersReduced || isMobile) return;
    groupRef.current.rotation.y += delta * 0.08;
  });

  const jobs = useMemo(
    () =>
      [0, 1, 2, 3].map((n) => {
        const t = (progress + n * 0.25) % 1.0;
        return -2.25 + t * 4.5;
      }),
    [progress],
  );

  if (!active) return null;

  return (
    <group ref={groupRef}>
      <ambientLight intensity={0.25} />
      <pointLight position={[0, 3, 3]} intensity={0.6} color="#06b6d4" />

      {STATIONS.map((pos, i) => (
        <mesh key={i} position={pos}>
          <boxGeometry args={[0.18, 0.18, 0.18]} />
          <meshStandardMaterial color="#06b6d4" transparent opacity={0.35} />
        </mesh>
      ))}

      {BEAM_POSITIONS.map((positions, i) => (
        <line key={i}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[positions, 3]}
            />
          </bufferGeometry>
          <lineBasicMaterial color="#06b6d4" transparent opacity={0.25} />
        </line>
      ))}

      {jobs.map((x, i) => (
        <mesh key={i} position={[x, 0, 0]}>
          <planeGeometry args={[0.12, 0.12]} />
          <meshStandardMaterial
            color="#06b6d4"
            emissive="#06b6d4"
            emissiveIntensity={1.5}
            transparent
            opacity={0.9}
          />
        </mesh>
      ))}
    </group>
  );
}
