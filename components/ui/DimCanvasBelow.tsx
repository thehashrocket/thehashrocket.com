"use client";

import { useRef } from "react";
import { useDimCanvasBelow } from "@/lib/hooks";

/** Half the viewport, so tall laptop screens (1440×900) load with the scene bright. */
const DIM_START = 0.5;

/**
 * Place right after an offer page's hero section: the 3D scene dims once the body
 * text reaches the middle of the viewport. A tiny client island, so offer pages
 * stay server components. Never mount it on a page that also renders
 * CaseStudyScroll: both own the same canvas flag and reset it on unmount.
 */
export function DimCanvasBelow() {
  const ref = useRef<HTMLDivElement>(null);
  useDimCanvasBelow(ref, DIM_START);
  return <div ref={ref} aria-hidden="true" data-testid="dim-canvas-below" />;
}
