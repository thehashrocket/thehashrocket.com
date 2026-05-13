/**
 * @vitest-environment jsdom
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import { useSceneStore } from "@/lib/store";

// Mock next/navigation
const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

// Mock next/link to render a plain anchor
vi.mock("next/link", () => ({
  default: ({ href, children, onClick, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string; children: React.ReactNode }) => (
    <a href={href} onClick={onClick} {...props}>{children}</a>
  ),
}));

// Lazy import after mocks are set up
const { AtlasCard } = await import("@/components/ui/AtlasCard");

const defaultProps = {
  slug: "pharma-wms",
  title: "Pharma WMS",
  subtitle: "Test subtitle",
  accent: "#4ade80",
  tags: ["React"],
};

beforeEach(() => {
  useSceneStore.setState({ currentScene: "hero", scrollProgress: 0, morphRunning: false });
  mockPush.mockClear();
});

describe("AtlasCard", () => {
  it("calls startMorph on click and sets morphTarget", () => {
    const { getByRole } = render(<AtlasCard {...defaultProps} />);
    const link = getByRole("link");
    fireEvent.click(link);
    expect(useSceneStore.getState().morphRunning).toBe(true);
    expect(useSceneStore.getState().currentScene).toBe("pharma-wms");
  });

  it("navigates when morphRunning goes false after click", async () => {
    const { getByRole } = render(<AtlasCard {...defaultProps} />);
    fireEvent.click(getByRole("link"));
    expect(mockPush).not.toHaveBeenCalled();
    // Simulate scene calling completeMorph
    useSceneStore.getState().completeMorph();
    // Allow effect to run
    await new Promise((r) => setTimeout(r, 0));
    expect(mockPush).toHaveBeenCalledWith("/work/pharma-wms");
    expect(mockPush).toHaveBeenCalledTimes(1);
  });

  it("navigatedRef guard prevents double-navigation on morphRunning bounce", async () => {
    const { getByRole } = render(<AtlasCard {...defaultProps} />);
    fireEvent.click(getByRole("link"));
    // First completion
    useSceneStore.getState().completeMorph();
    await new Promise((r) => setTimeout(r, 0));
    expect(mockPush).toHaveBeenCalledTimes(1);
    // Simulate spurious morphRunning false again without a new startMorph
    useSceneStore.setState({ morphRunning: false });
    await new Promise((r) => setTimeout(r, 0));
    // Guard should block — still only 1 navigation
    expect(mockPush).toHaveBeenCalledTimes(1);
  });

  it("ignores click when morphRunning is already true", () => {
    useSceneStore.setState({ morphRunning: true, currentScene: "hero" });
    const { getByRole } = render(<AtlasCard {...defaultProps} />);
    fireEvent.click(getByRole("link"));
    expect(mockPush).not.toHaveBeenCalled();
  });

  it("does not intercept modifier-key clicks", () => {
    const { getByRole } = render(<AtlasCard {...defaultProps} />);
    fireEvent.click(getByRole("link"), { metaKey: true });
    expect(useSceneStore.getState().morphRunning).toBe(false);
  });
});
