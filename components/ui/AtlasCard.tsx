"use client";

import { useRef } from "react";
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
  const { morphRunning, startMorph, completeMorph } = useSceneStore();
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(null);

  function handleClick(e: React.MouseEvent<HTMLAnchorElement>) {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if (morphRunning) return;

    e.preventDefault();
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    startMorph(slug);

    timeoutRef.current = setTimeout(() => {
      completeMorph();
      router.push(`/work/${slug}`);
    }, 3000);
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
