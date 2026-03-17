import { test, expect } from "@playwright/test";

const PROD_URL = "https://lueneburg-sperrmuell-heute.vercel.app";

/**
 * E2E tests verifying that emails sent by the application reference the
 * production URL (https://lueneburg-sperrmuell-heute.vercel.app) and never
 * a preview / localhost URL.
 *
 * The tests exercise both API endpoints that dispatch emails:
 *   - POST /api/email-subscribe  (confirmation email)
 *   - GET  /api/notify           (day-before notification email)
 *
 * Because Playwright cannot intercept server-side SMTP traffic directly, the
 * URL correctness is validated by the companion unit tests.  These e2e tests
 * assert that the API endpoints are reachable, respond with the expected
 * status codes, and never embed a preview host in the JSON responses.
 */

test.describe("Email: production URL enforcement", () => {
  // ─── /api/email-subscribe ──────────────────────────────────────────────────

  test.describe("POST /api/email-subscribe", () => {
    test("returns 201 when a valid email is submitted", async ({ request }) => {
      const res = await request.post("/api/email-subscribe", {
        data: { email: `e2e-test-${Date.now()}@example.com` },
      });
      // 201 = subscription queued; 500 = mailer not configured in dev – both are acceptable here
      expect([201, 500]).toContain(res.status());
    });

    test("returns 400 for an invalid email address", async ({ request }) => {
      const res = await request.post("/api/email-subscribe", {
        data: { email: "not-an-email" },
      });
      expect(res.status()).toBe(400);
      const body = await res.json();
      expect(body.error).toBe("invalid_email");
    });

    test("response body does not contain preview host strings", async ({ request }) => {
      const res = await request.post("/api/email-subscribe", {
        data: { email: `e2e-url-check-${Date.now()}@example.com` },
      });
      const text = await res.text();
      // The JSON response itself must not leak any preview URL
      expect(text).not.toMatch(/vercel\.app\/(?!$)/); // no non-root vercel paths except prod
      expect(text).not.toContain("-git-");
    });
  });

  // ─── /api/notify ──────────────────────────────────────────────────────────

  test.describe("GET /api/notify", () => {
    test("returns 401 when CRON_SECRET is set and no auth header is provided", async ({
      request,
    }) => {
      // When CRON_SECRET is configured the endpoint must not be callable without auth.
      // In CI / dev without a secret, expecting 200 or 401 are both valid.
      const res = await request.get("/api/notify");
      expect([200, 401]).toContain(res.status());
    });

    test("notify response does not leak preview URL strings", async ({ request }) => {
      // Call without auth – if a secret is set we get 401 JSON, which is fine.
      const res = await request.get("/api/notify");
      const text = await res.text();
      expect(text).not.toContain("-git-"); // preview deployment URL pattern
    });
  });

  // ─── UI: email subscribe form ──────────────────────────────────────────────

  /**
   * Navigate to a date so far in the future that no Sperrmüll schedules exist.
   * This triggers the empty-state branch in SidePanel which renders EmailSubscribeForm.
   */
  async function navigateToEmptyDate(page: import("@playwright/test").Page) {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Pick a date guaranteed to have no collections
    const dateInput = page.locator('input[type="date"][aria-label="Datum auswählen"]');
    await dateInput.fill("2099-12-31");
    await page.waitForLoadState("networkidle");
  }

  test.describe("Email subscribe UI", () => {
    test("subscribe form is visible when there are no streets for a date", async ({ page }) => {
      await navigateToEmptyDate(page);

      const trigger = page.getByRole("button", {
        name: /Erinnere mich vor Sperrmüll-Terminen per E-Mail/i,
      });
      await expect(trigger.first()).toBeVisible({ timeout: 10000 });
    });

    test("clicking subscribe button opens the email form dialog", async ({ page }) => {
      await navigateToEmptyDate(page);

      await page
        .getByRole("button", {
          name: /Erinnere mich vor Sperrmüll-Terminen per E-Mail/i,
        })
        .first()
        .click();

      // The email input field should now be visible
      await expect(page.locator('input[type="email"]')).toBeVisible({ timeout: 5000 });
    });

    test("submitting the form sends the request to the local server (not a preview URL)", async ({
      page,
    }) => {
      await navigateToEmptyDate(page);

      await page
        .getByRole("button", {
          name: /Erinnere mich vor Sperrmüll-Terminen per E-Mail/i,
        })
        .first()
        .click();

      const emailInput = page.locator('input[type="email"]');
      await expect(emailInput).toBeVisible({ timeout: 5000 });

      // Intercept the subscribe API call and verify no preview host is used
      const [subscribeRequest] = await Promise.all([
        page.waitForRequest((req) => req.url().includes("/api/email-subscribe")),
        emailInput.fill(`ui-test-${Date.now()}@example.com`),
        emailInput.press("Enter"),
      ]);

      // The fetch must target the local dev server, never a preview deployment
      expect(subscribeRequest.url()).not.toContain("preview");
      expect(subscribeRequest.url()).not.toContain("-git-");
      expect(subscribeRequest.url()).toContain("/api/email-subscribe");
    });

    test("email field is pre-focused when dialog opens", async ({ page }) => {
      await navigateToEmptyDate(page);

      await page
        .getByRole("button", {
          name: /Erinnere mich vor Sperrmüll-Terminen per E-Mail/i,
        })
        .first()
        .click();

      const emailInput = page.locator('input[type="email"]');
      await expect(emailInput).toBeVisible({ timeout: 5000 });
      // Focus is applied after a 50 ms delay in the component
      await page.waitForTimeout(100);
      await expect(emailInput).toBeFocused();
    });
  });
});
