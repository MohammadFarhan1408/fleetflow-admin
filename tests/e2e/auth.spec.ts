import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

// Mocked E2E: no fleetflow-api behind the BFF. Flows that need the API are covered by Vitest
// (MSW) and the full-stack run recorded in memory.md.
const WCAG_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

const expectNoBlockingViolations = async (page: import("@playwright/test").Page) => {
  const { violations } = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
  const blocking = violations.filter((v) => v.impact === "serious" || v.impact === "critical");
  expect(blocking, JSON.stringify(blocking, null, 2)).toEqual([]);
};

test("console pages redirect to sign in and keep the requested path", async ({ page }) => {
  await page.goto("/?view=today");

  await expect(page).toHaveURL("/login?next=%2F%3Fview%3Dtoday");
  await expect(page.getByRole("heading", { level: 1, name: "Sign in" })).toBeVisible();
});

test("security headers are set", async ({ request }) => {
  const response = await request.get("/login");

  expect(response.headers()["x-frame-options"]).toBe("DENY");
  expect(response.headers()["x-content-type-options"]).toBe("nosniff");
  expect(response.headers()["x-powered-by"]).toBeUndefined();
});

for (const colorScheme of ["light", "dark"] as const) {
  test(`sign-in page is accessible (${colorScheme})`, async ({ page }) => {
    await page.emulateMedia({ colorScheme });
    await page.goto("/login?notice=session_expired");
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page.getByText("Enter your email address")).toBeVisible();

    await expectNoBlockingViolations(page);
  });
}

test("forgot-password page is accessible", async ({ page }) => {
  await page.goto("/forgot-password");
  await expect(page.getByRole("heading", { level: 1, name: "Reset your password" })).toBeVisible();

  await expectNoBlockingViolations(page);
});

test("reset-password page explains an incomplete link and is accessible", async ({ page }) => {
  await page.goto("/reset-password");
  await expect(page.getByRole("alert").filter({ hasText: "This link is incomplete" })).toBeVisible();

  await expectNoBlockingViolations(page);
});

test("the BFF rejects cross-origin login attempts", async ({ request }) => {
  const response = await request.post("/bff/auth/login", {
    headers: { Origin: "https://evil.example" },
    data: { email: "a@b.test", password: "x" },
  });

  expect(response.status()).toBe(403);
});
