"use client";

import dynamic from "next/dynamic";
import type { ReactNode } from "react";
import { ErrorBoundary } from "./ErrorBoundary";
import { StaticFallback } from "./StaticFallback";

const SceneCanvas = dynamic(() => import("./SceneCanvas"), {
  ssr: false,
  loading: () => <StaticFallback />,
});

export function SceneProvider({ children }: { children: ReactNode }) {
  return (
    <>
      <ErrorBoundary fallback={<StaticFallback />}>
        <SceneCanvas />
      </ErrorBoundary>
      {children}
    </>
  );
}
