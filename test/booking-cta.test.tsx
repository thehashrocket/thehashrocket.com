/**
 * @vitest-environment jsdom
 * The Cal.com fallback: with NEXT_PUBLIC_CALCOM_URL unset, no CTA may render a
 * dead booking button or a link from the contact page back to itself.
 */
import { afterEach, describe, expect, it, vi } from "vitest";
import { render } from "@testing-library/react";
import type { AnchorHTMLAttributes } from "react";

vi.mock("next/link", () => ({
  default: (props: AnchorHTMLAttributes<HTMLAnchorElement>) => <a {...props} />,
}));

vi.mock("@/lib/actions", () => ({ submitContact: vi.fn() }));

const { ClosingCta } = await import("@/components/ui/ClosingCta");
const ContactPage = (await import("@/app/contact/page")).default;

const CAL_URL = "https://example.com/me";

function links(container: HTMLElement) {
  return [...container.querySelectorAll("a")].map((a) => ({
    text: a.textContent,
    href: a.getAttribute("href"),
  }));
}

async function renderContactPage(source?: string | string[]) {
  return render(await ContactPage({ searchParams: Promise.resolve({ source }) }));
}

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("ClosingCta", () => {
  // Value: protects=without Cal.com the CTA is one link to the form, keeping the source;
  //   fails_when=the BookingLink null branch or the secondary-link gate is removed or inverted;
  //   why_new=site.test.ts covers the URL helpers only, no test renders either component;
  //   seam=none; no_claim=next/link navigation (mocked as a plain anchor)
  it("offers a single contact link when Cal.com is unset", () => {
    vi.stubEnv("NEXT_PUBLIC_CALCOM_URL", "");
    const { container } = render(<ClosingCta source="stockton" />);
    expect(links(container)).toEqual([
      { text: "Start a conversation", href: "/contact?source=stockton" },
    ]);
  });

  // Value: protects=with Cal.com the CTA books in a new tab and still offers the form, both tagged;
  //   fails_when=the source is dropped from either link or the external link loses target/rel;
  //   why_new=site.test.ts checks the URL string, not what the buttons link to;
  //   seam=none; no_claim=Cal.com honours ?source= (env stubbed with a fake URL)
  it("offers booking and the form when Cal.com is set", () => {
    vi.stubEnv("NEXT_PUBLIC_CALCOM_URL", CAL_URL);
    const { container } = render(<ClosingCta source="stockton" />);
    expect(links(container)).toEqual([
      { text: "Book a 20-minute call", href: `${CAL_URL}?source=stockton` },
      { text: "Send a message", href: "/contact?source=stockton" },
    ]);
    const booking = container.querySelector(`a[href^='${CAL_URL}']`);
    expect(booking?.getAttribute("target")).toBe("_blank");
    expect(booking?.getAttribute("rel")).toContain("noopener");
  });
});

describe("ContactPage", () => {
  // Value: protects=the contact page shows booking only with Cal.com and forwards only known sources;
  //   fails_when=the booking gate goes, or a raw ?source= reaches Cal.com or the hidden form field;
  //   why_new=e2e opens /contact without a source and with no Cal.com assertion; nothing covers the gate;
  //   seam=none; no_claim=real searchParams parsing or form submission (props passed directly)
  it("gates booking on Cal.com and forwards only known sources", async () => {
    vi.stubEnv("NEXT_PUBLIC_CALCOM_URL", "");
    const unset = (await renderContactPage("home")).container;
    expect(links(unset).map((l) => l.text)).not.toContain("Start a conversation");
    expect(unset.querySelector("input[name='source']")?.getAttribute("value")).toBe("home");

    vi.stubEnv("NEXT_PUBLIC_CALCOM_URL", CAL_URL);
    const known = (await renderContactPage("home")).container;
    expect(links(known)).toContainEqual({
      text: "Book a 20-minute call",
      href: `${CAL_URL}?source=home`,
    });

    for (const hostile of ["evil&x=1", ["home", "work"]]) {
      const page = (await renderContactPage(hostile)).container;
      expect(links(page)).toContainEqual({ text: "Book a 20-minute call", href: CAL_URL });
      expect(page.querySelector("input[name='source']")).toBeNull();
    }
  });
});
