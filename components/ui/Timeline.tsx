"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "motion/react";
import { Tag } from "@/components/ui/Tag";
import type { CareerEntry } from "@/lib/experience";

const MAX_ANIMATION_DELAY = 0.4;

function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);
    setIsMobile(mql.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, [breakpoint]);
  return isMobile;
}

function TimelineEntry({
  entry,
  index,
  tier,
}: {
  entry: CareerEntry;
  index: number;
  tier: "expanded" | "compact" | "condensed";
}) {
  const ref = useRef<HTMLLIElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-64px" });

  const dateRange = `${entry.startYear}–${entry.endYear ?? "Present"}`;

  return (
    <motion.li
      ref={ref}
      aria-label={`${entry.description}, ${dateRange}`}
      className={tier === "condensed" ? "pb-12" : "pb-16"}
      initial={{ opacity: 0, y: 24 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
      transition={{
        duration: 0.35,
        ease: [0, 0, 0.2, 1],
        delay: Math.min(index * 0.1, MAX_ANIMATION_DELAY),
      }}
    >
      <div className="relative pl-8">
        {/* Dot */}
        <div className="absolute left-0 top-1.5 h-3 w-3 rounded-full bg-[var(--accent)]" />

        {/* Date range */}
        <p className="font-mono text-sm text-[var(--text-muted)]">{dateRange}</p>

        {tier === "condensed" ? (
          <p className="mt-1 font-display text-lg font-semibold text-[var(--text-primary)]">
            {entry.description}
          </p>
        ) : (
          <>
            {/* Description heading */}
            <h3 className="mt-2 font-display text-2xl font-semibold text-[var(--text-primary)]">
              {entry.description}
            </h3>

            {/* Role */}
            <p className="mt-1 text-base text-[var(--text-secondary)]">
              {entry.role}
            </p>

            {/* Location */}
            <p className="mt-0.5 text-sm text-[var(--text-muted)]">
              {entry.location}
            </p>

            {/* Highlights (expanded only) */}
            {tier === "expanded" && entry.highlights.length > 0 && (
              <ul className="mt-4 space-y-2">
                {entry.highlights.map((highlight) => (
                  <li
                    key={highlight}
                    className="flex gap-2 text-base text-[var(--text-secondary)]"
                  >
                    <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-[var(--text-muted)]" />
                    {highlight}
                  </li>
                ))}
              </ul>
            )}

            {/* Tech tags */}
            <div className="mt-4 flex flex-wrap gap-2">
              {entry.technologies.map((tech) => (
                <Tag key={tech}>{tech}</Tag>
              ))}
            </div>
          </>
        )}
      </div>
    </motion.li>
  );
}

function getTier(
  index: number,
  total: number,
  isMobile: boolean
): "expanded" | "compact" | "condensed" {
  if (total <= 4) return index < 2 ? "expanded" : "compact";
  if (isMobile) {
    return index < 2 ? "expanded" : "condensed";
  }
  if (index < 2) return "expanded";
  if (index >= total - 2) return "condensed";
  return "compact";
}

export function Timeline({ entries }: { entries: CareerEntry[] }) {
  const isMobile = useIsMobile();

  if (entries.length === 0) return null;

  return (
    <ol className="relative border-l-2 border-[var(--accent)]">
      {entries.map((entry, i) => (
        <TimelineEntry
          key={`${entry.startYear}-${entry.description}`}
          entry={entry}
          index={i}
          tier={getTier(i, entries.length, isMobile)}
        />
      ))}
    </ol>
  );
}
