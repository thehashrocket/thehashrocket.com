"use client";

import { useRef, useEffect, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Vector3, type Group, type Mesh, type MeshBasicMaterial } from "three";
import { usePrefersReducedMotion } from "@/lib/hooks";
import { MORPH_DURATION_MS } from "@/lib/constants";
import { isOverText, ndcToViewport, readTextRects, stepOpacity, type Rect } from "@/lib/scene-text-avoid";
import type { SceneProps } from "./types";

const PARTICLE_OPACITY = 0.5;
/** A full fade takes about 0.25 s. */
const FADE_PER_SECOND = PARTICLE_OPACITY * 4;
/** How often the text blocks are re-measured; layout moves on scroll and resize. */
const TEXT_REFRESH_SECONDS = 0.2;

export function HeroScene({ progress, active, onMorphComplete }: SceneProps) {
  const meshRef = useRef<Mesh>(null);
  const particlesRef = useRef<Group>(null);
  const dotRefs = useRef<(Mesh | null)[]>([]);
  const textRects = useRef<Rect[]>([]);
  const sinceRefresh = useRef(TEXT_REFRESH_SECONDS);
  const scratch = useMemo(() => new Vector3(), []);
  const { camera, size } = useThree();
  const prefersReduced = usePrefersReducedMotion();

  useEffect(() => {
    if (!active || !onMorphComplete) return;
    const t = setTimeout(onMorphComplete, MORPH_DURATION_MS);
    return () => clearTimeout(t);
  }, [active, onMorphComplete]);

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

    if (!prefersReduced) {
      meshRef.current.rotation.y += delta * 0.15;
      meshRef.current.rotation.x = progress * Math.PI * 0.25;

      if (particlesRef.current) {
        particlesRef.current.rotation.y -= delta * 0.05;
        particlesRef.current.rotation.z += delta * 0.02;
      }
    }

    // Fade any dot that sits over page text (#109). Runs under reduced motion too:
    // a still dot can land on a letter as easily as a moving one.
    sinceRefresh.current += delta;
    if (sinceRefresh.current >= TEXT_REFRESH_SECONDS) {
      sinceRefresh.current = 0;
      textRects.current = readTextRects(document, size);
    }
    for (const dot of dotRefs.current) {
      if (!dot) continue;
      dot.getWorldPosition(scratch).project(camera);
      const { x, y } = ndcToViewport(scratch.x, scratch.y, size.width, size.height);
      const target = isOverText(x, y, textRects.current) ? 0 : PARTICLE_OPACITY;
      const material = dot.material as MeshBasicMaterial;
      material.opacity = stepOpacity(material.opacity, target, delta, FADE_PER_SECOND, prefersReduced);
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
      <group ref={particlesRef}>
        {particlePositions.map((pos, i) => (
          <mesh
            key={i}
            position={pos}
            ref={(el) => {
              dotRefs.current[i] = el;
            }}
          >
            <sphereGeometry args={[0.02, 8, 8]} />
            <meshBasicMaterial color="#4ade80" transparent opacity={PARTICLE_OPACITY} />
          </mesh>
        ))}
      </group>
    </group>
  );
}
