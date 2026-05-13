"use client";

import { useRef } from "react";
import { useScroll, useMotionValueEvent } from "motion/react";
import { useSceneStore } from "@/lib/store";

interface Beat {
  heading: string;
  body: string;
}

interface CaseStudyScrollProps {
  beats: Beat[];
}

export function CaseStudyScroll({ beats }: CaseStudyScrollProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef });
  const setScrollProgress = useSceneStore((s) => s.setScrollProgress);

  useMotionValueEvent(scrollYProgress, "change", (value) => {
    setScrollProgress(value);
  });

  return (
    <div ref={containerRef} className="mt-16">
      {beats.map((beat, i) => (
        <section
          key={i}
          className="mx-auto max-w-[720px] py-16 md:py-24"
        >
          <h2 className="mb-6 font-display text-3xl font-bold tracking-[-0.02em] text-[var(--text-primary)] md:text-4xl">
            {beat.heading}
          </h2>
          <p className="text-lg leading-relaxed text-[var(--text-secondary)]">
            {beat.body}
          </p>
        </section>
      ))}
    </div>
  );
}
