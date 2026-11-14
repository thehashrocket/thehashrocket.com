"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { sendGAEvent } from "@next/third-parties/google";
import { submitContact } from "@/lib/actions";
import { CONTACT_FORM_TIMEOUT_MS } from "@/lib/constants";
import { PROJECT_TYPES, TIMELINES } from "@/lib/contact-options";
import { Button } from "./Button";

const initialState = { success: false, error: null };

const selectClass =
  "min-h-[44px] rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 text-sm text-[var(--text-primary)] focus:border-[var(--accent)] focus:outline-none";

export function ContactForm({
  source,
  defaultProjectType,
  hideTimeline = false,
}: {
  source?: string;
  /** Preselected, still editable; form reset restores it. */
  defaultProjectType?: (typeof PROJECT_TYPES)[number];
  /** The server treats timeline as optional, so omitting the field is safe. */
  hideTimeline?: boolean;
}) {
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

  // Keyed on state, not state.success, so a second message in a row still counts.
  useEffect(() => {
    if (state.success) {
      sendGAEvent("event", "generate_lead", { method: "contact_form", source: source ?? "direct" });
    }
  }, [state, source]);

  useEffect(() => {
    if (isPending) {
      setTimedOut(false);
      timeoutRef.current = setTimeout(() => {
        setTimedOut(true);
        timeoutRef.current = null;
      }, CONTACT_FORM_TIMEOUT_MS);
    } else {
      setTimedOut(false);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    }
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
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
          maxLength={100}
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
          maxLength={254}
          className="rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] focus:outline-none"
          placeholder="you@company.com"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="projectType" className="text-sm text-[var(--text-secondary)]">
            What do you need? (optional)
          </label>
          <select
            id="projectType"
            name="projectType"
            defaultValue={defaultProjectType ?? ""}
            className={selectClass}
          >
            <option value="">Choose one</option>
            {PROJECT_TYPES.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
        {!hideTimeline && (
          <div className="flex flex-col gap-1.5">
            <label htmlFor="timeline" className="text-sm text-[var(--text-secondary)]">
              Rough timeline (optional)
            </label>
            <select id="timeline" name="timeline" defaultValue="" className={selectClass}>
              <option value="">Choose one</option>
              {TIMELINES.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        )}
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
          maxLength={5000}
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
          Message sent! I&apos;ll reply within one business day.
        </div>
      )}

      <Button type="submit" disabled={isPending}>
        {isPending ? "Sending…" : "Send message"}
      </Button>
    </form>
  );
}
