"use client";

import { useRef, useEffect, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { BufferAttribute, BufferGeometry, PointsMaterial } from "three";
import { usePrefersReducedMotion, useMediaQuery } from "@/lib/hooks";
import { MORPH_DURATION_MS } from "@/lib/constants";
import type { SceneProps } from "./types";

const N = 100;
const CLUSTERS: [number, number, number][] = [
  [-1.5, 0.5, 0.0],
  [1.5, 0.5, 0.0],
  [0.0, -1.2, 0.0],
  [-0.8, -0.3, 0.5],
  [0.8, -0.3, -0.5],
];

function easeProgress(p: number): number {
  return Math.pow(p, 0.6);
}

export function GrantScene({ progress, active, accent = "#f59e0b", onMorphComplete }: SceneProps) {
  const geoRef = useRef<BufferGeometry>(null);
  const matRef = useRef<PointsMaterial>(null);
  const posAttrRef = useRef<BufferAttribute>(null);
  const prevProgress = useRef(-1);
  const prefersReduced = usePrefersReducedMotion();
  const isMobile = useMediaQuery("(max-width: 767px)");

  useEffect(() => {
    if (!active || !onMorphComplete) return;
    const t = setTimeout(onMorphComplete, MORPH_DURATION_MS);
    return () => clearTimeout(t);
  }, [active, onMorphComplete]);

  // Start positions: 80% scatter radius so particles are visible at progress=0
  const startPositions = useMemo(() => {
    const arr = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 2.4;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 2.4;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 2.4;
    }
    return arr;
  }, []);

  const clusterAssignments = useMemo(() => {
    const arr = new Int32Array(N);
    for (let i = 0; i < N; i++) arr[i] = i % CLUSTERS.length;
    return arr;
  }, []);

  // Working copy mutated in-place each frame
  const workingPositions = useMemo(
    () => new Float32Array(startPositions),
    [startPositions],
  );

  useEffect(() => {
    return () => {
      geoRef.current?.dispose();
      matRef.current?.dispose();
    };
  }, []);

  useFrame(() => {
    if (!active) {
      prevProgress.current = -1;
      return;
    }
    if (!geoRef.current?.attributes?.position) return;
    if (prefersReduced || isMobile) return;
    if (prevProgress.current === progress) return;

    prevProgress.current = progress;
    const eased = easeProgress(progress);

    for (let i = 0; i < N; i++) {
      const cluster = CLUSTERS[clusterAssignments[i]];
      workingPositions[i * 3] =
        startPositions[i * 3] + (cluster[0] - startPositions[i * 3]) * eased;
      workingPositions[i * 3 + 1] =
        startPositions[i * 3 + 1] +
        (cluster[1] - startPositions[i * 3 + 1]) * eased;
      workingPositions[i * 3 + 2] =
        startPositions[i * 3 + 2] +
        (cluster[2] - startPositions[i * 3 + 2]) * eased;
    }

    if (posAttrRef.current) posAttrRef.current.needsUpdate = true;
  });

  if (!active) return null;

  return (
    <group>
      <ambientLight intensity={0.25} />
      <pointLight
        position={[2, 2, 2]}
        intensity={0.3 + progress * 0.3}
        color={accent}
      />

      <points>
        <bufferGeometry ref={geoRef}>
          <bufferAttribute
            ref={posAttrRef}
            attach="attributes-position"
            args={[workingPositions, 3]}
          />
        </bufferGeometry>
        <pointsMaterial ref={matRef} size={0.025} color={accent} />
      </points>
    </group>
  );
}
