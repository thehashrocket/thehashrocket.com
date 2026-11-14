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

// Value: protects=the focused Services heading never draws the outline box, keyboard users get a thin underline
//   where focus landed and mouse users get nothing, and the fixed header hides the page text under it;
//   fails_when=focus:outline-none comes off, the keyboard/pointer split is lost, or the header goes transparent;
//   why_new=the owner saw a blue box around "Services" and text behind the header on the live site; seam=none;
//   no_claim=desktop Chrome's own focus-visible heuristic (headless differs; the rule is input-independent)
test("the Services heading shows no outline box and the header covers text under it", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  // Keyboard activation: headless Chromium only draws :focus-visible rings after keyboard input, while desktop
  // Chrome also drew one after the owner's mouse click. The same rule hides both.
  await page.getByRole("navigation", { name: "Main navigation" }).locator('a[href="/#services"]').focus();
  await page.keyboard.press("Enter");
  await expectLandedOnServices(page);
  const heading = page.locator("#services-heading");
  const focusStyle = () =>
    heading.evaluate((el) => ({ outline: getComputedStyle(el).outlineStyle, line: getComputedStyle(el).textDecorationLine }));
  expect(await focusStyle(), "after keyboard Enter").toEqual({ outline: "none", line: "underline" });

  await page.evaluate(() => window.scrollTo(0, 0));
  await page.getByRole("navigation", { name: "Main navigation" }).locator('a[href="/#services"]').click();
  await expect(heading).toBeFocused();
  expect(await focusStyle(), "after a mouse click").toEqual({ outline: "none", line: "none" });
  // The backdrop is its own layer inside the header (see Nav.tsx for why it is not on the header).
  const headerBg = await page.locator("header").first().locator(":scope > [aria-hidden=\"true\"]").first()
    .evaluate((el) => getComputedStyle(el).backgroundColor);
  // Chromium reports rgba(r, g, b, a) or, for color-mix output, oklab(l a b / alpha); no alpha means opaque.
  const alphaMatch = headerBg.match(/^rgba\(.*,\s*([\d.]+)\)$/) ?? headerBg.match(/\/\s*([\d.]+)\)$/);
  const alpha = alphaMatch ? Number(alphaMatch[1]) : 1;
  expect(headerBg, "header background").not.toBe("rgba(0, 0, 0, 0)");
  expect(alpha, `header background opacity (${headerBg})`).toBeGreaterThanOrEqual(0.9);
});

// Value: protects=arriving at Services from another page keeps the keyboard/mouse split: keyboard Enter shows the
//   underline after the full page load, a mouse click shows nothing, and the remembered input is used once;
//   fails_when=the cross-page path stops remembering the input, or the landing page stops restoring or clearing it;
//   why_new=the fix-check found keyboard users arriving from other pages got no mark; seam=none;
//   no_claim=browsers that block sessionStorage (they get no mark; covered by try/catch, not tested)
test("arriving at Services from another page keeps the keyboard-only underline", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  const services = page.getByRole("navigation", { name: "Main navigation" }).locator('a[href="/#services"]');
  const heading = page.locator("#services-heading");
  const line = () => heading.evaluate((el) => getComputedStyle(el).textDecorationLine);

  await page.goto("/talks");
  await services.focus();
  await page.keyboard.press("Enter");
  await expectLandedOnServices(page);
  expect(await line(), "keyboard Enter from /talks").toBe("underline");

  await page.goto("/talks");
  await services.click();
  await expectLandedOnServices(page);
  expect(await line(), "mouse click from /talks").toBe("none");

  // The remembered input is spent: a later direct visit carries no mark from an earlier click.
  await page.goto("/about");
  await services.focus();
  await page.keyboard.press("Enter");
  await expectLandedOnServices(page);
  await page.goto("/work");
  await page.goto("/#services");
  await expect(heading).toBeFocused();
  expect(await page.evaluate(() => document.documentElement.dataset.navInput ?? null), "fresh load").toBeNull();
});

// Value: protects=a link the browser scrolls into view on focus lands below the opaque header, not under it;
//   fails_when=html loses its scroll-padding-top (Shift+Tab then parks focused links under the header);
//   why_new=the header became opaque; adversarial review found focus could be hidden; seam=none;
//   no_claim=browsers that ignore scroll-padding for focus scrolling (Chromium only)
test("focusing a link above the viewport keeps it below the header", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  // Park the second service link just below the header, focus it without scrolling, then Shift+Tab: the browser
  // scrolls the first link (now under the header) only as far as it thinks is needed.
  const links = page.locator('[data-testid="service-choices"] a');
  await links.nth(1).evaluate((el) => {
    window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - 100);
    (el as HTMLElement).focus({ preventScroll: true });
  });
  await page.keyboard.press("Shift+Tab");
  const link = links.first();
  await expect(link).toBeFocused();
  const headerBottom = await page.locator("header").first().evaluate((el) => el.getBoundingClientRect().bottom);
  const box = await link.boundingBox();
  expect(box!.y, "focused link below the fixed header").toBeGreaterThanOrEqual(headerBottom);
});

// Value: protects=Back and Forward still change the page after the same-page Services jump, and a second click
//   refocuses the section; fails_when=the jump goes back to a native fragment entry that Next ignores on popstate
//   (Back then leaves /work on screen under the /#services URL); why_new=adversarial review reproduced that bug;
//   seam=none; no_claim=browsers other than Chromium
test("Back and Forward work after jumping to Services on the homepage", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  const nav = page.getByRole("navigation", { name: "Main navigation" });
  await nav.locator('a[href="/#services"]').click();
  await expectLandedOnServices(page);

  await page.evaluate(() => window.scrollTo(0, 0));
  await nav.locator('a[href="/#services"]').click();
  await expectLandedOnServices(page);

  await nav.getByRole("link", { name: "Work" }).click();
  await expect(page).toHaveURL(/\/work$/);
  await expect(page.locator("#services")).toHaveCount(0);

  await page.goBack();
  await expect(page).toHaveURL(/\/#services$/);
  await expect(page.locator("#services")).toHaveCount(1);

  await page.goForward();
  await expect(page).toHaveURL(/\/work$/);
  await expect(page.locator("#services")).toHaveCount(0);
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
//   fails_when=the overlay goes back to centered and non-scrolling, stops covering the screen, or links lose their
//   44px targets;
//   why_new=the menu gained a fifth item; seam=none; no_claim=enlarged text (TODOS.md)
test("every mobile menu item is reachable and at least 44px tall at 375×560", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 560 });
  await page.goto("/about");
  await page.getByRole("button", { name: "Open menu" }).click();
  // The overlay must cover the screen. A backdrop-filter or transform on the header would make the header its
  // containing block and shrink it to a strip, while links stayed reachable by scrolling inside that strip.
  const overlay = await page.getByRole("navigation", { name: "Mobile navigation" }).evaluate((el) => {
    let box: Element | null = el;
    while (box && getComputedStyle(box).position !== "fixed") box = box.parentElement;
    const r = box!.getBoundingClientRect();
    return { top: r.top, height: r.height };
  });
  expect(overlay, "open menu overlay covers the viewport").toEqual({ top: 0, height: 560 });
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
