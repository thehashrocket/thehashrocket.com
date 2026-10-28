/**
 * @vitest-environment jsdom
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, fireEvent, act } from "@testing-library/react";

// Mock next/link to render a plain anchor
vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    onClick,
    ...props
  }: React.AnchorHTMLAttributes<HTMLAnchorElement> & {
    href: string;
    children: React.ReactNode;
  }) => (
    <a href={href} onClick={onClick} {...props}>
      {children}
    </a>
  ),
}));

const { MobileNav } = await import("@/components/layout/MobileNav");

const links = [
  { href: "/work", label: "Work" },
  { href: "/about", label: "About" },
];

beforeEach(() => {
  // Reset body overflow before each test
  document.body.style.overflow = "";
});

afterEach(() => {
  document.body.style.overflow = "";
});

describe("MobileNav", () => {
  it("renders the hamburger button", () => {
    const { getByRole } = render(<MobileNav links={links} />);
    const btn = getByRole("button");
    expect(btn).toBeTruthy();
    expect(btn.getAttribute("aria-label")).toBe("Open menu");
    expect(btn.getAttribute("aria-expanded")).toBe("false");
  });

  it("opens the overlay on button click", () => {
    const { getByRole, getByLabelText } = render(<MobileNav links={links} />);
    fireEvent.click(getByRole("button"));
    const nav = getByLabelText("Mobile navigation");
    expect(nav).toBeTruthy();
  });

  it("button aria-label changes to Close menu when open", () => {
    const { getByRole } = render(<MobileNav links={links} />);
    const btn = getByRole("button");
    fireEvent.click(btn);
    expect(btn.getAttribute("aria-label")).toBe("Close menu");
    expect(btn.getAttribute("aria-expanded")).toBe("true");
  });

  it("closes the overlay when button clicked again", () => {
    const { getByRole, queryByLabelText } = render(<MobileNav links={links} />);
    const btn = getByRole("button");
    fireEvent.click(btn); // open
    expect(queryByLabelText("Mobile navigation")).toBeTruthy();
    fireEvent.click(btn); // close
    expect(queryByLabelText("Mobile navigation")).toBeNull();
  });

  it("closes when a nav link is clicked", () => {
    const { getByRole, getByText, queryByLabelText } = render(
      <MobileNav links={links} />
    );
    fireEvent.click(getByRole("button"));
    fireEvent.click(getByText("Work"));
    expect(queryByLabelText("Mobile navigation")).toBeNull();
  });

  it("locks scroll (overflow: hidden) when overlay opens", () => {
    const { getByRole } = render(<MobileNav links={links} />);
    expect(document.body.style.overflow).toBe("");
    act(() => {
      fireEvent.click(getByRole("button"));
    });
    expect(document.body.style.overflow).toBe("hidden");
  });

  it("restores scroll when overlay closes via button", () => {
    const { getByRole } = render(<MobileNav links={links} />);
    const btn = getByRole("button");
    act(() => {
      fireEvent.click(btn); // open
    });
    expect(document.body.style.overflow).toBe("hidden");
    act(() => {
      fireEvent.click(btn); // close
    });
    expect(document.body.style.overflow).toBe("");
  });

  it("closes overlay on Escape key press", () => {
    const { getByRole, queryByLabelText } = render(<MobileNav links={links} />);
    act(() => {
      fireEvent.click(getByRole("button"));
    });
    expect(queryByLabelText("Mobile navigation")).toBeTruthy();
    act(() => {
      fireEvent.keyDown(document, { key: "Escape" });
    });
    expect(queryByLabelText("Mobile navigation")).toBeNull();
  });

  it("restores scroll after Escape key closes overlay", () => {
    const { getByRole } = render(<MobileNav links={links} />);
    act(() => {
      fireEvent.click(getByRole("button"));
    });
    expect(document.body.style.overflow).toBe("hidden");
    act(() => {
      fireEvent.keyDown(document, { key: "Escape" });
    });
    expect(document.body.style.overflow).toBe("");
  });

  it("does NOT close on non-Escape key press", () => {
    const { getByRole, queryByLabelText } = render(<MobileNav links={links} />);
    act(() => {
      fireEvent.click(getByRole("button"));
    });
    act(() => {
      fireEvent.keyDown(document, { key: "Enter" });
    });
    expect(queryByLabelText("Mobile navigation")).toBeTruthy();
  });

  it("does NOT register keydown listener when overlay is closed", () => {
    // Open then close; Escape should not re-open
    const { getByRole, queryByLabelText } = render(<MobileNav links={links} />);
    const btn = getByRole("button");
    act(() => {
      fireEvent.click(btn); // open
    });
    act(() => {
      fireEvent.click(btn); // close
    });
    act(() => {
      fireEvent.keyDown(document, { key: "Escape" });
    });
    // Still closed — Escape on a closed menu should be a no-op
    expect(queryByLabelText("Mobile navigation")).toBeNull();
  });

  it("renders all provided links in open overlay", () => {
    const { getByRole, getByText } = render(<MobileNav links={links} />);
    fireEvent.click(getByRole("button"));
    expect(getByText("Work")).toBeTruthy();
    expect(getByText("About")).toBeTruthy();
  });

  it("always renders the Let's Talk CTA in open overlay", () => {
    const { getByRole, getByText } = render(<MobileNav links={links} />);
    fireEvent.click(getByRole("button"));
    expect(getByText("Let's Talk")).toBeTruthy();
  });
});
