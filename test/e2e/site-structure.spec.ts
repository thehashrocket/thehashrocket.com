import { expect, test } from "@playwright/test";

test("Lab has its own page and left the homepage", async ({ page }) => {
  await page.goto("/lab");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Things I build for fun");

  await page.goto("/");
  await expect(page.getByText("Things I build for fun")).toHaveCount(0);
});

test("Locations moved from the top nav to the footer", async ({ page }) => {
  await page.goto("/");
  const main = page.getByRole("navigation", { name: "Main navigation" });
  const footer = page.getByRole("navigation", { name: "Footer navigation" });
  await expect(main.getByRole("link", { name: "Locations" })).toHaveCount(0);
  await expect(footer.getByRole("link", { name: "Locations" })).toBeVisible();
});

test("the Manteca page renders three studies", async ({ page }) => {
  await page.goto("/locations/manteca-tracy-lathrop");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Manteca");
  await expect(page.locator("a[href^='/work/']")).toHaveCount(3);
});

test("the contact form offers the optional qualifying fields", async ({ page }) => {
  await page.goto("/contact");
  await expect(page.getByLabel(/what do you need/i)).toBeVisible();
  await expect(page.getByLabel(/rough timeline/i)).toBeVisible();
});
