"use client";

import { useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSceneStore } from "@/lib/store";
import { Tag } from "./Tag";

interface AtlasCardProps {
  slug: string;
  title: string;
  subtitle: string;
  accent: string;
  tags: string[];
}

export function AtlasCard({ slug, title, subtitle, accent, tags }: AtlasCardProps) {
  const router = useRouter();
  const { morphRunning, startMorph } = useSceneStore();
  const morphTarget = useRef<string | null>(null);
  const navigatedRef = useRef(false);

  useEffect(() => {
    // Navigate once morphRunning goes false after a card click
    if (!morphRunning && morphTarget.current && !navigatedRef.current) {
      navigatedRef.current = true;
      router.push(`/work/${morphTarget.current}`);
      morphTarget.current = null;
    }
    // Reset guard when a new morph starts so the next completion can navigate
    if (morphRunning) {
      navigatedRef.current = false;
    }
  }, [morphRunning, router]);

  function handleClick(e: React.MouseEvent<HTMLAnchorElement>) {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if (morphRunning) return;
    e.preventDefault();
    morphTarget.current = slug;
    startMorph(slug);
  }

  return (
    <Link
      href={`/work/${slug}`}
      onClick={handleClick}
      className="group block rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] p-6 transition-colors hover:border-[var(--accent)] md:p-8"
      style={{ borderTopColor: accent, borderTopWidth: 2 }}
    >
      <h3 className="font-display text-2xl font-semibold tracking-[-0.01em] text-[var(--text-primary)] transition-colors group-hover:text-[var(--accent)]">
        {title}
      </h3>
      <p className="mt-2 text-[var(--text-secondary)]">{subtitle}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {tags.map((tag) => (
          <Tag key={tag}>{tag}</Tag>
        ))}
      </div>
    </Link>
  );
}
