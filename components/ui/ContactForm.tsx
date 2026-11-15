"use client";

import { startTransition, useActionState, useEffect, useRef, useState, useSyncExternalStore, type FormEvent } from "react";
import { sendGAEvent } from "@next/third-parties/google";
import { submitContact, type ContactFormState } from "@/lib/actions";
import { CONTACT_FORM_TIMEOUT_MS } from "@/lib/constants";
import { PROJECT_TYPES, TIMELINES, contactFlowFor, type ProjectType } from "@/lib/contact-options";
import { CONTACT_EMAIL, getBookingUrl } from "@/lib/site";
import { BookingAnchor } from "./BookingAnchor";
import { Button } from "./Button";
import { heroFact } from "./styles";

const initialState: ContactFormState = { success: false, error: null, code: null };

const noSubscribe = () => () => {};
/** True once the page is interactive; false in the server render and before hydration. */
function useHydrated() {
  return useSyncExternalStore(noSubscribe, () => true, () => false);
}

const selectClass =
  "min-h-[44px] rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 text-sm text-[var(--text-primary)] focus:border-[var(--accent)] focus:outline-none";

/**
 * The contact form and its "What happens next" list. The steps and the timeline
 * field follow the visitor's current project type, not only the ?source that
 * seeded it.
 *
 * After a send, the fields clear but the select stays on the type that was sent
 * (`state.submittedProjectType`), so a follow-up message keeps it. The confirmation and
 * the steps describe that sent message until the visitor edits the form again.
 * `editedState` records which action state
 * the visitor last edited under (the form's input and change events); every send
 * returns a new state object, so an edit only clears the receipt it was made under.
 * `form.reset()` fires neither event, so our reset never clears the receipt.
 *
 * The offer terms from ?source (`terms`) show only while the selected type is the one
 * they belong to, never beside a receipt, and only once the page is interactive: before
 * that (or with JavaScript off) the browser may have restored a different type into the
 * select, and a server-rendered price would describe the wrong offer.
 *
 * While a send is in flight the text fields are read-only and the selects disabled, so
 * nothing typed then is lost to the reset after a successful send. Read-only (not
 * disabled) keeps keyboard focus where it was and lets the visitor copy their message
 * out; the selects can be disabled because the form data is read before the send starts.
 * If the send stalls, the "Still sending…" notice offers email and booking instead.
 *
 * The select stays uncontrolled. Its defaultValue is `resetType`: the draft's type after
 * an error, the sent type after a success, otherwise the ?source seed. Our reset on
 * success therefore lands on the sent type, and `projectType` mirrors the select through
 * onChange and onReset. A controlled select would show "Choose one" after a reset while
 * the steps still followed state.
 *
 * Submission goes through onSubmit + startTransition once hydrated, so React does
 * not auto-reset the form and a visitor keeps their draft on any error. `action`
 * stays set so a submit before hydration still posts to the server action instead
 * of a GET that would put the message in the URL. That plain POST re-renders the form,
 * so every error echoes the draft back and the fields take it as their default values.
 */
export function ContactForm({
  source,
  defaultProjectType,
  terms,
}: {
  source?: string;
  /** Preselected, still editable. */
  defaultProjectType?: ProjectType;
  /** The arrival offer's price and terms, shown while that offer's type is selected. */
  terms?: { text: string; termsType: ProjectType };
}) {
  const [state, formAction, isPending] = useActionState(
    submitContact,
    initialState,
  );
  const seed = defaultProjectType ?? "";
  const sentType = state.submittedProjectType ?? "";
  // What the select shows on first render and after a reset. A no-JavaScript POST
  // re-renders with its result, so this also covers that path.
  const resetType = state.draft?.projectType ?? (state.success ? sentType : seed);
  const [projectType, setProjectType] = useState<string>(resetType);
  const [editedState, setEditedState] = useState<ContactFormState | null>(null);
  const showReceipt = state.success && editedState !== state;
  // Steps describe the message that was sent while the receipt shows; otherwise the select.
  const flow = contactFlowFor(showReceipt ? sentType : projectType);
  // The timeline field is part of the form, so it always follows the select.
  const showTimeline = contactFlowFor(projectType).showTimeline;
  const hydrated = useHydrated();
  const showTerms = hydrated && terms !== undefined && !showReceipt && projectType === terms.termsType;
  // Screen readers hear one short line when the steps change, not the whole list again.
  const stepsType = showReceipt ? sentType : projectType;
  const stepsAnnouncement = `Next steps updated for ${stepsType || "your message"}.`;
  const formRef = useRef<HTMLFormElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(null);
  const [timedOut, setTimedOut] = useState(false);

  // Keyed on state, not state.success, so a second message in a row also resets.
  useEffect(() => {
    // An error leaves the form alone (no auto-reset), so the select and the steps
    // already agree on the draft's project type.
    // reset() restores each option's original default (React does not move it when
    // defaultValue changes), so put the select back on the sent type by hand; onReset
    // has already set projectType to the same value.
    if (state.success) {
      const form = formRef.current;
      form?.reset();
      const select = form?.elements.namedItem("projectType");
      if (select instanceof HTMLSelectElement) select.value = state.submittedProjectType ?? "";
    }
  }, [state]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(() => formAction(formData));
  }

  const bookingSource = source ?? "contact";
  const bookingUrl = getBookingUrl(bookingSource);
  // Another way through when a send is refused, fails or stalls.
  const alternative = (
    <p data-testid="contact-alternative" className="mt-2">
      You can email me at{" "}
      <a href={`mailto:${CONTACT_EMAIL}`} className="underline underline-offset-2">
        {CONTACT_EMAIL}
      </a>
      {bookingUrl && (
        <>
          , or{" "}
          <BookingAnchor href={bookingUrl} source={bookingSource} className="underline underline-offset-2">
            book a call
          </BookingAnchor>
        </>
      )}
      .
    </p>
  );
  const draft = state.draft;

  // The browser can restore or autofill the select (reload, back navigation) or the
  // visitor can change it before hydration, none of which fires onChange. Read the
  // DOM once on mount so the steps and timeline match what the select shows.
  useEffect(() => {
    const select = formRef.current?.elements.namedItem("projectType");
    if (select instanceof HTMLSelectElement) {
      setProjectType(select.value);
    }
  }, []);

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
    <form
      ref={formRef}
      action={formAction}
      onSubmit={handleSubmit}
      onReset={() => setProjectType(resetType)}
      onInput={() => setEditedState(state)}
      onChange={() => setEditedState(state)}
      className="flex flex-col gap-6"
    >
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
          readOnly={isPending}
          defaultValue={draft?.name}
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
          readOnly={isPending}
          defaultValue={draft?.email}
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
            defaultValue={resetType}
            disabled={isPending}
            onChange={(event) => setProjectType(event.target.value)}
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
        {showTimeline && (
          <div className="flex flex-col gap-1.5">
            <label htmlFor="timeline" className="text-sm text-[var(--text-secondary)]">
              Rough timeline (optional)
            </label>
            <select
                id="timeline"
                name="timeline"
                defaultValue={draft?.timeline ?? ""}
                disabled={isPending}
                className={selectClass}
              >
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

      {/* Follows the select (or the sent type, under a receipt); never animated. */}
      <div data-testid="contact-flow">
        <p className="sr-only" aria-live="polite" data-testid="steps-announcement">
          {stepsAnnouncement}
        </p>
        {showTerms && (
          <p data-testid="offer-terms" className={`mb-4 ${heroFact}`}>
            {terms.text}
          </p>
        )}
        <h2 className="mb-3 font-mono text-sm text-[var(--accent)]">What happens next</h2>
        <ol data-testid="next-steps" className="space-y-2 text-[var(--text-secondary)]">
          {flow.nextSteps.map((step, i) => (
            <li key={step} className="flex gap-3">
              <span aria-hidden="true" className="font-mono text-sm text-[var(--text-muted)]">
                {i + 1}
              </span>
              {step}
            </li>
          ))}
        </ol>
        {flow.note && <p className="mt-3 text-base text-[var(--text-secondary)]">{flow.note}</p>}
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
          readOnly={isPending}
          defaultValue={draft?.message}
          className="min-h-[120px] resize-y rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] focus:outline-none"
          placeholder="Tell me about your project…"
        />
      </div>

      {timedOut && isPending && (
        <div
          role="status"
          className="rounded-[var(--radius-sm)] border border-[var(--warning)]/20 bg-[var(--warning)]/10 px-4 py-3 text-sm text-[var(--warning)]"
        >
          Still sending… this is taking longer than expected. Your message is still in the form.
          {alternative}
        </div>
      )}

      {state.error && (
        <div
          role="alert"
          className="rounded-[var(--radius-sm)] border border-[var(--error)]/20 bg-[var(--error)]/10 px-4 py-3 text-sm text-[var(--error)]"
        >
          {state.error}
          {/* A denied or failed send still has a way through. */}
          {state.code && alternative}
        </div>
      )}

      {state.success && (
        <div
          role="status"
          className="rounded-[var(--radius-sm)] border border-[var(--success)]/20 bg-[var(--success)]/10 px-4 py-3 text-sm text-[var(--success)]"
        >
          {sentType
            ? `Message sent (${sentType}). I’ll reply within one business day.`
            : "Message sent! I’ll reply within one business day."}
        </div>
      )}

      <Button type="submit" disabled={isPending}>
        {isPending ? "Sending…" : "Send message"}
      </Button>
    </form>
  );
}
