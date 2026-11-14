import { expect, test } from "@playwright/test";

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

const pages = [
  { path: "/ai-app-review", source: "ai-app-review", h1: /what's risky in the app/i, fact: /\$[\d,]+ · 3 weeks · fixed scope/ },
  { path: "/print-shops", source: "print-shops", h1: /without the paper/i, fact: /200 jobs a week/ },
];

for (const { path, source, h1, fact } of pages) {
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
    await expect(focused).toHaveText(/Book a 20-minute call|Start a conversation/);
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

test("the print case study links to /print-shops, and the footer does too", async ({ page }) => {
  await page.goto("/work/print-portal");
  await expect(page.locator('main a[href="/print-shops"]')).toBeVisible();
  const footer = page.getByRole("navigation", { name: "Footer navigation" });
  await expect(footer.getByRole("link", { name: "Print shops" })).toBeVisible();
});

// Value: protects=homepage Rescue service links to /ai-app-review and the pricing line keeps $10,000 beside the review price;
//   fails_when=services[].link stops rendering, its href drifts, or the How-it-works price line loses either figure;
//   why_new=no unit or e2e test renders app/page.tsx; claims.test checks $10,000 on /contact and locations only;
//   seam=none; no_claim=the exact review price value (lib/offers.ts owns it)
test("the homepage Rescue service links to the review and keeps both prices", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText(/Projects typically start at \$10,000\. An AI-built app review is a flat \$[\d,]+\./)).toBeVisible();
  await page.getByRole("link", { name: "Get an AI-built app reviewed →" }).click();
  await expect(page).toHaveURL(/\/ai-app-review$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(/what's risky in the app/i);
});
