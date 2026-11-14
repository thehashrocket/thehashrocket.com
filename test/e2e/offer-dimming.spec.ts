import { expect, test } from "@playwright/test";
import { OFFER_ROUTES } from "../../lib/site";

// Value: protects=on offer pages the 3D scene stays bright behind the hero and dims once body text scrolls in;
//   fails_when=a page loses its <DimCanvasBelow /> marker, the marker sits inside the hero (loads dimmed),
//   or the dim class stops reaching the canvas; why_new=only case studies dimmed before release 2;
//   seam=none; no_claim=the rendered opacity value or the 350ms transition
//
// WebGL on: SwiftShader gives headless Chromium a software GL context. Playwright only accepts
// launchOptions at file level (it is a worker fixture), which is why this lives outside offer-pages.spec.ts,
// whose beforeEach turns WebGL off.
test.use({ launchOptions: { args: ["--enable-unsafe-swiftshader", "--use-angle=swiftshader"] } });

const VIEWPORTS = [
  { width: 1440, height: 900 },
  { width: 1920, height: 1200 },
];

for (const path of OFFER_ROUTES) {
  for (const viewport of VIEWPORTS) {
    test(`${path} dims the scene below the hero at ${viewport.width}×${viewport.height}`, async ({ page }) => {
      await page.setViewportSize(viewport);
      await page.goto(path);

      // A missing canvas is a failure, not a skip: the checks below would pass vacuously.
      const canvas = page.locator("canvas").first();
      await expect(canvas).toBeAttached({ timeout: 15_000 });
      // r3f wraps the canvas in two divs; the outer one carries the className.
      const wrapper = canvas.locator("xpath=../..");
      const dimmedClass = () => wrapper.getAttribute("class");

      await expect.poll(dimmedClass).not.toMatch(/\bopacity-20\b/);

      const marker = page.getByTestId("dim-canvas-below");
      await marker.evaluate((el) => window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY));
      await expect.poll(dimmedClass).toMatch(/\bopacity-20\b/);
    });
  }
}
