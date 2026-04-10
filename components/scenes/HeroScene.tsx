"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import type { Mesh } from "three";
import type { SceneProps } from "./types";

export function HeroScene({ progress, active }: SceneProps) {
  const meshRef = useRef<Mesh>(null);
  const particlesRef = useRef<Mesh>(null);

  const particlePositions = useMemo(
    () =>
      [...Array(60)].map((_, i) => {
        const theta = (i / 60) * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        const r = 2.5 + Math.random() * 0.5;
        return [
          r * Math.sin(phi) * Math.cos(theta),
          r * Math.sin(phi) * Math.sin(theta),
          r * Math.cos(phi),
        ] as [number, number, number];
      }),
    [],
  );

  useFrame((_, delta) => {
    if (!active || !meshRef.current) return;

    meshRef.current.rotation.y += delta * 0.15;
    meshRef.current.rotation.x = progress * Math.PI * 0.25;

    if (particlesRef.current) {
      particlesRef.current.rotation.y -= delta * 0.05;
      particlesRef.current.rotation.z += delta * 0.02;
    }
  });

  if (!active) return null;

  return (
    <group>
      <ambientLight intensity={0.3} />
      <pointLight position={[5, 5, 5]} intensity={0.8} color="#4ade80" />
      <pointLight position={[-5, -3, 3]} intensity={0.4} color="#fafafa" />

      {/* Central form — an icosahedron that represents systems thinking */}
      <mesh ref={meshRef} position={[0, 0, 0]}>
        <icosahedronGeometry args={[1.5, 1]} />
        <meshStandardMaterial
          color="#4ade80"
          wireframe
          transparent
          opacity={0.6}
        />
      </mesh>

      {/* Orbiting particles */}
      <mesh ref={particlesRef}>
        {particlePositions.map((pos, i) => (
          <mesh key={i} position={pos}>
            <sphereGeometry args={[0.02, 8, 8]} />
            <meshBasicMaterial color="#4ade80" transparent opacity={0.5} />
          </mesh>
        ))}
      </mesh>
    </group>
  );
}
