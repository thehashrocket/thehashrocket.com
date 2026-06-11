"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { submitContact } from "@/lib/actions";
import { Button } from "./Button";

const initialState = { success: false, error: null };

export function ContactForm({ source }: { source?: string }) {
  const [state, formAction, isPending] = useActionState(
    submitContact,
    initialState,
  );
  const formRef = useRef<HTMLFormElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(null);
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
    }
  }, [state.success]);

  // Client-side 10s timeout
  useEffect(() => {
    if (isPending) {
      setTimedOut(false);
      timeoutRef.current = setTimeout(() => {
        setTimedOut(true);
      }, 10000);
    } else {
      setTimedOut(false);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    }
  }, [isPending]);

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-6">
      {/* Source attribution */}
      {source && <input type="hidden" name="source" value={source} />}

      {/* Honeypot */}
      <div className="sr-only" aria-hidden>
        <label htmlFor="website">Website</label>
        <input type="text" id="website" name="website" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="name" className="text-sm text-[var(--text-secondary)]">
          Name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          minLength={2}
          className="rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] focus:outline-none"
          placeholder="Your name"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="email"
          className="text-sm text-[var(--text-secondary)]"
        >
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] focus:outline-none"
          placeholder="you@company.com"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="message"
          className="text-sm text-[var(--text-secondary)]"
        >
          Message
        </label>
        <textarea
          id="message"
          name="message"
          required
          minLength={10}
          rows={5}
          className="min-h-[120px] resize-y rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] focus:outline-none"
          placeholder="Tell me about your project…"
        />
      </div>

      {timedOut && isPending && (
        <div
          role="status"
          className="rounded-[var(--radius-sm)] border border-[var(--warning)]/20 bg-[var(--warning)]/10 px-4 py-3 text-sm text-[var(--warning)]"
        >
          Still sending… this is taking longer than expected.
        </div>
      )}

      {state.error && (
        <div
          role="alert"
          className="rounded-[var(--radius-sm)] border border-[var(--error)]/20 bg-[var(--error)]/10 px-4 py-3 text-sm text-[var(--error)]"
        >
          {state.error}
        </div>
      )}

      {state.success && (
        <div
          role="status"
          className="rounded-[var(--radius-sm)] border border-[var(--success)]/20 bg-[var(--success)]/10 px-4 py-3 text-sm text-[var(--success)]"
        >
          Message sent! I&apos;ll get back to you within 24 hours.
        </div>
      )}

      <Button type="submit" disabled={isPending}>
        {isPending ? "Sending…" : "Send message"}
      </Button>
    </form>
  );
}
