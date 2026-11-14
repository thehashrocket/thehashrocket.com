import { useState, useEffect, type RefObject } from "react";
import { useSceneStore } from "@/lib/store";

export function usePrefersReducedMotion(): boolean {
  const [prefersReduced, setPrefersReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReduced(mq.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReduced(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return prefersReduced;
}

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(query);
    setMatches(mq.matches);
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [query]);

  return matches;
}

/**
 * Dims the 3D canvas once `ref`'s element rises above `threshold` of the viewport
 * height, and keeps it dim below that point. Clears the dim on unmount.
 *
 * It reads position on every scroll because a jump (Home, End) can skip over an
 * IntersectionObserver's trigger zone without firing it. Only one dimming owner
 * may be mounted per page: each resets the shared flag on unmount.
 */
export function useDimCanvasBelow(ref: RefObject<HTMLElement | null>, threshold: number): void {
  const setCanvasDimmed = useSceneStore((s) => s.setCanvasDimmed);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const update = () => {
      setCanvasDimmed(el.getBoundingClientRect().top < window.innerHeight * threshold);
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);

    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      setCanvasDimmed(false);
    };
  }, [ref, threshold, setCanvasDimmed]);
}
