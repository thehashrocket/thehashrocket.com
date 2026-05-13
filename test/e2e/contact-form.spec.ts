import { test, expect } from "@playwright/test";

test("honeypot submission is silently swallowed", async ({ page }) => {
  await page.goto("/contact");
  await page.locator('[name="website"]').fill("http://spam.example.com");
  await page.getByRole("button", { name: /send/i }).click();
  await expect(page.getByText(/message sent/i)).not.toBeVisible();
});

test("contact form shows validation error for short name", async ({ page }) => {
  await page.goto("/contact");
  await page.getByLabel(/name/i).fill("A");
  await page.getByLabel(/email/i).fill("test@example.com");
  await page.getByLabel(/message/i).fill("This is a test message");
  await page.getByRole("button", { name: /send/i }).click();
  await expect(page.getByText(/at least 2 characters/i)).toBeVisible();
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
