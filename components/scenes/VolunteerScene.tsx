"use client";

import { useRef, useEffect, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group } from "three";
import { usePrefersReducedMotion, useMediaQuery } from "@/lib/hooks";
import { MORPH_DURATION_MS } from "@/lib/constants";
import type { SceneProps } from "./types";

// Three nonprofits in a triangle, volunteers on a ring around them.
const HUBS: [number, number, number][] = [
  [0.0, 0.9, 0.0],
  [-0.9, -0.6, 0.2],
  [0.9, -0.6, -0.2],
];

const VOLUNTEER_COUNT = 18;
const RING_RADIUS = 2.2;

const VOLUNTEERS: [number, number, number][] = Array.from({ length: VOLUNTEER_COUNT }, (_, i) => {
  const angle = (i / VOLUNTEER_COUNT) * Math.PI * 2;
  const wobble = i % 2 === 0 ? 0.25 : -0.25;
  return [
    Math.cos(angle) * RING_RADIUS,
    Math.sin(angle) * RING_RADIUS * 0.7,
    wobble,
  ];
});

function nearestHub(p: [number, number, number]): number {
  let best = 0;
  let bestDist = Infinity;
  HUBS.forEach((h, i) => {
    const d = (h[0] - p[0]) ** 2 + (h[1] - p[1]) ** 2 + (h[2] - p[2]) ** 2;
    if (d < bestDist) {
      bestDist = d;
      best = i;
    }
  });
  return best;
}

// Home-org links come first; every third volunteer then carries credentials
// to a second org, revealed last as the reader scrolls.
const LINKS: [[number, number, number], [number, number, number]][] = [
  ...VOLUNTEERS.map((v): [[number, number, number], [number, number, number]] => [v, HUBS[nearestHub(v)]]),
  ...VOLUNTEERS.filter((_, i) => i % 3 === 0).map(
    (v): [[number, number, number], [number, number, number]] => [v, HUBS[(nearestHub(v) + 1) % HUBS.length]],
  ),
];

export function VolunteerScene({ progress, active, accent = "#2dd4bf", onMorphComplete }: SceneProps) {
  const groupRef = useRef<Group>(null);
  const prefersReduced = usePrefersReducedMotion();
  const isMobile = useMediaQuery("(max-width: 767px)");

  useEffect(() => {
    if (!active || !onMorphComplete) return;
    const t = setTimeout(onMorphComplete, MORPH_DURATION_MS);
    return () => clearTimeout(t);
  }, [active, onMorphComplete]);

  const linkPositions = useMemo(
    () => LINKS.map(([a, b]) => new Float32Array([...a, ...b])),
    [],
  );

  useFrame((_, delta) => {
    if (!active || !groupRef.current || prefersReduced || isMobile) return;
    groupRef.current.rotation.z += delta * 0.05;
  });

  if (!active) return null;

  const visibleLinks = Math.max(HUBS.length, Math.floor(LINKS.length * progress));

  return (
    <group ref={groupRef}>
      <ambientLight intensity={0.25} />
      <pointLight position={[0, 0, 3]} intensity={0.7} color={accent} />

      {HUBS.map((pos, i) => (
        <mesh key={`hub-${i}`} position={pos}>
          <sphereGeometry args={[0.18, 16, 16]} />
          <meshStandardMaterial color={accent} transparent opacity={0.55} />
        </mesh>
      ))}

      {VOLUNTEERS.map((pos, i) => (
        <mesh key={`vol-${i}`} position={pos}>
          <sphereGeometry args={[0.06, 8, 8]} />
          <meshStandardMaterial color={accent} transparent opacity={0.35} />
        </mesh>
      ))}

      {linkPositions.map((positions, i) => (
        <line key={i}>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[positions, 3]} />
          </bufferGeometry>
          <lineBasicMaterial color={accent} transparent opacity={i < visibleLinks ? 0.5 : 0} />
        </line>
      ))}
    </group>
  );
}
