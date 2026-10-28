import { describe, it, expect } from "vitest";
import { sideProjects } from "../lib/side-projects";

describe("side-projects", () => {
  it("has at least one project", () => {
    expect(sideProjects.length).toBeGreaterThan(0);
  });

  it("each project has required fields and unique slug", () => {
    const slugs = new Set<string>();
    for (const p of sideProjects) {
      expect(p.slug).toMatch(/^[a-z0-9-]+$/);
      expect(slugs.has(p.slug)).toBe(false);
      slugs.add(p.slug);
      expect(p.name).toBeTruthy();
      expect(p.status).toBeTruthy();
      expect(p.description.length).toBeGreaterThan(40);
      expect(p.tags.length).toBeGreaterThan(0);
      if (p.url) expect(p.url).toMatch(/^https:\/\//);
    }
  });
});
