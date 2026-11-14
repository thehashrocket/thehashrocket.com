import { expect, test, type Page } from "@playwright/test";
import { OFFER_ROUTES } from "../../lib/site";

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

/** The Services heading is in the viewport, below the fixed header, and has keyboard focus. */
async function expectLandedOnServices(page: Page) {
  await expect(page).toHaveURL(/\/#services$/);
  const heading = page.locator("#services-heading");
  await expect(heading).toBeFocused();
  await expect(heading).toBeInViewport();
  const headerBottom = await page.locator("header").first().evaluate((el) => el.getBoundingClientRect().bottom);
  const box = await heading.boundingBox();
  expect(box!.y, "Services heading below the fixed header").toBeGreaterThanOrEqual(headerBottom);
}

// Value: protects=the main nav reaches every offer page through the Services section, and keyboard users land on it
//   (#100); fails_when=the nav link, the section id, an offer link or the focus hand-off is lost;
//   why_new=offers were reachable only from page bodies and the footer; seam=none;
//   no_claim=#100's literal "one click" (owner accepted nav → Services → offer at the gate)
test("Services in the main nav lands on a section that links every offer page", async ({ page }) => {
  for (const start of ["/", "/talks"]) {
    await page.goto(start);
    await page.getByRole("navigation", { name: "Main navigation" }).locator('a[href="/#services"]').click();
    await expectLandedOnServices(page);
  }
  const section = page.locator("#services");
  for (const route of OFFER_ROUTES) {
    await expect(section.locator(`a[href="${route}"]`).first()).toBeVisible();
  }
  await page.keyboard.press("Tab");
  await expect(section.locator('[data-testid="service-choices"] a').first()).toBeFocused();
});

// Value: protects=the phone menu reaches Services from any page, lands below the header, and works a second time;
//   fails_when=body scroll stays locked during the hash jump or the menu link is missing; why_new=first same-page
//   hash link in the mobile menu; seam=none; no_claim=iOS Safari specifics (Chromium only)
test("Services in the mobile menu lands on the section from / and from /talks", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  for (const start of ["/talks", "/", "/"]) {
    await page.goto(start);
    if (start === "/") await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.getByRole("button", { name: "Open menu" }).click();
    await page.getByRole("navigation", { name: "Mobile navigation" }).locator('a[href="/#services"]').click();
    await expectLandedOnServices(page);
  }
});

// Value: protects=every item in the phone menu can be reached and tapped on a short screen;
//   fails_when=the overlay goes back to centered and non-scrolling, or links lose their 44px targets;
//   why_new=the menu gained a fifth item; seam=none; no_claim=enlarged text (TODOS.md)
test("every mobile menu item is reachable and at least 44px tall at 375×560", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 560 });
  await page.goto("/about");
  await page.getByRole("button", { name: "Open menu" }).click();
  const links = page.getByRole("navigation", { name: "Mobile navigation" }).getByRole("link");
  const count = await links.count();
  expect(count).toBeGreaterThanOrEqual(5);
  for (let i = 0; i < count; i++) {
    const link = links.nth(i);
    await link.scrollIntoViewIfNeeded();
    await expect(link).toBeInViewport();
    const box = await link.boundingBox();
    expect(box!.height, `${await link.textContent()} tap target`).toBeGreaterThanOrEqual(44);
  }
});
