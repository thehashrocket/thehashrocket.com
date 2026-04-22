import type { Metadata } from "next";
import { ContactForm } from "@/components/ui/ContactForm";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Have a complex engineering problem? I help startups and enterprises architect and build systems that need to work at scale. Response within 24 hours.",
  openGraph: {
    url: "https://thehashrocket.com/contact",
  },
};

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{ source?: string }>;
}) {
  const { source } = await searchParams;

  return (
    <div className="px-6 pt-32 pb-24">
      <div className="mx-auto max-w-[720px]">
        <p className="mb-2 font-mono text-sm text-[var(--accent)]">Contact</p>
        <h1 className="mb-4 font-display text-5xl font-bold tracking-[-0.02em] text-[var(--text-primary)] md:text-6xl">
          Let&apos;s talk
        </h1>
        <p className="mb-12 text-lg text-[var(--text-secondary)]">
          Have a complex problem that needs a senior engineer? Tell me about
          your project and I&apos;ll get back to you within 24 hours.
        </p>

        <ContactForm source={source} />
      </div>
    </div>
  );
}
