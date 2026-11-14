import { expect, test } from "@playwright/test";
import { OFFER_ROUTES } from "../../lib/site";
import { TALK_TITLE } from "../../lib/talk";

// No WebGL: lib/webgl.ts sees a null context and the site falls back to static.
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    // @ts-expect-error narrowing the overloads is not the point here
    HTMLCanvasElement.prototype.getContext = function (type: string, ...args: unknown[]) {
      if (type === "webgl" || type === "webgl2") return null;
      return original.call(this, type, ...args);
    };
  });
});

// One row per OFFER_ROUTES entry (a test below fails until a new route has one).
// firstScreen: the shortest phone height (375 wide) where the hero's price/summary and primary
// action must fit; 667 also checks the scope line and every hero action. false = no hero testids.
interface PageRow {
  path: (typeof OFFER_ROUTES)[number];
  source: string;
  h1: RegExp | string;
  fact: RegExp;
  ctaText: RegExp;
  firstScreen: 667 | 560 | false;
}

const pages: PageRow[] = [
  {
    path: "/automation-sprint",
    source: "automation-sprint",
    h1: /One process, automated\./,
    fact: /\$[\d,]+–\$[\d,]+ · fixed before work starts/,
    ctaText: /Book a 20-minute call|Send a message/,
    firstScreen: 560,
  },
  {
    path: "/ai-app-review",
    source: "ai-app-review",
    h1: /what's risky in the app/i,
    fact: /\$[\d,]+ · 3 weeks · fixed scope/,
    ctaText: /Book a 20-minute call|Send a message/,
    // The four-line headline plus subline doesn't fit 560 yet; see TODOS.md.
    firstScreen: 667,
  },
  {
    path: "/print-shops",
    source: "print-shops",
    h1: /without the paper/i,
    fact: /200 jobs a week/,
    ctaText: /Book a 20-minute call|Start a conversation/,
    firstScreen: false,
  },
  {
    path: "/talks",
    source: "talks",
    h1: TALK_TITLE,
    fact: /Free · \d+–\d+ min/,
    ctaText: /Ask about a date/,
    firstScreen: 560,
  },
];

test("every offer route has a pages row", () => {
  expect(pages.map((row) => row.path).sort()).toEqual([...OFFER_ROUTES].sort());
});

for (const { path, source, h1, fact, ctaText } of pages) {
  test(`${path} renders its offer and tagged CTAs without WebGL`, async ({ page }) => {
    await page.goto(path);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(h1);
    await expect(page.getByText(fact).first()).toBeVisible();
    const tagged = page.locator(`main a[href*="source=${source}"]`);
    expect(await tagged.count()).toBeGreaterThanOrEqual(2);
  });

  test(`${path}: skip link first, then the hero's primary CTA`, async ({ page }) => {
    await page.goto(path);
    await page.keyboard.press("Tab");
    await expect(page.locator(":focus")).toHaveText("Skip to content");
    await page.keyboard.press("Enter");
    await page.keyboard.press("Tab");
    const focused = page.locator(":focus");
    await expect(focused).toHaveAttribute("href", new RegExp(`source=${source}`));
    await expect(focused).toHaveText(ctaText);
    // A visible focus ring, not just tab order
    const outline = await focused.evaluate((el) => getComputedStyle(el).outlineStyle);
    expect(outline).not.toBe("none");
  });
}

// Value: protects=on a small phone the price or summary, what the offer is, and the primary action are in the
//   first screen, below the fixed nav, with Cal.com off (project chromium) and on (project booking-on);
//   fails_when=the hero grows, the nav overlaps it, a booking button pushes the hero down, or the page scrolls
//   sideways at 320px; why_new=Playwright ran Desktop Chrome only; seam=none;
//   no_claim=real devices or larger text sizes
for (const { path, firstScreen } of pages) {
  if (firstScreen === false) continue;
  test(`${path} first screen on a phone`, async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(path);
    await page.evaluate(() => document.fonts.ready);
    const navBottom = await page.locator("header, nav").first().evaluate((el) => el.getBoundingClientRect().bottom);
    for (const testId of ["offer-summary", "offer-scope", "booking-cta"]) {
      const box = await page.getByTestId(testId).boundingBox();
      expect(box, testId).not.toBeNull();
      expect(box!.y, `${testId} below the nav`).toBeGreaterThanOrEqual(navBottom);
      expect(box!.y + box!.height, `${testId} in the first screen`).toBeLessThanOrEqual(667);
    }
    // Every hero action, not just the primary one, fits the first screen
    const heroActions = page.getByTestId("booking-cta").locator("xpath=..").locator("a");
    for (const action of await heroActions.all()) {
      const box = await action.boundingBox();
      expect(box!.y + box!.height, `${await action.textContent()} in the first screen`).toBeLessThanOrEqual(667);
    }

    // Shorter viewport: an iPhone SE under Safari's chrome.
    if (firstScreen === 560) {
      await page.setViewportSize({ width: 375, height: 560 });
      for (const testId of ["offer-summary", "booking-cta"]) {
        const box = await page.getByTestId(testId).boundingBox();
        expect(box!.y + box!.height, `${testId} at 560`).toBeLessThanOrEqual(560);
      }
    }

    await page.setViewportSize({ width: 320, height: 640 });
    const fits = () => page.evaluate(() => document.documentElement.scrollWidth <= 320);
    expect(await fits()).toBe(true);
    const menu = page.getByRole("button", { name: /menu/i });
    if (await menu.isVisible()) {
      await menu.click();
      await menu.click();
      expect(await fits()).toBe(true);
    }
  });
}

// Value: protects=each offer route serves its share card as a PNG; fails_when=a route's opengraph-image throws
//   (font load, template props, an import such as TALK_TITLE moving) and link previews fall back to nothing;
//   why_new=no test requests any opengraph-image route, and /talks adds a new one; seam=none;
//   no_claim=how the card looks or whether the title fits the 1200×630 frame
for (const path of OFFER_ROUTES) {
  test(`${path} serves its Open Graph image`, async ({ request }) => {
    const response = await request.get(`${path}/opengraph-image`);
    expect(response.status(), path).toBe(200);
    expect(response.headers()["content-type"], path).toBe("image/png");
    expect((await response.body()).length, path).toBeGreaterThan(1000);
  });
}

test("related case studies on /ai-app-review navigate without WebGL", async ({ page }) => {
  await page.goto("/ai-app-review");
  await page.locator('main a[href="/work/fleet-security-audit"]').click();
  await expect(page).toHaveURL(/\/work\/fleet-security-audit$/);
  // Value: protects=a case study without relatedLanding still renders and shows no offer link;
  //   fails_when=the relatedLanding guard is dropped (page throws) or the print link leaks to every study;
  //   why_new=the URL check above passes even on an error page, and only print-portal (present branch) was asserted;
  //   seam=none; no_claim=relatedLanding on case studies other than these two
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.locator('main a[href="/print-shops"]')).toHaveCount(0);
});

test("the review page preselects its project type on /contact", async ({ page }) => {
  await page.goto("/contact?source=ai-app-review");
  await expect(page.getByLabel(/what do you need/i)).toHaveValue("AI-built app review");
  await expect(page.getByText("You're asking about the AI-built app review.")).toBeVisible();
});

// Value: protects=an organizer from /talks reaches the form with the talk type, the talk steps and no timeline,
//   and switching type swaps both back; fails_when=the talks source stops mapping, or the flow keys off ?source only;
//   why_new=/talks and the type-driven contact flow are new; seam=none; no_claim=email delivery
test("a talk organizer lands on /contact with the talk type, its steps and no timeline", async ({ page }) => {
  await page.goto("/talks");
  await page.getByTestId("booking-cta").click();
  await expect(page).toHaveURL(/source=talks/);
  const projectType = page.getByLabel(/what do you need/i);
  await expect(projectType).toHaveValue("A talk for my group");
  await expect(page.getByText("We pick a date and a format.")).toBeVisible();
  await expect(page.getByLabel(/rough timeline/i)).toHaveCount(0);
  await projectType.selectOption("Rescue");
  await expect(page.getByText("We do a 20-minute call.")).toBeVisible();
  await expect(page.getByLabel(/rough timeline/i)).toBeVisible();
});

// Value: protects=/talks is reachable from the footer and /about; fails_when=either link is dropped or renamed;
//   why_new=/talks had no inbound links before release 2; seam=none; no_claim=the homepage (no talks link by design)
test("the footer and /about link to /talks", async ({ page }) => {
  await page.goto("/about");
  const footer = page.getByRole("navigation", { name: "Footer navigation" });
  await expect(footer.getByRole("link", { name: "Talks" })).toHaveAttribute("href", "/talks");
  await page.locator("main").getByRole("link", { name: "Ask about a date →" }).click();
  await expect(page).toHaveURL(/\/talks$/);
});

test("the print case study links to /print-shops, and the footer does too", async ({ page }) => {
  await page.goto("/work/print-portal");
  await expect(page.locator('main a[href="/print-shops"]')).toBeVisible();
  const footer = page.getByRole("navigation", { name: "Footer navigation" });
  await expect(footer.getByRole("link", { name: "Print shops" })).toBeVisible();
});

// Value: protects=the homepage price line leads with the sprint and links the sprint and the review;
//   fails_when=the ladder order changes or its links drop; why_new=pricing moved to offerLadderParts;
//   seam=none; no_claim=the exact prices (lib/offers.ts owns them)
test("the homepage leads with the sprint and links both entry offers", async ({ page }) => {
  await page.goto("/");
  const ladder = page.getByTestId("offer-ladder");
  await expect(ladder).toHaveText(/^Start with a \$[\d,]+–\$[\d,]+ automation sprint or a \$[\d,]+ AI-built app review\. Larger builds start at \$10,000\.$/);
  await expect(ladder.getByRole("link", { name: /automation sprint/ })).toHaveAttribute("href", "/automation-sprint");
  await page.getByRole("link", { name: "Get an AI-built app reviewed →" }).click();
  await expect(page).toHaveURL(/\/ai-app-review$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(/what's risky in the app/i);
});

// Value: protects=the contact form's preselected project type follows client-side navigation between offers;
//   fails_when=the ContactForm key stops tracking ?source, so a second offer keeps the first offer's type;
//   why_new=every other contact test loads /contact directly; seam=none; no_claim=Cal.com booking links
test("the preselected project type follows client navigation between offers", async ({ page }) => {
  await page.goto("/");
  const ladder = page.getByTestId("offer-ladder");
  await ladder.getByRole("link", { name: /automation sprint/ }).click();
  await expect(page).toHaveURL(/\/automation-sprint$/);
  await page.locator("main").getByRole("link", { name: "Send a message" }).first().click();
  await expect(page).toHaveURL(/source=automation-sprint/);
  await expect(page.getByLabel(/what do you need/i)).toHaveValue("Automation sprint");

  await page.goBack();
  await page.goBack();
  await expect(page).toHaveURL(/\/$/);
  await page.getByTestId("offer-ladder").getByRole("link", { name: /AI-built app review/ }).click();
  await expect(page).toHaveURL(/\/ai-app-review$/);
  await page.locator("main").getByRole("link", { name: "Send a message" }).first().click();
  await expect(page).toHaveURL(/source=ai-app-review/);
  await expect(page.getByLabel(/what do you need/i)).toHaveValue("AI-built app review");
});
