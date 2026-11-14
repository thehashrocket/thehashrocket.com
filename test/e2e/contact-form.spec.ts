import { test, expect } from "@playwright/test";

test("honeypot submission does not send real email", async ({ page }) => {
  // The server returns {success:true} on honeypot detection (silent accept — bots
  // think they succeeded but no email is sent). Fill the honeypot only; HTML5
  // validation prevents the form from submitting so no server round-trip occurs.
  await page.goto("/contact");
  await page.locator('[name="website"]').fill("http://spam.example.com");
  await page.getByRole("button", { name: /send/i }).click();
  await expect(page.getByText(/message sent/i)).not.toBeVisible();
});

test("contact form blocks submission for a too-short name", async ({ page }) => {
  // `minLength={2}` on the name input (ContactForm.tsx) means the browser's own
  // constraint validation rejects a 1-character name before the form is ever
  // submitted. The server's "Name must be at least 2 characters." (lib/actions.ts)
  // is a second layer that only runs if a request gets through, so it is
  // unreachable from a real browser.
  //
  // Assert the block causally, not by proxy. `validity.tooShort` is already true
  // the moment the field is filled, so checking it after the click proves
  // nothing about the click. These two events only fire (or fail to fire) as a
  // direct result of attempting to submit:
  //   - `invalid` on the name field => the browser actively rejected the submit
  //   - no `submit` on the form     => the submission never started
  await page.goto("/contact");

  await page.evaluate(() => {
    const w = window as unknown as { __invalid: boolean; __submitted: boolean };
    w.__invalid = false;
    w.__submitted = false;
    const form = document.querySelector("form");
    const nameInput = document.querySelector('input[name="name"]');
    if (!form || !nameInput) throw new Error("contact form not found");
    form.addEventListener("submit", () => {
      w.__submitted = true;
    });
    nameInput.addEventListener("invalid", () => {
      w.__invalid = true;
    });
  });

  await page.getByLabel(/name/i).fill("A");
  await page.getByLabel(/email/i).fill("test@example.com");
  await page.getByLabel(/message/i).fill("This is a test message");
  await page.getByRole("button", { name: /send/i }).click();

  const result = await page.evaluate(() => {
    const w = window as unknown as { __invalid: boolean; __submitted: boolean };
    return { invalid: w.__invalid, submitted: w.__submitted };
  });
  expect(result.invalid).toBe(true);
  expect(result.submitted).toBe(false);
});

test("contact form happy path shows success", async ({ page }) => {
  // TEST_EMAIL_ENABLED=true in .env.test skips Resend — no real email sent
  await page.goto("/contact");
  await page.getByLabel(/name/i).fill("Test User");
  await page.getByLabel(/email/i).fill("test@example.com");
  await page.getByLabel(/message/i).fill("E2E test message from Playwright");
  await page.getByRole("button", { name: /send/i }).click();
  await expect(page.getByText(/message sent/i)).toBeVisible({ timeout: 10000 });
});

// Value: protects=a sprint inquiry submits through the real server action and the form resets to its preselected type;
//   fails_when=the preselect is lost on reset, the new project type is rejected server-side, or the limiter blocks test runs;
//   why_new=contact-preselect.test.tsx calls form.reset() directly and never submits; seam=none;
//   no_claim=email delivery (TEST_EMAIL_ENABLED skips Resend and the rate limiter)
test("a sprint inquiry submits and resets to the sprint type", async ({ page }) => {
  await page.goto("/contact?source=automation-sprint");
  const projectType = page.getByLabel(/what do you need/i);
  await expect(projectType).toHaveValue("Automation sprint");
  await projectType.selectOption("Rescue");
  await page.getByLabel(/name/i).fill("Test User");
  await page.getByLabel(/email/i).fill("test@example.com");
  await page.getByLabel(/message/i).fill("E2E sprint inquiry from Playwright");
  await page.getByRole("button", { name: /send/i }).click();
  await expect(page.getByText(/message sent/i)).toBeVisible({ timeout: 10000 });
  await expect(projectType).toHaveValue("Automation sprint");
});
