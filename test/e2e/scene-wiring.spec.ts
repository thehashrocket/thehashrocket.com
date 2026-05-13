import { test, expect } from "@playwright/test";

test("direct navigation to /work/pharma-wms wires pharma scene", async ({ page }) => {
  await page.goto("/work/pharma-wms");
  // SceneSync renders a sr-only sentinel confirming which scene is active
  const sentinel = page.getByTestId("current-scene");
  await expect(sentinel).toHaveAttribute("data-scene", "pharma-wms");
});

test("navigating away from case study resets sentinel", async ({ page }) => {
  await page.goto("/work/pharma-wms");
  await expect(page.getByTestId("current-scene")).toHaveAttribute("data-scene", "pharma-wms");
  await page.goto("/");
  await expect(page.getByTestId("current-scene")).not.toBeAttached();
});

test("each case study slug wires its own scene", async ({ page }) => {
  const slugs = ["nonprofit-matching", "grant-discovery", "print-portal"];
  for (const slug of slugs) {
    await page.goto(`/work/${slug}`);
    await expect(page.getByTestId("current-scene")).toHaveAttribute("data-scene", slug);
  }
});
