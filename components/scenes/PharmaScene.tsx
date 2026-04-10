"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group } from "three";
import type { SceneProps } from "./types";

export function PharmaScene({ progress, active }: SceneProps) {
  const groupRef = useRef<Group>(null);

  useFrame((_, delta) => {
    if (!active || !groupRef.current) return;
    groupRef.current.rotation.y += delta * 0.1;
  });

  if (!active) return null;

  // Grid of warehouse nodes that connect as scroll progresses
  const gridSize = 4;
  const nodes: [number, number, number][] = [];
  for (let x = 0; x < gridSize; x++) {
    for (let z = 0; z < gridSize; z++) {
      nodes.push([
        (x - gridSize / 2 + 0.5) * 0.8,
        Math.sin(x * 0.5 + z * 0.5) * 0.3,
        (z - gridSize / 2 + 0.5) * 0.8,
      ]);
    }
  }

  const visibleNodes = Math.floor(nodes.length * Math.max(progress, 0.1));

  return (
    <group ref={groupRef}>
      <ambientLight intensity={0.2} />
      <pointLight position={[3, 3, 3]} intensity={0.6} color="#4ade80" />

      {nodes.slice(0, visibleNodes).map((pos, i) => (
        <mesh key={i} position={pos}>
          <boxGeometry args={[0.15, 0.15, 0.15]} />
          <meshStandardMaterial
            color="#4ade80"
            transparent
            opacity={0.4 + (i / nodes.length) * 0.6}
          />
        </mesh>
      ))}
    </group>
  );
}
