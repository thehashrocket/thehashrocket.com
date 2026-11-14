import { caseStudySlugs } from "@/lib/case-studies";
import { locationSlugs } from "@/lib/locations";

const KNOWN_SOURCES = new Set<string>([
  "home",
  "work",
  "about",
  "locations",
  "ai-app-review",
  "print-shops",
  "automation-sprint",
  // Care plan and talks pages ship in release 2; the tags attribute early shared links now.
  "care-plan",
  "talks",
  "talk-attendee",
  // Tags for links shared off-site, such as /contact?source=linkedin.
  "linkedin",
  "referral",
  ...locationSlugs,
  ...caseStudySlugs.map((slug) => `work-${slug}`),
]);

/**
 * ?source= is visitor-controlled and reaches the email subject and Cal.com, so
 * only values the site itself generates get through.
 */
export function normalizeSource(value: unknown): string | undefined {
  return typeof value === "string" && KNOWN_SOURCES.has(value) ? value : undefined;
}
