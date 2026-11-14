// Pure helpers for the contact email, kept out of lib/actions.ts because a
// "use server" module may only export async functions.

export const NAME_MAX = 100;

/** The email subject: name (one line, capped), then project type and source when present. */
export function contactSubject(name: string, projectType: string | null, source: string | undefined): string {
  const safeName = name.replace(/[\r\n]+/g, " ").trim().slice(0, NAME_MAX);
  return `New contact from ${safeName}${projectType ? ` - ${projectType}` : ""}${source ? ` (via ${source})` : ""}`;
}
